/* ═══════════════════════════════════════════════════════
   PyNux — Online Python Compiler  (Monaco + Pyodide)
   ═══════════════════════════════════════════════════════ */

const $ = s => document.querySelector(s);

// DOM refs
const loadingScreen = $('#loading-screen'), loaderLines = $('#loader-lines');
const loaderProgress = $('#loader-progress'), loaderStatus = $('#loader-status');
const app = $('#app'), outputEl = $('#output'), placeholder = $('#output-placeholder');
const btnRun = $('#btn-run'), btnStop = $('#btn-stop'), btnClear = $('#btn-clear');
const btnClearOut = $('#btn-clear-output'), btnNew = $('#btn-new');
const btnCopy = $('#btn-copy');
const btnFontUp = $('#btn-font-up'), btnFontDown = $('#btn-font-down');
const btnWrap = $('#btn-wrap');
const statusState = $('#status-state'), statusCursor = $('#status-cursor');
const statusTimer = $('#status-timer'), timerValue = $('#timer-value');
const inputOverlay = $('#input-overlay'), inputField = $('#input-field');
const inputLabel = $('#input-prompt-label');
const fileTabs = $('#file-tabs');

let pyodide = null, editor = null, isRunning = false;
let execStartTime = 0, timerInterval = null, fontSize = 14, wordWrap = true;

/* ══════════ MULTI-FILE SYSTEM (max 5) ══════════ */
const MAX_FILES = 5;
let files = [
  { name: 'main.py', content: `# ═══════════════════════════════════════════
# 🐍 PyNux — Python Feature Showcase
# All Python built-ins & standard library work!
# ═══════════════════════════════════════════

# ── Built-in Functions ──
nums = [42, 8, 15, 16, 23, 4]
print("Original:", nums)
print("Sorted:  ", sorted(nums))
print("Reversed:", list(reversed(nums)))
print(f"len={len(nums)}, sum={sum(nums)}, min={min(nums)}, max={max(nums)}")
print(f"abs(-7)={abs(-7)}, round(3.14159,2)={round(3.14159,2)}, pow(2,10)={pow(2,10)}")

# ── String Methods ──
text = "hello pynux"
print(f"\\nupper: {text.upper()}")
print(f"title: {text.title()}")
print(f"split: {text.split()}")
print(f"replace: {text.replace('pynux','world')}")
print(f"find 'nux': index {text.find('nux')}")

# ── List / Dict / Set ──
squares = [x**2 for x in range(1, 6)]
evens = list(filter(lambda x: x%2==0, range(1, 11)))
mapped = list(map(str, squares))
print(f"\\nSquares: {squares}")
print(f"Evens: {evens}")
print(f"Mapped: {mapped}")
print(f"Zip: {list(zip(['a','b','c'], [1,2,3]))}")

fruits = {"apple": 3, "banana": 1, "cherry": 5}
print(f"Dict sorted by value: {sorted(fruits.items(), key=lambda x: x[1])}")

unique = set([1,2,2,3,3,3])
print(f"Set: {unique}, type: {type(unique).__name__}")

# ── Math Module ──
import math
print(f"\\nπ={math.pi}, e={math.e:.4f}")
print(f"sqrt(144)={math.sqrt(144)}, factorial(7)={math.factorial(7)}")
print(f"gcd(48,18)={math.gcd(48,18)}, log2(256)={math.log2(256)}")

# ── Random Module ──
import random
print(f"\\nRandom int 1-100: {random.randint(1, 100)}")
print(f"Random choice: {random.choice(['🎯','🚀','🔥','⚡','💎'])}")
sample = random.sample(range(1, 50), 5)
print(f"Random sample: {sample}")

# ── Datetime ──
from datetime import datetime, timedelta
now = datetime.now()
print(f"\\nNow: {now.strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Tomorrow: {(now + timedelta(days=1)).strftime('%A, %B %d')}")

# ── Collections ──
from collections import Counter, defaultdict
words = "hello world hello python hello pynux world".split()
print(f"\\nWord counts: {dict(Counter(words).most_common())}")

# ── Regex ──
import re
emails = "Contact us at info@pynux.dev or hello@test.com"
found = re.findall(r'[\\w.]+@[\\w.]+', emails)
print(f"\\nEmails found: {found}")

# ── Classes & OOP ──
class Hacker:
    def __init__(self, name, skill):
        self.name = name
        self.skill = skill
    def __repr__(self):
        return f"Hacker({self.name}, lvl={self.skill})"

team = [Hacker("Neo", 99), Hacker("Trinity", 95), Hacker("Morpheus", 92)]
team.sort(key=lambda h: h.skill, reverse=True)
print(f"\\nTeam: {team}")

# ── Lambda, Map, Filter, Reduce ──
from functools import reduce
product = reduce(lambda a, b: a * b, range(1, 6))
print(f"\\n5! via reduce: {product}")

# ── Enumerate & Comprehensions ──
print("\\n🏆 Top Skills:")
for i, h in enumerate(team, 1):
    bar = "█" * (h.skill // 10)
    print(f"  #{i} {h.name:>10} [{bar}] {h.skill}")

print("\\n✅ All features working perfectly!")
` }
];
let activeFileIdx = 0;

