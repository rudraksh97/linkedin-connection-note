// LinkedIn AI Note Helper - HTML Templates

const UITemplates = {
  // Main UI container template
  mainContainer: `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding:0 0 20px 0; border-bottom:1px solid #e5e7eb;">
      <div>
        <h3 style="margin:0; color:#111827; font-size:18px; font-weight:700; letter-spacing:-0.025em;">Invitation notepad</h3>
        <p style="margin:2px 0 0 0; color:#6b7280; font-size:13px; font-weight:500;">AI-powered connection messages</p>
      </div>
      <button id="close-btn" style="background:#f9fafb; border:1px solid #e5e7eb; width:32px; height:32px; border-radius:8px; cursor:pointer; color:#6b7280; font-size:16px; display:flex; align-items:center; justify-content:center; transition:all 0.2s ease; font-weight:500; box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.05);">×</button>
    </div>
    
    <!-- Tabs for different sections -->
    <div style="margin-bottom:24px;">
      <div style="display:flex; gap:2px; background:#f1f5f9; padding:3px; border-radius:10px; box-shadow:inset 0 1px 2px rgba(0, 0, 0, 0.05);">
        <button id="tab-create" class="main-tab active" style="flex:1; padding:10px 14px; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; background:#ffffff; color:#0f172a; transition:all 0.2s ease; box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); position:relative;">
          Create
        </button>
        <button id="tab-saved" class="main-tab" style="flex:1; padding:10px 14px; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; background:transparent; color:#64748b; transition:all 0.2s ease;">
          Saved
        </button>
      </div>
    </div>
    
    <!-- Main content area -->
    <div id="main-content" style="flex:1; overflow-y:auto; min-height:0;">
      {{createTabContent}}
      {{savedTabContent}}
    </div>
  `,

  // Create tab content template
  createTabContent: `
    <div id="create-content" style="display:block;">
      <div>

        
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
          <div style="width:3px; height:20px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius:2px;"></div>
          <label for="custom-message-input" style="margin:0; color:#111827; font-size:15px; font-weight:700; letter-spacing:-0.025em;">Create Message</label>
        </div>
        
        <div style="position:relative; margin-bottom:20px;">
          <textarea 
            id="custom-message-input" 
            name="custom-message-input"
            placeholder="Write your message here or Give prompt"
            autocomplete="off"
            spellcheck="true"
            style="
              width:100% !important; 
              height:140px !important; 
              padding:16px !important; 
              border:2px solid #e5e7eb !important; 
              border-radius:12px !important; 
              resize:vertical !important; 
              font-size:14px !important; 
              line-height:1.6 !important; 
              font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
              box-sizing:border-box !important; 
              outline:none !important; 
              transition:all 0.2s ease !important; 
              background:#ffffff !important; 
              color:#111827 !important; 
              box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
              cursor:text !important;
              user-select:text !important;
              pointer-events:auto !important;
              -webkit-user-select:text !important;
              -moz-user-select:text !important;
              -ms-user-select:text !important;
              z-index:1 !important;
              position:relative !important;
            "
          ></textarea>
          <div style="position:absolute; bottom:12px; right:12px; font-size:11px; color:#9ca3af; font-weight:500; background:rgba(255,255,255,0.9); padding:2px 6px; border-radius:4px; pointer-events:none;">
            <span id="char-count">0</span>/300
          </div>
        </div>
        
        <!-- AI Generation Options -->
        <div style="margin-bottom:16px;">
          <div style="margin-bottom:12px;">
            <button id="generate-ai-btn" style="width:100%; padding:14px 16px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; border:none; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); display:flex; align-items:center; justify-content:center; min-height:44px; white-space:nowrap;">
              🤖 Write with AI
            </button>
          </div>
        </div>
        
        <!-- Message Actions -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; align-items:center;">
          <button id="save-custom-btn" style="padding:14px 16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; border:none; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; box-shadow:0 2px 4px rgba(16,185,129,0.2); display:flex; align-items:center; justify-content:center; min-height:44px; white-space:nowrap;">
            💾 Save
          </button>
          
          <button id="use-current-btn" style="padding:14px 16px; background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:white; border:none; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; box-shadow:0 2px 4px rgba(139,92,246,0.2); display:flex; align-items:center; justify-content:center; min-height:44px; white-space:nowrap;">
            ✉️ Use
          </button>
          
          <button id="clear-custom-btn" style="padding:14px 16px; background:#64748b; color:white; border:none; border-radius:10px; cursor:pointer; font-size:13px; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1); min-height:44px; white-space:nowrap;">
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  `,

  // Saved messages tab content template
  savedTabContent: `
    <div id="saved-content" style="display:none;">
      <div style="margin-bottom:20px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <div style="width:3px; height:20px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius:2px;"></div>
          <label style="margin:0; color:#111827; font-size:15px; font-weight:700; letter-spacing:-0.025em;">Filter by Category</label>
        </div>
        <div id="category-pills" style="display:flex; flex-wrap:wrap; gap:8px;">
          <button class="category-pill active" data-category="all" style="padding:8px 16px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; border:none; border-radius:20px; cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s ease; white-space:nowrap;">
            📋 All Messages
          </button>
        </div>
      </div>
      
      <div id="saved-messages-list">
        <div style="text-align:center; padding:40px 20px; color:#64748b; font-size:14px;">
          <div style="width:80px; height:80px; background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius:20px; margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:32px; border:2px solid #e2e8f0;">📝</div>
          <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:700; color:#374151;">No saved messages yet</h3>
          <p style="margin:0; font-size:14px; color:#64748b; line-height:1.5; max-width:280px; margin:0 auto;">Create and save messages in the Create tab to build your personal message library</p>
        </div>
      </div>
    </div>
  `,



  // API Key modal template
  apiKeyModal: `
    <div style="background:white; padding:32px; border-radius:16px; max-width:480px; width:90%; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width:64px; height:64px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius:16px; margin:0 auto 16px auto; display:flex; align-items:center; justify-content:center; font-size:28px;">🤖</div>
        <h3 style="margin:0 0 8px 0; color:#111827; font-size:20px; font-weight:700;">AI Provider Configuration</h3>
        <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.5;">Choose your AI provider and configure settings</p>
      </div>
      
      <div style="margin-bottom:24px;">
        <label style="display:block; margin-bottom:12px; color:#374151; font-size:14px; font-weight:600;">AI Provider:</label>
        <div style="display:flex; gap:12px; margin-bottom:16px;">
          <label style="flex:1; display:flex; align-items:center; padding:12px; border:2px solid #e5e7eb; border-radius:12px; cursor:pointer; transition:all 0.2s ease;" id="provider-openai-label">
            <input type="radio" name="provider" value="openai" id="provider-openai" style="margin-right:8px;">
            <div>
              <div style="font-weight:600; color:#374151;">OpenAI</div>
              <div style="font-size:12px; color:#6b7280;">Paid API</div>
            </div>
          </label>
          <label style="flex:1; display:flex; align-items:center; padding:12px; border:2px solid #e5e7eb; border-radius:12px; cursor:pointer; transition:all 0.2s ease;" id="provider-ollama-label">
            <input type="radio" name="provider" value="ollama" id="provider-ollama" style="margin-right:8px;">
            <div>
              <div style="font-weight:600; color:#374151;">Ollama</div>
              <div style="font-size:12px; color:#6b7280;">Free & Local</div>
            </div>
          </label>
        </div>
      </div>

      <div id="openai-config" style="margin-bottom:24px; display:none;">
        <label style="display:block; margin-bottom:8px; color:#374151; font-size:14px; font-weight:600;">OpenAI API Key:</label>
        <input type="password" id="api-key-input" placeholder="sk-..." style="width:100%; padding:14px 16px; border:2px solid #e5e7eb; border-radius:12px; font-size:14px; font-family:monospace; box-sizing:border-box; cursor:text; user-select:text; pointer-events:auto; background:white; outline:none; transition:all 0.2s ease; box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <p style="margin:8px 0 0 0; color:#6b7280; font-size:12px;">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" style="color:#3b82f6; text-decoration:none; font-weight:600;">OpenAI Platform</a></p>
      </div>

      <div id="ollama-config" style="margin-bottom:24px; display:none;">
        <div style="margin-bottom:16px;">
          <label style="display:block; margin-bottom:8px; color:#374151; font-size:14px; font-weight:600;">Ollama Server URL:</label>
          <input type="text" id="ollama-url-input" placeholder="http://localhost:11434" style="width:100%; padding:14px 16px; border:2px solid #e5e7eb; border-radius:12px; font-size:14px; box-sizing:border-box; cursor:text; user-select:text; pointer-events:auto; background:white; outline:none; transition:all 0.2s ease; box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        </div>
        <div style="margin-bottom:16px;">
          <label style="display:block; margin-bottom:8px; color:#374151; font-size:14px; font-weight:600;">Model:</label>
          <select id="ollama-model-select" style="width:100%; padding:14px 16px; border:2px solid #e5e7eb; border-radius:12px; font-size:14px; box-sizing:border-box; background:white; outline:none; transition:all 0.2s ease; box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1);">
            <option value="llama3.2">Llama 3.2 (Recommended)</option>
            <option value="llama3.1">Llama 3.1</option>
            <option value="llama3">Llama 3</option>
            <option value="mistral">Mistral</option>
            <option value="codellama">Code Llama</option>
            <option value="phi3">Phi-3</option>
            <option value="gemma2">Gemma 2</option>
          </select>
        </div>
        <div style="margin-bottom:16px;">
          <button id="test-ollama-connection" style="width:100%; padding:12px 16px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease;">
            🔍 Test Connection
          </button>
          <div id="ollama-test-result" style="margin-top:8px; font-size:12px; display:none;"></div>
        </div>
        <div style="background:#f8fafc; padding:12px; border-radius:8px; border-left:4px solid #3b82f6;">
          <p style="margin:0; color:#374151; font-size:12px; line-height:1.4;">
            <strong>Quick Setup:</strong><br>
            <button id="auto-setup-ollama" style="background:#3b82f6; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:11px; margin:4px 0;">
              🚀 Auto-Setup Ollama
            </button><br>
            <span style="font-size:10px; color:#6b7280;">One-click installation and model download</span>
          </p>
          <div id="setup-progress" style="display:none; margin-top:8px;">
            <div style="background:#e5e7eb; border-radius:4px; height:6px; overflow:hidden;">
              <div id="progress-bar" style="background:#3b82f6; height:100%; width:0%; transition:width 0.3s ease;"></div>
            </div>
            <p id="setup-status" style="margin:4px 0 0 0; font-size:10px; color:#374151;">Preparing setup...</p>
          </div>
          <details style="margin-top:8px;">
            <summary style="cursor:pointer; font-size:11px; color:#6b7280;">Manual Setup Instructions</summary>
            <div style="margin-top:4px; font-size:10px; color:#6b7280;">
              1. Install from <a href="https://ollama.ai" target="_blank" style="color:#3b82f6;">ollama.ai</a><br>
              2. Run: <code style="background:#e5e7eb; padding:1px 3px; border-radius:3px;">ollama pull llama3.2</code><br>
              3. Start: <code style="background:#e5e7eb; padding:1px 3px; border-radius:3px;">ollama serve</code>
            </div>
          </details>
        </div>
      </div>

      <div style="display:flex; gap:12px;">
        <button id="save-config-btn" style="flex:1; padding:14px 20px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; border:none; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s ease; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);">Save & Continue</button>
        <button id="cancel-config-btn" style="padding:14px 20px; background:#f8fafc; color:#374151; border:1px solid #e5e7eb; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s ease;">Cancel</button>
      </div>
      <p style="margin:16px 0 0 0; color:#6b7280; font-size:12px; text-align:center; line-height:1.4;">Your configuration is stored securely in your browser and never shared.</p>
    </div>
  `,

  // Success feedback template
  successFeedback: `
    <div style="text-align:center; padding:24px; color:#10b981; font-size:14px; background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border:1px solid #a7f3d0; border-radius:12px; margin:16px 0; animation: slideInUp 0.5s ease-out;">
      <div style="width:48px; height:48px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius:12px; margin:0 auto 12px auto; display:flex; align-items:center; justify-content:center; font-size:20px; color:white;">✅</div>
      <p style="margin:0 0 4px 0; font-weight:700; color:#065f46; font-size:15px;">Message inserted successfully!</p>
      <p style="margin:0; color:#047857; font-size:12px;">You can now send your connection request</p>
    </div>
  `,

  // Category selection modal template
  categorySelectionModal: `
    <div style="background:white; padding:32px; border-radius:16px; max-width:420px; width:90%; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width:64px; height:64px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius:16px; margin:0 auto 16px auto; display:flex; align-items:center; justify-content:center; font-size:28px;">📁</div>
        <h3 style="margin:0 0 8px 0; color:#111827; font-size:20px; font-weight:700;">Save to Category</h3>
        <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.5;">Choose a category for your message</p>
      </div>
      
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:12px; color:#374151; font-size:14px; font-weight:600;">Select Category:</label>
        <div id="category-selection-pills" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
          <button class="category-selection-pill" data-category="General" style="padding:10px 16px; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; white-space:nowrap;">
            📝 General
          </button>
          <button class="category-selection-pill" data-category="Referral" style="padding:10px 16px; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; white-space:nowrap;">
            🤝 Referral
          </button>
          <button class="category-selection-pill" data-category="custom" style="padding:10px 16px; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; white-space:nowrap;">
            ➕ New Category
          </button>
        </div>
      </div>
      
      <div id="custom-category-section" style="display:none; margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; color:#374151; font-size:14px; font-weight:600;">New Category Name:</label>
        <input type="text" id="custom-category-input" placeholder="Enter category name..." style="width:100%; padding:12px 16px; border:2px solid #e5e7eb; border-radius:10px; font-size:14px; box-sizing:border-box; outline:none; transition:all 0.2s ease;" maxlength="30">
        <p style="margin:4px 0 0 0; color:#6b7280; font-size:12px;">Maximum 30 characters</p>
      </div>
      
      <div style="display:flex; gap:12px;">
        <button id="save-with-category-btn" style="flex:1; padding:14px 20px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; border:none; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s ease; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);" disabled>Save Message</button>
        <button id="cancel-category-btn" style="padding:14px 20px; background:#f8fafc; color:#374151; border:1px solid #e5e7eb; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s ease;">Cancel</button>
      </div>
    </div>
  `,

  // Change category modal template  
  changeCategoryModal: `
    <div style="background:white; padding:32px; border-radius:16px; max-width:420px; width:90%; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width:64px; height:64px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius:16px; margin:0 auto 16px auto; display:flex; align-items:center; justify-content:center; font-size:28px;">✏️</div>
        <h3 style="margin:0 0 8px 0; color:#111827; font-size:20px; font-weight:700;">Change Category</h3>
        <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.5;">Move message to a different category</p>
      </div>
      
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:12px; color:#374151; font-size:14px; font-weight:600;">Select New Category:</label>
        <div id="change-category-selection-pills" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
          <!-- Pills will be populated dynamically -->
        </div>
      </div>
      
      <div id="change-custom-category-section" style="display:none; margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; color:#374151; font-size:14px; font-weight:600;">New Category Name:</label>
        <input type="text" id="change-custom-category-input" placeholder="Enter category name..." style="width:100%; padding:12px 16px; border:2px solid #e5e7eb; border-radius:10px; font-size:14px; box-sizing:border-box; outline:none; transition:all 0.2s ease;" maxlength="30">
        <p style="margin:4px 0 0 0; color:#6b7280; font-size:12px;">Maximum 30 characters</p>
      </div>
      
      <div style="display:flex; gap:12px;">
        <button id="change-category-save-btn" style="flex:1; padding:14px 20px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; border:none; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s ease; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);" disabled>Change Category</button>
        <button id="change-category-cancel-btn" style="padding:14px 20px; background:#f8fafc; color:#374151; border:1px solid #e5e7eb; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s ease;">Cancel</button>
      </div>
    </div>
  `
};

// Function to get template with substitutions
function getTemplate(templateName, substitutions = {}) {
  let template = UITemplates[templateName];
  
  if (!template) {
    console.error('Template not found:', templateName);
    return '';
  }

  // Handle nested template references for mainContainer
  if (templateName === 'mainContainer') {
    template = template
      .replace('{{createTabContent}}', UITemplates.createTabContent)
      .replace('{{savedTabContent}}', UITemplates.savedTabContent);
  }

  // Apply any substitutions
  Object.keys(substitutions).forEach(key => {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, 'g'), substitutions[key]);
  });

  return template;
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.UITemplates = UITemplates;
  window.getTemplate = getTemplate;
} 