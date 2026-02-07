chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "lock-focus-read-selection",
        title: "Read Selection (Lock Focus)",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "lock-focus-read-selection") {
        // improved: send message to content script to handle UI and speech
        chrome.tabs.sendMessage(tab.id, {
            action: 'speakSelection',
            text: info.selectionText
        });
    }
});