function renderTabs() {
  fileTabs.innerHTML = '';
  files.forEach((file, i) => {
    const tab = document.createElement('div');
    tab.className = 'file-tab' + (i === activeFileIdx ? ' active' : '');
    tab.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span class="tab-name">${file.name}</span>
      ${files.length > 1 ? '<svg class="tab-close" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' : ''}
    `;
    // Switch tab on click
    tab.addEventListener('click', (e) => {
      if (e.target.closest('.tab-close')) return;
      switchTab(i);
    });
    // Double-click to rename (only the name part, .py stays)
    const nameSpan = tab.querySelector('.tab-name');
    nameSpan.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      renameTab(i, nameSpan);
    });
    // Close tab
    const closeBtn = tab.querySelector('.tab-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(i);
      });
    }
    fileTabs.appendChild(tab);
  });
}

function renameTab(idx, spanEl) {
  const oldName = files[idx].name.replace(/\.py$/, '');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldName;
  input.style.cssText = 'width:80px;padding:1px 4px;font:inherit;font-size:.74rem;background:#0b1015;color:#c9d1d9;border:1px solid #00ff41;border-radius:3px;outline:none;';
  spanEl.replaceWith(input);
  input.focus();
  input.select();

  const finish = () => {
    let val = input.value.trim().replace(/\.py$/i, '').replace(/[^a-zA-Z0-9_\-]/g, '');
    if (!val) val = oldName;
    const newName = val + '.py';
    // Check for duplicates (skip self)
    if (files.some((f, j) => j !== idx && f.name === newName)) {
      val = oldName; // revert if duplicate
    }
    files[idx].name = val + '.py';
    renderTabs();
  };

  input.addEventListener('blur', finish);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = oldName; input.blur(); }
  });
}

function switchTab(idx) {
  // Save current content
  if (editor) files[activeFileIdx].content = editor.getValue();
  activeFileIdx = idx;
  if (editor) editor.setValue(files[idx].content);
  renderTabs();
}

function closeTab(idx) {
  if (files.length <= 1) return;
  files.splice(idx, 1);
  if (activeFileIdx >= files.length) activeFileIdx = files.length - 1;
  else if (activeFileIdx > idx) activeFileIdx--;
  else if (activeFileIdx === idx) activeFileIdx = Math.min(idx, files.length - 1);
  if (editor) editor.setValue(files[activeFileIdx].content);
  renderTabs();
}

function createNewFile() {
  if (files.length >= MAX_FILES) {
    alert(`Maximum ${MAX_FILES} files allowed.`);
    return;
  }

  const overlay = $('#newfile-overlay');
  const input = $('#newfile-input');
  const errEl = $('#newfile-error');

  overlay.style.display = 'flex';
  input.value = '';
  errEl.style.display = 'none';
  setTimeout(() => input.focus(), 50);

  const cleanup = () => {
    overlay.style.display = 'none';
    input.removeEventListener('keydown', onKey);
    overlay.removeEventListener('click', onBg);
  };

  const submit = () => {
    let val = input.value.trim().replace(/\.py$/i, '').replace(/[^a-zA-Z0-9_\-]/g, '');
    if (!val) {
      errEl.textContent = 'Please enter a valid name (letters, numbers, _ or -)';
      errEl.style.display = 'block';
      return;
    }
    const name = val + '.py';
    if (files.some(f => f.name === name)) {
      errEl.textContent = `"${name}" already exists.`;
      errEl.style.display = 'block';
      return;
    }
    // Save current file content
    if (editor) files[activeFileIdx].content = editor.getValue();
    files.push({ name, content: `# ${name}\n\n` });
    activeFileIdx = files.length - 1;
    if (editor) editor.setValue(files[activeFileIdx].content);
    renderTabs();
    cleanup();
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    if (e.key === 'Escape') { cleanup(); }
  };

  const onBg = (e) => {
    if (e.target === overlay) cleanup();
  };

  input.addEventListener('keydown', onKey);
  overlay.addEventListener('click', onBg);
}


/* ══════════ MATRIX RAIN ══════════ */
(function () {
  const canvas = $('#matrix-canvas'), ctx = canvas.getContext('2d');
  let cols, drops;
  const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘ012345789ABCDEF<>/{}[]()=+*&#@!';
  function resize() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    cols = Math.floor(canvas.width / 14); drops = Array(cols).fill(1);
  }
  resize(); addEventListener('resize', resize);
  function draw() {
    ctx.fillStyle = 'rgba(10,10,10,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41'; ctx.font = '13px monospace';
    for (let i = 0; i < cols; i++) {
      ctx.fillText(chars[Math.random() * chars.length | 0], i * 14, drops[i] * 14);
      if (drops[i] * 14 > canvas.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    }
  }
  const t = setInterval(draw, 40);
  window._stopMatrix = () => clearInterval(t);
})();

/* ══════════ LOADER ANIMATION ══════════ */
const LOAD_LINES = [
  { text: '$ python3 --version', cls: 'prompt', delay: 200 },
  { text: 'Python 3.11.3 (pyodide)', cls: 'success', delay: 400 },
  { text: '$ pip install pyodide-core', cls: 'prompt', delay: 600 },
  { text: '# Loading WebAssembly runtime...', cls: 'comment', delay: 900 },
  { text: 'import sys, os, json, math', cls: 'keyword', delay: 1200 },
  { text: 'from pyodide import *', cls: 'keyword', delay: 1400 },
  { text: '# Initializing code editor...', cls: 'comment', delay: 1700 },
  { text: 'print("PyNux ready ✓")', cls: 'string', delay: 2000 },
  { text: '>>> PyNux ready ✓', cls: 'success', delay: 2400 },
];
const STATUS_MSGS = [
  [0, 'Initializing...'], [15, 'Loading WebAssembly...'],
  [35, 'Downloading Python runtime...'], [55, 'Compiling standard library...'],
  [75, 'Setting up editor...'], [90, 'Almost there...'], [100, 'Welcome to PyNux'],
];

function animateLoader() {
  LOAD_LINES.forEach(({ text, cls, delay }) => {
    setTimeout(() => {
      const d = document.createElement('div');
      d.className = `line ${cls}`; d.textContent = text;
      loaderLines.appendChild(d); loaderLines.scrollTop = loaderLines.scrollHeight;
    }, delay);
  });
}

function animateProgress(duration) {
  const start = performance.now(); let mi = 0;
  (function tick() {
    const pct = Math.min(((performance.now() - start) / duration) * 100, 100);
    loaderProgress.style.width = pct + '%';
    while (mi < STATUS_MSGS.length - 1 && pct >= STATUS_MSGS[mi + 1][0]) mi++;
    loaderStatus.textContent = STATUS_MSGS[mi][1];
    if (pct < 100) requestAnimationFrame(tick);
  })();
}

/* ══════════ MONACO EDITOR ══════════ */
function createEditor() {
  monaco.editor.defineTheme('pynux-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'b388ff' },
      { token: 'string', foreground: 'ffd600' },
      { token: 'number', foreground: '00e5ff' },
      { token: 'type', foreground: '00e5ff' },
      { token: 'identifier', foreground: 'c9d1d9' },
      { token: 'delimiter', foreground: '6e7681' },
      { token: 'tag', foreground: '00ff41' },
    ],
    colors: {
      'editor.background': '#0b1015',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#00ff4108',
      'editor.selectionBackground': '#00ff4120',
      'editorCursor.foreground': '#00ff41',
      'editorLineNumber.foreground': '#3d4f5f',
      'editorLineNumber.activeForeground': '#00ff41',
      'editorGutter.background': '#0b1015',
      'editor.selectionHighlightBackground': '#00ff4115',
      'editorBracketMatch.background': '#00ff4130',
      'editorBracketMatch.border': '#00ff4160',
      'editorIndentGuide.background': '#1a233280',
      'editorIndentGuide.activeBackground': '#00ff4130',
      'scrollbarSlider.background': '#00801f60',
      'scrollbarSlider.hoverBackground': '#00cc3380',
      'editorWidget.background': '#111820',
      'editorWidget.border': '#1a2332',
      'input.background': '#0b1015',
      'input.border': '#1a2332',
      'focusBorder': '#00ff41',
      'list.hoverBackground': '#00ff4110',
      'list.activeSelectionBackground': '#00ff4120',
    }
  });

  editor = monaco.editor.create($('#editor-container'), {
    value: files[activeFileIdx].content,
    language: 'python',
    theme: 'pynux-dark',
    fontSize: fontSize,
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontLigatures: true,
    minimap: { enabled: false },
    wordWrap: 'on',
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    renderLineHighlight: 'all',
    bracketPairColorization: { enabled: true },
    padding: { top: 12, bottom: 12 },
    lineNumbers: 'on',
    glyphMargin: false,
    folding: true,
    suggest: { showWords: true },
    quickSuggestions: true,
  });

  editor.onDidChangeCursorPosition(e => {
    statusCursor.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
  });

  editor.addAction({
    id: 'run-code', label: 'Run Code',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => runCode()
  });

  renderTabs();
}

