/**
 * API client module for Claude API.
 * Handles API keys, model selections, custom proxies, and a rich Mock Mode fallback.
 */
// Local storage keys
const STORAGE_KEYS = {
    API_KEY: 'ai_helper_claude_api_key',
    MODEL: 'ai_helper_claude_model',
    PROXY_URL: 'ai_helper_claude_proxy_url'
};
// Default configuration values
const DEFAULTS = {
    MODEL: 'claude-3-5-sonnet-20241022',
    PROXY_URL: '' // Empty means direct call
};
// Rich mock responses that ACTUALLY solve the specific problems, providing concrete code and answers.
const MOCK_RESPONSES = {
    "scalable-chat": {
        "parts": [
            "Real-time connection management & web socket scaling",
            "Message persistence & database write throughput bottlenecks",
            "User presence tracking & state synchronization",
            "Global latency reduction & horizontal scaling architecture"
        ],
        "steps": [
            {
                "title": "Establish WebSocket Gateway",
                "detail": "Deploy a stateless WebSocket server tier behind a load balancer. We use stateless gateways so that any server can handle any user connection, scaling horizontally as user counts grow."
            },
            {
                "title": "Introduce Redis Pub/Sub",
                "detail": "Connect WebSocket gateways via Redis Pub/Sub. When User A sends a message on Server 1 to User B on Server 2, Redis publishes the message across gateways, ensuring delivery regardless of server assignment."
            },
            {
                "title": "Implement Hybrid Database Layer",
                "detail": "Use Cassandra or DynamoDB for raw message history, and Redis for ephemeral presence data. NoSQL database writes scale linearly, preventing write-locks during high-concurrency chatting."
            },
            {
                "title": "Decouple History Fetching via HTTP",
                "detail": "Load historical chat archives through stateless REST/GraphQL APIs instead of WebSockets. This reduces WebSocket connection memory load and leverages traditional HTTP CDN caching."
            },
            {
                "title": "Introduce Message Queues",
                "detail": "Buffer media uploads and system events using Kafka or RabbitMQ. Asynchronous tasks like push notifications and virus scanning must run out-of-band to keep the chat loop fast."
            }
        ],
        "explains": [
            {
                "label": "Stateless Gateways",
                "reason": "Allows auto-scaling groups to terminate or launch gateway instances without losing core system state, enabling elastic scale."
            },
            {
                "label": "Redis Pub/Sub",
                "reason": "Keeps inter-server coordination overhead at O(1) complexity and sub-millisecond latency, preventing message delivery lag."
            },
            {
                "label": "NoSQL Persistence",
                "reason": "Avoids relational ACID transaction overhead. Chat history is append-only and read-intensive, matching NoSQL's key-value scaling profile."
            },
            {
                "label": "Queue Buffering",
                "reason": "Protects core chat delivery from database pressure spikes during viral events by decoupling write-heavy secondary workflows."
            }
        ]
    },
    "database-optimization": {
        "parts": [
            "Query plan analysis & missing index identification",
            "Buffer pool memory constraints & disk I/O bottlenecks",
            "Connection pool exhaustion & thread locking",
            "Application-level query redundancy & lack of caching"
        ],
        "steps": [
            {
                "title": "Analyze the Query Execution Plan",
                "detail": "Run EXPLAIN ANALYZE on the slow query to find table scans. This reveals exactly where the database engine is wasting time reading raw disk blocks instead of using indexes."
            },
            {
                "title": "Design Selective Covering Indexes",
                "detail": "Create composite indexes tailored to the WHERE and JOIN conditions, and include SELECT fields. This allows the database to return results directly from the index tree without a secondary table lookup."
            },
            {
                "title": "Optimize Connection Pool Sizes",
                "detail": "Configure connection pool limits on the application server to match database CPU cores. Too many open connections cause context switching and thread locks, worsening query latency."
            },
            {
                "title": "Introduce Read Replicas",
                "detail": "Direct read queries to read-only replicas and preserve the primary database for writes. This segregates traffic, ensuring write locks do not block user search queries."
            },
            {
                "title": "Implement Cache-Aside Strategy",
                "detail": "Integrate Redis to cache frequent, slow-changing query results. Fetching from memory in 1ms completely bypasses the database, reducing database CPU utilization."
            }
        ],
        "explains": [
            {
                "label": "EXPLAIN FIRST",
                "reason": "Prevents blind indexing. Creating indexes without analyzing query plans can degrade write performance and waste precious buffer memory."
            },
            {
                "label": "Covering Indexes",
                "reason": "Reduces disk I/O operations to a single index seek, bypassing data block retrievals entirely for maximum efficiency."
            },
            {
                "label": "Read/Write Segregation",
                "reason": "Ensures reporting queries or search dashboards cannot lock transaction tables, maintaining fast write throughput."
            },
            {
                "label": "Memory Caching",
                "reason": "Defends the database from 'stampeding herd' traffic spikes by serving hot data directly from distributed memory."
            }
        ]
    },
    "marketing-channels": {
        "parts": [
            "Target audience persona & online behavior mapping",
            "Customer Acquisition Cost (CAC) vs Lifetime Value (LTV) limits",
            "Channel attribution & funnel conversion tracking",
            "Resource constraints & content production velocity"
        ],
        "steps": [
            {
                "title": "Define Customer Value and Budget Bounds",
                "detail": "Calculate target Customer Lifetime Value (LTV) to determine the maximum viable Customer Acquisition Cost (CAC). This math acts as a filter, immediately eliminating unsustainable channels."
            },
            {
                "title": "Map User Journeys to Specific Channels",
                "detail": "Align target demographics with platform demographics. For instance, B2B enterprise targets map to LinkedIn and Search, while visual consumer products map to Instagram and TikTok."
            },
            {
                "title": "Run Micro-Budget Channel Experiments",
                "detail": "Allocate small, equal budgets ($500) to three high-potential channels for two weeks. This gathers baseline conversion and cost data without risking significant capital."
            },
            {
                "title": "Analyze Unit Economics & CTR",
                "detail": "Compare Click-Through Rates (CTR), cost-per-lead, and conversion rates across test channels. Identify which channel demonstrates the lowest cost per acquired customer."
            },
            {
                "title": "Double Down and Scale the Winner",
                "detail": "Consolidate 80% of budget into the single winning channel while using the remaining 20% to test new creative angles, scaling linearly until saturation."
            }
        ],
        "explains": [
            {
                "label": "LTV-Guided CAC Limits",
                "reason": "Prevents spending more to acquire a customer than they are worth, establishing guardrails for financial sustainability."
            },
            {
                "label": "Micro-Budget Testing",
                "reason": "Bypasses subjective opinions by letting empirical market data prove where the audience actually responds."
            },
            {
                "label": "Winner-Take-All Scaling",
                "reason": "Avoids resource dilution. Startups lack the bandwidth to manage five channels effectively; mastering one yields far higher ROI."
            }
        ]
    },
    "reverse-string": {
        "parts": [
            "Input type validation & null check handling",
            "String conversion to mutable array representation",
            "In-place character array reversal execution",
            "Array recombination into final reversed string output"
        ],
        "steps": [
            {
                "title": "Check Input Validity",
                "detail": "Validate that the input is a valid string. If it is null, undefined, or empty, return the input immediately: `if (!str || typeof str !== 'string') return '';` to prevent runtime type errors."
            },
            {
                "title": "Split String into Array",
                "detail": "Convert the immutable string into a mutable character array using the split method: `const charArray = str.split('');`. This allows us to reorder characters easily."
            },
            {
                "title": "Execute Array Reversal",
                "detail": "Reverse the elements in the character array in-place: `charArray.reverse();`. This operation runs in O(N) linear time complexity, swapping characters from outside-in."
            },
            {
                "title": "Recombine Array to String",
                "detail": "Join the reversed character array back into a single string using join with an empty separator: `const reversedStr = charArray.join('');`. Return the result."
            }
        ],
        "explains": [
            {
                "label": "Type Validation first",
                "reason": "Prevents browser crashes or javascript type errors if a number, object, or null is accidentally passed to the function."
            },
            {
                "label": "Built-in Array.reverse()",
                "reason": "Leverages highly optimized browser engine code written in native C++, which executes significantly faster than manual custom javascript loops."
            },
            {
                "label": "Linear Time Complexity O(N)",
                "reason": "Visiting each character exactly twice (once to split, once to swap) is mathematically optimal for string reversal without skipping data."
            }
        ]
    },
    "center-div": {
        "parts": [
            "Parent container display format declaration",
            "Vertical coordinate alignment mapping",
            "Horizontal coordinate alignment mapping",
            "Parent dimensions boundary constraint setting"
        ],
        "steps": [
            {
                "title": "Establish Flexbox Layout on Parent",
                "detail": "Apply `display: flex;` to the parent container. This activates the Flexible Box layout model, which lets the parent dynamically distribute space and align children."
            },
            {
                "title": "Center Children Horizontally",
                "detail": "Add `justify-content: center;` to the parent container CSS. This aligns the child element directly along the horizontal center (main axis) of the flex container."
            },
            {
                "title": "Center Children Vertically",
                "detail": "Add `align-items: center;` to the parent container CSS. This aligns the child element directly along the vertical center (cross axis) of the flex container."
            },
            {
                "title": "Ensure Parent Has Height Boundaries",
                "detail": "Apply `min-height: 100vh;` (or a specific height like `400px`) to the parent container. Without height, the parent shrinks to the height of its children, making vertical centering impossible to see."
            }
        ],
        "explains": [
            {
                "label": "Flexbox over Margins",
                "reason": "Bypasses old-school absolute positioning or hacks like `margin: 50% auto;` which break layouts when child dimensions change."
            },
            {
                "label": "Min-height of 100vh",
                "reason": "Ensures the parent expands to fill the entire browser viewport, centering the div relative to the user's visible screen."
            },
            {
                "label": "Dynamic Space Distribution",
                "reason": "Enables the centered element to stay perfectly centered even when browser windows are resized or viewed on mobile screens."
            }
        ]
    },
    "default": {
        "parts": [
            "Problem scope delineation & constraint identification",
            "Core component decoupling & functional boundary mapping",
            "Iterative resolution design & dependency ordering",
            "Success verification metrics & error mitigation"
        ],
        "steps": [
            {
                "title": "Deconstruct the Problem Constraints",
                "detail": "Analyze the input parameters and define what qualifies as a successful solution. Understanding what not to solve is just as important as knowing what to solve."
            },
            {
                "title": "Establish Modular Boundaries",
                "detail": "Divide the main objective into isolated, independent components. Isolating variables prevents changes in one area from breaking functionality in another."
            },
            {
                "title": "Order Dependencies and Solve Iteratively",
                "detail": "Identify the foundation step upon which other components rely. Solve this core block first, then build upward sequentially."
            },
            {
                "title": "Verify Edge Cases and Integration",
                "detail": "Run validation checks on the assembled system under stress or extreme inputs. This ensures structural integrity under real-world usage."
            }
        ],
        "explains": [
            {
                "label": "Modular Boundaries",
                "reason": "Enables parallel development, simpler testing, and isolated debugging, reducing long-term maintenance costs."
            },
            {
                "label": "Dependency Ordering",
                "reason": "Eliminates rework by ensuring you do not build secondary features before the foundational infrastructure is solid."
            },
            {
                "label": "Strict Boundary Focus",
                "reason": "Avoids scope creep by keeping the solution strictly aligned with the initial constraints and requirements."
            }
        ]
    }
};
/**
 * Gets saved API settings from localStorage
 * @returns {Object} Settings object
 */
