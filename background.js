// LinkedIn AI Note Helper – background.js (updated)

const apiURL = 'https://api.openai.com/v1/chat/completions';
const API_KEY_STORAGE_KEY = 'linkedinAI_openaiApiKey';
const SAVED_MESSAGES_KEY = 'linkedinAI_savedMessages';
const MESSAGE_HISTORY_KEY = 'linkedinAI_messageHistory';

// Helper function to generate secure IDs
function generateSecureId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const entropy = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${random}-${entropy}`;
}

async function getOpenAIChatCompletion(prompt) {
  // Get API key from Chrome storage
  const result = await chrome.storage.local.get([API_KEY_STORAGE_KEY]);
  const OPENAI_API_KEY = result[API_KEY_STORAGE_KEY];
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
    return { error: 'API key not configured. Please set your OpenAI API key in the extension popup.' };
  }
  
  // Basic API key format validation
  if (!OPENAI_API_KEY.startsWith('sk-') || OPENAI_API_KEY.length < 20) {
    return { error: 'Invalid API key format. Please check your OpenAI API key.' };
  }
  const body = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7
  };
  try {
    const res = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return { error: data?.error?.message || `HTTP ${res.status}` };
    return { suggestion: data.choices?.[0]?.message?.content?.trim() };
  } catch (err) {
    return { error: err.message };
  }
}

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  try {
    if (req.action === 'getAISuggestion') {
      getOpenAIChatCompletion(req.prompt)
        .then(sendResponse)
        .catch(error => {
          console.error('Error in getOpenAIChatCompletion:', error);
          sendResponse({ error: error.message || 'Unknown error occurred' });
        });
      return true;
    }

    if (req.action === 'saveApiKey') {
      // Validate API key before saving
      if (!req.apiKey || typeof req.apiKey !== 'string' || req.apiKey.trim() === '') {
        sendResponse({ error: 'Invalid API key provided' });
        return true;
      }
      
      const cleanApiKey = req.apiKey.trim();
      if (!cleanApiKey.startsWith('sk-') || cleanApiKey.length < 20) {
        sendResponse({ error: 'Invalid API key format. Must start with "sk-" and be at least 20 characters long.' });
        return true;
      }
      
      chrome.storage.local.set({ [API_KEY_STORAGE_KEY]: cleanApiKey })
        .then(() => {
          console.log('API key saved successfully');
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error saving API key:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    if (req.action === 'getApiKey') {
      chrome.storage.local.get([API_KEY_STORAGE_KEY])
        .then(result => {
          sendResponse({ apiKey: result[API_KEY_STORAGE_KEY] || '' });
        })
        .catch(error => {
          console.error('Error getting API key:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    if (req.action === 'getHtml') {
      const url = chrome.runtime.getURL(req.path);
      fetch(url)
        .then(r => r.text())
        .then(html => sendResponse({ html }))
        .catch(err => sendResponse({ error: err.message }));
      return true;
    }

    // Save custom message
    if (req.action === 'saveCustomMessage') {
      // Validate and sanitize message input
      if (!req.message || typeof req.message !== 'string' || req.message.trim() === '') {
        sendResponse({ error: 'Invalid message provided' });
        return true;
      }
      
      const cleanMessage = req.message.trim();
      if (cleanMessage.length > 2000) {
        sendResponse({ error: 'Message too long. Maximum 2000 characters allowed.' });
        return true;
      }
      
      chrome.storage.local.get([SAVED_MESSAGES_KEY])
        .then(result => {
          const savedMessages = result[SAVED_MESSAGES_KEY] || [];
          
          // Check for duplicate messages
          const isDuplicate = savedMessages.some(msg => msg.message === cleanMessage);
          if (isDuplicate) {
            sendResponse({ error: 'This message has already been saved.' });
            return;
          }
          
          const newMessage = {
            id: generateSecureId(),
            message: cleanMessage,
            timestamp: Date.now()
          };
          savedMessages.unshift(newMessage); // Add to beginning
          
          // Keep only last 50 saved messages
          if (savedMessages.length > 50) {
            savedMessages.splice(50);
          }
          
          return chrome.storage.local.set({ [SAVED_MESSAGES_KEY]: savedMessages });
        })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error saving custom message:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    // Get saved messages
    if (req.action === 'getSavedMessages') {
      chrome.storage.local.get([SAVED_MESSAGES_KEY])
        .then(result => {
          sendResponse({ messages: result[SAVED_MESSAGES_KEY] || [] });
        })
        .catch(error => {
          console.error('Error getting saved messages:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    // Delete saved message
    if (req.action === 'deleteSavedMessage') {
      chrome.storage.local.get([SAVED_MESSAGES_KEY])
        .then(result => {
          const savedMessages = result[SAVED_MESSAGES_KEY] || [];
          const filteredMessages = savedMessages.filter(msg => msg.id !== req.messageId);
          return chrome.storage.local.set({ [SAVED_MESSAGES_KEY]: filteredMessages });
        })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error deleting saved message:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    // Add message to history
    if (req.action === 'addToHistory') {
      chrome.storage.local.get([MESSAGE_HISTORY_KEY])
        .then(result => {
          const history = result[MESSAGE_HISTORY_KEY] || [];
          const newHistoryItem = {
            id: generateSecureId(),
            message: req.message,
            source: req.source, // 'ai' or 'saved'
            timestamp: Date.now()
          };
          
          // Check if message already exists in recent history (last 5 items)
          const recentHistory = history.slice(0, 5);
          const isDuplicate = recentHistory.some(item => item.message === req.message);
          
          if (!isDuplicate) {
            history.unshift(newHistoryItem); // Add to beginning
            
            // Keep only last 100 history items
            if (history.length > 100) {
              history.splice(100);
            }
            
            return chrome.storage.local.set({ [MESSAGE_HISTORY_KEY]: history });
          }
          return Promise.resolve(); // Skip saving if duplicate
        })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error adding to history:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    // Get message history
    if (req.action === 'getMessageHistory') {
      chrome.storage.local.get([MESSAGE_HISTORY_KEY])
        .then(result => {
          sendResponse({ history: result[MESSAGE_HISTORY_KEY] || [] });
        })
        .catch(error => {
          console.error('Error getting message history:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    // Delete history message
    if (req.action === 'deleteHistoryMessage') {
      chrome.storage.local.get([MESSAGE_HISTORY_KEY])
        .then(result => {
          const history = result[MESSAGE_HISTORY_KEY] || [];
          const filteredHistory = history.filter(msg => msg.id !== req.messageId);
          return chrome.storage.local.set({ [MESSAGE_HISTORY_KEY]: filteredHistory });
        })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error deleting history message:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }
    
    // Handle unknown actions
    sendResponse({ error: 'Unknown action: ' + req.action });
  } catch (error) {
    console.error('Error in message listener:', error);
    sendResponse({ error: error.message || 'Unknown error occurred' });
  }
});

console.log('LinkedIn AI Note Helper background.js v0.3.0 loaded');