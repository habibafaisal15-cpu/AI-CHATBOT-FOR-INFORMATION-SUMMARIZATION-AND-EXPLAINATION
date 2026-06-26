/**
 * Main application controller module.
 * Binds DOM events, coordinates data flow between API, core logic, and UI rendering.
 */

import { getSettings, saveSettings, solveProblem } from './api/claude.js';
import { decomposeProblem } from './core/decomposer.js';
import { reasonProblem } from './core/reasoner.js';
import { explainProblem } from './core/explainer.js';
import { showLoader, hideLoader } from './ui/loader.js';
import { renderSolution, renderError } from './ui/renderer.js';

// DOM Selectors
const solverForm = document.getElementById('solver-form');
const problemInput = document.getElementById('problem-text');
const resultsContainer = document.getElementById('results-container');

// Settings Modal Selectors
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const settingsForm = document.getElementById('settings-form');
const apiKeyInput = document.getElementById('settings-api-key');
const modelInput = document.getElementById('settings-model');
const proxyInput = document.getElementById('settings-proxy');

// Status Indicator Selectors
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

/**
 * Initializes the application on DOM load.
 */
function init() {
    // 1. Load saved settings and update inputs + status indicators
    updateSettingsFormFields();
    updateStatusIndicator();

    // 2. Bind event listeners
    bindEvents();
}

/**
 * Binds DOM event listeners.
 */
function bindEvents() {
    // Solver form submission
    solverForm.addEventListener('submit', handleSolveRequest);

    // Modal toggling
    settingsToggleBtn.addEventListener('click', openSettingsModal);
    settingsCloseBtn.addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettingsModal();
    });

    // Save settings form submission
    settingsForm.addEventListener('submit', handleSaveSettings);

    // Quick demo tags click
    const sampleTags = document.querySelectorAll('.sample-tag');
    sampleTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const problem = tag.getAttribute('data-problem');
            problemInput.value = problem;
            problemInput.focus();
            
            // Auto-trigger submit for instant satisfaction
            solverForm.dispatchEvent(new Event('submit'));
        });
    });

    // Delegate retry button inside the dynamically rendered results container
    resultsContainer.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'error-retry-btn') {
            solverForm.dispatchEvent(new Event('submit'));
        }
    });
}

/**
 * Handles the problem solving workflow.
 * Coordinates showing loader, calling API, validating/formatting, and rendering.
 */
async function handleSolveRequest(e) {
    e.preventDefault();
    const problem = problemInput.value.trim();
    if (!problem) return;

    // Show loading overlay
    showLoader();
    
    // Smoothly scroll container into view if needed
    resultsContainer.classList.add('hidden');

    try {
        // 1. Fetch raw structured data from Claude API (or mock fallback)
        const rawData = await solveProblem(problem);

        // 2. Pass to core modules for formatting and boundary validation
        const parts = decomposeProblem(rawData.parts);
        const steps = reasonProblem(rawData.steps);
        const explains = explainProblem(rawData.explains);

        // 3. Render the processed elements to the DOM
        renderSolution(resultsContainer, { parts, steps, explains });

    } catch (error) {
        console.error('Core orchestration failure:', error);
        // Render stylized error card with custom description
        renderError(resultsContainer, error.message);
    } finally {
        // Hide loader in all outcomes
        hideLoader();
    }
}

/**
 * Updates the settings modal inputs with values from localStorage.
 */
function updateSettingsFormFields() {
    const settings = getSettings();
    apiKeyInput.value = settings.apiKey;
    modelInput.value = settings.model;
    proxyInput.value = settings.proxyUrl;
}

/**
 * Updates the footer status indicators based on active API settings.
 */
function updateStatusIndicator() {
    const settings = getSettings();
    if (settings.apiKey) {
        statusIndicator.classList.add('active-api');
        statusText.innerText = `Claude API Active (${settings.model})`;
    } else {
        statusIndicator.classList.remove('active-api');
        statusText.innerText = 'Demo Mock Mode Active';
    }
}

/**
 * Opens the API settings modal.
 */
function openSettingsModal() {
    updateSettingsFormFields();
    settingsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Disable background scrolling
}

/**
 * Closes the API settings modal.
 */
function closeSettingsModal() {
    settingsModal.classList.add('hidden');
    document.body.style.overflow = ''; // Re-enable background scrolling
}

/**
 * Saves input settings values to localStorage.
 */
function handleSaveSettings(e) {
    e.preventDefault();
    
    saveSettings({
        apiKey: apiKeyInput.value,
        model: modelInput.value,
        proxyUrl: proxyInput.value
    });

    updateStatusIndicator();
    closeSettingsModal();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
init(); // Immediately call just in case DOMContentLoaded already fired
