// LinkedIn AI Note Helper - Popup Script (Simplified)

document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  loadApiKeyStatus();
  loadSavedMessages();
});

function setupEventListeners() {
  // Configure API Key button
  const configureBtn = document.getElementById('configure-api-key');
  if (configureBtn) {
    configureBtn.addEventListener('click', showApiKeyModal);
  }
  
  // Manage Messages button
  const manageBtn = document.getElementById('manage-messages');
  if (manageBtn) {
    manageBtn.addEventListener('click', showMessagesModal);
  }
  
  // Open LinkedIn button
  const linkedinBtn = document.getElementById('open-linkedin');
  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', function() {
      chrome.tabs.create({ url: 'https://www.linkedin.com' });
    });
  }
  
  // Clear History button
  const clearBtn = document.getElementById('clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearHistory);
  }
  
  // Export Data button
  const exportBtn = document.getElementById('export-data');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportAllData);
  }
  
  // Import Data button
  const importBtn = document.getElementById('import-data');
  if (importBtn) {
    importBtn.addEventListener('click', importData);
  }
}

function loadApiKeyStatus() {
  // Create overview content
  const apiKeySection = document.querySelector('.api-key-section');
  if (apiKeySection) {
    apiKeySection.innerHTML = `
      <h3>🔑 AI Provider</h3>
      <div id="api-key-status" class="status-indicator">
        <span class="loading">Checking...</span>
      </div>
      <button id="configure-api-key" class="btn btn-primary">Configure AI Provider</button>
      
      <div class="saved-messages-section">
        <h3>📚 Saved Messages</h3>
        <div id="saved-messages-count" class="count">0 messages</div>
        <button id="manage-messages" class="btn btn-secondary">Manage Messages</button>
      </div>
      
      <div class="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <button id="open-linkedin" class="btn btn-outline">Open LinkedIn</button>
        <button id="clear-history" class="btn btn-outline">Clear History</button>
      </div>
      
      <div class="footer">
        <p>Visit any LinkedIn profile and click "Connect" to start using the AI helper.</p>
      </div>
    `;
    
    // Re-setup event listeners after creating content
    setupEventListeners();
  }
  
  // Load provider first
  chrome.runtime.sendMessage({ action: 'getProvider' }, function(providerResponse) {
    if (chrome.runtime.lastError || !providerResponse) {
      const statusElement = document.getElementById('api-key-status');
      if (statusElement) {
        statusElement.innerHTML = '<span class="error">❌ Error loading</span>';
      }
      return;
    }
    
    const provider = providerResponse.provider || 'openai';
    
    if (provider === 'openai') {
      chrome.runtime.sendMessage({ action: 'getApiKey' }, function(response) {
        const statusElement = document.getElementById('api-key-status');
        if (!statusElement) return;
        
        if (chrome.runtime.lastError || !response) {
          statusElement.innerHTML = '<span class="error">❌ Error loading</span>';
          return;
        }
        
        if (response.apiKey && response.apiKey.trim()) {
          statusElement.innerHTML = '<span class="success">✅ OpenAI Configured</span>';
        } else {
          statusElement.innerHTML = '<span class="warning">⚠️ OpenAI Not configured</span>';
        }
      });
    } else {
      chrome.runtime.sendMessage({ action: 'getOllamaConfig' }, function(response) {
        const statusElement = document.getElementById('api-key-status');
        if (!statusElement) return;
        
        if (chrome.runtime.lastError || !response) {
          statusElement.innerHTML = '<span class="error">❌ Error loading</span>';
          return;
        }
        
        statusElement.innerHTML = '<span class="success">✅ Ollama Configured</span>';
      });
    }
  });
}

function loadSavedMessages() {
  chrome.runtime.sendMessage({ action: 'getSavedMessages' }, function(response) {
    const countElement = document.getElementById('saved-messages-count');
    if (!countElement) return;
    
    if (chrome.runtime.lastError || !response) {
      countElement.textContent = 'Error loading';
      return;
    }
    
    const count = response.messages ? response.messages.length : 0;
    countElement.textContent = `${count} message${count !== 1 ? 's' : ''}`;
  });
}

