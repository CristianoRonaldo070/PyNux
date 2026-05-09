# 🐍 PyNux — Online Python Compiler

<div align="center">

![PyNux](https://img.shields.io/badge/PyNux-Online%20Python%20Compiler-00ff41?style=for-the-badge&logo=python&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-ffd600?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-00e5ff?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel)

**A hacker-themed online Python compiler that runs entirely in your browser.**  
*No server. No backend. Just pure WebAssembly-powered Python.*

</div>

---

## ⚡ What is PyNux?

**PyNux** (Python + Linux) is a sleek, terminal-inspired online Python IDE that lets you write, edit, and execute Python code directly in your browser — powered by [Pyodide](https://pyodide.org/) (Python compiled to WebAssembly) and [Monaco Editor](https://microsoft.github.io/monaco-editor/) (the engine behind VS Code).

> No installations. No sign-ups. No data leaves your browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖥️ **Monaco Editor** | VS Code's editor with full Python syntax highlighting, auto-indentation, bracket matching, and IntelliSense |
| ⚡ **In-Browser Python** | Python 3.11 runs via Pyodide WebAssembly — zero backend required |
| 🎨 **Hacker Theme** | Matrix rain loading screen, neon green terminal aesthetic, CRT scanlines |
| 📁 **Multi-File Tabs** | Create up to 5 `.py` files with tabs, rename via double-click, close with × |
| 📋 **Copy with Feedback** | Animated tick icon on copy for 3 seconds |
| 🔤 **Font Controls** | Zoom in/out with dedicated buttons |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+Enter` to run, `Ctrl+Shift+N` for new file |
| 📱 **Responsive** | Works on desktop and mobile with adaptive layout |
| 🔒 **Secure Headers** | COOP/COEP headers, XSS protection, CSP via Vercel config |
| 🐍 **Python `input()` Support** | Custom dialog for interactive `input()` calls |

---

## 🚀 Quick Start

### Run Locally
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/PyNux.git
cd PyNux

# Serve with any static server
npx serve
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The included `vercel.json` handles all security headers and CORS configuration automatically.

---

## 🗂️ Project Structure

```
PyNux/
├── index.html        # Main HTML — loading screen + editor layout
├── style.css         # Hacker theme CSS — matrix aesthetic
├── script.js         # App logic — Monaco, Pyodide, tabs, execution
├── favicon.svg       # Glowing "Py" terminal favicon
├── vercel.json       # Vercel deployment config + security headers
├── .gitignore        # Git ignore rules
└── README.md         # You are here
```

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Run code |
| `Ctrl + Shift + N` | New file |
| `Tab` | Indent (4 spaces) |
| `Double-click tab` | Rename file |

---

## 🛠️ Tech Stack

- **Editor** — [Monaco Editor](https://microsoft.github.io/monaco-editor/) (VS Code engine)
- **Python Runtime** — [Pyodide v0.24.1](https://pyodide.org/) (CPython → WebAssembly)
- **Fonts** — [Fira Code](https://github.com/tonsky/FiraCode) + [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono)
- **Hosting** — [Vercel](https://vercel.com/) (static deployment)

---

## 📸 Preview

> Matrix rain loading screen → Split-pane editor with live Python output

---

## 📄 License

MIT License — feel free to fork, modify, and deploy.

---

<div align="center">

**Built with 💚 by hackers, for hackers.**

*PyNux — Write Python. Run Anywhere.*

</div>
