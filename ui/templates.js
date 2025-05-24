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
        <button id="tab-history" class="main-tab" style="flex:1; padding:10px 14px; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; background:transparent; color:#64748b; transition:all 0.2s ease;">
          History
        </button>
      </div>
    </div>
    
    <!-- Main content area -->
    <div id="main-content" style="flex:1; overflow-y:auto; min-height:0;">
      {{createTabContent}}
      {{savedTabContent}}
      {{historyTabContent}}
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
            placeholder="Write your connection message here..."
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
        
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; align-items:center;">
          <button id="generate-ai-btn" style="padding:14px 16px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; border:none; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); display:flex; align-items:center; justify-content:center; min-height:44px; white-space:nowrap;">
            Generate
          </button>
          
          <button id="save-custom-btn" style="padding:14px 16px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; border:none; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; box-shadow:0 2px 4px rgba(16,185,129,0.2); display:flex; align-items:center; justify-content:center; min-height:44px; white-space:nowrap;">
            Save
          </button>
          
          <button id="use-current-btn" style="padding:14px 16px; background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color:white; border:none; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; box-shadow:0 2px 4px rgba(139,92,246,0.2); display:flex; align-items:center; justify-content:center; min-height:44px; white-space:nowrap;">
            Use
          </button>
          
          <button id="clear-custom-btn" style="padding:14px 16px; background:#64748b; color:white; border:none; border-radius:10px; cursor:pointer; font-size:13px; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1); min-height:44px; white-space:nowrap;">
            Clear
          </button>
        </div>
      </div>
    </div>
  `,

  // Saved messages tab content template
  savedTabContent: `
    <div id="saved-content" style="display:none;">
      <div id="saved-messages-list">
        <div style="text-align:center; padding:40px 20px; color:#64748b; font-size:14px;">
          <div style="width:80px; height:80px; background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius:20px; margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:32px; border:2px solid #e2e8f0;">📝</div>
          <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:700; color:#374151;">No saved messages yet</h3>
          <p style="margin:0; font-size:14px; color:#64748b; line-height:1.5; max-width:280px; margin:0 auto;">Create and save messages in the Create tab to build your personal message library</p>
        </div>
      </div>
    </div>
  `,

  // History tab content template
  historyTabContent: `
    <div id="history-content" style="display:none;">
      <div id="history-messages-list">
        <div style="text-align:center; padding:40px 20px; color:#64748b; font-size:14px;">
          <div style="width:80px; height:80px; background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius:20px; margin:0 auto 20px auto; display:flex; align-items:center; justify-content:center; font-size:32px; border:2px solid #e2e8f0;">📊</div>
          <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:700; color:#374151;">No message history yet</h3>
          <p style="margin:0; font-size:14px; color:#64748b; line-height:1.5; max-width:280px; margin:0 auto;">Sent messages will appear here for future reference and reuse</p>
        </div>
      </div>
    </div>
  `,

  // API Key modal template
  apiKeyModal: `
    <div style="background:white; padding:32px; border-radius:16px; max-width:420px; width:90%; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width:64px; height:64px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius:16px; margin:0 auto 16px auto; display:flex; align-items:center; justify-content:center; font-size:28px;">🔑</div>
        <h3 style="margin:0 0 8px 0; color:#111827; font-size:20px; font-weight:700;">API Key Required</h3>
        <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.5;">Get your free API key from <a href="https://platform.openai.com/api-keys" target="_blank" style="color:#3b82f6; text-decoration:none; font-weight:600;">OpenAI Platform</a></p>
      </div>
      <div style="margin-bottom:24px;">
        <label style="display:block; margin-bottom:8px; color:#374151; font-size:14px; font-weight:600;">Enter your OpenAI API Key:</label>
        <input type="password" id="api-key-input" placeholder="sk-..." style="width:100%; padding:14px 16px; border:2px solid #e5e7eb; border-radius:12px; font-size:14px; font-family:monospace; box-sizing:border-box; cursor:text; user-select:text; pointer-events:auto; background:white; outline:none; transition:all 0.2s ease; box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1);">
      </div>
      <div style="display:flex; gap:12px;">
        <button id="save-api-key-btn" style="flex:1; padding:14px 20px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; border:none; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s ease; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);">Save & Continue</button>
        <button id="cancel-api-key-btn" style="padding:14px 20px; background:#f8fafc; color:#374151; border:1px solid #e5e7eb; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s ease;">Cancel</button>
      </div>
      <p style="margin:16px 0 0 0; color:#6b7280; font-size:12px; text-align:center; line-height:1.4;">Your API key is stored securely in your browser and never shared.</p>
    </div>
  `,

  // Success feedback template
  successFeedback: `
    <div style="text-align:center; padding:24px; color:#10b981; font-size:14px; background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border:1px solid #a7f3d0; border-radius:12px; margin:16px 0; animation: slideInUp 0.5s ease-out;">
      <div style="width:48px; height:48px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius:12px; margin:0 auto 12px auto; display:flex; align-items:center; justify-content:center; font-size:20px; color:white;">✅</div>
      <p style="margin:0 0 4px 0; font-weight:700; color:#065f46; font-size:15px;">Message inserted successfully!</p>
      <p style="margin:0; color:#047857; font-size:12px;">You can now send your connection request</p>
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
      .replace('{{savedTabContent}}', UITemplates.savedTabContent)
      .replace('{{historyTabContent}}', UITemplates.historyTabContent);
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