/* ══════════ PYODIDE ══════════ */
async function loadPyodideRuntime() {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
  document.head.appendChild(s);
  await new Promise(r => { s.onload = r; });

  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
  });

  pyodide.runPython(`
import sys
class _Out:
    def __init__(self, n):
        self._n = n
    def write(self, t):
        if t:
            from js import _pynux_write
            _pynux_write(t, self._n)
    def flush(self): pass
sys.stdout = _Out("stdout")
sys.stderr = _Out("stderr")
`);
}

window._pynux_write = (text, stream) => {
  appendOutput(text, stream === 'stderr' ? 'out-error' : 'out-line');
};

/* ══════════ EXECUTION ══════════ */
function appendOutput(text, cls = 'out-line') {
  if (placeholder.style.display !== 'none') placeholder.style.display = 'none';
  const s = document.createElement('span');
  s.className = cls; s.textContent = text;
  outputEl.appendChild(s); outputEl.scrollTop = outputEl.scrollHeight;
}

function clearOutput() {
  outputEl.innerHTML = '';
  placeholder.style.display = '';
  outputEl.appendChild(placeholder);
}

function startTimer() {
  execStartTime = performance.now();
  statusTimer.style.display = 'flex';
  timerInterval = setInterval(() => {
    timerValue.textContent = ((performance.now() - execStartTime) / 1000).toFixed(2) + 's';
  }, 50);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerValue.textContent = ((performance.now() - execStartTime) / 1000).toFixed(2) + 's';
}

