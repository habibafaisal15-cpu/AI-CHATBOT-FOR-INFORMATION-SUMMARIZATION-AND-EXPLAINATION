# AI Helper: Structured Problem Solver

AI Helper is a premium, client-side web application designed to deconstruct complex, multi-dimensional problems into isolated sub-problems, map out a logical step-by-step reasoning timeline, and detail concrete justifications for every key decision.

Featuring a highly colorful aurora dark theme, glassmorphism UI cards, and responsive timeline animations, the application is built entirely with vanilla frontend technologies (HTML, CSS, JavaScript ES Modules) and integrates directly with the Anthropic Claude API.

---

## Key Features

*   🧩 **Problem Decomposition**: Deconstructs any complex problem into 3–5 independent, decoupled sub-problems or architectural components.
*   ⚙️ **Step-by-Step Reasoning Timeline**: Formulates a chronological progression of 4–6 concrete reasoning steps, complete with actionable details and implementation guides.
*   💡 **Key Justifications**: Generates 3–5 technical or logical justifications explaining the rationale behind major decisions.
*   💻 **Actionable Code & Markdown Rendering**: Automatically detects inline code backticks (\`code\`) and multi-line code blocks (\`\`\`js ... \`\`\`) inside explanations and renders them in scrollable monospaced code blocks.
*   🎭 **Intelligent Demo Mock Mode**: Runs fully functional out-of-the-box. If no API key is provided, the application detects common engineering or business topics (such as *string reversal*, *CSS centering*, *scalable chat architecture*, *database optimization*, and *growth marketing*) and returns hand-crafted, concrete, code-complete solutions.
*   ⚙️ **Secure Client-side API Configuration**: Features a settings modal to input your **Anthropic API Key**, customize the target Claude model, and configure a **CORS Proxy URL** to safely bypass browser CORS blocks.

---

## Project Architecture

The application is structured cleanly into dedicated modules:

```
ai-helper/
├── index.html           # Main dashboard layout, form inputs, and settings modal
├── style.css            # Custom glassmorphism design system and colorful animations
├── main.js              # Central application controller and event orchestrator
├── README.md            # Project documentation
├── api/
│   └── claude.js        # API credentials manager and Intelligent Mock Mode database
├── core/
│   ├── decomposer.js    # Sub-problem validator (enforces 3–5 parts rule)
│   ├── reasoner.js      # Timeline step validator (enforces 4–6 steps rule)
│   └── explainer.js     # Decision rationale validator (enforces 3–5 explains rule)
└── ui/
    ├── loader.js        # Multi-stage progressive thinking loading screen
    └── renderer.js      # Dynamic DOM generator and secure markdown-to-HTML parser
```

---

## Visual Design & Aesthetics

*   **Aurora Backdrop**: Deep slate base (`#04050d`) with three offset backdrop glowing radial orbs (Violet, Cyan, and Rose) creating a beautiful, modern ambient aurora effect.
*   **Color-Coded Columns**:
    *   **Decomposed Parts**: Accentuated with a **Violet theme** (`#7c3aed`) and left-border cards.
    *   **Step-by-Step Thinking**: Accentuated with a **Cyan theme** (`#0891b2`) featuring glowing numbered timeline badges.
    *   **Key Justifications**: Accentuated with a **Rose theme** (`#e11d48`) featuring coral left borders and rose checkmark badges.
*   **Dynamic Shifting Gradients**: The main headers and buttons use a linear rainbow gradient that smoothly slides across color spectrums on hover. Staggered card animations use a cubic-bezier transition to glide into place upon calculation.

---

## Getting Started

Because the application is built using modern JavaScript ES Modules (`type="module"`), browsers block direct local file access (`file://`) due to CORS security policies. The project must be served over an HTTP server.

### Option A: Using Python (Simplest)
Open your terminal, navigate to the project directory, and run:
```bash
cd path/to/ai-helper
python -m http.server 8080
```
Then, open **[http://localhost:8080](http://localhost:8080)** in your browser.

### Option B: Using Node.js & http-server
If Node.js is installed on your system, install and run `http-server`:
```bash
npm install -g http-server
http-server -p 8080
```
Then, open **[http://localhost:8080](http://localhost:8080)** in your browser.

---

## Configuration

1.  Open the application in your browser.
2.  Click the **Gear Icon** in the top-right corner to open the **API Configuration** modal.
3.  Enter your **Anthropic API Key** (`sk-ant-...`).
4.  *(Optional)* Enter a **CORS Proxy URL** (e.g., `http://localhost:8080/` or a custom gateway). Since Anthropic's API blocks direct client-side requests from browsers, a CORS proxy is required to make direct API requests from a static site.
5.  Click **Save Configurations**. The status dot in the footer will turn green, indicating the active API connection.
