# NPTEL Auto-Nav Extension

This extension automates the entire workflow of logging into Swayam-NPTEL and navigating to your actual course on MOOVIT.

## Features

1. **Auto-Login on Swayam SSO:** 
   - Detects the `swayam-sso` login page and automatically fills in your credentials using advanced React-compatible state injection.
   - Waits for your NopeCHA extension to solve the Cloudflare Turnstile challenge.
   - Automatically clicks "Sign In" once the CAPTCHA is solved.
2. **Navigates NPTEL E-Learning:** 
   - Uses native `PointerEvent` injections to bypass Radix UI restrictions and opens your profile dropdown.
   - Automatically clicks the "My courses" link.
3. **Auto-Routes from Dashboard:** 
   - Clicks the "Go To Course" button on your Swayam dashboard (`swayam.gov.in/mycourses`).
4. **Auto-Opens MOOVIT Course:** 
   - Upon landing on VIT's MOOVIT portal, it scans for the active course and automatically opens it.
5. **Infinite-Loop Protection:** 
   - Intelligently halts all automation if it detects you have reached a specific course URL (e.g., `/course/`), preventing it from endlessly clicking your profile.

## Setup
1. Open Google Chrome.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the folder containing this extension.

## Compatibility
Built for the Swayam, NPTEL, and MOOVIT architecture. Designed to work in tandem with auto-CAPTCHA solvers (like NopeCHA).
