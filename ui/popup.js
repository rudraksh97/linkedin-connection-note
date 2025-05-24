// LinkedIn AI Note Helper - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Initialize popup
  initializePopup();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  loadApiKeyStatus();
  loadSavedMessages();
});

function initializePopup() {
  // Update popup content based on current state
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div class="popup-header">
        <h2>📝 Invitation notepad</h2>
        <p class="version">v0.3.0</p>
      </div>
      
      <div class="api-key-section">
        <h3>🔑 API Key</h3>
        <div id="api-key-status" class="status-indicator">
          <span class="loading">Checking...</span>
        </div>
        <button id="configure-api-key" class="btn btn-primary">Configure API Key</button>
      </div>
      
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
  }
}

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
}

function loadApiKeyStatus() {
  chrome.runtime.sendMessage({ action: 'getApiKey' }, function(response) {
    const statusElement = document.getElementById('api-key-status');
    if (chrome.runtime.lastError || !response) {
      statusElement.innerHTML = '<span class="error">❌ Error loading</span>';
      return;
    }
    
    if (response.apiKey && response.apiKey.trim()) {
      statusElement.innerHTML = '<span class="success">✅ Configured</span>';
    } else {
      statusElement.innerHTML = '<span class="warning">⚠️ Not configured</span>';
    }
  });
}

function loadSavedMessages() {
  chrome.runtime.sendMessage({ action: 'getSavedMessages' }, function(response) {
    const countElement = document.getElementById('saved-messages-count');
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
        <h3>🔑 Configure API Key</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p>Enter your OpenAI API key to enable AI message generation:</p>
        <input type="password" id="api-key-input" placeholder="sk-..." class="api-key-input">
        <p class="help-text">
          Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>
        </p>
      </div>
      <div class="modal-footer">
        <button id="save-api-key" class="btn btn-primary">Save</button>
        <button id="cancel-api-key" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Load existing API key
  chrome.runtime.sendMessage({ action: 'getApiKey' }, function(response) {
    if (response && response.apiKey) {
      document.getElementById('api-key-input').value = response.apiKey;
    }
  });
  
  // Set up modal event listeners
  overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#cancel-api-key').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  
  overlay.querySelector('#save-api-key').addEventListener('click', function() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    if (!apiKey) {
      showNotification('Please enter an API key', 'error');
      return;
    }
    
    chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey: apiKey }, function(response) {
      if (chrome.runtime.lastError || !response) {
        showNotification('Error saving API key', 'error');
        return;
      }
      
      if (response.success) {
        showNotification('API key saved successfully!', 'success');
        loadApiKeyStatus();
        overlay.remove();
      } else {
        showNotification(response.error || 'Failed to save API key', 'error');
      }
    });
  });
  
  // Focus input
  setTimeout(() => document.getElementById('api-key-input').focus(), 100);
}

function showMessagesModal() {
  // Create modal for managing messages
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal large">
      <div class="modal-header">
        <h3>📚 Manage Saved Messages</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div id="messages-list" class="messages-list">
          <div class="loading">Loading messages...</div>
        </div>
      </div>
      <div class="modal-footer">
        <button id="close-messages" class="btn btn-secondary">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Load and display messages
  chrome.runtime.sendMessage({ action: 'getSavedMessages' }, function(response) {
    const messagesList = document.getElementById('messages-list');
    
    if (chrome.runtime.lastError || !response) {
      messagesList.innerHTML = '<div class="error">Error loading messages</div>';
      return;
    }
    
    if (!response.messages || response.messages.length === 0) {
      messagesList.innerHTML = '<div class="empty">No saved messages yet</div>';
      return;
    }
    
    messagesList.innerHTML = response.messages.map(msg => `
      <div class="message-item" data-id="${msg.id}">
        <div class="message-text">${escapeHtml(msg.message)}</div>
        <div class="message-meta">
          <span class="date">${new Date(msg.timestamp).toLocaleDateString()}</span>
          <button class="delete-btn" data-id="${msg.id}">Delete</button>
        </div>
      </div>
    `).join('');
    
    // Set up delete buttons
    messagesList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const messageId = this.dataset.id;
        deleteMessage(messageId, () => {
          this.closest('.message-item').remove();
          loadSavedMessages(); // Update count
        });
      });
    });
  });
  
  // Set up modal event listeners
  overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#close-messages').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function deleteMessage(messageId, callback) {
  chrome.runtime.sendMessage({ action: 'deleteSavedMessage', messageId: messageId }, function(response) {
    if (chrome.runtime.lastError || !response) {
      showNotification('Error deleting message', 'error');
      return;
    }
    
    if (response.success) {
      showNotification('Message deleted', 'success');
      if (callback) callback();
    } else {
      showNotification('Failed to delete message', 'error');
    }
  });
}

function clearHistory() {
  if (!confirm('Are you sure you want to clear all message history?')) {
    return;
  }
  
  chrome.storage.local.remove(['linkedinAI_messageHistory'], function() {
    if (chrome.runtime.lastError) {
      showNotification('Error clearing history', 'error');
    } else {
      showNotification('History cleared successfully', 'success');
    }
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
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