async function runCode() {
  if (isRunning || !pyodide) return;
  isRunning = true;
  btnRun.style.display = 'none'; btnStop.style.display = 'inline-flex';
  statusState.textContent = 'Running...'; statusState.style.color = '#ffd600';

  // Save current file
  files[activeFileIdx].content = editor.getValue();
  const currentFile = files[activeFileIdx].name;

  clearOutput();
  appendOutput(`>>> Running ${currentFile}...\n`, 'out-system');
  startTimer();

  const code = editor.getValue();
  try {
    pyodide.runPython(`
import builtins
def _pynux_input(prompt=""):
    from js import _pynux_sync_input
    result = _pynux_sync_input(prompt)
    return str(result) if result is not None else ""
builtins.input = _pynux_input
`);
    await pyodide.runPythonAsync(code);
    stopTimer();
    appendOutput('\n', 'out-line');
    appendOutput(`✅ Process finished (${timerValue.textContent})\n`, 'out-success');
  } catch (err) {
    stopTimer();
    const msg = (err.message || String(err)).replace(/File "<exec>"/g, `File "${currentFile}"`);
    appendOutput('\n' + msg + '\n', 'out-error');
    appendOutput(`\n❌ Process finished with error (${timerValue.textContent})\n`, 'out-error');
  }
  isRunning = false;
  btnRun.style.display = 'inline-flex'; btnStop.style.display = 'none';
  statusState.textContent = 'Ready'; statusState.style.color = '';
}