export function getSettings() {
    return {
        apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
        model: localStorage.getItem(STORAGE_KEYS.MODEL) || DEFAULTS.MODEL,
        proxyUrl: localStorage.getItem(STORAGE_KEYS.PROXY_URL) || DEFAULTS.PROXY_URL
    };
}
/**
 * Saves API settings to localStorage
 * @param {Object} settings - Settings to save
 */
export function saveSettings({ apiKey, model, proxyUrl }) {
    if (apiKey !== undefined) localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
    if (model !== undefined) localStorage.setItem(STORAGE_KEYS.MODEL, model.trim());
    if (proxyUrl !== undefined) localStorage.setItem(STORAGE_KEYS.PROXY_URL, proxyUrl.trim());
}
/**
 * Sends a problem description to Claude API, returning the structured JSON.
 * Falls back to Mock Mode if no API Key is set.
 * @param {string} problem - The problem description to solve.
 * @returns {Promise<Object>} The parsed JSON response.
 */
export async function solveProblem(problem) {
    const settings = getSettings();
    
    // Check if we should run in mock mode
    if (!settings.apiKey) {
        return simulateResponse(problem);
    }
    // UPDATED SYSTEM PROMPT: Explicitly instructs Claude to ACTUALLY SOLVE the problem inside the steps.
    const systemPrompt = `You are a structured problem-solving assistant.
When given a problem, always respond in this exact JSON format:
{
  "parts": [
    "sub-problem 1",
    "sub-problem 2",
    ...
  ],
  "steps": [
    { "title": "Step name", "detail": "What to do and why." },
    ...
  ],
  "explains": [
    { "label": "Short label", "reason": "Why this makes sense." },
    ...
  ]
}
CRITICAL REQUIREMENT:
You must ACTUALLY SOLVE the user's specific problem. The "steps" and "explains" arrays must contain the concrete solution, code, formulas, configuration, or answers to the user's specific problem, rather than just describing how one would go about solving it. For example, if the user asks for code, the "detail" fields in "steps" must include the actual, functional code snippets and detailed explanations of how they solve the problem.
Rules:
- parts: 3–5 sub-problems or components
- steps: 4–6 concrete reasoning steps in order
- explains: 3–5 justifications for key decisions
- No markdown, no preamble — JSON only`;
    const payload = {
        model: settings.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
            {
                role: "user",
                content: problem
            }
        ],
        temperature: 0.1
    };
    let url = 'https://api.anthropic.com/v1/messages';
    if (settings.proxyUrl) {
        const proxy = settings.proxyUrl.endsWith('/') ? settings.proxyUrl : `${settings.proxyUrl}/`;
        url = `${proxy}https://api.anthropic.com/v1/messages`;
    }
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01'
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errText = await response.text();
            let errorMessage = `HTTP Error ${response.status}`;
            try {
                const errJson = JSON.parse(errText);
                if (errJson.error && errJson.error.message) {
                    errorMessage = errJson.error.message;
                }
            } catch (e) {
                errorMessage = errText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        const contentText = data.content[0].text;
        
        return JSON.parse(contentText);
    } catch (error) {
        console.error('API Call failed:', error);
        
        if (error.message === 'Failed to fetch' && !settings.proxyUrl) {
            throw new Error('API request blocked by browser CORS policy. To call Anthropic directly from the browser, you must specify a CORS Proxy URL in the Settings panel, or run a local proxy.');
        }
        
        throw error;
    }
}
/**
 * Simulates a high-quality structured response for demonstration purposes.
 * Detects keywords and returns concrete, actionable solutions (not meta-descriptions).
 * @param {string} problem - The problem description.
 * @returns {Promise<Object>} Simulated JSON response.
 */
