const API_BASE = 'http://localhost:5001/api';

async function runVerification() {
  console.log('Starting E2E API Verification for CodeArena 2.0...\n');

  try {
    // 1. Sign up a test user
    console.log('1. Attempting Sign Up...');
    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    
    if (!signupRes.ok) {
      throw new Error(`Signup failed: ${signupRes.statusText}`);
    }
    
    const signupData = await signupRes.json();
    const token = signupData.token;
    console.log('✓ Sign Up Successful. Received token:', token.substring(0, 20) + '...');

    // 2. Fetch Questions
    console.log('\n2. Fetching questions...');
    const questionsRes = await fetch(`${API_BASE}/questions?difficulty=easy`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!questionsRes.ok) {
      throw new Error(`Fetch questions failed: ${questionsRes.statusText}`);
    }

    const questions = await questionsRes.json();
    console.log(`✓ Fetched ${questions.length} questions.`);
    if (questions.length === 0) {
      throw new Error('No questions returned. DB might not be seeded.');
    }

    const targetQuestion = questions.find(q => q.title === 'Two Sum');
    if (!targetQuestion) {
      throw new Error('Two Sum question not found in seeded database.');
    }
    console.log(`✓ Found target question: "${targetQuestion.title}" (ID: ${targetQuestion._id})`);

    // 3. Test Run Code (Custom Input)
    console.log('\n3. Running code execution test...');
    const pythonCode = `import sys

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 3:
        n = int(lines[0])
        nums = list(map(int, lines[1].split()))
        target = int(lines[2])
        indices = two_sum(nums, target)
        if indices:
            print(f"{indices[0]} {indices[1]}")
`;

    const runRes = await fetch(`${API_BASE}/submissions/run`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        questionId: targetQuestion._id,
        code: pythonCode,
        language: 'python'
      })
    });

    if (!runRes.ok) {
      throw new Error(`Run code failed: ${runRes.statusText}`);
    }

    const runData = await runRes.json();
    console.log('✓ Run code execution response received:');
    console.log(JSON.stringify(runData, null, 2));

    const allPassed = runData.runResults.every(r => r.passed);
    if (allPassed) {
      console.log('✓ All sample test cases PASSED!');
    } else {
      throw new Error('Some sample test cases failed.');
    }

    // 4. Test Submit Code (Evaluation + Adaptive Scoring)
    console.log('\n4. Submitting solution for adaptive scoring...');
    const submitRes = await fetch(`${API_BASE}/submissions/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        questionId: targetQuestion._id,
        code: pythonCode,
        language: 'python',
        timeTaken: 120 // 2 minutes
      })
    });

    if (!submitRes.ok) {
      throw new Error(`Submit failed: ${submitRes.statusText}`);
    }

    const submitData = await submitRes.json();
    console.log('✓ Submission response received:');
    console.log(JSON.stringify(submitData, null, 2));

    if (submitData.verdict === 'Accepted') {
      console.log(`\n✓ SUCCESS! Solution Accepted!`);
      console.log(`Adaptive Score/Confidence Score: ${submitData.confidenceScore}%`);
      console.log(`Breakdown:`, submitData.scores);
    } else {
      throw new Error(`Solution rejected with verdict: ${submitData.verdict}`);
    }

    console.log('\nE2E VERIFICATION COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n✗ Verification Failed:', error.message);
    process.exit(1);
  }
}

runVerification();
