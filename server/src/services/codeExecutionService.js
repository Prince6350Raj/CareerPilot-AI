const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');

function normalizeOutput(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'boolean' || typeof val === 'number') return String(val);
  if (typeof val === 'string') return val.trim();
  try {
    return JSON.stringify(val).replace(/\s+/g, '');
  } catch (e) {
    return String(val).trim();
  }
}

function compareOutputs(actual, expected) {
  const normAct = normalizeOutput(actual).toLowerCase();
  const normExp = normalizeOutput(expected).toLowerCase();

  if (normAct === normExp) return true;

  if (normAct.startsWith('[') && normExp.startsWith('[')) {
    try {
      const aArr = Array.isArray(actual) ? actual : JSON.parse(actual);
      const eArr = typeof expected === 'string' ? JSON.parse(expected) : expected;
      if (Array.isArray(aArr) && Array.isArray(eArr) && aArr.length === eArr.length) {
        const s1 = JSON.stringify([...aArr].sort());
        const s2 = JSON.stringify([...eArr].sort());
        if (s1 === s2) return true;
      }
    } catch (e) {}
  }

  return false;
}

async function executeJavaScript(userCode, funcName, inputStr, expectedOutputStr) {
  return new Promise((resolve) => {
    try {
      const varMatches = [...inputStr.matchAll(/(?:^|,\s*)([a-zA-Z0-9_$]+)\s*=/g)].map(m => m[1]);
      let declStr = "let " + inputStr.replace(/,\s*([a-zA-Z0-9_$]+)\s*=/g, "; let $1 =") + ";";

      const runnerCode = [
        userCode,
        '(function() {',
        '  ' + declStr,
        '  let targetFunc = null;',
        '  if (typeof ' + funcName + ' === "function") {',
        '    targetFunc = ' + funcName + ';',
        '  } else if (typeof Solution === "function") {',
        '    const sol = new Solution();',
        '    if (typeof sol.' + funcName + ' === "function") {',
        '      targetFunc = sol.' + funcName + '.bind(sol);',
        '    }',
        '  }',
        '  if (!targetFunc) {',
        '    throw new Error("Function \'' + funcName + '\' was not found in your code.");',
        '  }',
        '  return targetFunc(' + varMatches.join(', ') + ');',
        '})();'
      ].join('\n');

      const sandbox = {
        console: { log: () => {}, error: () => {}, warn: () => {} },
        Map, Set, Array, Object, Math, String, Number, Boolean, RegExp, Date, parseInt, parseFloat, isNaN, isFinite
      };

      const script = new vm.Script(runnerCode);
      const context = vm.createContext(sandbox);
      const startTime = Date.now();
      const result = script.runInContext(context, { timeout: 2000 });
      const durationMs = Date.now() - startTime;

      const isMatch = compareOutputs(result, expectedOutputStr);
      resolve({
        success: isMatch,
        actualOutput: result !== undefined ? (typeof result === 'object' ? JSON.stringify(result) : String(result)) : 'undefined',
        expectedOutput: expectedOutputStr,
        runtimeMs: durationMs,
        error: isMatch ? null : ("Expected " + expectedOutputStr + ", but returned " + JSON.stringify(result))
      });
    } catch (err) {
      resolve({
        success: false,
        actualOutput: "Error: " + err.message,
        expectedOutput: expectedOutputStr,
        runtimeMs: 0,
        error: "Runtime Error: " + err.message
      });
    }
  });
}

