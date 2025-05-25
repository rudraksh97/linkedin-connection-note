// LinkedIn AI Note Helper - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Initialize popup tabs
  initializeTabs();
  
  // Set up event listeners
  setupEventListeners();
  setupTabListeners();
  
  // Load initial data
  loadApiKeyStatus();
  loadSavedMessages();
  loadAnalytics();
  loadSettings();
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

// Tab functionality
function initializeTabs() {
  // Initialize the overview tab content
  loadOverviewContent();
}

function setupTabListeners() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Analytics specific listeners
  document.getElementById('export-data')?.addEventListener('click', exportAllData);
  document.getElementById('import-data')?.addEventListener('click', importData);
  document.getElementById('clear-analytics')?.addEventListener('click', clearAnalytics);

  // Settings listeners
  document.getElementById('default-tone')?.addEventListener('change', saveSettings);
  document.getElementById('length-preference')?.addEventListener('change', saveSettings);
  document.getElementById('auto-save')?.addEventListener('change', saveSettings);
  document.getElementById('analytics-tracking')?.addEventListener('change', saveSettings);
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // Load tab-specific data
  if (tabName === 'analytics') {
    loadAnalytics();
  } else if (tabName === 'settings') {
    loadSettings();
  }
}

function loadOverviewContent() {
  const overviewTab = document.getElementById('overview-tab');
  overviewTab.innerHTML = `
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

// Analytics functionality
function loadAnalytics() {
  chrome.storage.local.get(['messageHistory', 'analytics'], function(result) {
    const history = result.messageHistory || [];
    const analytics = result.analytics || {};

    updateAnalyticsStats(history, analytics);
    updateActivityChart(history);
    updateInsights(history, analytics);
  });
}

function updateAnalyticsStats(history, analytics) {
  const totalSent = history.length;
  const aiGenerated = history.filter(msg => msg.source === 'ai').length;
  const averageLength = totalSent > 0 ? Math.round(history.reduce((sum, msg) => sum + msg.message.length, 0) / totalSent) : 0;
  const responseRate = analytics.responseRate || 0;

  document.getElementById('total-sent').textContent = totalSent;
  document.getElementById('response-rate').textContent = `${responseRate}%`;
  document.getElementById('avg-length').textContent = averageLength;
  document.getElementById('ai-generated').textContent = aiGenerated;
}

function updateActivityChart(history) {
  const chartContainer = document.getElementById('activity-chart');
  
  // Simple activity visualization
  const last7Days = getLast7DaysActivity(history);
  const maxActivity = Math.max(...last7Days.map(day => day.count));
  
  if (maxActivity === 0) {
    chartContainer.innerHTML = '<div class="chart-placeholder">📈 No activity yet</div>';
    return;
  }

  const chartHtml = last7Days.map(day => {
    const height = (day.count / maxActivity) * 60;
    return `<div class="activity-bar" style="height: ${height}px; background: #0077b5; width: 8px; margin: 0 2px; border-radius: 2px; align-self: flex-end;" title="${day.date}: ${day.count} messages"></div>`;
  }).join('');

  chartContainer.innerHTML = `<div style="display: flex; align-items: flex-end; justify-content: center; height: 60px;">${chartHtml}</div>`;
}

function getLast7DaysActivity(history) {
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    
    const count = history.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      return msgDate.toDateString() === dateStr;
    }).length;
    
    days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: count
    });
  }
  
  return days;
}

function updateInsights(history, analytics) {
  const insights = generateInsights(history, analytics);
  const insightsList = document.getElementById('insights-list');
  
  insightsList.innerHTML = insights.map(insight => `
    <div class="insight-item">
      <span class="insight-icon">${insight.icon}</span>
      <span class="insight-text">${insight.text}</span>
    </div>
  `).join('');
}

function generateInsights(history, analytics) {
  const insights = [];
  
  if (history.length > 5) {
    const avgLength = history.reduce((sum, msg) => sum + msg.message.length, 0) / history.length;
    if (avgLength < 100) {
      insights.push({
        icon: '📝',
        text: 'Try longer messages (120-150 chars) for better engagement'
      });
    } else if (avgLength > 200) {
      insights.push({
        icon: '✂️',
        text: 'Consider shorter messages for better response rates'
      });
    }
  }
  
  // Analyze activity patterns
  const hourCounts = {};
  history.forEach(msg => {
    const hour = new Date(msg.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const bestHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
  if (bestHour && history.length > 3) {
    const timeStr = bestHour < 12 ? `${bestHour}:00 AM` : `${bestHour - 12}:00 PM`;
    insights.push({
      icon: '⏰',
      text: `Most active time: ${timeStr}`
    });
  }
  
  // AI vs Manual insights
  const aiCount = history.filter(msg => msg.source === 'ai').length;
  const manualCount = history.length - aiCount;
  
  if (aiCount > manualCount && history.length > 5) {
    insights.push({
      icon: '🤖',
      text: 'You rely heavily on AI - try personalizing some messages manually'
    });
  } else if (manualCount > aiCount * 2 && history.length > 5) {
    insights.push({
      icon: '⚡',
      text: 'Consider using AI generation more often to save time'
    });
  }
  
  if (insights.length === 0) {
    insights.push({
      icon: '🚀',
      text: 'Send more messages to unlock personalized insights'
    });
  }
  
  return insights;
}

// Settings functionality
function loadSettings() {
  chrome.storage.local.get(['settings'], function(result) {
    const settings = result.settings || {};
    
    document.getElementById('default-tone').value = settings.defaultTone || 'professional';
    document.getElementById('length-preference').value = settings.lengthPreference || 'medium';
    document.getElementById('auto-save').checked = settings.autoSave !== false;
    document.getElementById('analytics-tracking').checked = settings.analyticsTracking !== false;
    document.getElementById('persona-detection').checked = settings.personaDetection !== false;
  });
}

function saveSettings() {
  const settings = {
    defaultTone: document.getElementById('default-tone').value,
    lengthPreference: document.getElementById('length-preference').value,
    autoSave: document.getElementById('auto-save').checked,
    analyticsTracking: document.getElementById('analytics-tracking').checked,
    personaDetection: document.getElementById('persona-detection').checked
  };
  
  chrome.storage.local.set({ settings: settings }, function() {
    showNotification('Settings saved!', 'success');
  });
}

// Data management
function exportAllData() {
  chrome.storage.local.get(null, function(allData) {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-invitation-notepad-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
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
        chrome.storage.local.set(data, function() {
          showNotification('Data imported successfully!', 'success');
          loadAnalytics();
          loadSettings();
          loadApiKeyStatus();
          loadSavedMessages();
        });
      } catch (error) {
        showNotification('Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearAnalytics() {
  if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
    chrome.storage.local.remove(['messageHistory', 'analytics'], function() {
      showNotification('Analytics data cleared', 'success');
      loadAnalytics();
    });
  }
}

// Persona template management functions
function managePersonaTemplates(persona) {
  chrome.storage.local.get(['personaTemplates'], function(result) {
    const templates = result.personaTemplates || {};
    const personaTemplates = templates[persona] || [];
    
    const personaLabels = {
      'recruiter': 'Recruiter Templates',
      'engineering_manager': 'Engineering Manager Templates', 
      'founder': 'Founder Templates',
      'generic': 'Generic Templates'
    };
    
    // Create modal for managing templates
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal large">
        <div class="modal-header">
          <h3>📝 ${personaLabels[persona]}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 15px;">
            <button class="btn btn-primary" onclick="addPersonaTemplate('${persona}')">+ Add Template</button>
          </div>
          <div id="persona-templates-list">
            ${personaTemplates.length === 0 ? 
              '<div style="text-align: center; padding: 20px; color: #666;">No templates yet</div>' :
              personaTemplates.map((template, index) => `
                <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                  <div style="font-weight: 600; margin-bottom: 8px;">${template.title}</div>
                  <div style="font-size: 13px; color: #666; margin-bottom: 8px;">${template.message}</div>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="editPersonaTemplate('${persona}', ${index})">Edit</button>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="deletePersonaTemplate('${persona}', ${index})">Delete</button>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close handlers
    overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    
    // Make close function global for the buttons
    window.closeModal = function() {
      overlay.remove();
    };
  });
}

