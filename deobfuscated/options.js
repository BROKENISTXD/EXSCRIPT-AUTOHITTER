
// Deobfuscated options.js

document.addEventListener("DOMContentLoaded", function() {
    loadSettings();
    loadPaymentHistory();
    document.getElementById("saveButton").addEventListener('click', saveSettings);
    document.getElementById("resetButton").addEventListener("click", resetSettings);
    document.getElementById("extensionToggle").addEventListener('change', toggleExtension);
});

function loadSettings() {
    chrome.storage.sync.get({
        'bin1': "415464440104",
        'bin2': '',
        'generateKey': 'X',
        'clearKey': 'C',
        'cardDetails': [],
        'extensionEnabled': true
    }, function(result) {
        document.getElementById("bin1").value = result.bin1;
        document.getElementById("bin2").value = result.bin2;
        document.getElementById("generateKey").value = result.generateKey;
        document.getElementById("clearKey").value = result.clearKey;
        document.getElementById("cardDetails").value = result.cardDetails.join('\n');
        document.getElementById('extensionToggle').checked = result.extensionEnabled;
    });
}

function saveSettings() {
    const bin1 = document.getElementById("bin1").value.trim();
    const bin2 = document.getElementById("bin2").value.trim();
    const generateKey = document.getElementById('generateKey').value.trim();
    const clearKey = document.getElementById("clearKey").value.trim();
    const cardDetails = document.getElementById("cardDetails").value.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .slice(0, 10);
    const extensionEnabled = document.getElementById("extensionToggle").checked;

    if (!bin1 && cardDetails.length === 0) {
        showNotification("Error", "Please enter a BIN or card details", "error");
        return;
    }
    if (bin1 && cardDetails.length > 0) {
        showNotification("Error", "Please enter either a BIN or card details, not both", "error");
        return;
    }
    if (generateKey === clearKey) {
        showNotification("Error", "Generate and Clear keys must be different", "error");
        return;
    }

    chrome.storage.sync.set({
        'bin1': bin1,
        'bin2': bin2,
        'generateKey': generateKey,
        'clearKey': clearKey,
        'cardDetails': cardDetails,
        'extensionEnabled': extensionEnabled
    }, function() {
        showNotification('Success', "Settings saved successfully", "success");
        updateAllTabs({
            'bin1': bin1,
            'bin2': bin2,
            'generateKey': generateKey,
            'clearKey': clearKey,
            'cardDetails': cardDetails,
            'extensionEnabled': extensionEnabled
        });
    });
}

function resetSettings() {
    const defaults = {
        'bin1': '415464440104',
        'bin2': '',
        'generateKey': 'X',
        'clearKey': 'C',
        'cardDetails': [],
        'extensionEnabled': true
    };
    chrome.storage.sync.set(defaults, function() {
        loadSettings();
        showNotification("Success", "Settings reset to defaults", "success");
        updateAllTabs(defaults);
    });
}

function loadPaymentHistory() {
    chrome.storage.sync.get("paymentHistory", function(result) {
        const history = result.paymentHistory || [];
        const historyList = document.getElementById("historyList");
        if (historyList) {
            historyList.innerHTML = '';
            history.forEach(function(item) {
                const li = document.createElement('li');
                li.textContent = "Card: " + item.card + " - Site: " + item.site + " - Amount: " + item.amount + " - Status: " + item.status + " - Date: " + item.date;
                historyList.appendChild(li);
            });
        }
    });
}

function toggleExtension() {
    const enabled = document.getElementById("extensionToggle").checked;
    chrome.storage.sync.set({
        'extensionEnabled': enabled
    }, function() {
        updateAllTabs({
            'action': "toggleExtension",
            'enabled': enabled
        });
        showNotification("Extension Status", 'Extension ' + (enabled ? "enabled" : "disabled"), enabled ? "success" : "error");
    });
}

function showNotification(title, message, type) {
    const container = document.getElementById("notificationContainer");
    const div = document.createElement("div");
    div.className = "notification " + type;
    div.innerHTML = "\n        <div class=\"notification-icon\">" + (type === "success" ? '✅' : '❌') + "</div>\n        <div class=\"notification-content\">\n            <h4>" + title + "</h4>\n            <p>" + message + "</p>\n        </div>\n        <div class=\"notification-close\" onclick=\"this.parentElement.remove();\">&times;</div>\n    ";
    container.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 5000);
}

function updateAllTabs(message) {
    chrome.tabs.query({}, function(tabs) {
        for (let tab of tabs) {
            chrome.tabs.sendMessage(tab.id, message);
        }
    });
}
