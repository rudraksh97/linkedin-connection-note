# LinkedIn AI Note Helper Extension

## Overview
The LinkedIn AI Note Helper is a Chrome extension designed to assist users in crafting personalized notes for LinkedIn connections, messages, and invitations. It aims to streamline the process by:
1.  Allowing users to fetch AI-generated text suggestions by making direct calls to the OpenAI API.
2.  Storing a history of previously used notes for easy reuse.
3.  Injecting a helpful UI directly onto LinkedIn pages.

## Features
*   **In-Page UI:** Injects a user interface directly on relevant LinkedIn pages (profiles, messaging, invitation manager).
*   **AI-Powered Suggestions:** Leverages the OpenAI API (e.g., GPT-3.5-turbo, GPT-4) to generate note suggestions based on user prompts.
    *   *Note: This requires the user to configure their OpenAI API key.*
*   **Note History:** Saves notes that you've used (either from AI suggestions or potentially manually added in future versions) to local browser storage.
*   **Click-to-Use History:** Allows you to easily re-use notes from your history.
*   **Placeholder for Direct Copy:** Includes a placeholder function to eventually copy notes directly into LinkedIn's text areas.

## IMPORTANT: Setup and Configuration (User Responsibility)

This extension requires manual setup by the user to function correctly.

### 1. Loading the Extension
1.  Download or clone the extension files to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" using the toggle switch (usually in the top right corner).
4.  Click on the "Load unpacked" button.
5.  Select the directory where you saved the extension files.

### 2. Configuring AI Interaction (`background.js`)
The AI suggestion feature now uses the OpenAI API directly.

*   **Obtain an OpenAI API Key:**
    *   You need an API key from OpenAI. Visit the OpenAI platform (platform.openai.com), sign up or log in, and navigate to the API key section of your account settings to create a new secret key.
*   **Set the API Key in `background.js`:**
    *   Open the `background.js` file in the extension's directory.
    *   Locate the following line:
        ```javascript
        const OPENAI_API_KEY = 'USER_MUST_REPLACE_WITH_THEIR_API_KEY';
        ```
    *   Replace `'USER_MUST_REPLACE_WITH_THEIR_API_KEY'` with your actual OpenAI API key.
*   **Security Warning:**
    *   Your OpenAI API key is sensitive. Do not share it, commit it to public repositories, or embed it directly in client-side code if you plan to distribute this extension more widely. For personal use, placing it in `background.js` as instructed is a direct approach, but be mindful of its security. If you are concerned, consider using more advanced methods like a backend proxy or environment variables (which are more complex for a simple Chrome extension).

### 3. Configuring LinkedIn Interaction (`content_script.js`)
To enable the feature of copying notes directly into LinkedIn's message or invitation text boxes:

*   The function `getLinkedInNoteTextArea()` in `content_script.js` currently contains a `TODO` comment.
*   You need to **find the correct CSS selector(s)** for LinkedIn's text area elements on different pages (e.g., connection request pop-ups, messaging views).
*   Update the `getLinkedInNoteTextArea()` function with this selector logic. This will be prone to breaking if LinkedIn updates its UI.
    *   **How to find CSS selectors for LinkedIn:**
        1.  On LinkedIn, open the relevant message box or connection request pop-up.
        2.  Right-click on the text input area.
        3.  Select "Inspect" or "Inspect Element".
        4.  In the developer tools, find the highlighted HTML element (usually a `textarea` or a `div` with `contenteditable="true"`).
        5.  Copy its selector (right-click > Copy > Copy selector) and test it in the console using `document.querySelector('your-selector')`.

## Usage
Once configured:
1.  Navigate to a LinkedIn page where you want to write a note (e.g., a profile page to send a connection request, or a messaging thread).
2.  If the extension's UI doesn't appear, ensure you are on a targeted page (see `isTargetLinkedInPage` in `content_script.js`).
3.  **AI Suggestions:**
    *   Click the "Get AI Suggestion (Test)" button in the extension's UI (this button's prompt is currently hardcoded).
    *   If your OpenAI API key in `background.js` is correct, an AI-generated suggestion should appear in the "AI Suggestions" area after a brief moment.
    *   Click "Use this note" below a suggestion to save it to your "Used Notes History" and (eventually, once configured) copy it to the LinkedIn text area.
4.  **Used Notes History:**
    *   Previously "used" notes appear in the "Used Notes History" section.
    *   Clicking on a note in the history will (eventually, once configured) copy it to the LinkedIn text area.

## Disclaimer
This extension's functionality is dependent on:
*   Correct user configuration of the OpenAI API key in `background.js`.
*   The stability and structure of LinkedIn's website (for the `getLinkedInNoteTextArea` feature).
*   Adherence to OpenAI's API usage policies.

It is provided as a starting point and may require effort to maintain and adapt, especially the LinkedIn UI interaction parts. Use responsibly and at your own risk.
