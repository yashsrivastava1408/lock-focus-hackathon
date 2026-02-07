document.addEventListener('DOMContentLoaded', () => {
    const dyslexiaToggle = document.getElementById('dyslexia-toggle');
    const bionicToggle = document.getElementById('bionic-toggle');
    const syllableToggle = document.getElementById('syllable-toggle');
    const focusToggle = document.getElementById('focus-toggle');
    const readingRulerToggle = document.getElementById('reading-ruler-toggle');
    const colorInput = document.getElementById('overlay-color');

    // Load saved settings
    chrome.storage.sync.get(['dyslexiaMode', 'bionicMode', 'syllableMode', 'focusMode', 'readingRuler', 'tintColor'], (result) => {
        dyslexiaToggle.checked = result.dyslexiaMode || false;
        bionicToggle.checked = result.bionicMode || false;
        syllableToggle.checked = result.syllableMode || false;
        focusToggle.checked = result.focusMode || false;
        readingRulerToggle.checked = result.readingRuler || false;
        if (result.tintColor) {
            colorInput.value = result.tintColor;
        }

        const speedInput = document.getElementById('voice-speed');
        const speedValue = document.getElementById('speed-value');
        if (result.voiceSpeed) {
            speedInput.value = result.voiceSpeed;
            speedValue.textContent = result.voiceSpeed + 'x';
        }
    });

    // Event Listeners
    dyslexiaToggle.addEventListener('change', () => {
        const isEnabled = dyslexiaToggle.checked;
        chrome.storage.sync.set({ dyslexiaMode: isEnabled });
        sendMessageToContentScript({ action: 'toggleDyslexiaMode', value: isEnabled });
    });

    bionicToggle.addEventListener('change', () => {
        const isEnabled = bionicToggle.checked;
        chrome.storage.sync.set({ bionicMode: isEnabled });
        sendMessageToContentScript({ action: 'toggleBionicMode', value: isEnabled });
    });

    syllableToggle.addEventListener('change', () => {
        const isEnabled = syllableToggle.checked;
        chrome.storage.sync.set({ syllableMode: isEnabled });
        sendMessageToContentScript({ action: 'toggleSyllableMode', value: isEnabled });
    });

    focusToggle.addEventListener('change', () => {
        const isEnabled = focusToggle.checked;
        chrome.storage.sync.set({ focusMode: isEnabled });
        sendMessageToContentScript({ action: 'toggleFocusMode', value: isEnabled });
    });

    readingRulerToggle.addEventListener('change', () => {
        const isEnabled = readingRulerToggle.checked;
        chrome.storage.sync.set({ readingRuler: isEnabled });
        sendMessageToContentScript({ action: 'toggleReadingRuler', value: isEnabled });
    });

    colorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        chrome.storage.sync.set({ tintColor: color });
        sendMessageToContentScript({ action: 'setTintColor', value: color });
    });

    const speedInput = document.getElementById('voice-speed');
    const speedValue = document.getElementById('speed-value');
    speedInput.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        speedValue.textContent = speed + 'x';
        chrome.storage.sync.set({ voiceSpeed: speed });
        sendMessageToContentScript({ action: 'setVoiceSpeed', value: speed });
    });
});

function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            // Check for system pages
            if (tabs[0].url && (tabs[0].url.startsWith("chrome://") || tabs[0].url.startsWith("edge://") || tabs[0].url.startsWith("about:"))) {
                const status = document.getElementById('status-msg') || createStatusElement();
                status.textContent = "Cannot run on this system page.";
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Could not send message:", chrome.runtime.lastError.message);

                    const status = document.getElementById('status-msg') || createStatusElement();
                    status.textContent = "Please refresh the page to enable features.";
                    status.style.color = "#e74c3c";

                    setTimeout(() => {
                        if (status) status.textContent = "";
                    }, 4000);
                }
            });
        }
    });
}

function createStatusElement() {
    let status = document.getElementById('status-msg');
    if (!status) {
        status = document.createElement('div');
        status.id = 'status-msg';
        status.className = 'status-message';
        status.style.cssText = "margin-top: 10px; color: #e74c3c; font-size: 0.8rem; text-align: center;";
        document.querySelector('main').appendChild(status);
    }
    return status;
}
