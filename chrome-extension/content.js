// Initial State
let readingRulerElement = null;
let tintLayer = null;
let voiceSpeed = 1.0;
let currentUtterance = null;
let speechPlayer = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleDyslexiaMode') {
        toggleDyslexiaFont(request.value);
    } else if (request.action === 'toggleBionicMode') {
        toggleBionicMode(request.value);
    } else if (request.action === 'toggleSyllableMode') {
        toggleSyllableMode(request.value);
    } else if (request.action === 'toggleFocusMode') {
        toggleFocusMode(request.value);
    } else if (request.action === 'toggleReadingRuler') {
        toggleReadingRuler(request.value);
    } else if (request.action === 'setTintColor') {
        setTintColor(request.value);
    } else if (request.action === 'setVoiceSpeed') {
        voiceSpeed = request.value;
    } else if (request.action === 'speakSelection') {
        playTextToSpeech(request.text);
    }
});

// Load initial settings on page load
chrome.storage.sync.get(['dyslexiaMode', 'bionicMode', 'syllableMode', 'focusMode', 'readingRuler', 'tintColor', 'voiceSpeed'], (result) => {
    if (result.dyslexiaMode) toggleDyslexiaFont(true);
    if (result.bionicMode) toggleBionicMode(true);
    if (result.syllableMode) toggleSyllableMode(true);
    if (result.focusMode) toggleFocusMode(true);
    if (result.readingRuler) toggleReadingRuler(true);
    if (result.tintColor) setTintColor(result.tintColor);
    if (result.voiceSpeed) voiceSpeed = result.voiceSpeed;
});

/* --- Feature Implementations --- */

function toggleDyslexiaFont(enable) {
    if (enable) {
        document.body.classList.add('lock-focus-dyslexia-font');
    } else {
        document.body.classList.remove('lock-focus-dyslexia-font');
    }
}

// Distraction Shield Logic
const BLOCKED_SITES = [
    'youtube.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'reddit.com',
    'tiktok.com',
    'netflix.com',
    'twitch.tv'
];

function toggleFocusMode(enable) {
    if (enable) {
        document.body.classList.add('lock-focus-focus-mode');
        checkDistraction();
    } else {
        document.body.classList.remove('lock-focus-focus-mode');
        removeDistractionOverlay();
    }
}

function checkDistraction() {
    const hostname = window.location.hostname;
    const isBlocked = BLOCKED_SITES.some(site => hostname.includes(site));

    if (isBlocked) {
        showDistractionOverlay();
    }
}

