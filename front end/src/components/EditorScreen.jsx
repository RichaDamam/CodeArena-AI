import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft, Play, Send, Clock, CheckCircle2,
  XCircle, AlertTriangle, Lock, Unlock, Video,
  Cpu, FileCode
} from 'lucide-react';

const API_BASE = 'http://localhost:5001/api';

export default function EditorScreen({
  initialDifficulty,
  user,
  token,
  onBackToLanding
}) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isCustomInput, setIsCustomInput] = useState(false);

  const [timeTaken, setTimeTaken] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [linesOfCode, setLinesOfCode] = useState(1);

  const [running, setRunning] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  const [submitResult, setSubmitResult] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [unlockedHints, setUnlockedHints] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);

  const timerRef = useRef(null);
  const seenQuestionIdsRef = useRef({});

  useEffect(() => {
    fetchQuestions(initialDifficulty);

    return () => clearInterval(timerRef.current);
  }, [initialDifficulty]);

  useEffect(() => {
    if (!currentQuestion) return;

    const template =
      currentQuestion.starterTemplates?.[language] || '';

    setCode(template);
    setTimeTaken(0);
    setAttempts(1);
    setRunResults(null);
    setSubmitResult(null);
    setUnlockedHints({});

    if (failedAttempts >= 2) {
      setUnlockedHints({ 0: true });
    } else {
      setFailedAttempts(0);
    }

    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeTaken(previous => previous + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQuestion]);

  const handleLanguageChange = newLanguage => {
    setLanguage(newLanguage);

    if (currentQuestion) {
      setCode(
        currentQuestion.starterTemplates?.[newLanguage] || ''
      );
    }
  };

  const handleEditorChange = value => {
    const newCode = value || '';

    setCode(newCode);

    const lines = newCode
      .split('\n')
      .filter(line => line.trim().length > 0).length;

    setLinesOfCode(lines || 1);
  };

  const fetchQuestions = async difficulty => {
    setLoadingQuestions(true);

    try {
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const response = await fetch(
        `${API_BASE}/questions?difficulty=${encodeURIComponent(difficulty)}`,
        { headers }
      );

      const data = await response.json();

      let questionPool =
        response.ok && Array.isArray(data) ? data : [];

      if (questionPool.length === 0) {
        const fallbackResponse = await fetch(
          `${API_BASE}/questions`,
          { headers }
        );

        const fallbackData = await fallbackResponse.json();

        if (
          fallbackResponse.ok &&
          Array.isArray(fallbackData)
        ) {
          questionPool = fallbackData;
        }
      }

      if (questionPool.length === 0) {
        setQuestions([]);
        setCurrentQuestion(null);
        return;
      }

      setQuestions(questionPool);

      const currentId = currentQuestion?._id;
      const difficultyKey = difficulty || 'all';

      let seenIds =
        seenQuestionIdsRef.current[difficultyKey] || [];

      let unseenQuestions = questionPool.filter(
        question =>
          question._id && !seenIds.includes(question._id)
      );

      if (unseenQuestions.length === 0) {
        seenIds = [];
        unseenQuestions = questionPool;
      }

      const alternatives = unseenQuestions.filter(
        question => question._id !== currentId
      );

      const choices =
        alternatives.length > 0
          ? alternatives
          : unseenQuestions;

      const selected =
        choices[Math.floor(Math.random() * choices.length)];

      if (!selected) {
        setCurrentQuestion(null);
        return;
      }

      if (selected._id) {
        seenQuestionIdsRef.current[difficultyKey] = [
          ...seenIds,
          selected._id
        ];
      }

      const detailResponse = await fetch(
        `${API_BASE}/questions/${selected._id}`,
        { headers }
      );

      const detailData = await detailResponse.json();

      if (!detailResponse.ok) {
        throw new Error(
          detailData.message || 'Could not load question details.'
        );
      }

      setCurrentQuestion(detailData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      setCurrentQuestion(null);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleRun = async () => {
    if (!currentQuestion) return;

    setRunning(true);
    setRunResults(null);
    setActiveTab('output');
    setAttempts(previous => previous + 1);

    try {
      const payload = {
        questionId: currentQuestion._id,
        code,
        language,
        customInput: isCustomInput ? customInput : undefined
      };

      const response = await fetch(
        `${API_BASE}/submissions/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRunResults(data.runResults);
      } else {
        setRunResults([{
          input: isCustomInput ? customInput : 'Sample cases',
          expected: '',
          actual: '',
          stderr: data.message || 'Execution error',
          passed: false
        }]);
      }
    } catch (error) {
      setRunResults([{
        input: '',
        expected: '',
        actual: '',
        stderr: error.message,
        passed: false
      }]);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    setRunning(true);
    setRunResults(null);
    setActiveTab('output');

    try {
      const payload = {
        questionId: currentQuestion._id,
        code,
        language,
        timeTaken
      };

      const response = await fetch(
        `${API_BASE}/submissions/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitResult(data);
        setShowFeedbackModal(true);

        if (data.verdict !== 'Accepted') {
          setFailedAttempts(previous => previous + 1);
        }
      } else {
        alert(data.message || 'Submission failed');
      }
    } catch (error) {
      alert(`Submission error: ${error.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleProceedNext = () => {
    setShowFeedbackModal(false);

    if (!submitResult || !currentQuestion) return;

    const score = submitResult.confidenceScore;
    const currentDifficulty = currentQuestion.difficulty;

    let nextDifficulty = currentDifficulty;

    if (score > 75) {
      if (currentDifficulty === 'easy') {
        nextDifficulty = 'medium';
      } else if (currentDifficulty === 'medium') {
        nextDifficulty = 'hard';
      }

      setFailedAttempts(0);
    } else if (score < 40) {
      if (currentDifficulty === 'hard') {
        nextDifficulty = 'medium';
      } else if (currentDifficulty === 'medium') {
        nextDifficulty = 'easy';
      }

      setFailedAttempts(2);
    } else {
      setFailedAttempts(0);
    }

    fetchQuestions(nextDifficulty);
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');

    const remainingSeconds = (seconds % 60)
      .toString()
      .padStart(2, '0');

    return `${minutes}:${remainingSeconds}`;
  };

  const toggleHint = index => {
    setUnlockedHints(previous => ({
      ...previous,
      [index]: !previous[index]
    }));
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center font-sans">
        <Cpu
          className="text-cyber-cyan animate-spin mb-4"
          size={40}
        />
        <span className="text-sm font-mono tracking-widest text-cyber-cyan">
          LOADING CODING ENVIRONMENT...
        </span>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col items-center justify-center font-sans">
        <AlertTriangle
          className="text-cyber-yellow mb-4"
          size={40}
        />

        <p className="mb-6 text-center px-4">
          No questions found. Please check whether your backend
          is running and questions are available in the database.
        </p>

        <button
          onClick={() => fetchQuestions(initialDifficulty)}
          className="px-6 py-2.5 rounded-lg border border-dark-border hover:bg-dark-card transition-all"
        >
          TRY AGAIN
        </button>

        <button
          onClick={onBackToLanding}
          className="mt-3 px-6 py-2.5 rounded-lg border border-dark-border hover:bg-dark-card transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          BACK TO LANDING
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-bg text-dark-text flex flex-col overflow-hidden font-sans">
      <header className="h-14 border-b border-dark-border/60 bg-dark-card flex items-center justify-between px-6 shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLanding}
            className="p-2 rounded-lg border border-dark-border hover:bg-dark-bg transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="h-4 w-px bg-dark-border" />

          <div>
            <h2 className="text-sm font-bold tracking-wide">
              {currentQuestion.title}
            </h2>

            <span
              className={`text-[10px] font-black uppercase font-mono tracking-wider ${
                currentQuestion.difficulty === 'easy'
                  ? 'text-cyber-green'
                  : currentQuestion.difficulty === 'medium'
                    ? 'text-cyber-yellow'
                    : 'text-cyber-magenta'
              }`}
            >
              SECTOR: {currentQuestion.difficulty} // TOPIC: {currentQuestion.topic}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono font-bold text-dark-muted">
            <span>
              RATING:{' '}
              <span className="text-cyber-cyan">
                {user?.rating || 1200}
              </span>
            </span>

            <span>
              LEVEL:{' '}
              <span className="text-cyber-purple">
                {user?.level || 1}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border font-mono font-bold text-sm">
            <Clock size={15} className="text-cyber-cyan" />
            <span>{formatTime(timeTaken)}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="w-full md:w-5/12 border-r border-dark-border/40 flex flex-col bg-dark-bg overflow-hidden">
          <div className="flex border-b border-dark-border/40 bg-dark-card shrink-0">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-3 text-xs font-bold font-mono tracking-widest text-center border-b-2 ${
                activeTab === 'description'
                  ? 'border-cyber-cyan text-cyber-cyan'
                  : 'border-transparent text-dark-muted'
              }`}
            >
              INSTRUCTIONS
            </button>

            <button
              onClick={() => setActiveTab('hints')}
              className={`flex-1 py-3 text-xs font-bold font-mono tracking-widest text-center border-b-2 ${
                activeTab === 'hints'
                  ? 'border-cyber-cyan text-cyber-cyan'
                  : 'border-transparent text-dark-muted'
              }`}
            >
              HINTS & AIDS
              {failedAttempts > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyber-magenta text-white text-[9px]">
                  {failedAttempts}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'description' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dark-muted tracking-widest font-mono uppercase mb-3">
                    PROBLEM DESCRIPTION
                  </h3>

                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.statement}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-dark-muted tracking-widest font-mono uppercase mb-3">
                    SAMPLE CASES
                  </h3>

                  <div className="space-y-4">
                    {(currentQuestion.testCases || [])
                      .filter(testCase => testCase.isSample)
                      .map((testCase, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-dark-border bg-dark-card overflow-hidden font-mono text-xs"
                        >
                          <div className="px-4 py-2 border-b border-dark-border flex items-center justify-between text-dark-muted font-bold text-[10px]">
                            <span>CASE #{index + 1}</span>
                            <span className="text-cyber-cyan">
                              SAMPLE INPUT
                            </span>
                          </div>

                          <div className="p-4 space-y-3">
                            <div>
                              <div className="text-dark-muted text-[10px] font-bold mb-1">
                                INPUT:
                              </div>

                              <pre className="whitespace-pre-wrap bg-dark-bg p-2.5 rounded border border-dark-border">
                                {testCase.input}
                              </pre>
                            </div>

                            <div>
                              <div className="text-dark-muted text-[10px] font-bold mb-1">
                                EXPECTED OUTPUT:
                              </div>

                              <pre className="text-cyber-green whitespace-pre-wrap bg-dark-bg p-2.5 rounded border border-dark-border">
                                {testCase.output}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dark-muted tracking-widest font-mono uppercase mb-3">
                    HINTS
                  </h3>

                  <p className="text-xs text-dark-muted mb-4 leading-relaxed">
                    Reveal step-by-step guidance to help solve the problem.
                  </p>

                  <div className="space-y-3">
                    {(currentQuestion.hints || []).map((hint, index) => (
                      <div
                        key={index}
                        className="border border-dark-border rounded-xl bg-dark-card overflow-hidden"
                      >
                        <button
                          onClick={() => toggleHint(index)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold font-mono tracking-wider"
                        >
                          <span>HINT #{index + 1}</span>

                          {unlockedHints[index] ? (
                            <Unlock
                              size={14}
                              className="text-cyber-cyan"
                            />
                          ) : (
                            <Lock
                              size={14}
                              className="text-dark-muted"
                            />
                          )}
                        </button>

                        {unlockedHints[index] && (
                          <div className="px-4 pb-4 pt-1 text-sm text-dark-muted leading-relaxed border-t border-dark-border">
                            {hint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-dark-border">
                  <h3 className="text-xs font-bold text-dark-muted tracking-widest font-mono uppercase mb-3">
                    VIDEO EXPLAINER
                  </h3>

                  {failedAttempts >= 2 ? (
                    <div className="p-5 border border-cyber-magenta/30 bg-dark-card rounded-2xl flex flex-col items-center text-center">
                      <Unlock
                        size={24}
                        className="text-cyber-magenta mb-2"
                      />

                      <h4 className="text-sm font-bold mb-2">
                        VIDEO TUTORIAL UNLOCKED
                      </h4>

                      <p className="text-xs text-dark-muted mb-4">
                        You have failed two attempts. The video
                        explanation is now unlocked.
                      </p>

                      <button
                        onClick={() => setShowVideoModal(true)}
                        className="px-5 py-2.5 rounded-lg bg-cyber-magenta text-white font-bold font-mono text-xs flex items-center gap-2"
                      >
                        <Video size={14} />
                        WATCH EXPLAINER VIDEO
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 border border-dark-border bg-dark-card rounded-2xl flex flex-col items-center text-center">
                      <Lock
                        size={24}
                        className="text-dark-muted mb-2"
                      />

                      <h4 className="text-sm font-bold mb-2">
                        VIDEO EXPLAINER LOCKED
                      </h4>

                      <p className="text-xs text-dark-muted mb-4">
                        Video explainers unlock after two failed attempts.
                      </p>

                      <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden border border-dark-border">
                        <div
                          className="bg-cyber-magenta h-full transition-all"
                          style={{
                            width: `${Math.min(failedAttempts / 2, 1) * 100}%`
                          }}
                        />
                      </div>

                      <span className="text-[10px] font-mono text-dark-muted mt-2">
                        PROGRESS: {Math.min(failedAttempts, 2)} / 2
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-dark-card">
          <div className="h-12 border-b border-dark-border flex items-center justify-between px-6 shrink-0 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-dark-muted font-bold">
                LANGUAGE:
              </span>

              <select
                value={language}
                onChange={event =>
                  handleLanguageChange(event.target.value)
                }
                className="bg-dark-bg border border-dark-border rounded px-2 py-1 focus:outline-none focus:border-cyber-cyan cursor-pointer font-bold text-xs"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="java">Java (Main Class)</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-dark-muted font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <FileCode size={12} className="text-cyber-cyan" />
                LINES: {linesOfCode}
              </span>

              <span>ATTEMPT: #{attempts}</span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              language={
                language === 'python'
                  ? 'python'
                  : language === 'javascript'
                    ? 'javascript'
                    : 'java'
              }
              value={code}
              theme="vs"
              onChange={handleEditorChange}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          <div className="h-16 border-t border-dark-border bg-dark-card flex items-center justify-between px-6 shrink-0">
            <button
              onClick={() => setIsCustomInput(previous => !previous)}
              className={`text-xs font-bold font-mono tracking-wider px-3 py-1.5 rounded-lg border ${
                isCustomInput
                  ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5'
                  : 'border-dark-border text-dark-muted'
              }`}
            >
              CUSTOM TEST INPUT
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={running}
                className="px-5 py-2.5 rounded-lg border border-cyber-yellow text-cyber-yellow font-bold font-mono text-xs disabled:opacity-50 flex items-center gap-2"
              >
                <Play size={12} />
                {running ? 'RUNNING...' : 'RUN CODE'}
              </button>

              <button
                onClick={handleSubmit}
                disabled={running}
                className="px-6 py-2.5 rounded-lg bg-cyber-green text-white font-black font-mono text-xs disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={12} />
                SUBMIT SOLUTION
              </button>
            </div>
          </div>

          <div className="h-44 border-t border-dark-border bg-dark-bg flex flex-col overflow-hidden shrink-0 font-mono text-xs">
            <div className="h-8 border-b border-dark-border bg-dark-card px-6 flex items-center justify-between text-[10px] font-black text-dark-muted tracking-widest shrink-0 uppercase">
              <span>TERMINAL DIAGNOSTICS</span>

              {running && (
                <span className="text-cyber-yellow animate-pulse">
                  RUNNING COMPILER...
                </span>
              )}
            </div>

            {isCustomInput && (
              <div className="h-10 border-b border-dark-border px-6 flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-bold text-dark-muted">
                  STDIN:
                </span>

                <input
                  type="text"
                  value={customInput}
                  onChange={event => setCustomInput(event.target.value)}
                  placeholder="Enter space-separated inputs"
                  className="flex-1 bg-transparent border-none outline-none text-xs font-mono"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {runResults ? (
                runResults.map((result, index) => (
                  <div
                    key={index}
                    className="space-y-2 pb-3 border-b border-dark-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle2
                            size={14}
                            className="text-cyber-green"
                          />
                        ) : (
                          <XCircle
                            size={14}
                            className="text-cyber-magenta"
                          />
                        )}

                        <span className="font-bold text-[11px]">
                          CASE #{index + 1} RESULT
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          result.passed
                            ? 'bg-cyber-green/10 text-cyber-green'
                            : 'bg-cyber-magenta/10 text-cyber-magenta'
                        }`}
                      >
                        {result.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>

                    {result.stderr ? (
                      <div className="rounded-lg bg-cyber-magenta/5 border border-cyber-magenta/20 p-3 text-cyber-magenta whitespace-pre-wrap">
                        {result.stderr}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-dark-muted font-bold block mb-1">
                            EXPECTED OUTPUT:
                          </span>

                          <pre className="bg-dark-card p-2 border border-dark-border rounded whitespace-pre-wrap">
                            {result.expected || 'N/A'}
                          </pre>
                        </div>

                        <div>
                          <span className="text-[10px] text-dark-muted font-bold block mb-1">
                            ACTUAL OUTPUT:
                          </span>

                          <pre className="bg-dark-card p-2 border border-dark-border rounded whitespace-pre-wrap">
                            {result.actual}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-dark-muted">
                  Write your code and run tests to see the output.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-cyber-magenta bg-black">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 text-white"
            >
              Close
            </button>

            <iframe
              width="100%"
              height="100%"
              src={currentQuestion.videoUrl}
              title="Expert Video Explanation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {showFeedbackModal && submitResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-dark-border bg-dark-card shadow-2xl p-8 flex flex-col items-center">
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                submitResult.verdict === 'Accepted'
                  ? 'bg-cyber-green'
                  : 'bg-cyber-magenta'
              }`}
            />

            <div className="mb-4">
              {submitResult.verdict === 'Accepted' ? (
                <CheckCircle2
                  size={48}
                  className="text-cyber-green"
                />
              ) : (
                <XCircle
                  size={48}
                  className="text-cyber-magenta"
                />
              )}
            </div>

            <h2 className="text-2xl font-black text-center mb-1">
              {submitResult.verdict.toUpperCase()}
            </h2>

            <p className="text-xs text-dark-muted font-mono font-bold uppercase tracking-widest text-center mb-6">
              PASSED {submitResult.passedCount} / {submitResult.totalCount} TEST CASES
            </p>

            <div className="flex flex-col items-center justify-center w-36 h-36 rounded-full border border-dark-border bg-dark-bg mb-6">
              <span className="text-[10px] font-mono text-dark-muted uppercase font-bold tracking-wider">
                CONFIDENCE
              </span>

              <span
                className={`text-4xl font-black ${
                  submitResult.confidenceScore > 75
                    ? 'text-cyber-green'
                    : submitResult.confidenceScore < 40
                      ? 'text-cyber-magenta'
                      : 'text-cyber-yellow'
                }`}
              >
                {submitResult.confidenceScore}%
              </span>

              <span className="text-[9px] font-mono text-dark-muted uppercase font-bold">
                CALIBRATED
              </span>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
              <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                <span className="text-dark-muted text-[10px] font-bold">
                  ACCURACY
                </span>
                <p className="mt-1 font-bold text-sm">
                  {submitResult.correctness}%
                </p>
              </div>

              <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                <span className="text-dark-muted text-[10px] font-bold">
                  SPEED SCORE
                </span>
                <p className="text-cyber-cyan mt-1 font-bold text-sm">
                  {submitResult.scores?.speed ?? 0}/100
                </p>
              </div>

              <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                <span className="text-dark-muted text-[10px] font-bold">
                  ATTEMPTS
                </span>
                <p className="text-cyber-purple mt-1 font-bold text-sm">
                  #{submitResult.attempts}
                </p>
              </div>

              <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                <span className="text-dark-muted text-[10px] font-bold">
                  CODE LINES
                </span>
                <p className="text-cyber-yellow mt-1 font-bold text-sm">
                  {submitResult.linesOfCode}
                </p>
              </div>
            </div>

            <div className="w-full bg-dark-bg border border-dark-border p-4 rounded-xl text-center text-xs leading-relaxed text-dark-muted mb-8">
              <span className="font-bold block mb-1">
                ADAPTIVE DIAGNOSTICS
              </span>

              {submitResult.confidenceScore > 75
                ? 'Good work! Moving to a harder difficulty when available.'
                : submitResult.confidenceScore < 40
                  ? 'Review your solution. Moving to an easier difficulty when available.'
                  : 'Keep practicing at this difficulty.'}
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 py-3 rounded-lg border border-dark-border font-bold text-xs"
              >
                REVIEW CODE
              </button>

              <button
                onClick={handleProceedNext}
                className="flex-grow-2 flex-[2] py-3 rounded-lg bg-cyber-cyan text-black font-black tracking-widest text-xs"
              >
                NEXT QUESTION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}