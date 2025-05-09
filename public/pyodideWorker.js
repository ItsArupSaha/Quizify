// public/pyodideWorker.js

// Import the Pyodide runtime into the Worker
importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");

let pyodideReady = false;
let pyodide = null;

// 1) Initialize Pyodide
async function init() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
  });
  pyodideReady = true;
  // Notify main thread we’re ready
  postMessage({ type: "ready" });
}
init();

// 2) Handle incoming messages to load code or run a test
onmessage = async (e) => {
  const { id, action, code, callArgs } = e.data;

  if (!pyodideReady) {
    postMessage({ id, error: "Pyodide still loading" });
    return;
  }

  try {
    if (action === "load") {
      // Load the student’s entire code (defines solution())
      await pyodide.runPythonAsync(code);
      postMessage({ id, result: "loaded" });
    } else if (action === "run") {
      // Run one call: get a JSON‐quoted result for consistency
      const expr = `
import json
val = solution(${callArgs})
json.dumps(val) if not isinstance(val, bool) else str(val)
`;
      const raw = await pyodide.runPythonAsync(expr);
      postMessage({ id, result: raw });
    }
  } catch (err) {
    postMessage({ id, error: err.message || err.toString() });
  }
};