function showApiKeyModal() {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>🤖 Configure AI Provider</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="provider-selection">
          <label>Choose AI Provider:</label>
          <div class="provider-options">
            <label class="provider-option">
              <input type="radio" name="provider" value="openai" id="popup-provider-openai">
              <span>OpenAI (Paid API)</span>
            </label>
            <label class="provider-option">
              <input type="radio" name="provider" value="ollama" id="popup-provider-ollama">
              <span>Ollama (Free & Local)</span>
            </label>
          </div>
        </div>
        
        <div id="popup-openai-config" class="provider-config" style="display:none;">
          <p>Enter your OpenAI API key to enable AI message generation:</p>
          <input type="password" id="popup-api-key-input" placeholder="sk-..." class="api-key-input">
          <p class="help-text">
            Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>
          </p>
        </div>
        
        <div id="popup-ollama-config" class="provider-config" style="display:none;">
          <div class="form-group">
            <label>Ollama Server URL:</label>
            <input type="text" id="popup-ollama-url" placeholder="http://localhost:11434" class="form-input">
          </div>
          <div class="form-group">
            <label>Model:</label>
            <select id="popup-ollama-model" class="form-select">
              <option value="">Select a model...</option>
            </select>
            <button type="button" id="refresh-models-btn" class="btn btn-outline" style="margin-top: 5px; padding: 4px 8px; font-size: 12px; width: auto; display: inline-block;">🔄 Refresh Models</button>
          </div>
          <div class="help-box">
            <strong>Setup Ollama:</strong><br>
            1. Install from <a href="https://ollama.ai" target="_blank">ollama.ai</a><br>
            2. Run: <code>ollama pull llama3.2</code><br>
            3. Start with CORS enabled: <code>OLLAMA_ORIGINS=* ollama serve</code><br>
            <br>
            <strong>If you get CORS errors:</strong><br>
            Stop Ollama and restart it with: <code>OLLAMA_ORIGINS=* ollama serve</code>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="save-provider-config" class="btn btn-primary">Save</button>
        <button id="cancel-provider-config" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Load current configuration and set up initial state
  Promise.all([
    new Promise(resolve => chrome.runtime.sendMessage({ action: 'getProvider' }, resolve)),
    new Promise(resolve => chrome.runtime.sendMessage({ action: 'getApiKey' }, resolve)),
    new Promise(resolve => chrome.runtime.sendMessage({ action: 'getOllamaConfig' }, resolve))
  ]).then(([providerResponse, apiKeyResponse, ollamaResponse]) => {
    const provider = providerResponse && providerResponse.provider ? providerResponse.provider : 'openai';
    const openaiRadio = document.getElementById('popup-provider-openai');
    const ollamaRadio = document.getElementById('popup-provider-ollama');
    
    // Set provider selection
    if (provider === 'ollama') {
      ollamaRadio.checked = true;
    } else {
      openaiRadio.checked = true;
    }
    
    // Load API key for OpenAI
    const apiKeyInput = document.getElementById('popup-api-key-input');
    if (apiKeyResponse && apiKeyResponse.apiKey && apiKeyInput) {
      apiKeyInput.value = apiKeyResponse.apiKey;
    }
    
    // Load Ollama config
    if (ollamaResponse) {
      const urlInput = document.getElementById('popup-ollama-url');
      if (urlInput) {
        urlInput.value = ollamaResponse.url || 'http://localhost:11434';
      }
    }
    
    // Show provider config and load models if needed
    showProviderConfig();
    
    // If Ollama is selected, load models
    if (provider === 'ollama' && ollamaResponse) {
      setTimeout(() => {
        loadOllamaModels(ollamaResponse.url || 'http://localhost:11434', ollamaResponse.model);
      }, 200);
    }
  });
  
  // Provider selection handlers
  function showProviderConfig() {
    const openaiRadio = document.getElementById('popup-provider-openai');
    const ollamaRadio = document.getElementById('popup-provider-ollama');
    const openaiConfig = document.getElementById('popup-openai-config');
    const ollamaConfig = document.getElementById('popup-ollama-config');
    
    if (openaiRadio && openaiRadio.checked) {
      openaiConfig.style.display = 'block';
      ollamaConfig.style.display = 'none';
    } else if (ollamaRadio && ollamaRadio.checked) {
      openaiConfig.style.display = 'none';
      ollamaConfig.style.display = 'block';
      
      // Load models when user switches to Ollama (only if not already loaded)
      const modelSelect = document.getElementById('popup-ollama-model');
      if (modelSelect && modelSelect.options.length <= 1) {
        setTimeout(() => {
          const urlInput = document.getElementById('popup-ollama-url');
          const url = urlInput ? urlInput.value.trim() : 'http://localhost:11434';
          
          // Get saved model from config
          chrome.runtime.sendMessage({ action: 'getOllamaConfig' }, function(response) {
            const savedModel = response && response.model ? response.model : null;
            if (url) {
              loadOllamaModels(url, savedModel);
            }
          });
        }, 100);
      }
    }
  }
  
  const providerRadios = document.querySelectorAll('input[name="provider"]');
  providerRadios.forEach(radio => {
    radio.addEventListener('change', showProviderConfig);
  });

  // Set up Ollama-specific event listeners after a short delay to ensure DOM is ready
  setTimeout(() => {
    // Refresh models button
    const refreshModelsBtn = document.getElementById('refresh-models-btn');
    if (refreshModelsBtn) {
      refreshModelsBtn.addEventListener('click', function() {
        const urlInput = document.getElementById('popup-ollama-url');
        const url = urlInput ? urlInput.value.trim() : 'http://localhost:11434';
        loadOllamaModels(url);
      });
    }

    // Auto-refresh models when URL changes
    const ollamaUrlInput = document.getElementById('popup-ollama-url');
    if (ollamaUrlInput) {
      ollamaUrlInput.addEventListener('blur', function() {
        const url = this.value.trim();
        if (url) {
          loadOllamaModels(url);
        }
      });
    }
  }, 50);
  
  // Save button
  document.getElementById('save-provider-config').addEventListener('click', function() {
    const selectedProvider = document.querySelector('input[name="provider"]:checked').value;
    
    if (selectedProvider === 'openai') {
      const apiKey = document.getElementById('popup-api-key-input').value.trim();
      if (!apiKey) {
        showNotification('Please enter an OpenAI API key', 'error');
        return;
      }
      
      // Save provider
      chrome.runtime.sendMessage({ action: 'saveProvider', provider: 'openai' }, function(response) {
        if (response && response.success) {
          // Save API key
          chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey: apiKey }, function(response) {
            if (response && response.success) {
              showNotification('OpenAI configuration saved!', 'success');
              overlay.remove();
              loadApiKeyStatus();
            } else {
              showNotification('Failed to save API key', 'error');
            }
          });
        } else {
          showNotification('Failed to save provider', 'error');
        }
      });
    } else {
      const ollamaUrl = document.getElementById('popup-ollama-url').value.trim();
      const ollamaModel = document.getElementById('popup-ollama-model').value;
      
      if (!ollamaUrl) {
        showNotification('Please enter Ollama server URL', 'error');
        return;
      }
      
      // Save provider
      chrome.runtime.sendMessage({ action: 'saveProvider', provider: 'ollama' }, function(response) {
        if (response && response.success) {
          // Save Ollama config
          chrome.runtime.sendMessage({ action: 'saveOllamaConfig', url: ollamaUrl, model: ollamaModel }, function(response) {
            if (response && response.success) {
              showNotification('Ollama configuration saved!', 'success');
              overlay.remove();
              loadApiKeyStatus();
            } else {
              showNotification('Failed to save Ollama config', 'error');
            }
          });
        } else {
          showNotification('Failed to save provider', 'error');
        }
      });
    }
  });
  
  // Cancel button
  document.getElementById('cancel-provider-config').addEventListener('click', function() {
    overlay.remove();
  });
  
  // Close button
  document.querySelector('.close-btn').addEventListener('click', function() {
    overlay.remove();
  });
  
  // Close on overlay click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function loadOllamaModels(url, selectedModel) {
  const modelSelect = document.getElementById('popup-ollama-model');
  if (!modelSelect) {
    return;
  }
  // Show loading state
  modelSelect.innerHTML = '<option value="">🔄 Loading models...</option>';
  modelSelect.disabled = true;
  
  // Test connection and get models
  chrome.runtime.sendMessage({ 
    action: 'testOllamaConnection', 
    url: url || 'http://localhost:11434'
  }, function(response) {
    if (chrome.runtime.lastError) {
      modelSelect.innerHTML = '<option value="">Error loading models</option>';
      modelSelect.disabled = false;
      return;
    }
    
    if (response && response.success && response.models && response.models.length > 0) {
      // Clear and populate with available models
      modelSelect.innerHTML = '';
      
      // Add available models
      response.models.forEach(function(model) {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        modelSelect.appendChild(option);
      });
      
      // Set selected model if provided
      if (selectedModel) {
        const foundOption = Array.from(modelSelect.options).find(opt => opt.value === selectedModel);
        if (foundOption) {
          modelSelect.value = selectedModel;
        } else if (modelSelect.options.length > 0) {
          // If selected model not found, use first available
          modelSelect.value = modelSelect.options[0].value;
        }
      } else if (modelSelect.options.length > 0) {
        // No specific model selected, use first available
        modelSelect.value = modelSelect.options[0].value;
      }
      
      modelSelect.disabled = false;
    } else {
      // Connection failed or no models
      let errorMsg = 'Connection failed';
      if (response && response.error) {
        if (response.error.includes('CORS error')) {
          errorMsg = 'CORS issue - Restart Ollama with CORS enabled';
        } else if (response.error.includes('fetch') || response.error.includes('Failed to fetch')) {
          errorMsg = 'Ollama not running - Please start Ollama';
        } else {
          errorMsg = response.error;
        }
      } else if (response && response.models && response.models.length === 0) {
        errorMsg = 'No models installed - Run: ollama pull llama3.2';
      }
      
      modelSelect.innerHTML = `<option value="">⚠️ ${errorMsg}</option>`;
      modelSelect.disabled = false;
    }
  });
}