function showDistractionOverlay() {
    if (document.getElementById('lock-focus-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'lock-focus-overlay';
    overlay.innerHTML = `
    <div class="lock-focus-message">
      <div class="lock-icon">🔒</div>
      <h1>Focus Locked</h1>
      <p>This site is blocked while Focus Mode is active.</p>
      <p class="motivation">"Starve your distractions, feed your focus."</p>
    </div>
  `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

function removeDistractionOverlay() {
    const overlay = document.getElementById('lock-focus-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
    }
}

// Bionic Reading Implementation
function toggleBionicMode(enable) {
    if (enable) {
        document.body.classList.add('lock-focus-bionic-reading');
        processTextNodes(node => {
            // Avoid re-processing
            if (node.parentNode.classList.contains('lock-focus-bionic-word')) return;

            const words = node.nodeValue.split(' ');
            const newFragment = document.createDocumentFragment();

            words.forEach((word, index) => {
                if (!word.trim()) {
                    newFragment.appendChild(document.createTextNode(' '));
                    return;
                }

                const span = document.createElement('span');
                span.className = 'lock-focus-bionic-word';

                const len = word.length;
                const boldLen = Math.ceil(len / 2);

                const boldPart = document.createElement('b');
                boldPart.textContent = word.slice(0, boldLen);

                const normalPart = document.createTextNode(word.slice(boldLen));

                span.appendChild(boldPart);
                span.appendChild(normalPart);
                newFragment.appendChild(span);

                if (index < words.length - 1) {
                    newFragment.appendChild(document.createTextNode(' '));
                }
            });

            if (node.parentNode) {
                node.parentNode.replaceChild(newFragment, node);
            }
        });

    } else {
        document.body.classList.remove('lock-focus-bionic-reading');
    }
}

// Syllable Splitter Implementation
function toggleSyllableMode(enable) {
    if (enable) {
        document.body.classList.add('lock-focus-syllable-mode');
        processTextNodes(node => {
            if (node.parentNode.classList.contains('lock-focus-syllable-word')) return;
            const words = node.nodeValue.split(' ');
            const newFragment = document.createDocumentFragment();

            words.forEach((word, index) => {
                const syllableWord = heuristicSyllableSplit(word);
                const span = document.createElement('span');
                span.className = 'lock-focus-syllable-word';
                span.textContent = syllableWord;
                newFragment.appendChild(span);

                if (index < words.length - 1) newFragment.appendChild(document.createTextNode(' '));
            });

            if (node.parentNode) {
                node.parentNode.replaceChild(newFragment, node);
            }
        });
    } else {
        document.body.classList.remove('lock-focus-syllable-mode');
    }
}

function processTextNodes(callback) {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    const nodes = [];
    while (node = walker.nextNode()) {
        const parent = node.parentNode;
        const tag = parent.tagName.toLowerCase();
        if (tag !== 'script' && tag !== 'style' && tag !== 'noscript' && tag !== 'textarea') {
            if (node.nodeValue.trim().length > 0) {
                nodes.push(node);
            }
        }
    }

    nodes.forEach(callback);
}

function heuristicSyllableSplit(word) {
    const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
    const parts = word.match(syllableRegex);
    return parts ? parts.join('•') : word;
}


function toggleReadingRuler(enable) {
    if (enable) {
        if (!readingRulerElement) {
            readingRulerElement = document.createElement('div');
            readingRulerElement.id = 'lock-focus-reading-ruler';
            document.body.appendChild(readingRulerElement);

            document.addEventListener('mousemove', updateRulerPosition);
        }
        readingRulerElement.style.display = 'block';
    } else {
        if (readingRulerElement) {
            readingRulerElement.style.display = 'none';
            document.removeEventListener('mousemove', updateRulerPosition);
        }
    }
}

function updateRulerPosition(e) {
    if (readingRulerElement) {
        readingRulerElement.style.top = (e.clientY + window.scrollY) + 'px';
    }
}

function setTintColor(color) {
    if (!tintLayer) {
        tintLayer = document.createElement('div');
        tintLayer.id = 'lock-focus-tint-layer';
        document.body.appendChild(tintLayer);
    }

    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);

    tintLayer.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
    tintLayer.style.display = 'block';
}

/* --- TEXT TO SPEECH --- */
function playTextToSpeech(text) {
    if (!text) return;

    showSpeechPlayer(text);

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = voiceSpeed || 1.0;

        currentUtterance.onend = () => {
            const player = document.getElementById('lock-focus-speech-player');
            if (player) {
                player.querySelector('.player-status').innerText = "Done";
                setTimeout(() => { player.style.display = 'none'; }, 2000);
            }
        };

        window.speechSynthesis.speak(currentUtterance);
    }
}

function showSpeechPlayer(displayText) {
    let player = document.getElementById('lock-focus-speech-player');
    if (!player) {
        player = document.createElement('div');
        player.id = 'lock-focus-speech-player';
        document.body.appendChild(player);

        // Add logic to close/stop
        player.addEventListener('click', (e) => {
            if (e.target.id === 'lock-focus-stop-btn') {
                window.speechSynthesis.cancel();
                document.getElementById('lock-focus-speech-player').style.display = 'none';
            }
        });
    }

    // Truncate
    const shortText = displayText.length > 50 ? displayText.substring(0, 50) + "..." : displayText;

    player.innerHTML = `
      <div class="player-content">
         <span class="player-status">reading...</span>
         <div class="player-text">${shortText}</div>
      </div>
      <button id="lock-focus-stop-btn">Stop</button>
   `;

    player.style.display = 'flex';
}
