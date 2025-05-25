// LinkedIn AI Note Helper – background.js (updated)

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY_STORAGE_KEY = 'linkedinAI_openaiApiKey';
const SAVED_MESSAGES_KEY = 'linkedinAI_savedMessages';
const PROVIDER_STORAGE_KEY = 'linkedinAI_provider';
const OLLAMA_URL_STORAGE_KEY = 'linkedinAI_ollamaUrl';
const OLLAMA_MODEL_STORAGE_KEY = 'linkedinAI_ollamaModel';

// Helper function to generate secure IDs
function generateSecureId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const entropy = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${random}-${entropy}`;
}

async function getAIChatCompletion(prompt) {
  // Get provider and configuration from Chrome storage
  const result = await chrome.storage.local.get([
    PROVIDER_STORAGE_KEY, 
    API_KEY_STORAGE_KEY, 
    OLLAMA_URL_STORAGE_KEY, 
    OLLAMA_MODEL_STORAGE_KEY
  ]);
  
  const provider = result[PROVIDER_STORAGE_KEY] || 'openai';
  
  if (provider === 'ollama') {
    return await getOllamaChatCompletion(prompt, result);
  } else {
    return await getOpenAIChatCompletion(prompt, result);
  }
}

async function getOpenAIChatCompletion(prompt, config) {
  const OPENAI_API_KEY = config[API_KEY_STORAGE_KEY];
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
    return { error: 'OpenAI API key not configured. Please set your OpenAI API key in the extension popup.' };
  }
  
  // Basic API key format validation
  if (!OPENAI_API_KEY.startsWith('sk-') || OPENAI_API_KEY.length < 20) {
    return { error: 'Invalid OpenAI API key format. Please check your OpenAI API key.' };
  }
  
  const body = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7
  };
  
  try {
    const res = await fetch(OPENAI_API_URL, {
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

// Ollama client implementation based on ollama-js library
class OllamaClient {
  constructor(host = 'http://localhost:11434') {
    this.host = host.replace(/\/$/, ''); // Remove trailing slash
  }

  async generate(request) {
    const url = `${this.host}/api/generate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Model '${request.model}' not found. Please pull the model first: ollama pull ${request.model}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async chat(request) {
    const url = `${this.host}/api/chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Model '${request.model}' not found. Please pull the model first: ollama pull ${request.model}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async list() {
    const url = `${this.host}/api/tags`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}

async function getOllamaChatCompletion(prompt, config) {
  const ollamaUrl = config[OLLAMA_URL_STORAGE_KEY] || 'http://localhost:11434';
  const ollamaModel = config[OLLAMA_MODEL_STORAGE_KEY] || 'llama3.2';
  
  try {
    const ollama = new OllamaClient(ollamaUrl);
    
    // Use chat API for better conversation handling
    const response = await ollama.chat({
      model: ollamaModel,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 500
      }
    });
    
    return { suggestion: response.message?.content?.trim() || response.response?.trim() };
  } catch (err) {
    if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
      return { error: 'Cannot connect to Ollama. Please ensure Ollama is running on ' + ollamaUrl };
    }
    return { error: err.message };
  }
}

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  try {
    if (req.action === 'getAISuggestion') {
      getAIChatCompletion(req.prompt)
        .then(sendResponse)
        .catch(error => {
          console.error('Error in getAIChatCompletion:', error);
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

    if (req.action === 'saveProvider') {
      chrome.storage.local.set({ [PROVIDER_STORAGE_KEY]: req.provider })
        .then(() => {
          console.log('Provider saved successfully:', req.provider);
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error saving provider:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    if (req.action === 'getProvider') {
      chrome.storage.local.get([PROVIDER_STORAGE_KEY])
        .then(result => {
          sendResponse({ provider: result[PROVIDER_STORAGE_KEY] || 'openai' });
        })
        .catch(error => {
          console.error('Error getting provider:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    if (req.action === 'saveOllamaConfig') {
      const config = {};
      if (req.url) config[OLLAMA_URL_STORAGE_KEY] = req.url;
      if (req.model) config[OLLAMA_MODEL_STORAGE_KEY] = req.model;
      
      chrome.storage.local.set(config)
        .then(() => {
          console.log('Ollama config saved successfully');
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error saving Ollama config:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    if (req.action === 'getOllamaConfig') {
      chrome.storage.local.get([OLLAMA_URL_STORAGE_KEY, OLLAMA_MODEL_STORAGE_KEY])
        .then(result => {
          sendResponse({ 
            url: result[OLLAMA_URL_STORAGE_KEY] || 'http://localhost:11434',
            model: result[OLLAMA_MODEL_STORAGE_KEY] || 'llama3.2'
          });
        })
        .catch(error => {
          console.error('Error getting Ollama config:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    if (req.action === 'testOllamaConnection') {
      const ollamaUrl = req.url || 'http://localhost:11434';
      const ollama = new OllamaClient(ollamaUrl);
      
      ollama.list()
        .then(result => {
          sendResponse({ 
            success: true, 
            models: result.models || [],
            message: 'Connected successfully'
          });
        })
        .catch(error => {
          console.error('Error testing Ollama connection:', error);
          sendResponse({ 
            success: false, 
            error: error.message,
            message: 'Failed to connect to Ollama'
          });
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
      
      // Validate and sanitize category
      const category = req.category ? req.category.trim() : 'General';
      if (category.length > 30) {
        sendResponse({ error: 'Category name too long. Maximum 30 characters allowed.' });
        return true;
      }
      
      chrome.storage.local.get([SAVED_MESSAGES_KEY])
        .then(result => {
          const savedMessages = result[SAVED_MESSAGES_KEY] || [];
          
          // Check for duplicate messages in the same category
          const isDuplicate = savedMessages.some(msg => 
            msg.message === cleanMessage && (msg.category || 'General') === category
          );
          if (isDuplicate) {
            sendResponse({ error: 'This message has already been saved in this category.' });
            return;
          }
          
          const newMessage = {
            id: generateSecureId(),
            message: cleanMessage,
            category: category,
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

    // Get saved messages (optionally filtered by category)
    if (req.action === 'getSavedMessages') {
      chrome.storage.local.get([SAVED_MESSAGES_KEY])
        .then(result => {
          let messages = result[SAVED_MESSAGES_KEY] || [];
          
          // Filter by category if specified
          if (req.category) {
            messages = messages.filter(msg => (msg.category || 'General') === req.category);
          }
          
          sendResponse({ messages: messages });
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

    // Get categories
    if (req.action === 'getCategories') {
      chrome.storage.local.get([SAVED_MESSAGES_KEY])
        .then(result => {
          const savedMessages = result[SAVED_MESSAGES_KEY] || [];
          const categories = new Set(['General', 'Referral']); // Default categories
          
          // Extract unique categories from saved messages
          savedMessages.forEach(msg => {
            if (msg.category && msg.category.trim()) {
              categories.add(msg.category);
            }
          });
          
          sendResponse({ categories: Array.from(categories).sort() });
        })
        .catch(error => {
          console.error('Error getting categories:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    // Change saved message category
    if (req.action === 'changeSavedMessageCategory') {
      if (!req.messageId || !req.newCategory) {
        sendResponse({ error: 'Invalid parameters provided' });
        return true;
      }
      
      const newCategory = req.newCategory.trim();
      if (newCategory.length > 30) {
        sendResponse({ error: 'Category name too long. Maximum 30 characters allowed.' });
        return true;
      }
      
      chrome.storage.local.get([SAVED_MESSAGES_KEY])
        .then(result => {
          const savedMessages = result[SAVED_MESSAGES_KEY] || [];
          const messageIndex = savedMessages.findIndex(msg => msg.id === req.messageId);
          
          if (messageIndex === -1) {
            sendResponse({ error: 'Message not found' });
            return;
          }
          
          // Check for duplicate in new category
          const isDuplicate = savedMessages.some((msg, index) => 
            index !== messageIndex && 
            msg.message === savedMessages[messageIndex].message && 
            (msg.category || 'General') === newCategory
          );
          
          if (isDuplicate) {
            sendResponse({ error: 'This message already exists in the target category.' });
            return;
          }
          
          // Update category
          savedMessages[messageIndex].category = newCategory;
          
          return chrome.storage.local.set({ [SAVED_MESSAGES_KEY]: savedMessages });
        })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error changing message category:', error);
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

console.log('LinkedIn AI Note Helper background.js v0.7.0 loaded - Auto-Setup Ollama with guided installation');