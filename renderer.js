/**
 * UI Renderer module.
 * Dynamically builds and updates the DOM outputs for parts, steps, and explanations.
 */
/**
 * Renders the complete solved output to the dashboard.
 * @param {Object} container - The target container element.
 * @param {Object} data - Processed data containing parts, steps, and explains.
 */
export function renderSolution(container, data) {
    if (!container) return;
    // Clear previous contents and show container
    container.innerHTML = '';
    container.classList.remove('hidden');
    // Create main grid layout
    const grid = document.createElement('div');
    grid.className = 'results-grid';
    // 1. Decomposition Column (Parts)
    const decompCol = createSectionColumn(
        'decomposition-section', 
        'Decomposed Parts', 
        'Problem broken down into independent sub-problems.', 
        'icon-decompose'
    );
    const partsContainer = document.createElement('div');
    partsContainer.className = 'parts-list';
    
    data.parts.forEach((part) => {
        const partCard = document.createElement('div');
        partCard.className = 'part-card fade-in-up';
        partCard.style.animationDelay = `${part.index * 100}ms`;
        
        partCard.innerHTML = `
            <div class="part-header">
                <span class="part-badge">Part 0${part.index}</span>
            </div>
            <p class="part-content">${escapeHTML(part.content)}</p>
            <p class="part-content">${formatText(part.content)}</p>
        `;
        partsContainer.appendChild(partCard);
    });
    decompCol.appendChild(partsContainer);
    grid.appendChild(decompCol);
    // 2. Reasoning Column (Steps)
    const reasoningCol = createSectionColumn(
        'reasoning-section', 
        'Step-by-Step Thinking', 
        'Logical progression of reasoning and operations.', 
        'icon-reason'
    );
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-container';
    
    data.steps.forEach((step) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'timeline-item fade-in-up';
        stepItem.style.animationDelay = `${step.stepNumber * 120}ms`;
        
        stepItem.innerHTML = `
            <div class="timeline-marker">
                <div class="marker-dot">${step.stepNumber}</div>
                <div class="marker-line"></div>
            </div>
            <div class="timeline-content">
                <h4 class="step-title">${escapeHTML(step.title)}</h4>
                <p class="step-detail">${escapeHTML(step.detail)}</p>
                <div class="step-detail">${formatText(step.detail)}</div>
            </div>
        `;
        timelineContainer.appendChild(stepItem);
    });
    reasoningCol.appendChild(timelineContainer);
    grid.appendChild(reasoningCol);
    // 3. Justifications Column (Explains)
    const explainsCol = createSectionColumn(
        'explains-section', 
        'Key Justifications', 
        'Rationales explaining why these decisions make sense.', 
        'icon-explain'
    );
    const explainsContainer = document.createElement('div');
    explainsContainer.className = 'explains-list';
    
    data.explains.forEach((item) => {
        const explainCard = document.createElement('div');
        explainCard.className = 'explain-card fade-in-up';
        explainCard.style.animationDelay = `${item.index * 150}ms`;
        
        explainCard.innerHTML = `
            <div class="explain-header">
                <div class="explain-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span class="explain-label">${escapeHTML(item.label)}</span>
            </div>
            <p class="explain-reason">${escapeHTML(item.reason)}</p>
            <div class="explain-reason">${formatText(item.reason)}</div>
        `;
        explainsContainer.appendChild(explainCard);
    });
    explainsCol.appendChild(explainsContainer);
    grid.appendChild(explainsCol);
    // Append everything to main container
    container.appendChild(grid);
    
    // Smooth scroll to results
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
/**
 * Creates an error display card within the results container.
 * @param {Object} container - The target container element.
 * @param {string} message - The error message to display.
 */
export function renderError(container, message) {
    if (!container) return;
    container.innerHTML = '';
    container.classList.remove('hidden');
    const errorCard = document.createElement('div');
    errorCard.className = 'error-card fade-in';
    
    errorCard.innerHTML = `
        <div class="error-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        </div>
        <h3 class="error-title">Decomposition Failed</h3>
        <p class="error-message">${escapeHTML(message)}</p>
        <button class="btn btn-secondary retry-btn" id="error-retry-btn">Try Again</button>
    `;
    container.appendChild(errorCard);
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
/**
 * Helper to create a section column with headers.
 */
function createSectionColumn(id, title, subtitle, iconClass) {
    const col = document.createElement('div');
    col.id = id;
    col.className = 'results-column';
    
    col.innerHTML = `
        <div class="column-header">
            <div class="column-title-wrapper">
                <div class="column-icon ${iconClass}"></div>
                <h3 class="column-title">${escapeHTML(title)}</h3>
            </div>
            <p class="column-subtitle">${escapeHTML(subtitle)}</p>
        </div>
    `;
    return col;
}
/**
 * Formats plain text, escaping HTML and rendering backticks as code elements.
 * @param {string} str - Raw text.
 * @returns {string} Safe HTML with code styling.
 */
function formatText(str) {
    if (!str) return '';
    
    // 1. Escape HTML first for security
    let escaped = escapeHTML(str);
    
    // 2. Parse triple backticks into code blocks
    escaped = escaped.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, '<pre class="code-block"><code>$1</code></pre>');
    escaped = escaped.replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>');
    
    // 3. Parse single backticks into inline code elements
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    return escaped;
}
/**
 * Helper to escape HTML characters to prevent XSS.
 */
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
