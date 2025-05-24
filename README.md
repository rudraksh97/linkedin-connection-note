# LinkedIn AI Note Helper Extension

## Overview
The LinkedIn AI Note Helper is a Chrome extension designed to assist users in crafting personalized notes for LinkedIn connections, messages, and invitations. It aims to streamline the process by:
1.  Allowing users to fetch AI-generated text suggestions (via a user-configured Selenium setup interacting with an AI chat website like ChatGPT).
2.  Storing a history of previously used notes for easy reuse.
3.  Injecting a helpful UI directly onto LinkedIn pages.

## Features
*   **In-Page UI:** Injects a user interface directly on relevant LinkedIn pages (profiles, messaging, invitation manager).
*   **AI-Powered Suggestions:** Leverages an AI chat website (e.g., ChatGPT, configured by the user) to generate note suggestions based on user prompts.
    *   *Note: This requires significant user setup for Selenium and CSS selectors.*
*   **Note History:** Saves notes that you've used (either from AI suggestions or potentially manually added in future versions) to local browser storage.
*   **Click-to-Use History:** Allows you to easily re-use notes from your history.
*   **Placeholder for Direct Copy:** Includes a placeholder function to eventually copy notes directly into LinkedIn's text areas.

## IMPORTANT: Setup and Configuration (User Responsibility)

This extension requires manual setup by the user to function correctly, especially the AI interaction part.

### 1. Loading the Extension
1.  Download or clone the extension files to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" using the toggle switch (usually in the top right corner).
4.  Click on the "Load unpacked" button.
5.  Select the directory where you saved the extension files.

### 2. Configuring AI Interaction (`background.js`)
The core of the AI suggestion feature relies on interacting with an AI chat website using Selenium. This part is **highly experimental** and requires careful configuration.

*   **AI Chat URL (`AI_CHAT_URL`):**
    *   The `AI_CHAT_URL` constant in `background.js` is pre-set to `https://chatgpt.com/`.
*   **User Login (Critical):**
    *   You **MUST be logged into your chosen AI chat website (e.g., ChatGPT) in your main Chrome browser session** where you are running this extension. The extension does not handle logins itself.
*   **CSS Selectors (Mandatory User Update):**
    *   You **MUST** update the placeholder CSS selectors in `background.js` for the AI interaction to work. These are found within the `getAIDrivenText` function:
        *   `REPLACE_WITH_INPUT_SELECTOR_FOR_CHATGPT_TEXTAREA`: The CSS selector for the text input field on the AI website.
        *   `REPLACE_WITH_SUBMIT_BUTTON_SELECTOR_IF_NEEDED`: The CSS selector for the submit button (if the site doesn't submit on 'Enter').
        *   `REPLACE_WITH_RESPONSE_ELEMENT_SELECTOR_FOR_CHATGPT`: The CSS selector for the element(s) containing the AI's generated response.
    *   **How to find CSS selectors:**
        1.  Go to the AI chat website (e.g., `https://chatgpt.com/`).
        2.  Right-click on the element you want to target (e.g., the prompt input box).
        3.  Select "Inspect" or "Inspect Element" from the context menu. This will open the browser's developer tools.
        4.  The HTML for the selected element will be highlighted. Look for unique `id` attributes or a combination of `class` attributes.
        5.  You can right-click the element in the developer tools HTML view and choose "Copy" > "Copy selector". Test this selector carefully (e.g., in the console using `document.querySelector('your-selector')`).
*   **Selenium Environment:**
    *   The `background.js` file provides a template for Selenium interaction. **It does not include a full Selenium WebDriver setup.** You would need to:
        *   Set up a Node.js environment with the `selenium-webdriver` package and a WebDriver (like `chromedriver`).
        *   Or, adapt the script to communicate with a separate backend service that runs Selenium.
    *   This is an advanced setup and is not plug-and-play.
*   **Potential Issues:**
    *   **CAPTCHAs & Bot Detection:** AI websites often have measures to prevent automated access. These can block the extension.
    *   **UI Changes:** AI websites frequently update their user interface. Any UI change can break the CSS selectors you've configured, requiring you to find and update them again.
    *   **Terms of Service:** Automating interaction with websites might be against their Terms of Service. Use responsibly and at your own risk.
*   **New Chat Handling:**
    *   The script assumes `AI_CHAT_URL` lands on a page ready for prompting. If the site requires clicking a "New Chat" button or similar, you'll need to add those Selenium steps to `getAIDrivenText` in `background.js`.

### 3. Configuring LinkedIn Interaction (`content_script.js`)
To enable the feature of copying notes directly into LinkedIn's message or invitation text boxes:

*   The function `getLinkedInNoteTextArea()` in `content_script.js` currently contains a `TODO` comment.
*   You need to **find the correct CSS selector(s)** for LinkedIn's text area elements on different pages (e.g., connection request pop-ups, messaging views).
*   Update the `getLinkedInNoteTextArea()` function with this selector logic. This will also be prone to breaking if LinkedIn updates its UI.

## Usage
Once configured (especially the AI interaction part):
1.  Navigate to a LinkedIn page where you want to write a note (e.g., a profile page to send a connection request, or a messaging thread).
2.  If the extension's UI doesn't appear, ensure you are on a targeted page (see `isTargetLinkedInPage` in `content_script.js`).
3.  **AI Suggestions:**
    *   Click the "Get AI Suggestion (Test)" button in the extension's UI (this button's prompt is currently hardcoded).
    *   If your Selenium setup and selectors in `background.js` are correct, an AI-generated suggestion should appear in the "AI Suggestions" area.
    *   Click "Use this note" below a suggestion to save it to your "Used Notes History" and (eventually, once configured) copy it to the LinkedIn text area.
4.  **Used Notes History:**
    *   Previously "used" notes appear in the "Used Notes History" section.
    *   Clicking on a note in the history will (eventually, once configured) copy it to the LinkedIn text area.

## Disclaimer
This is an experimental, template extension. Its functionality, particularly the AI interaction, is heavily dependent on:
*   Correct user configuration of `background.js` (CSS selectors, Selenium environment).
*   The stability and structure of external websites (LinkedIn, AI chat platform).
*   The user's adherence to the terms of service of these websites.

It is provided as a starting point and may require significant effort to maintain and adapt. Use with caution and at your own risk.
