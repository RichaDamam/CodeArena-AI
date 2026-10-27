const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const { executeCode } = require('../utils/compiler');

// Helper to count lines of code (ignoring empty lines and simple comments)
function getLinesOfCode(code, language) {
  const lines = code.split('\n');
  let count = 0;
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    // Basic comment checks
    if (language === 'python' && line.startsWith('#')) continue;
    if ((language === 'javascript' || language === 'java') && line.startsWith('//')) continue;
    count++;
  }
  return Math.max(1, count);
}

// Helper to clean outputs for comparison (strips whitespaces and blank lines)
function cleanOutput(str) {
  return str
    .replace(/\r\n/g, '\n') // Normalize newlines
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

// @route    POST api/submissions/run
// @desc     Run code against sample test cases (not saved)
// @access   Private
router.post('/run', auth, async (req, res) => {
  const { questionId, code, language, customInput } = req.body;

  if (!questionId || !code || !language) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // If custom input is provided, just run it
    if (customInput !== undefined && customInput !== null) {
      try {
        const result = await executeCode(language, code, customInput);
        return res.json({
          runResults: [{
            input: customInput,
            expected: '',
            actual: result.stdout,
            stderr: result.stderr,
            passed: !result.error
          }]
        });
      } catch (err) {
        return res.status(500).json({ message: 'Compilation/Execution engine error', error: err.message });
      }
    }

    // Run against sample test cases
    const sampleCases = question.testCases.filter(tc => tc.isSample);
    if (sampleCases.length === 0 && question.testCases.length > 0) {
      sampleCases.push(question.testCases[0]); // fallback to first testcase if no sample marked
    }

    const runResults = [];
    for (let i = 0; i < sampleCases.length; i++) {
      const tc = sampleCases[i];
      try {
        const result = await executeCode(language, code, tc.input);
        
        const cleanActual = cleanOutput(result.stdout);
        const cleanExpected = cleanOutput(tc.output);
        const passed = !result.error && (cleanActual === cleanExpected);

        runResults.push({
          input: tc.input,
          expected: tc.output,
          actual: result.stdout,
          stderr: result.stderr,
          passed
        });
      } catch (err) {
        runResults.push({
          input: tc.input,
          expected: tc.output,
          actual: '',
          stderr: `Execution failed: ${err.message}`,
          passed: false
        });
      }
    }

    res.json({ runResults });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/submissions/submit
// @desc     Evaluate code against all test cases, log stats, and return score
// @access   Private
router.post('/submit', auth, async (req, res) => {
  const { questionId, code, language, timeTaken } = req.body; // timeTaken in seconds

  if (!questionId || !code || !language || timeTaken === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const testCases = question.testCases;
    if (testCases.length === 0) {
      return res.status(400).json({ message: 'Question has no test cases to evaluate' });
    }

    let passedCount = 0;
    const details = [];
    let compilationError = false;
    let runtimeError = false;
    let timeLimitExceeded = false;

    // Run code on all test cases
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      try {
        const result = await executeCode(language, code, tc.input);
        
        if (result.error) {
          if (result.stderr.toLowerCase().includes('compilation') || result.stderr.toLowerCase().includes('syntaxerror') || result.stderr.toLowerCase().includes('error: class')) {
            compilationError = true;
          } else {
            runtimeError = true;
          }
          details.push({
            passed: false,
            stderr: result.stderr,
            isSample: tc.isSample
          });
          continue;
        }

        const cleanActual = cleanOutput(result.stdout);
        const cleanExpected = cleanOutput(tc.output);
        const passed = cleanActual === cleanExpected;

        if (passed) {
          passedCount++;
        }

        details.push({
          passed,
          isSample: tc.isSample,
          actual: tc.isSample ? result.stdout : undefined, // Only send actual stdout back for sample cases to avoid leaking test outputs
          expected: tc.isSample ? tc.output : undefined
        });

      } catch (err) {
        runtimeError = true;
        details.push({
          passed: false,
          stderr: err.message,
          isSample: tc.isSample
        });
      }
    }

    // Determine verdict
    let verdict = 'Wrong Answer';
    const correctness = Math.round((passedCount / testCases.length) * 100);

    if (correctness === 100) {
      verdict = 'Accepted';
    } else if (compilationError) {
      verdict = 'Compilation Error';
    } else if (runtimeError) {
      verdict = 'Runtime Error';
    }

    // Count attempts: find previous submissions for this user and question
    const prevSubmissionsCount = await Submission.countDocuments({
      userId: req.user.id,
      questionId: questionId
    });
    const attempts = prevSubmissionsCount + 1;

    // Scoring parameters configuration
    const linesOfCode = getLinesOfCode(code, language);

    // Reference parameters by difficulty
    let expectedTime = 600; // Easy: 10 mins
    let refLines = 15;
    if (question.difficulty === 'medium') {
      expectedTime = 1200; // Medium: 20 mins
      refLines = 30;
    } else if (question.difficulty === 'hard') {
      expectedTime = 2400; // Hard: 40 mins
      refLines = 60;
    }

    // 1. Correctness score (0 - 100)
    const correctnessScore = correctness;

    // 2. Speed score (0 - 100)
    // Formula: Decays from 100 to 10 as time approaches expected limit.
    const speedScore = Math.max(10, Math.min(100, Math.round(100 - (timeTaken / expectedTime) * 50)));

    // 3. Attempt score (0 - 100)
    // 1 attempt = 100, decays by 15 points per failed attempt, floor of 10.
    const attemptScore = Math.max(10, 100 - (attempts - 1) * 15);

    // 4. Efficiency score (0 - 100)
    // Fewer lines of code compared to refLines gives higher score.
    const efficiencyScore = Math.max(10, Math.min(100, Math.round(100 - Math.max(0, (linesOfCode - refLines) / refLines) * 50)));

    // Adaptive Engine formula
    const confidenceScore = Math.round(
      (0.40 * correctnessScore) +
      (0.25 * speedScore) +
      (0.20 * attemptScore) +
      (0.15 * efficiencyScore)
    );

    // Create and save submission record
    const submission = new Submission({
      userId: req.user.id,
      questionId: question._id,
      code,
      language,
      attempts,
      timeTaken,
      linesOfCode,
      verdict,
      confidenceScore,
      feedback: `Verdict: ${verdict}. Passed ${passedCount}/${testCases.length} cases. Score: ${confidenceScore}%`
    });

    await submission.save();

    res.json({
      submissionId: submission._id,
      verdict,
      correctness,
      passedCount,
      totalCount: testCases.length,
      attempts,
      timeTaken,
      linesOfCode,
      confidenceScore,
      details,
      scores: {
        correctness: correctnessScore,
        speed: speedScore,
        attempt: attemptScore,
        efficiency: efficiencyScore
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