function createPersonaTemplate() {
  // Create modal for new template
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>✨ Create Persona Template</h3>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Template Name:</label>
          <input type="text" id="template-title" placeholder="e.g., Experienced Developer to Recruiter" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Target Persona:</label>
          <select id="template-persona" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="recruiter">🎯 Recruiter</option>
            <option value="engineering_manager">⚙️ Engineering Manager</option>
            <option value="founder">🚀 Founder</option>
            <option value="generic">👤 Generic</option>
          </select>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Message Type:</label>
          <select id="template-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="connection">Connection Request</option>
            <option value="referral">Referral Request</option>
          </select>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Message Template:</label>
          <textarea id="template-message" placeholder="Hi {name}, I'm interested in..." style="width: 100%; height: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">Use {name}, {company}, {title} for dynamic values</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="savePersonaTemplate()">Save Template</button>
        <button class="btn btn-secondary" onclick="closeTemplateModal()">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Close handlers
  overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  
  // Make functions global
  window.closeTemplateModal = function() {
    overlay.remove();
  };
  
  window.savePersonaTemplate = function() {
    const title = document.getElementById('template-title').value.trim();
    const persona = document.getElementById('template-persona').value;
    const messageType = document.getElementById('template-type').value;
    const message = document.getElementById('template-message').value.trim();
    
    if (!title || !message) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    const template = {
      id: Date.now().toString(),
      title: title,
      message: message,
      messageType: messageType,
      createdAt: new Date().toISOString()
    };
    
    chrome.storage.local.get(['personaTemplates'], function(result) {
      const templates = result.personaTemplates || {};
      if (!templates[persona]) templates[persona] = [];
      templates[persona].push(template);
      
      chrome.storage.local.set({ personaTemplates: templates }, function() {
        showNotification('Template saved successfully!', 'success');
        overlay.remove();
        updatePersonaTemplateCounts();
      });
    });
  };
  
  // Focus the title input
  setTimeout(() => document.getElementById('template-title').focus(), 100);
}

function updatePersonaTemplateCounts() {
  chrome.storage.local.get(['personaTemplates'], function(result) {
    const templates = result.personaTemplates || {};
    
    const personas = ['recruiter', 'engineering_manager', 'founder', 'generic'];
    personas.forEach((persona, index) => {
      const count = (templates[persona] || []).length;
      const cards = document.querySelectorAll('.persona-card');
      if (cards[index]) {
        const countEl = cards[index].querySelector('div:nth-child(2)');
        if (countEl) {
          countEl.textContent = `${count} template${count !== 1 ? 's' : ''}`;
        }
      }
    });
  });
}

// Initialize persona template management
document.addEventListener('DOMContentLoaded', function() {
  // Load template counts when settings tab loads
  setTimeout(updatePersonaTemplateCounts, 1000);
});