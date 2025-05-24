// This file will inject and manage the UI on LinkedIn pages.

console.log("LinkedIn AI Note Helper: content_script.js loaded.");

const USED_NOTES_STORAGE_KEY = 'linkedinAINotes_usedNotes';
const MAX_HISTORY_SIZE = 15; // Max number of notes to keep in history

/**
 * Checks if the current LinkedIn page is a target for UI injection.
 * @returns {boolean} True if the UI should be injected, false otherwise.
 */
function isTargetLinkedInPage() {
  const href = window.location.href;
  const targetPatterns = [
    'linkedin.com/in/', // Profile pages
    'linkedin.com/messaging/thread/', // Messaging pages
    'linkedin.com/mynetwork/invitation-manager/' // Invitation manager
    // Connection request modals often don't change the main URL significantly,
    // relying on profile URL detection might be the primary way for connection notes.
  ];

  return targetPatterns.some(pattern => href.includes(pattern));
}

/**
 * Placeholder function to identify the LinkedIn note/message input field.
 * This will need to be implemented with specific selectors for LinkedIn's UI.
 * @returns {HTMLElement|null} The text area element or null if not found.
 */
function getLinkedInNoteTextArea() {
  // TODO: Implement robust selector logic for LinkedIn's note/message text areas.
  // This is highly dependent on LinkedIn's current HTML structure.
  // Examples of what selectors *might* look like (these will likely need adjustment):
  // - For connection notes: '.connect-button-container textarea', 'textarea[name="message"]'
  // - For messaging: '.msg-form__contenteditable[role="textbox"]', '.msg-form__textarea'
  console.log("TODO: Implement selector for LinkedIn text area. Returning null for now.");
  return null;
}


/**
 * Injects the AI Note Helper UI into the current LinkedIn page.
 * Fetches HTML from ui/popup.html to create the UI.
 */
async function injectUI() {
  if (!isTargetLinkedInPage()) {
    console.log("LinkedIn AI Note Helper: Not a target page, UI will not be injected. URL:", window.location.href);
    return;
  }
  console.log("LinkedIn AI Note Helper: Target page detected. Proceeding with UI injection.");

  try {
    const response = await fetch(chrome.runtime.getURL('ui/popup.html'));
    if (!response.ok) {
      console.error("Failed to fetch popup.html:", response.statusText);
      return;
    }
    const htmlText = await response.text();

    const uiContainer = document.createElement('div');
    uiContainer.id = 'linkedin-ai-note-helper-main-container';
    uiContainer.innerHTML = htmlText;

    // Styles are defined in css/style.css but some critical ones for positioning here:
    uiContainer.style.position = 'fixed';
    uiContainer.style.bottom = '20px';
    uiContainer.style.right = '20px';
    uiContainer.style.zIndex = '10000';

    document.body.appendChild(uiContainer);
    console.log("LinkedIn AI Note Helper: UI Injected from popup.html.");

    const testButton = document.getElementById('ai-suggestion-btn');
    if (testButton) {
      testButton.addEventListener('click', () => {
        console.log("Test button clicked. Requesting AI suggestion...");
        requestAISuggestions({ promptString: "Generate a polite connection note for a software engineer." });
      });
    } else {
      console.warn("AI Suggestion button (ai-suggestion-btn) not found in the loaded HTML.");
    }

    await loadAndDisplayHistory();

  } catch (error) {
    console.error("Error injecting UI:", error);
  }
}

/**
 * Saves a note to the local storage history.
 * @param {string} noteText The text of the note to save.
 */
async function saveNoteToHistory(noteText) {
  if (!noteText || typeof noteText !== 'string' || noteText.trim() === '') {
    console.warn("saveNoteToHistory: Attempted to save an empty or invalid note.");
    return;
  }
  try {
    const result = await chrome.storage.local.get([USED_NOTES_STORAGE_KEY]);
    let notesArray = result[USED_NOTES_STORAGE_KEY] || [];
    notesArray.unshift(noteText.trim());
    notesArray = [...new Set(notesArray)];
    if (notesArray.length > MAX_HISTORY_SIZE) {
      notesArray = notesArray.slice(0, MAX_HISTORY_SIZE);
    }
    await chrome.storage.local.set({ [USED_NOTES_STORAGE_KEY]: notesArray });
    console.log("Note saved to history:", noteText);
    await loadAndDisplayHistory();
  } catch (error)
 {
    console.error("Error saving note to history:", error);
  }
}

/**
 * Loads notes from storage and displays them in the "Used Notes History" section.
 */