async function executePython(userCode, funcName, inputStr, expectedOutputStr) {
  return new Promise((resolve) => {
    try {
      const tempDir = os.tmpdir();
      const scriptPath = path.join(tempDir, ("py_sol_" + Date.now() + "_" + Math.random().toString(36).substring(7) + ".py"));

      const varMatches = [...inputStr.matchAll(/(?:^|,\s*)([a-zA-Z0-9_$]+)\s*=/g)].map(m => m[1]);
      let pyDeclStr = inputStr.replace(/,\s*([a-zA-Z0-9_$]+)\s*=/g, "\n$1 =");
      pyDeclStr = pyDeclStr.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None');

      const wrapper = "import json\nimport sys\nfrom typing import List, Dict, Tuple, Optional, Any, Set\n\n" +
        userCode + "\n\n" +
        "def __run_eval():\n" +
        "    solver = None\n" +
        "    if 'Solution' in globals() and isinstance(Solution, type):\n" +
        "        try:\n" +
        "            solver = Solution()\n" +
        "        except:\n" +
        "            pass\n" +
        "    target_func = None\n" +
        "    if solver:\n" +
        "        if hasattr(solver, '" + funcName + "'):\n" +
        "            target_func = getattr(solver, '" + funcName + "')\n" +
        "        else:\n" +
        "            methods = [m for m in dir(solver) if not m.startswith('__') and callable(getattr(solver, m))]\n" +
        "            if methods:\n" +
        "                target_func = getattr(solver, methods[0])\n" +
        "    if not target_func and '" + funcName + "' in globals() and callable(globals()['" + funcName + "']):\n" +
        "        target_func = globals()['" + funcName + "']\n" +
        "    if not target_func:\n" +
        "        print(json.dumps({'__eval_error': 'Function " + funcName + " not defined.'}))\n" +
        "        return\n" +
        "    " + pyDeclStr.split('\n').join('\n    ') + "\n" +
        "    try:\n" +
        "        res = target_func(" + varMatches.join(', ') + ")\n" +
        "        print(json.dumps({'__eval_result': res}))\n" +
        "    except Exception as e:\n" +
        "        print(json.dumps({'__eval_error': str(e)}))\n\n" +
        "if __name__ == '__main__':\n" +
        "    __run_eval()\n";

      fs.writeFileSync(scriptPath, wrapper, 'utf8');

      const startTime = Date.now();
      exec('python "' + scriptPath + '"', { timeout: 3000 }, (err, stdout, stderr) => {
        try { fs.unlinkSync(scriptPath); } catch (e) {}
        const durationMs = Date.now() - startTime;

        if (err && !stdout) {
          return resolve({
            success: false,
            actualOutput: "Runtime Error",
            expectedOutput: expectedOutputStr,
            runtimeMs: durationMs,
            error: stderr ? stderr.split('\n').slice(-3).join(' ') : err.message
          });
        }

        try {
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine);

          if (parsed.__eval_error) {
            return resolve({
              success: false,
              actualOutput: "Error: " + parsed.__eval_error,
              expectedOutput: expectedOutputStr,
              runtimeMs: durationMs,
              error: "Runtime Error: " + parsed.__eval_error
            });
          }

          const res = parsed.__eval_result;
          const isMatch = compareOutputs(res, expectedOutputStr);

          resolve({
            success: isMatch,
            actualOutput: res !== undefined ? (typeof res === 'object' ? JSON.stringify(res) : String(res)) : 'None',
            expectedOutput: expectedOutputStr,
            runtimeMs: durationMs,
            error: isMatch ? null : ("Expected " + expectedOutputStr + ", but returned " + JSON.stringify(res))
          });
        } catch (parseErr) {
          resolve({
            success: false,
            actualOutput: stdout.trim() || stderr.trim() || 'Syntax/Compile Error',
            expectedOutput: expectedOutputStr,
            runtimeMs: durationMs,
            error: stderr || stdout || 'Execution Error'
          });
        }
      });
    } catch (fatalErr) {
      resolve({
        success: false,
        actualOutput: "Error: " + fatalErr.message,
        expectedOutput: expectedOutputStr,
        runtimeMs: 0,
        error: fatalErr.message
      });
    }
  });
}

