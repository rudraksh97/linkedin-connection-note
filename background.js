// This file handles AI text generation via OpenAI API.

// --- CRITICAL USER CONFIGURATION ---
// Replace this with your actual OpenAI API key.
// IMPORTANT: Keep your API key secure. Do not commit it to public repositories.
// Consider using environment variables or a secure configuration method if you adapt this code further.
const OPENAI_API_KEY = 'USER_MUST_REPLACE_WITH_THEIR_API_KEY';

/**
 * Fetches AI-driven text suggestions using the OpenAI Chat Completions API.
 *
 * @param {string} prompt The prompt to send to the OpenAI API.
 * @returns {Promise<object>} A promise that resolves with an object containing either
 *                            `suggestion: "text"` or `error: "message"`.
 */
async function getOpenAIChatCompletion(prompt) {
  // Check if the API key has been configured
  if (OPENAI_API_KEY === 'USER_MUST_REPLACE_WITH_THEIR_API_KEY' || !OPENAI_API_KEY) {
    console.error("OpenAI API key not configured in background.js. Please add your API key.");
    return { error: "OpenAI API key not configured in background.js" };
  }

  const apiURL = 'https://api.openai.com/v1/chat/completions';

  const requestBody = {
    model: "gpt-3.5-turbo", // Or "gpt-4" or other compatible models
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150, // Adjust as needed for desired response length
    temperature: 0.7 // Adjust for creativity vs. determinism. 0.2 is less random.
  };

  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Handle API errors (e.g., authentication issues, rate limits)
      console.error('OpenAI API Error:', responseData);
      const errorMessage = responseData.error && responseData.error.message ?
                           responseData.error.message :
                           `HTTP error ${response.status}`;
      return { error: `API Error: ${errorMessage}` };
    }

    // Extract the generated text
    if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message) {
      const suggestionText = responseData.choices[0].message.content.trim();
      return { suggestion: suggestionText };
    } else {
      console.error('Unexpected response structure from OpenAI API:', responseData);
      return { error: "Failed to parse suggestion from API response." };
    }

  } catch (error) {
    // Handle network errors or other unexpected issues during the fetch call
    console.error('Error calling OpenAI API:', error);
    return { error: `Network or other error: ${error.message}` };
  }
}

// Listener for messages from content_script.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAISuggestion") {
    if (!request.prompt) {
      console.error("Background: Received getAISuggestion request without a prompt.");
      sendResponse({ error: "Prompt is required." });
      return true; // Indicates asynchronous response
    }

    console.log(`Background: Received prompt for OpenAI: "${request.prompt}"`);

    getOpenAIChatCompletion(request.prompt)
      .then(result => {
        // The result object will have either a 'suggestion' or 'error' property
        if (result.suggestion) {
          console.log("Background: Sending suggestion to content script:", result.suggestion);
          sendResponse({ suggestion: result.suggestion });
        } else {
          console.error("Background: Sending error to content script:", result.error);
          sendResponse({ error: result.error || "Unknown error from getOpenAIChatCompletion." });
        }
      })
      .catch(error => {
        // This catch block is for unexpected errors in the promise chain itself,
        // though getOpenAIChatCompletion is designed to catch its own errors and return an error object.
        console.error("Background: Unexpected error in getOpenAIChatCompletion promise chain:", error);
        sendResponse({ error: `Internal background script error: ${error.message}` });
      });

    return true; // Indicates that the response will be sent asynchronously
  }
});

console.log("background.js loaded. Now uses OpenAI API. User MUST configure OPENAI_API_KEY.");

// Example of how to test the function (you would call this from the service worker's console)
/*
async function testOpenAI() {
  if (OPENAI_API_KEY === 'USER_MUST_REPLACE_WITH_THEIR_API_KEY') {
    console.log("Cannot test OpenAI: API Key not set in background.js");
    return;
  }
  console.log("Testing getOpenAIChatCompletion...");
  const testPrompt = "Write a short, friendly LinkedIn connection request intro for a software architect.";
  const result = await getOpenAIChatCompletion(testPrompt);
  if (result.suggestion) {
    console.log("Test Suggestion:", result.suggestion);
  } else {
    console.error("Test Error:", result.error);
  }
}
// To run the test:
// 1. Open the extension's service worker console.
// 2. Ensure OPENAI_API_KEY is set in the script.
// 3. Type: await testOpenAI()
// 4. Press Enter.
*/