async function loadAndDisplayHistory() {
  const historyListDiv = document.getElementById('used-notes-list');
  if (!historyListDiv) {
    console.error("Used notes list container (id: used-notes-list) not found.");
    return;
  }
  historyListDiv.innerHTML = '';

  try {
    const result = await chrome.storage.local.get([USED_NOTES_STORAGE_KEY]);
    const notes = result[USED_NOTES_STORAGE_KEY];

    if (notes && notes.length > 0) {
      notes.forEach(noteText => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('history-note-item');
        noteElement.textContent = noteText;
        noteElement.title = "Click to use this note (copies to console for now)";

        noteElement.addEventListener('click', () => {
          console.log("History note clicked:", noteText);
          const textArea = getLinkedInNoteTextArea();
          if (textArea) {
            // TODO: Actually copy to text area
            console.log("Attempting to copy history note to text area (selector pending):", noteText);
          } else {
            console.log("LinkedIn text area not found for history note.");
          }
        });
        historyListDiv.appendChild(noteElement);
      });
    } else {
      historyListDiv.innerHTML = '<p class="empty-history-message">No notes used yet.</p>';
    }
  } catch (error) {
    console.error("Error loading or displaying note history:", error);
    historyListDiv.innerHTML = '<p class="empty-history-message" style="color: red;">Error loading history.</p>';
  }
}

/**
 * Sends a prompt to the background script to get an AI suggestion.
 * @param {object} promptDetails An object containing the prompt string.
 */
function requestAISuggestions(promptDetails) {
  if (!promptDetails || !promptDetails.promptString) {
    console.error("requestAISuggestions: promptString is required.");
    return;
  }

  console.log(`Content Script: Sending prompt to background script: "${promptDetails.promptString}"`);

  chrome.runtime.sendMessage(
    { action: "getAISuggestion", prompt: promptDetails.promptString },
    (response) => {
      const suggestionsArea = document.getElementById('ai-suggestions-area');
      if (!suggestionsArea) {
        console.error("AI Suggestions area (id: ai-suggestions-area) not found in the UI.");
        return;
      }
      suggestionsArea.innerHTML = ''; // Clear previous

      if (chrome.runtime.lastError) {
        console.error("Error sending message to background script:", chrome.runtime.lastError.message);
        suggestionsArea.innerHTML = `<p class="ai-suggestion-error">Error: Could not connect to background script.</p>`;
        return;
      }

      if (response && response.error) {
        console.error("Background script returned an error:", response.error);
        suggestionsArea.innerHTML = `<p class="ai-suggestion-error">Error from AI: ${response.error}</p>`;
      } else if (response && response.suggestion) {
        console.log("Content Script: Received suggestion:", response.suggestion);
        const suggestionText = response.suggestion;
        const suggestionWrapper = document.createElement('div');
        suggestionWrapper.classList.add('ai-suggestion-wrapper');
        const suggestionP = document.createElement('p');
        suggestionP.classList.add('ai-suggestion-text');
        suggestionP.textContent = suggestionText;
        const useNoteButton = document.createElement('button');
        useNoteButton.textContent = "Use this note";
        useNoteButton.classList.add('use-note-button');

        useNoteButton.addEventListener('click', async () => {
          const originalButtonText = useNoteButton.textContent;
          useNoteButton.textContent = "Saved!";
          useNoteButton.disabled = true;

          await saveNoteToHistory(suggestionText);
          console.log("AI suggestion saved to history:", suggestionText);

          const textArea = getLinkedInNoteTextArea();
          if (textArea) {
            // TODO: Actually copy to text area
            console.log("Attempting to copy AI suggestion to text area (selector pending):", suggestionText);
          } else {
            console.log("LinkedIn text area not found for AI suggestion.");
          }

          setTimeout(() => {
            useNoteButton.textContent = originalButtonText;
            useNoteButton.disabled = false;
          }, 1500); // Revert after 1.5 seconds
        });

        suggestionWrapper.appendChild(suggestionP);
        suggestionWrapper.appendChild(useNoteButton);
        suggestionsArea.appendChild(suggestionWrapper);
      } else {
        console.warn("Content Script: Unexpected response:", response);
        suggestionsArea.innerHTML = `<p class="ai-suggestion-error">Unexpected response from AI.</p>`;
      }
    }
  );
}

// --- Initial execution ---
injectUI(); // Will now check page URL before injecting

console.log("LinkedIn AI Note Helper: content_script.js finished execution.");