// Synchronous input — window.prompt() blocks JS and returns a string immediately
window._pynux_sync_input = function (prompt) {
  appendOutput(prompt || '', 'out-input-line');
  const value = window.prompt(prompt || 'Enter input:') || '';
  appendOutput(value + '\n', 'out-input-line');
  return value;
};

/* ══════════ TOOLBAR ══════════ */

// ★ RUN BUTTON CLICK — this was missing before!
btnRun.addEventListener('click', () => runCode());

btnStop.addEventListener('click', () => {
  if (isRunning) {
    stopTimer();
    appendOutput('\n⛔ Execution interrupted by user\n', 'out-error');
    isRunning = false;
    btnRun.style.display = 'inline-flex'; btnStop.style.display = 'none';
    statusState.textContent = 'Ready'; statusState.style.color = '';
  }
});

btnClear.addEventListener('click', clearOutput);
btnClearOut.addEventListener('click', clearOutput);

// New file with prompt
btnNew.addEventListener('click', () => createNewFile());

// Copy with tick animation (3s)
btnCopy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(editor.getValue()); } catch {}
  btnCopy.classList.add('copied');
  setTimeout(() => btnCopy.classList.remove('copied'), 3000);
});



btnFontUp.addEventListener('click', () => { fontSize = Math.min(fontSize + 1, 28); editor.updateOptions({ fontSize }); });
btnFontDown.addEventListener('click', () => { fontSize = Math.max(fontSize - 1, 10); editor.updateOptions({ fontSize }); });

btnWrap.addEventListener('click', () => {
  wordWrap = !wordWrap;
  btnWrap.style.color = wordWrap ? '#00ff41' : '';
  editor.updateOptions({ wordWrap: wordWrap ? 'on' : 'off' });
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') { e.preventDefault(); createNewFile(); }
});

/* ══════════ RESIZE HANDLE ══════════ */
(function () {
  const handle = $('#resize-handle'), ep = $('#panel-editor'), op = $('#panel-output');
  let sx, sw;
  handle.addEventListener('mousedown', e => {
    e.preventDefault(); sx = e.clientX; sw = ep.offsetWidth;
    handle.classList.add('active');
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    const move = e => {
      const tw = ep.parentElement.offsetWidth - handle.offsetWidth;
      const nw = Math.max(200, Math.min(tw - 200, sw + e.clientX - sx));
      const p = (nw / tw) * 100;
      ep.style.flex = `0 0 ${p}%`; op.style.flex = `0 0 ${100 - p}%`;
    };
    const up = () => {
      handle.classList.remove('active');
      document.body.style.cursor = ''; document.body.style.userSelect = '';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
})();

/* ══════════ BOOT ══════════ */
(async function () {
  animateLoader();
  animateProgress(4500);

  const monacoScript = document.createElement('script');
  monacoScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
  document.head.appendChild(monacoScript);
  await new Promise(r => { monacoScript.onload = r; });

  require.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }
  });

  const monacoReady = new Promise(r => {
    require(['vs/editor/editor.main'], () => { createEditor(); r(); });
  });

  const pyodideReady = loadPyodideRuntime().catch(err => {
    console.error('Pyodide load error:', err);
    return loadPyodideRuntime();
  });

  try {
    await Promise.all([monacoReady, pyodideReady]);
  } catch (e) {
    loaderStatus.textContent = 'Failed to load runtime. Please refresh.';
    loaderStatus.style.color = '#ff1744';
    return;
  }

  await new Promise(r => setTimeout(r, 2500));
  loaderProgress.style.width = '100%';
  loaderStatus.textContent = 'Welcome to PyNux';
  await new Promise(r => setTimeout(r, 600));

  loadingScreen.classList.add('hidden');
  window._stopMatrix();
  app.classList.add('visible');
  editor.focus();
})();
