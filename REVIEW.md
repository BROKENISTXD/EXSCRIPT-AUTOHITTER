# Code Review Report: EXSCRIPT-AUTOHITTER & UsagiAutoX

## Executive Summary
This repository contains two distinct browser extensions, both of which exhibit **MALICIOUS** or highly suspicious behavior.

1.  **Root Directory Extension ("EXSCRIPT-AUTOHITTER")**: A crude, obfuscated credit card stealer/logger.
2.  **`usagi/` Directory Extension ("UsagiAutoX")**: A more sophisticated, heavily obfuscated tool with IP tracking, proxy management, and likely similar auto-checkout/carding capabilities.

**Recommendation:** **DO NOT INSTALL.** Both components are unsafe. The `usagi` version appears to be an evolution of the root version with better obfuscation and more features.

---

## 1. Analysis of Root Extension ("EXSCRIPT")

*See previous section for detailed analysis.*
- **Verdict:** Malicious (Data Exfiltration to `make.com`, browser hijacking).
- **Status:** Broken/Deprecated (per README), but code remains dangerous.

---

## 2. Analysis of `usagi/` Extension ("UsagiAutoX")

### 2.1 Overview
The `usagi` directory contains a newer extension with manifest version 3. It requests extensive permissions including `proxy`, `webRequest`, `declarativeNetRequest`, and `downloads`.

### 2.2 Obfuscation
The code in `usagi/script/` (`background.js`, `content.js`, etc.) is protected by a custom obfuscator that uses:
-   **String Array Rotation:** Arrays are shifted at runtime.
-   **Poly-Alphabetic Substitution:** Strings are decoded using different custom alphabets depending on the calling context.
-   **Control Flow Flattening:** Logic is hidden inside complex switch statements or generator functions.

### 2.3 Findings from Deobfuscation

#### **Network & Tracking**
Deobfuscated strings from `background.js` reveal calls to:
-   `https://api.ipify.org?format=json`
-   `https://api.ip.sb/ip`
-   `https://api64.ipify.org?format=json`

This indicates the extension tracks the user's IP address immediately upon execution. This is common in "carding" tools to match proxies with the stolen card's location.

#### **Functionality**
-   **Proxy Management**: The permissions and file names (`proxyhandler.js`) suggest it manages proxies, likely to route traffic through residential IPs for fraud.
-   **Autofill**: `autofill.js` and `content.js` contain logic (though heavily obfuscated) to interact with page inputs, consistent with the "auto hitter" description (automated checkout).
-   **Audio**: The presence of `sounds/hit.wav` suggests a "success" sound when a card works or a checkout succeeds.

### 2.4 Code Quality & Structure
-   The `usagi` code is more professional than the root version, using a build process (Webpack/Parcel-like structure inside `background.js`).
-   It uses modern APIs (Manifest V3, Declarative Net Request).

---

## 3. Comparison
| Feature | Root Extension | Usagi Extension |
| :--- | :--- | :--- |
| **Obfuscation** | Weak (Hex/Array) | Strong (Poly-alphabet, Rotation) |
| **Data Exfiltration** | Yes (`make.com`) | Likely (IP tracking confirmed) |
| **Purpose** | CC Stealer / Prank | Advanced Auto-Checkout / Fraud Tool |
| **Permissions** | Basic | Extensive (Proxy, WebRequest) |

## 4. Conclusion
The repository hosts malware designed for credit card fraud ("carding"). The `usagi` version is a robust, obfuscated tool for automating checkouts, managing proxies, and tracking IP addresses. It should be treated as high-risk malware.