function simulateResponse(problem) {
    return new Promise((resolve) => {
        const delay = 1500 + Math.random() * 1000;
        
        setTimeout(() => {
            const query = problem.toLowerCase();
            let matchedKey = 'default';
            
            // Check for specific programming questions first
            if (query.includes('reverse') && query.includes('string')) {
                matchedKey = 'reverse-string';
            } else if (query.includes('center') && (query.includes('div') || query.includes('element') || query.includes('css'))) {
                matchedKey = 'center-div';
            } else if (query.includes('chat') || query.includes('websocket') || query.includes('scalable app') || query.includes('message')) {
                matchedKey = 'scalable-chat';
            } else if (query.includes('database') || query.includes('query') || query.includes('slow') || query.includes('optimize') || query.includes('sql')) {
                matchedKey = 'database-optimization';
            } else if (query.includes('marketing') || query.includes('startup') || query.includes('acquisition') || query.includes('customer') || query.includes('channel')) {
                matchedKey = 'marketing-channels';
            }
            
            const mock = JSON.parse(JSON.stringify(MOCK_RESPONSES[matchedKey]));
            
            // If it is the default, make it a clear notification that they are in Mock Mode
            if (matchedKey === 'default') {
                mock.parts[0] = `Analyze "${problem.substring(0, 30)}${problem.length > 30 ? '...' : ''}" constraints`;
                mock.steps.push({
                    "title": "Configure Claude API Key for Custom Answers",
                    "detail": "Note: You are currently running in 'Demo Mock Mode'. To get actual, customized AI solutions for this specific problem, please click the gear icon in the top right and enter a valid Anthropic API Key."
                });
            }
            
            resolve(mock);
        }, delay);
    });
}