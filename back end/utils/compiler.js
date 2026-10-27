const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const TEMP_DIR = path.join(__dirname, '../temp_runs');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Execute code with input stdin locally using installed compilers/interpreters
 * @param {string} language - python, javascript, java
 * @param {string} code - source code
 * @param {string} stdin - input for the test case
 * @returns {Promise<{stdout: string, stderr: string, error: boolean, exitCode: number}>}
 */
const executeCode = async (language, code, stdin = '') => {
  const normLang = language.toLowerCase();
  const runId = Math.random().toString(36).substring(7);
  const runDir = path.join(TEMP_DIR, runId);
  
  // Ensure unique runtime directory is clean and isolated
  fs.mkdirSync(runDir, { recursive: true });

  let fileName = '';
  let command = '';
  let args = [];

  if (normLang === 'python') {
    fileName = 'solution.py';
    command = 'python';
    args = [path.join(runDir, fileName)];
  } else if (normLang === 'javascript') {
    fileName = 'solution.js';
    command = 'node';
    args = [path.join(runDir, fileName)];
  } else if (normLang === 'java') {
    // Determine class name to compile/run Main
    let className = 'Main';
    const match = code.match(/public\s+class\s+(\w+)/);
    if (match && match[1]) {
      className = match[1];
    }
    fileName = `${className}.java`;
    command = 'java';
    args = [path.join(runDir, fileName)];
  } else {
    // Delete temp dir if unsupported language
    try { fs.rmSync(runDir, { recursive: true, force: true }); } catch (_) {}
    throw new Error(`Unsupported language: ${language}`);
  }

  const filePath = path.join(runDir, fileName);
  fs.writeFileSync(filePath, code);

  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: runDir });
    
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Set execution timeout (5 seconds) to prevent infinite loops (TLE)
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, 5000);

    // Stream stdin input to process
    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (exitCode) => {
      clearTimeout(timeout);
      
      // Clean up directory and generated files
      try {
        fs.rmSync(runDir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to delete temp dir: ${err.message}`);
      }

      if (timedOut) {
        resolve({
          stdout: '',
          stderr: 'Time Limit Exceeded (5 seconds)',
          error: true,
          exitCode: 124
        });
      } else {
        resolve({
          stdout,
          stderr,
          error: exitCode !== 0,
          exitCode
        });
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      try {
        fs.rmSync(runDir, { recursive: true, force: true });
      } catch (_) {}
      
      resolve({
        stdout: '',
        stderr: `Execution failed to start: ${err.message}`,
        error: true,
        exitCode: 1
      });
    });
  });
};

module.exports = { executeCode };