function showMessagesModal() {
  chrome.runtime.sendMessage({ action: 'getSavedMessages' }, function(response) {
    if (chrome.runtime.lastError || !response) {
      showNotification('Failed to load messages', 'error');
      return;
    }
    
    const messages = response.messages || [];
    
    // Create modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal large">
        <div class="modal-header">
          <h3>📚 Saved Messages (${messages.length})</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="messages-list">
            ${messages.length === 0 ? 
              '<p style="text-align: center; color: #6b7280; padding: 20px;">No saved messages yet</p>' :
              messages.map(msg => `
                <div class="message-item">
                  <div class="message-text">${escapeHtml(msg.message)}</div>
                  <div class="message-meta">
                    <span>${msg.category || 'General'} • ${new Date(msg.timestamp).toLocaleDateString()}</span>
                    <button class="delete-btn" onclick="deleteMessage('${msg.id}', function() { location.reload(); })">Delete</button>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close button
    overlay.querySelector('.close-btn').addEventListener('click', function() {
      overlay.remove();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  });
}

function deleteMessage(messageId, callback) {
  chrome.runtime.sendMessage({
    action: 'deleteSavedMessage',
    messageId: messageId
  }, function(response) {
    if (response && response.success) {
      showNotification('Message deleted', 'success');
      loadSavedMessages();
      if (callback) callback();
    } else {
      showNotification('Failed to delete message', 'error');
    }
  });
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all saved messages? This cannot be undone.')) {
    chrome.runtime.sendMessage({ action: 'getSavedMessages' }, function(response) {
      if (response && response.messages) {
        const messages = response.messages;
        let deletedCount = 0;
        
        if (messages.length === 0) {
          showNotification('No messages to clear', 'success');
          return;
        }
        
        messages.forEach(msg => {
          chrome.runtime.sendMessage({
            action: 'deleteSavedMessage',
            messageId: msg.id
          }, function(response) {
            deletedCount++;
            if (deletedCount === messages.length) {
              showNotification('All messages cleared', 'success');
              loadSavedMessages();
            }
          });
        });
      }
    });
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function exportAllData() {
  chrome.runtime.sendMessage({ action: 'getSavedMessages' }, function(response) {
    if (chrome.runtime.lastError || !response) {
      showNotification('Failed to export data', 'error');
      return;
    }
    
    const data = {
      messages: response.messages || [],
      exportDate: new Date().toISOString(),
      version: '0.7.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-ai-helper-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
  });
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.messages || !Array.isArray(data.messages)) {
          showNotification('Invalid file format', 'error');
          return;
        }
        
        // Import messages
        let importedCount = 0;
        const totalMessages = data.messages.length;
        
        if (totalMessages === 0) {
          showNotification('No messages to import', 'error');
          return;
        }
        
        data.messages.forEach(msg => {
          chrome.runtime.sendMessage({
            action: 'saveCustomMessage',
            message: msg.message,
            category: msg.category || 'General'
          }, function(response) {
            importedCount++;
            if (importedCount === totalMessages) {
              showNotification(`Imported ${totalMessages} messages successfully!`, 'success');
              loadSavedMessages();
            }
          });
        });
        
      } catch (error) {
        showNotification('Failed to parse file', 'error');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}