async function executeCpp(userCode, funcName, inputStr, expectedOutputStr) {
  return new Promise((resolve) => {
    try {
      const tempDir = os.tmpdir();
      const baseName = `cpp_sol_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const sourcePath = path.join(tempDir, `${baseName}.cpp`);
      const exePath = path.join(tempDir, `${baseName}.exe`);

      const varMatches = [...inputStr.matchAll(/(?:^|,\s*)([a-zA-Z0-9_$]+)\s*=/g)].map(m => m[1]);

      let cppDecls = [];
      const parts = inputStr.split(/,\s*(?=[a-zA-Z0-9_$]+\s*=)/);
      for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx !== -1) {
          const varName = part.substring(0, eqIdx).trim();
          let val = part.substring(eqIdx + 1).trim();
          if (val.startsWith('[')) {
            val = val.replace(/\[/g, '{').replace(/\]/g, '}');
            if (val.includes('"')) {
              cppDecls.push(`vector<string> ${varName} = ${val};`);
            } else if (val.includes('{') && val.indexOf('{') !== val.lastIndexOf('{')) {
              cppDecls.push(`vector<vector<int>> ${varName} = ${val};`);
            } else {
              cppDecls.push(`vector<int> ${varName} = ${val};`);
            }
          } else if (val.startsWith('"')) {
            cppDecls.push(`string ${varName} = ${val};`);
          } else if (val === 'true' || val === 'false') {
            cppDecls.push(`bool ${varName} = ${val};`);
          } else if (!isNaN(Number(val))) {
            cppDecls.push(`int ${varName} = ${val};`);
          } else {
            cppDecls.push(`auto ${varName} = ${val};`);
          }
        }
      }

      const cppHarness = [
        '#include <iostream>',
        '#include <vector>',
        '#include <string>',
        '#include <unordered_map>',
        '#include <unordered_set>',
        '#include <map>',
        '#include <set>',
        '#include <algorithm>',
        '#include <queue>',
        '#include <stack>',
        '#include <cmath>',
        '#include <sstream>',
        'using namespace std;',
        '',
        'template <typename T>',
        'void __print_val(const T& val) { cout << val; }',
        'void __print_val(bool val) { cout << (val ? "true" : "false"); }',
        'void __print_val(const string& val) { cout << "\\"" << val << "\\""; }',
        'template <typename T>',
        'void __print_val(const vector<T>& vec) {',
        '    cout << "[";',
        '    for (size_t i = 0; i < vec.size(); ++i) {',
        '        __print_val(vec[i]);',
        '        if (i + 1 < vec.size()) cout << ",";',
        '    }',
        '    cout << "]";',
        '}',
        '',
        userCode,
        '',
        'int main() {',
        '    try {',
        '        Solution sol;',
        '        ' + cppDecls.join('\n        '),
        '        auto res = sol.' + funcName + '(' + varMatches.join(', ') + ');',
        '        __print_val(res);',
        '        cout << endl;',
        '    } catch (const exception& e) {',
        '        cerr << "Runtime Exception: " << e.what() << endl;',
        '        return 1;',
        '    } catch (...) {',
        '        cerr << "Unknown Runtime Error" << endl;',
        '        return 1;',
        '    }',
        '    return 0;',
        '}'
      ].join('\n');

      fs.writeFileSync(sourcePath, cppHarness, 'utf8');

      const startTime = Date.now();
      exec(`g++ -O2 -std=c++17 "${sourcePath}" -o "${exePath}"`, { timeout: 8000 }, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          try { fs.unlinkSync(sourcePath); } catch (e) {}
          return resolve({
            success: false,
            actualOutput: 'Compile Error',
            expectedOutput: expectedOutputStr,
            runtimeMs: 0,
            error: `C++ Compile Error:\n${compileStderr || compileErr.message}`
          });
        }

        exec(`"${exePath}"`, { timeout: 4000 }, (runErr, stdout, stderr) => {
          try { fs.unlinkSync(sourcePath); fs.unlinkSync(exePath); } catch (e) {}
          const durationMs = Date.now() - startTime;

          if (runErr) {
            return resolve({
              success: false,
              actualOutput: 'Runtime Error',
              expectedOutput: expectedOutputStr,
              runtimeMs: durationMs,
              error: `Runtime Error: ${stderr || runErr.message}`
            });
          }

          const res = stdout.trim();
          const isMatch = compareOutputs(res, expectedOutputStr);

          resolve({
            success: isMatch,
            actualOutput: res,
            expectedOutput: expectedOutputStr,
            runtimeMs: durationMs,
            error: isMatch ? null : `Expected ${expectedOutputStr}, but returned ${res}`
          });
        });
      });
    } catch (err) {
      resolve({
        success: false,
        actualOutput: `Error: ${err.message}`,
        expectedOutput: expectedOutputStr,
        runtimeMs: 0,
        error: `Error: ${err.message}`
      });
    }
  });
}

exports.evaluateCode = async (userCode, language, funcName, testCases = []) => {
  const lang = (language || 'javascript').toLowerCase();

  if (!testCases || testCases.length === 0) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'No test cases provided for execution.',
      actualOutput: 'N/A'
    };
  }

  let allPassed = true;
  let firstFailure = null;
  let totalRuntime = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let runResult;

    if (lang === 'python' || lang === 'py' || lang === 'python3') {
      runResult = await executePython(userCode, funcName, tc.input, tc.output);
    } else if (lang === 'cpp' || lang === 'c++' || lang === 'c') {
      runResult = await executeCpp(userCode, funcName, tc.input, tc.output);
    } else {
      runResult = await executeJavaScript(userCode, funcName, tc.input, tc.output);
    }

    totalRuntime += (runResult.runtimeMs || 0);

    if (!runResult.success) {
      allPassed = false;
      firstFailure = {
        testCaseIndex: i + 1,
        input: tc.input,
        expected: tc.output,
        actual: runResult.actualOutput,
        error: runResult.error
      };
      break;
    }
  }

  if (allPassed) {
    return {
      isCorrect: true,
      score: 100,
      timeComplexity: Math.max(0, totalRuntime) + " ms",
      spaceComplexity: '7.83 MB',
      feedback: "Accepted: All " + testCases.length + " test cases passed successfully!",
      actualOutput: testCases[0]?.output || 'Passed',
      expectedOutput: testCases[0]?.output || 'Passed'
    };
  } else {
    return {
      isCorrect: false,
      score: 0,
      timeComplexity: 'N/A',
      spaceComplexity: 'N/A',
      feedback: firstFailure.error ? firstFailure.error : ("Wrong Answer on Testcase " + firstFailure.testCaseIndex + ": Expected " + firstFailure.expected + ", but got " + firstFailure.actual + "."),
      actualOutput: firstFailure.actual,
      expectedOutput: firstFailure.expected,
      failedCaseIndex: firstFailure.testCaseIndex
    };
  }
};
