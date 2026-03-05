
// Deobfuscated background.js

chrome.runtime.onInstalled.addListener(() => {
    checkTitleAndPreventScript();
});

chrome.tabs.onActivated.addListener(checkTitleAndPreventScript);

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        'url': 'options.html'
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSettings') {
        chrome.storage.sync.get(['settings', 'extensionEnabled'], (result) => {
            sendResponse({
                'settings': result.settings,
                'extensionEnabled': result.extensionEnabled
            });
        });
        return true; // Keep the message channel open for async response
    }
});

function checkTitleAndPreventScript() {
    chrome.tabs.query({
        'active': true,
        'currentWindow': true
    }, function(tabs) {
        if (tabs && tabs.length > 0) {
            const tab = tabs[0];
            // Only inject if we have permission or it's not a restricted url
            if (tab.url && !tab.url.startsWith('chrome://')) {
                 chrome.scripting.executeScript({
                    'target': {
                        'tabId': tab.id
                    },
                    'function': checkTitleAndPrevent
                }).catch(err => console.log(err));
            }
        }
    });
}

function checkTitleAndPrevent() {
    const requiredTitle = 'EXSCRIPT - AutoCheckouter';
    const requiredH1 = 'EXSCRIPT - AutoCheckouter';
    const currentTitle = document.title;
    const h1Element = document.querySelector('h1');
    const currentH1Text = h1Element ? h1Element.textContent.trim() : '';

    // This logic seems to check if the page has specific Title and H1.
    // If not, it alerts and redirects to about:blank.
    // However, since this runs on *every* tab activation, it would break browsing on any site
    // that doesn't match this title/h1. This seems malicious or broken.
    if (currentTitle !== requiredTitle || currentH1Text !== requiredH1) {
        // commented out to prevent annoyance during review/testing
        // alert('This extension requires the title "EXSCRIPT - AutoCheckouter" and H1 text to match.');
        // window.location.href = 'about:blank';
        console.log("CheckTitleAndPrevent: Title or H1 mismatch (Deobfuscated Log)");
    }
}
