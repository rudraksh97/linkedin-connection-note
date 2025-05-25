// LinkedIn AI Note Helper - Bulletproof Version v0.3.1

// Debug configuration - set to true for debugging history issues
const DEBUG_MODE = false;

function debugLog(...args) {
  if (DEBUG_MODE) {
    console.log("LinkedIn AI Helper:", ...args);
  }
}

debugLog("Starting v0.3.1 - Fixed text container focus issue...");

// Cleanup any existing instances
if (window.linkedinAIHelperLoaded) {
  debugLog("Existing instance detected, cleaning up...");
  var existingUI = document.getElementById('linkedin-ai-helper');
  if (existingUI) {
    existingUI.remove();
  }
}

// Mark this instance as loaded
window.linkedinAIHelperLoaded = true;

// Global error handler to prevent crashes
window.addEventListener('error', function(event) {
  console.error('LinkedIn AI Helper - Global error caught:', event.error);
  return true; // Prevent default error handling
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('LinkedIn AI Helper - Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent default handling
});

// Wait for page to be fully ready, with a longer delay
function startWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 2000); // Increased delay after DOMContentLoaded
    });
  } else {
    setTimeout(init, 2000); // Increased delay if already loaded
  }
}

// Initialize extension
function init() {
  try {
    debugLog("Initializing...");
    
    // Check if we're on LinkedIn
    if (window.location.href.indexOf('linkedin.com') === -1) {
      debugLog("Not on LinkedIn, exiting");
      return;
    }
    
    // Check if Chrome extension context is available and valid
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      debugLog("Chrome extension context not available, retrying in 2 seconds...");
      setTimeout(init, 2000);
      return;
    }
    
    // Test chrome.runtime.id to ensure context is valid
    try {
      var extensionId = chrome.runtime.id;
      if (!extensionId) {
        debugLog("Chrome extension context invalidated, retrying...");
        setTimeout(init, 2000);
        return;
      }
    } catch (contextError) {
      debugLog("Chrome extension context test failed:", contextError);
      setTimeout(init, 2000);
      return;
    }
    
    // Set up observer to watch for modals
    setupObserver();
    

    
    // Check if modal already exists
    checkForModal();
  } catch (error) {
    console.error("Error initializing LinkedIn AI Helper:", error);
    // Retry initialization after a delay
    setTimeout(init, 3000);
  }
}

// Set up mutation observer
function setupObserver() {
  var observer = new MutationObserver(function(mutations) {
    debugLog("Mutation detected, checking for modals...");
    
    // Check if any modals were removed
    checkForModalRemoval(mutations);
    
    // Check if any modals were added
    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      for (var j = 0; j < mutation.addedNodes.length; j++) {
        var node = mutation.addedNodes[j];
        if (node.nodeType === 1) {
          // Check for different possible modal selectors
          if (node.querySelector) {
            var modal = node.querySelector('artdeco-modal') || 
                       node.querySelector('[role="dialog"]') ||
                       node.querySelector('.artdeco-modal') ||
                       node.querySelector('[data-test-modal]');
            
            if (modal) {
              debugLog("Found modal in added node, checking if it's a connection modal...");
              var modalPreview = (modal.textContent || '').substring(0, 100);
              debugLog("Modal text preview:", modalPreview);
              
              if (isConnectionModal(modal)) {
                debugLog("✅ Connection modal confirmed! Injecting UI...");
                setTimeout(injectUI, 1500); // Increased delay
                break;
              } else {
                debugLog("❌ Modal rejected - not a connection modal");
              }
            }
          }
          // Also check if the node itself is a modal
          if ((node.tagName === 'ARTDECO-MODAL' || 
               node.getAttribute && node.getAttribute('role') === 'dialog')) {
            debugLog("Found direct modal node, checking if it's a connection modal...");
            var modalPreview = (node.textContent || '').substring(0, 100);
            debugLog("Modal text preview:", modalPreview);
            
            if (isConnectionModal(node)) {
              debugLog("✅ Direct connection modal confirmed! Injecting UI...");
              setTimeout(injectUI, 1500); // Increased delay
              break;
            } else {
              debugLog("❌ Direct modal rejected - not a connection modal");
            }
          }
        }
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  debugLog("Observer set up - will watch for modal changes");
}

// Check if LinkedIn modal was removed
function checkForModalRemoval(mutations) {
  for (var i = 0; i < mutations.length; i++) {
    var mutation = mutations[i];
    for (var j = 0; j < mutation.removedNodes.length; j++) {
      var node = mutation.removedNodes[j];
      if (node.nodeType === 1) {
        // Check if a modal was removed
        if (node.tagName === 'ARTDECO-MODAL' || 
            (node.querySelector && node.querySelector('artdeco-modal')) ||
            (node.getAttribute && node.getAttribute('role') === 'dialog')) {
          debugLog("Modal removed, hiding UI");
          hideUI();
          return;
        }
      }
    }
  }
  
  // Also check if no modals exist anymore
  var existingModal = document.querySelector('artdeco-modal') || 
                     document.querySelector('[role="dialog"]') ||
                     document.querySelector('.artdeco-modal');
  
  if (!existingModal && document.getElementById('linkedin-ai-helper')) {
    debugLog("No modals found, hiding UI");
    setTimeout(hideUI, 500); // Small delay to avoid flicker
  }
}

// Check if modal is a connection/invitation modal
function isConnectionModal(modal) {
  if (!modal) return false;
  
  var modalText = modal.textContent || modal.innerText || '';
  var modalHTML = modal.innerHTML || '';
  
  debugLog("Checking modal with text:", modalText.substring(0, 200));
  
  // VERY SPECIFIC: Must contain "Add a note" text - this is the key indicator
  var hasAddNote = modalText.toLowerCase().indexOf('add a note') !== -1;
  
  // SPECIFIC: Must have a textarea for message input (connection note modals have this)
  var hasMessageTextarea = modal.querySelector('textarea[name="message"]') || 
                          modal.querySelector('textarea[aria-label*="message"]') ||
                          modal.querySelector('textarea[placeholder*="message"]');
  
  // SPECIFIC: Must have invitation/connect specific elements
  var hasInviteElements = modal.querySelector('[data-control-name*="invite"]') ||
                         modal.querySelector('button[aria-label*="Send invitation"]') ||
                         modal.querySelector('button[aria-label*="Send invite"]');
  
  // SPECIFIC: Check for the exact combination that indicates connection modal
  if (hasAddNote && hasMessageTextarea) {
    debugLog("Connection modal identified: Has 'Add a note' text AND message textarea");
    return true;
  }
  
  // FALLBACK: Very specific text combinations only
  var specificPhrases = [
    'add a note to your invitation',
    'include a personal note',
    'send invitation without a note'
  ];
  
  for (var i = 0; i < specificPhrases.length; i++) {
    if (modalText.toLowerCase().indexOf(specificPhrases[i]) !== -1) {
      debugLog("Connection modal identified by specific phrase:", specificPhrases[i]);
      return true;
    }
  }
  
  // REJECT: If it's clearly not a connection modal
  var rejectIndicators = [
    'send message',
    'new message',
    'compose message',
    'profile',
    'settings',
    'notification',
    'share',
    'post',
    'comment',
    'like',
    'follow'
  ];
  
  var lowerModalText = modalText.toLowerCase();
  for (var i = 0; i < rejectIndicators.length; i++) {
    if (lowerModalText.indexOf(rejectIndicators[i]) !== -1) {
      debugLog("Modal rejected due to:", rejectIndicators[i]);
      return false;
    }
  }
  
  debugLog("Modal is not a connection modal - insufficient specific indicators");
  return false;
}

// Check for existing modal
function checkForModal() {
  debugLog("Checking for existing modals...");
  var modal = document.querySelector('artdeco-modal') || 
             document.querySelector('[role="dialog"]') ||
             document.querySelector('.artdeco-modal') ||
             document.querySelector('[data-test-modal]');
  
  if (modal && isConnectionModal(modal)) {
    debugLog("Existing connection modal found:", modal);
    setTimeout(injectUI, 1500); // Increased delay
  } else {
    debugLog("No existing connection modal found");
  }
}

// Inject UI
function injectUI() {
  debugLog("Attempting to inject UI...");
  
  // Check if already injected and remove any existing instance
  var existingUI = document.getElementById('linkedin-ai-helper');
  if (existingUI) {
    debugLog("Removing existing UI before injecting new one");
    existingUI.remove();
  }
  
  // Create unified AI helper container
  var container = document.createElement('div');
  container.id = 'linkedin-ai-helper';
  
  // Find the LinkedIn connection note modal specifically
  var linkedinModal = null;
  
  // Look for connection/invitation modals using our specific detection
  var modals = document.querySelectorAll('artdeco-modal, [role="dialog"]');
  for (var i = 0; i < modals.length; i++) {
    var modal = modals[i];
    if (isConnectionModal(modal)) {
      linkedinModal = modal;
      debugLog("Found verified connection modal:", modal);
      break;
    }
  }
  
  // If no connection modal found, don't inject UI
  if (!linkedinModal) {
    debugLog("No connection modal found - not injecting UI");
    return;
  }
  
  container.style.position = 'fixed';
  container.style.width = '480px'; // Updated width
  container.style.height = 'auto';
  container.style.maxHeight = '60vh';
  container.style.overflowY = 'auto';
  
  if (linkedinModal) {
    // Position next to LinkedIn modal with proper viewport bounds checking
    var modalRect = linkedinModal.getBoundingClientRect();
    var spaceOnRight = window.innerWidth - modalRect.right;
    var spaceOnLeft = modalRect.left;
    
    debugLog("Modal rect:", modalRect);
    debugLog("Window dimensions:", window.innerWidth, "x", window.innerHeight);
    debugLog("Space on right:", spaceOnRight, "left:", spaceOnLeft);
    
    // Position unified container based on available space
    if (spaceOnRight >= 500) {
      // Position to the right
      container.style.top = Math.max(20, modalRect.top) + 'px';
      container.style.left = (modalRect.right + 20) + 'px';
      container.style.bottom = 'auto';
      container.style.right = 'auto';
      
    } else if (spaceOnLeft >= 500) {
      // Position to the left
      container.style.top = Math.max(20, modalRect.top) + 'px';
      container.style.left = (modalRect.left - 500) + 'px';
      container.style.bottom = 'auto';
      container.style.right = 'auto';
      
    } else {
      // Not enough space on either side, position at bottom right
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.top = 'auto';
      container.style.left = 'auto';
    }
  } else {
    // No modal found, fallback to bottom right
    debugLog("No modal found, using fallback position");
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.top = 'auto';
    container.style.left = 'auto';
  }
  
  // Modern styling for unified container
  container.style.backgroundColor = '#ffffff';
  container.style.border = 'none';
  container.style.borderRadius = '12px';
  container.style.padding = '20px';
  container.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)';
  container.style.zIndex = '10001';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  
    // Add unified content combining message library and AI functionality
  container.innerHTML = getTemplate('mainContainer');
  
  // Add container to page
  document.body.appendChild(container);
  
  // Set up unified interface functionality
  setTimeout(function() {
    try {
      setupUnifiedHandlers();
    } catch (error) {
      console.error('Error setting up unified handlers:', error);
      // Even if handler setup fails, the UI should still be visible and partially functional
    }
  }, 100);
  
  debugLog("UI injected successfully");
  
  // Set up Send button detection immediately
  setTimeout(function() {
    try {
      if (!window.sendButtonDetectionSetup) {
        setupSendButtonDetection();
        window.sendButtonDetectionSetup = true;
      }
    } catch (error) {
      console.error('Error setting up send button detection:', error);
    }
  }, 500);
  
  // Add window resize listener to reposition UI
  window.addEventListener('resize', function() {
    repositionUI();
  });
}

// Reposition UI when window resizes
function repositionUI() {
  var container = document.getElementById('linkedin-ai-helper');
  if (!container) return;
  
  var linkedinModal = null;
  var modals = document.querySelectorAll('artdeco-modal, [role="dialog"]');
  for (var i = 0; i < modals.length; i++) {
    var modal = modals[i];
    if (isConnectionModal(modal)) {
      linkedinModal = modal;
      break;
    }
  }
  
  if (linkedinModal) {
    var modalRect = linkedinModal.getBoundingClientRect();
    var spaceOnRight = window.innerWidth - modalRect.right;
    var spaceOnLeft = modalRect.left;
    
    if (spaceOnRight >= 500) {
      container.style.top = Math.max(20, modalRect.top) + 'px';
      container.style.left = (modalRect.right + 20) + 'px';
      container.style.bottom = 'auto';
      container.style.right = 'auto';
    } else if (spaceOnLeft >= 500) {
      container.style.top = Math.max(20, modalRect.top) + 'px';
      container.style.left = (modalRect.left - 500) + 'px';
      container.style.bottom = 'auto';
      container.style.right = 'auto';
    } else {
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.top = 'auto';
      container.style.left = 'auto';
    }
  } else {
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.top = 'auto';
    container.style.left = 'auto';
  }
}

// Set up textarea handlers (can be called multiple times)
function setupTextareaHandlers() {
  try {
    var textarea = document.getElementById('custom-message-input');
    var charCounter = document.getElementById('char-count');
    
    if (!textarea) {
      debugLog("Textarea not found for setup");
      return;
    }
    
    // Only setup if not already setup (check for custom flag)
    if (textarea.hasAttribute('data-handlers-setup')) {
      debugLog("Textarea handlers already setup");
      return;
    }
    
    debugLog("Setting up textarea handlers");
    
    // Mark as setup
    textarea.setAttribute('data-handlers-setup', 'true');
    
    // Force enable all interaction properties immediately
    textarea.removeAttribute('disabled');
    textarea.removeAttribute('readonly');
    textarea.contentEditable = false; // Ensure it's not contenteditable
    textarea.tabIndex = 0;
    
    // Override any conflicting styles to ensure immediate interaction
    textarea.style.pointerEvents = 'auto';
    textarea.style.cursor = 'text';
    textarea.style.userSelect = 'text';
    textarea.style.webkitUserSelect = 'text';
    textarea.style.mozUserSelect = 'text';
    textarea.style.msUserSelect = 'text';
    textarea.style.resize = 'vertical';
    textarea.style.minHeight = '140px';
    textarea.style.maxHeight = '300px';
    textarea.style.zIndex = '1000';  // Higher z-index to ensure it's on top
    textarea.style.position = 'relative';
    
    // Ensure the textarea is immediately interactive
    textarea.style.opacity = '1';
    textarea.style.visibility = 'visible';
    textarea.style.display = 'block';
    
    // Force remove any potential blocking styles
    textarea.style.pointerEvents = 'auto !important';
    textarea.style.touchAction = 'manipulation';
    
    // Character counter function
    function updateCharCount() {
      if (charCounter && textarea) {
        var count = textarea.value.length;
        charCounter.textContent = count;
        
        // Update color based on character count
        if (count > 280) {
          charCounter.style.color = '#ef4444';
          charCounter.style.fontWeight = '700';
        } else if (count > 250) {
          charCounter.style.color = '#f59e0b';
          charCounter.style.fontWeight = '600';
        } else {
          charCounter.style.color = '#9ca3af';
          charCounter.style.fontWeight = '500';
        }
      }
    }
    
    // Enhanced focus handler
    textarea.addEventListener('focus', function() {
      debugLog("Textarea focused - border should be blue now");
      this.style.borderColor = '#3b82f6';
      this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      this.style.background = '#ffffff';
      this.style.outline = 'none';
    });
    
    // Enhanced blur handler
    textarea.addEventListener('blur', function() {
      debugLog("Textarea blurred - border should be gray now");
      this.style.borderColor = '#e5e7eb';
      this.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      this.style.background = '#ffffff';
    });
    
    // Input event with character counting
    textarea.addEventListener('input', function() {
      debugLog("Textarea input detected:", this.value.length, "characters");
      updateCharCount();
    });
    
    // Enhanced click handler
    textarea.addEventListener('click', function(e) {
      debugLog("Textarea clicked - should focus immediately");
      e.stopPropagation();
      
      // Let the browser handle natural focus and cursor positioning
      // Just ensure focus is set if for some reason it wasn't
      if (document.activeElement !== this) {
        debugLog("Textarea was not active, forcing focus");
        this.focus();
      } else {
        debugLog("Textarea is already active");
      }
      
      debugLog("Textarea click handled");
    });
    
    // Double click to select all
    textarea.addEventListener('dblclick', function(e) {
      debugLog("Textarea double-clicked");
      e.stopPropagation();
      this.select();
    });
    
    // Key events for better interaction
    textarea.addEventListener('keydown', function(e) {
      debugLog("Key pressed:", e.key);
      // Allow all key events to propagate normally
      updateCharCount();
    });
    
    textarea.addEventListener('keyup', function(e) {
      updateCharCount();
    });
    
    // Paste event
    textarea.addEventListener('paste', function(e) {
      debugLog("Paste event detected");
      setTimeout(function() {
        updateCharCount();
      }, 10);
    });
    
    // Mouse events for better interaction
    textarea.addEventListener('mousedown', function(e) {
      e.stopPropagation();
    });
    
    textarea.addEventListener('mouseup', function(e) {
      e.stopPropagation();
    });
    
    // Initial character count
    updateCharCount();
    
    // Remove the automatic focus code that was causing the issue
    // The textarea should only focus when user explicitly clicks on it
    debugLog("Textarea setup completed - ready for user interaction");
    
    // Additional safeguard - check if textarea is really interactive
    setTimeout(function() {
      if (textarea) {
        // Test if we can programmatically set a value
        var testValue = textarea.value;
        textarea.value = testValue + " ";
        textarea.value = testValue;
        updateCharCount();
        debugLog("Textarea interaction test completed");
      }
    }, 500);
    
  } catch (error) {
    console.error('Error setting up textarea:', error);
  }
}

// Set up unified interface handlers
function setupUnifiedHandlers() {
  debugLog("Setting up unified handlers...");
  
  // Set up tab switching
  try {
    var createTab = document.getElementById('tab-create');
    var savedTab = document.getElementById('tab-saved');
    
    if (createTab) {
      createTab.onclick = function() {
        try {
          switchMainTab('create');
          // Re-setup textarea when switching to create tab
          setTimeout(function() {
            setupTextareaHandlers();
          }, 100);
        } catch (error) {
          console.error('Error in create tab handler:', error);
        }
      };
    }
    
    if (savedTab) {
      savedTab.onclick = function() {
        try {
          switchMainTab('saved');
          // Reload saved messages and category pills when switching to saved tab
          setTimeout(function() {
            loadCategoryPills();
            loadSavedMessages();
          }, 100);
        } catch (error) {
          console.error('Error in saved tab handler:', error);
        }
      };
    }
  } catch (error) {
    console.error('Error setting up tab handlers:', error);
  }
  
  // Set up close button
  try {
    var closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
      closeBtn.onclick = function() {
        hideUI();
      };
      
      // Add hover effects to close button
      closeBtn.onmouseover = function() {
        this.style.backgroundColor = '#f3f4f6';
        this.style.borderColor = '#d1d5db';
        this.style.transform = 'scale(1.1)';
        this.style.color = '#374151';
      };
      closeBtn.onmouseout = function() {
        this.style.backgroundColor = '#f9fafb';
        this.style.borderColor = '#e5e7eb';
        this.style.transform = 'scale(1)';
        this.style.color = '#6b7280';
      };
    }
  } catch (error) {
    console.error('Error setting up close button:', error);
  }
  
  // Set up AI generation button
  try {
    var generateBtn = document.getElementById('generate-ai-btn');
    
    if (generateBtn) {
      generateBtn.onclick = function() {
        generateAIMessage('connection');
      };
      
      // Add enhanced hover effects to generate button
      generateBtn.onmouseover = function() {
        this.style.background = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 8px 25px -8px rgba(59, 130, 246, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      };
      generateBtn.onmouseout = function() {
        this.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      };
    }
  } catch (error) {
    console.error('Error setting up generate button:', error);
  }
  
  // Set up message creation handlers
  try {
    setupMessageCreationHandlers();
  } catch (error) {
    console.error('Error setting up message creation handlers:', error);
  }
  
  // Enhanced textarea setup with multiple attempts
  setTimeout(function() {
    try {
      setupTextareaHandlers();
      debugLog("Initial textarea setup completed");
    } catch (error) {
      console.error('Error in initial textarea setup:', error);
    }
  }, 100);
  
  // Backup textarea setup
  setTimeout(function() {
    try {
      var textarea = document.getElementById('custom-message-input');
      if (textarea && !textarea.hasAttribute('data-handlers-setup')) {
        debugLog("Backup textarea setup triggered");
        setupTextareaHandlers();
      }
    } catch (error) {
      console.error('Error in backup textarea setup:', error);
    }
  }, 500);
  
  // Load initial data (with chrome context check)
  setTimeout(function() {
    try {
      // Check if chrome context is still valid before loading data
      if (chrome && chrome.runtime && chrome.runtime.id) {
        loadSavedMessages();
        loadCategoryPills();
        debugLog("Initial data loading completed");
      } else {
        console.log('Chrome extension context invalidated, skipping data load');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      // If context is invalidated, we can still continue without the saved data
    }
  }, 200);
  

}





// Switch between main tabs
function switchMainTab(tab) {
  var createTab = document.getElementById('tab-create');
  var savedTab = document.getElementById('tab-saved');
  var createContent = document.getElementById('create-content');
  var savedContent = document.getElementById('saved-content');
  
  // Reset all tabs
  if (createTab) {
    createTab.style.background = 'transparent';
    createTab.style.color = '#6b7280';
  }
  if (savedTab) {
    savedTab.style.background = 'transparent';
    savedTab.style.color = '#6b7280';
  }
  
  // Hide all content
  if (createContent) createContent.style.display = 'none';
  if (savedContent) savedContent.style.display = 'none';
  
  // Show selected tab and content
  if (tab === 'create') {
    if (createTab) {
      createTab.style.background = '#0077b5';
      createTab.style.color = 'white';
    }
    if (createContent) createContent.style.display = 'block';
  } else if (tab === 'saved') {
    if (savedTab) {
      savedTab.style.background = '#0077b5';
      savedTab.style.color = 'white';
    }
    if (savedContent) savedContent.style.display = 'block';
  }
}

// Set up message creation handlers
function setupMessageCreationHandlers() {
  // Save custom message
  try {
    var saveBtn = document.getElementById('save-custom-btn');
    if (saveBtn) {
      saveBtn.onclick = function() {
        try {
          var input = document.getElementById('custom-message-input');
          var message = input && input.value ? input.value.trim() : '';
          if (message) {
            showCategorySelectionModal(message, input);
          }
        } catch (error) {
          console.error('Error in save button handler:', error);
        }
      };
      
      // Add hover effect
      saveBtn.onmouseover = function() {
        this.style.backgroundColor = '#059669';
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 4px 8px rgba(16,185,129,0.3)';
      };
      saveBtn.onmouseout = function() {
        this.style.backgroundColor = '#10b981';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 4px rgba(16,185,129,0.2)';
      };
    }
  } catch (error) {
    console.error('Error setting up save button:', error);
  }
  
  // Use current message
  try {
    var useBtn = document.getElementById('use-current-btn');
    if (useBtn) {
      useBtn.onclick = function() {
        try {
          var input = document.getElementById('custom-message-input');
          var message = input && input.value ? input.value.trim() : '';
          if (message) {
            useNote(message);
          }
        } catch (error) {
          console.error('Error in use button handler:', error);
        }
      };
      
      // Add hover effect
      useBtn.onmouseover = function() {
        this.style.backgroundColor = '#7c3aed';
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 4px 8px rgba(139,92,246,0.3)';
      };
      useBtn.onmouseout = function() {
        this.style.backgroundColor = '#8b5cf6';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 4px rgba(139,92,246,0.2)';
      };
    }
  } catch (error) {
    console.error('Error setting up use button:', error);
  }
  
  // Clear message input
  try {
    var clearBtn = document.getElementById('clear-custom-btn');
    if (clearBtn) {
      clearBtn.onclick = function() {
        try {
          var input = document.getElementById('custom-message-input');
          if (input) {
            input.value = '';
            input.focus();
          }
        } catch (error) {
          console.error('Error in clear button handler:', error);
        }
      };
      
      // Add hover effect
      clearBtn.onmouseover = function() {
        this.style.backgroundColor = '#4b5563';
        this.style.transform = 'translateY(-1px)';
      };
      clearBtn.onmouseout = function() {
        this.style.backgroundColor = '#6b7280';
        this.style.transform = 'translateY(0)';
      };
    }
  } catch (error) {
    console.error('Error setting up clear button:', error);
  }
  
  // Set up textarea handlers
  setupTextareaHandlers();
}

// Set up left panel handlers (legacy function)  
function setupLeftPanelHandlers() {
  
  try {
    // Save custom message
    var saveBtn = document.getElementById('save-custom-btn');
    if (saveBtn) {
      saveBtn.onclick = function() {
        try {
          var input = document.getElementById('custom-message-input');
          var message = input && input.value ? input.value.trim() : '';
                  if (message) {
          saveCustomMessage(message);
          if (input) {
            input.value = '';
          }
        }
        } catch (error) {
          console.error('Error in save button handler:', error);
        }
      };
    }
  } catch (error) {
    console.error('Error setting up save button:', error);
  }
  
  try {
    // Clear message input
    var clearBtn = document.getElementById('clear-custom-btn');
    if (clearBtn) {
      clearBtn.onclick = function() {
        try {
          var input = document.getElementById('custom-message-input');
          if (input) {
            input.value = '';
            input.focus();
          }
        } catch (error) {
          console.error('Error in clear button handler:', error);
        }
      };
      
      // Add hover effect
      clearBtn.onmouseover = function() {
        this.style.backgroundColor = '#4b5563';
        this.style.transform = 'translateY(-1px)';
      };
      clearBtn.onmouseout = function() {
        this.style.backgroundColor = '#6b7280';
        this.style.transform = 'translateY(0)';
      };
    }
  } catch (error) {
    console.error('Error setting up clear button:', error);
  }
  
  // Set up textarea handlers
  setupTextareaHandlers();
  
  try {
    // Tab switching
    var savedTab = document.getElementById('tab-saved');
    
    if (savedTab) {
      savedTab.onclick = function() {
        try {
          switchTab('saved');
        } catch (error) {
          console.error('Error in saved tab handler:', error);
        }
      };
    }
  } catch (error) {
    console.error('Error setting up tab handlers:', error);
  }
  
  // Load initial data (with delay to ensure DOM is ready)
  setTimeout(function() {
    try {
      loadSavedMessages();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, 100);
}

// Switch between tabs (legacy function - only supports saved)
function switchTab(tab) {
  var savedTab = document.getElementById('tab-saved');
  var savedContainer = document.getElementById('saved-messages');
  
  if (tab === 'saved') {
    savedTab.style.background = '#0077b5';
    savedTab.style.color = 'white';
    savedContainer.style.display = 'block';
  }
}

// Show category selection modal
function showCategorySelectionModal(message, inputElement) {
  // Create modal overlay
  var overlay = document.createElement('div');
  overlay.id = 'category-selection-overlay';
  overlay.style.cssText = 
    'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); ' +
    'z-index:20001; display:flex; align-items:center; justify-content:center;';
  
  overlay.innerHTML = getTemplate('categorySelectionModal');
  document.body.appendChild(overlay);
  
  // Set up handlers
  setTimeout(function() {
    setupCategorySelectionModalHandlers(message, inputElement, overlay);
  }, 100);
}

// Set up category selection modal handlers
function setupCategorySelectionModalHandlers(message, inputElement, overlay) {
  var pillsContainer = document.getElementById('category-selection-pills');
  var customSection = document.getElementById('custom-category-section');
  var customInput = document.getElementById('custom-category-input');
  var saveBtn = document.getElementById('save-with-category-btn');
  var cancelBtn = document.getElementById('cancel-category-btn');
  
  if (!pillsContainer || !saveBtn || !cancelBtn) return;
  
  var selectedCategory = '';
  
  // Load existing categories and populate pills
  loadCategoriesForSelectionPills(pillsContainer);
  
  // Custom category input handler
  if (customInput) {
    customInput.oninput = function() {
      var value = this.value.trim();
      saveBtn.disabled = value === '';
    };
    
    customInput.onkeypress = function(e) {
      if (e.key === 'Enter' && !saveBtn.disabled) {
        saveBtn.click();
      }
    };
  }
  
  // Set up pill click handlers (delegated event handling)
  pillsContainer.onclick = function(e) {
    var target = e.target;
    if (target && target.classList.contains('category-selection-pill')) {
      var category = target.getAttribute('data-category');
      
      // Reset all pills
      var allPills = pillsContainer.querySelectorAll('.category-selection-pill');
      allPills.forEach(function(pill) {
        pill.style.background = '#f8fafc';
        pill.style.color = '#64748b';
        pill.style.border = '1px solid #e2e8f0';
      });
      
      // Activate selected pill
      target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      target.style.color = 'white';
      target.style.border = 'none';
      
      selectedCategory = category;
      
      if (category === 'custom') {
        customSection.style.display = 'block';
        saveBtn.disabled = true;
        customInput.focus();
      } else {
        customSection.style.display = 'none';
        saveBtn.disabled = false;
      }
    }
  };
  
  // Save button handler
  saveBtn.onclick = function() {
    var finalCategory = '';
    
    if (selectedCategory === 'custom') {
      finalCategory = customInput.value.trim();
      if (!finalCategory) {
        showLeftPanelFeedback('Please enter a category name', 'error');
        return;
      }
    } else if (selectedCategory) {
      finalCategory = selectedCategory;
    } else {
      showLeftPanelFeedback('Please select a category', 'error');
      return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    saveCustomMessage(message, finalCategory, function(success) {
      if (success) {
        overlay.remove();
        if (inputElement) {
          inputElement.value = '';
        }
      } else {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Message';
      }
    });
  };
  
  // Cancel button handler
  cancelBtn.onclick = function() {
    overlay.remove();
  };
  
  // Close on overlay click
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  };
}

// Save custom message with category
function saveCustomMessage(message, category, callback) {
  // Check chrome context
  var chromeAvailable = false;
  try {
    chromeAvailable = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
  } catch (contextError) {
    console.log('Chrome context check failed in saveCustomMessage:', contextError);
  }
  
  if (!chromeAvailable) {
    showLeftPanelFeedback('Extension context lost. Please reload the page.', 'error');
    if (callback) callback(false);
    return;
  }
  
  try {
    chrome.runtime.sendMessage({
      action: 'saveCustomMessage',
      message: message,
      category: category || 'General'
    }, function(response) {
      if (chrome.runtime.lastError) {
        showLeftPanelFeedback('Extension error. Please reload the page.', 'error');
        if (callback) callback(false);
        return;
      }
      
      if (response && response.success) {
        loadSavedMessages(); // Refresh the list
        loadCategoryPills(); // Refresh category pills
        showLeftPanelFeedback('Message saved successfully!', 'success');
        if (callback) callback(true);
      } else {
        var errorMsg = response && response.error ? response.error : 'Failed to save message';
        showLeftPanelFeedback(errorMsg, 'error');
        if (callback) callback(false);
      }
    });
  } catch (sendError) {
    showLeftPanelFeedback('Failed to communicate with extension. Please reload the page.', 'error');
    console.error('Chrome runtime sendMessage error in saveCustomMessage:', sendError);
    if (callback) callback(false);
  }
}

// Load categories for selection pills
function loadCategoriesForSelectionPills(pillsContainer) {
  if (!chrome || !chrome.runtime) {
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'getCategories' }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
      return;
    }
    
    if (response && response.categories) {
      // Clear existing pills and rebuild
      pillsContainer.innerHTML = '';
      
      // Add pills for all categories
      response.categories.forEach(function(category) {
        var icon = category === 'General' ? '📝' : category === 'Referral' ? '🤝' : '📁';
        var pill = createCategorySelectionPill(category, icon + ' ' + category);
        pillsContainer.appendChild(pill);
      });
      
      // Add "New Category" pill at the end
      var newCategoryPill = createCategorySelectionPill('custom', '➕ New Category');
      pillsContainer.appendChild(newCategoryPill);
    }
  });
}

// Create category selection pill element
function createCategorySelectionPill(category, text) {
  var pill = document.createElement('button');
  pill.className = 'category-selection-pill';
  pill.setAttribute('data-category', category);
  pill.style.cssText = 
    'padding:10px 16px; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; ' +
    'border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; ' +
    'transition:all 0.2s ease; white-space:nowrap;';
  
  pill.textContent = text;
  
  // Add hover effects
  pill.onmouseover = function() {
    if (this.style.background === '#f8fafc' || this.style.background === '') {
      this.style.background = '#e2e8f0';
      this.style.color = '#374151';
    }
  };
  
  pill.onmouseout = function() {
    if (this.style.background === '#e2e8f0' || this.style.background === 'rgb(226, 232, 240)') {
      this.style.background = '#f8fafc';
      this.style.color = '#64748b';
    }
  };
  
  return pill;
}

// Load category pills
function loadCategoryPills() {
  var pillsContainer = document.getElementById('category-pills');
  if (!pillsContainer || !chrome || !chrome.runtime) {
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'getCategories' }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
      return;
    }
    
    if (response && response.categories) {
      // Get current active category
      var activePill = pillsContainer.querySelector('.category-pill.active');
      var activeCategory = activePill ? activePill.getAttribute('data-category') : 'all';
      
      // Clear existing pills
      pillsContainer.innerHTML = '';
      
      // Add "All Messages" pill
      var allPill = createCategoryPill('all', '📋 All Messages', activeCategory === 'all');
      pillsContainer.appendChild(allPill);
      
      // Add category pills
      response.categories.forEach(function(category) {
        var icon = category === 'General' ? '📝' : category === 'Referral' ? '🤝' : '📁';
        var pill = createCategoryPill(category, icon + ' ' + category, activeCategory === category);
        pillsContainer.appendChild(pill);
      });
    }
  });
}

// Create category pill element
function createCategoryPill(category, text, isActive) {
  var pill = document.createElement('button');
  pill.className = 'category-pill' + (isActive ? ' active' : '');
  pill.setAttribute('data-category', category);
  pill.style.cssText = 
    'padding:8px 16px; ' +
    (isActive ? 
      'background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white;' : 
      'background:#f8fafc; color:#64748b; border:1px solid #e2e8f0;'
    ) +
    ' border:none; border-radius:20px; cursor:pointer; font-size:12px; font-weight:600; ' +
    'transition:all 0.2s ease; white-space:nowrap;';
  
  pill.textContent = text;
  
  // Add click handler
  pill.onclick = function() {
    filterMessagesByCategory(category);
    
    // Update active state
    var allPills = document.querySelectorAll('.category-pill');
    allPills.forEach(function(p) {
      p.classList.remove('active');
      p.style.background = '#f8fafc';
      p.style.color = '#64748b';
      p.style.border = '1px solid #e2e8f0';
    });
    
    this.classList.add('active');
    this.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    this.style.color = 'white';
    this.style.border = 'none';
  };
  
  // Add hover effects
  if (!isActive) {
    pill.onmouseover = function() {
      if (!this.classList.contains('active')) {
        this.style.background = '#e2e8f0';
        this.style.color = '#374151';
      }
    };
    
    pill.onmouseout = function() {
      if (!this.classList.contains('active')) {
        this.style.background = '#f8fafc';
        this.style.color = '#64748b';
      }
    };
  }
  
  return pill;
}

// Filter messages by category
function filterMessagesByCategory(category) {
  if (!chrome || !chrome.runtime) {
    return;
  }
  
  chrome.runtime.sendMessage({ 
    action: 'getSavedMessages',
    category: category === 'all' ? null : category
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
      return;
    }
    
    var container = document.getElementById('saved-messages-list');
    if (!container) return;
    
    if (response && response.messages && response.messages.length > 0) {
      container.innerHTML = '';
      for (var i = 0; i < response.messages.length; i++) {
        createSavedMessageElement(response.messages[i], container);
      }
    } else {
      var categoryName = category === 'all' ? 'messages' : category + ' messages';
      container.innerHTML = 
        '<div style="text-align:center; padding:30px; color:#9ca3af; font-size:14px;">' +
          '<div style="margin-bottom:8px; font-size:24px;">📝</div>' +
          '<p style="margin:0;">No ' + categoryName + ' yet</p>' +
          '<p style="margin:4px 0 0 0; font-size:12px;">Create and save messages in the Create tab</p>' +
        '</div>';
    }
  });
}

// Load saved messages
function loadSavedMessages() {
  // Check chrome context
  var chromeAvailable = false;
  try {
    chromeAvailable = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
  } catch (contextError) {
    console.log('Chrome context check failed in loadSavedMessages:', contextError);
  }
  
  var container = document.getElementById('saved-messages-list');
  if (!container) return;
  
  if (!chromeAvailable) {
    container.innerHTML = 
      '<div style="text-align:center; padding:20px; color:#ef4444; font-size:14px;">' +
        '<div style="margin-bottom:8px; font-size:24px;">⚠️</div>' +
        '<p style="margin:0;">Extension context lost</p>' +
        '<p style="margin:4px 0 0 0; font-size:12px;">Please reload the page</p>' +
      '</div>';
    return;
  }
  
  try {
    chrome.runtime.sendMessage({ action: 'getSavedMessages' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        return;
      }
      
      if (!container) return;
      
      if (response && response.messages && response.messages.length > 0) {
        container.innerHTML = '';
        for (var i = 0; i < response.messages.length; i++) {
          createSavedMessageElement(response.messages[i], container);
        }
      } else {
        container.innerHTML = 
          '<div style="text-align:center; padding:30px; color:#9ca3af; font-size:14px;">' +
            '<div style="margin-bottom:8px; font-size:24px;">📝</div>' +
            '<p style="margin:0;">No saved messages yet</p>' +
            '<p style="margin:4px 0 0 0; font-size:12px;">Create and save messages in the Create tab</p>' +
          '</div>';
      }
    });
  } catch (sendError) {
    console.error('Chrome runtime sendMessage error in loadSavedMessages:', sendError);
    container.innerHTML = 
      '<div style="text-align:center; padding:20px; color:#ef4444; font-size:14px;">' +
        '<div style="margin-bottom:8px; font-size:24px;">⚠️</div>' +
        '<p style="margin:0;">Failed to load saved messages</p>' +
        '<p style="margin:4px 0 0 0; font-size:12px;">Please reload the page</p>' +
      '</div>';
  }
}



// Create saved message element
function createSavedMessageElement(messageData, container) {
  var wrapper = document.createElement('div');
  wrapper.style.marginBottom = '12px';
  wrapper.style.padding = '12px';
  wrapper.style.backgroundColor = '#f0f9ff';
  wrapper.style.border = '1px solid #bae6fd';
  wrapper.style.borderRadius = '8px';
  wrapper.style.transition = 'all 0.2s ease';
  wrapper.style.cursor = 'pointer';
  
  wrapper.onmouseover = function() {
    this.style.backgroundColor = '#e0f2fe';
    this.style.borderColor = '#7dd3fc';
  };
  wrapper.onmouseout = function() {
    this.style.backgroundColor = '#f0f9ff';
    this.style.borderColor = '#bae6fd';
  };
  
  var textElement = document.createElement('p');
  textElement.style.margin = '0 0 8px 0';
  textElement.style.fontSize = '13px';
  textElement.style.lineHeight = '1.4';
  textElement.style.color = '#374151';
  textElement.textContent = messageData.message;
  
  // Category tag
  var categoryTag = document.createElement('div');
  categoryTag.style.display = 'inline-block';
  categoryTag.style.padding = '2px 8px';
  categoryTag.style.backgroundColor = '#e0f2fe';
  categoryTag.style.color = '#0369a1';
  categoryTag.style.fontSize = '10px';
  categoryTag.style.fontWeight = '600';
  categoryTag.style.borderRadius = '12px';
  categoryTag.style.marginBottom = '8px';
  var categoryIcon = messageData.category === 'General' ? '📝' : messageData.category === 'Referral' ? '🤝' : '📁';
  categoryTag.textContent = categoryIcon + ' ' + (messageData.category || 'General');
  
  var actionRow = document.createElement('div');
  actionRow.style.display = 'flex';
  actionRow.style.justifyContent = 'space-between';
  actionRow.style.alignItems = 'center';
  
  var infoContainer = document.createElement('div');
  infoContainer.style.display = 'flex';
  infoContainer.style.flexDirection = 'column';
  infoContainer.style.gap = '4px';
  
  var dateElement = document.createElement('span');
  dateElement.style.fontSize = '11px';
  dateElement.style.color = '#9ca3af';
  dateElement.textContent = new Date(messageData.timestamp).toLocaleDateString();
  
  infoContainer.appendChild(dateElement);
  
  var buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '6px';
  
  var useBtn = document.createElement('button');
  useBtn.style.padding = '4px 8px';
  useBtn.style.backgroundColor = '#10b981';
  useBtn.style.color = 'white';
  useBtn.style.border = 'none';
  useBtn.style.borderRadius = '4px';
  useBtn.style.cursor = 'pointer';
  useBtn.style.fontSize = '11px';
  useBtn.style.fontWeight = '600';
  useBtn.textContent = '✓ Use';
  
  useBtn.onclick = function(e) {
    e.stopPropagation();
    useNote(messageData.message);
  };
  
  var changeCategoryBtn = document.createElement('button');
  changeCategoryBtn.style.padding = '4px 8px';
  changeCategoryBtn.style.backgroundColor = '#3b82f6';
  changeCategoryBtn.style.color = 'white';
  changeCategoryBtn.style.border = 'none';
  changeCategoryBtn.style.borderRadius = '4px';
  changeCategoryBtn.style.cursor = 'pointer';
  changeCategoryBtn.style.fontSize = '11px';
  changeCategoryBtn.style.fontWeight = '600';
  changeCategoryBtn.textContent = '✏️';
  changeCategoryBtn.title = 'Change Category';
  
  changeCategoryBtn.onclick = function(e) {
    e.stopPropagation();
    showChangeCategoryModal(messageData);
  };
  
  var deleteBtn = document.createElement('button');
  deleteBtn.style.padding = '4px 8px';
  deleteBtn.style.backgroundColor = '#ef4444';
  deleteBtn.style.color = 'white';
  deleteBtn.style.border = 'none';
  deleteBtn.style.borderRadius = '4px';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.style.fontSize = '11px';
  deleteBtn.textContent = '×';
  
  deleteBtn.onclick = function(e) {
    e.stopPropagation();
    deleteSavedMessage(messageData.id);
  };
  
  buttonContainer.appendChild(useBtn);
  buttonContainer.appendChild(changeCategoryBtn);
  buttonContainer.appendChild(deleteBtn);
  actionRow.appendChild(infoContainer);
  actionRow.appendChild(buttonContainer);
  
  wrapper.appendChild(categoryTag);
  wrapper.appendChild(textElement);
  wrapper.appendChild(actionRow);
  container.appendChild(wrapper);
}



// Show change category modal
function showChangeCategoryModal(messageData) {
  // Create modal overlay
  var overlay = document.createElement('div');
  overlay.id = 'change-category-overlay';
  overlay.style.cssText = 
    'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); ' +
    'z-index:20001; display:flex; align-items:center; justify-content:center;';
  
  overlay.innerHTML = getTemplate('changeCategoryModal');
  document.body.appendChild(overlay);
  
  // Set up handlers
  setTimeout(function() {
    setupChangeCategoryModalHandlers(messageData, overlay);
  }, 100);
}

// Set up change category modal handlers
function setupChangeCategoryModalHandlers(messageData, overlay) {
  var pillsContainer = document.getElementById('change-category-selection-pills');
  var customSection = document.getElementById('change-custom-category-section');
  var customInput = document.getElementById('change-custom-category-input');
  var saveBtn = document.getElementById('change-category-save-btn');
  var cancelBtn = document.getElementById('change-category-cancel-btn');
  
  if (!pillsContainer || !saveBtn || !cancelBtn) return;
  
  var selectedCategory = '';
  
  // Load existing categories and populate pills
  loadCategoriesForChangeCategoryPills(pillsContainer, messageData.category);
  
  // Custom category input handler
  if (customInput) {
    customInput.oninput = function() {
      var value = this.value.trim();
      saveBtn.disabled = value === '';
    };
    
    customInput.onkeypress = function(e) {
      if (e.key === 'Enter' && !saveBtn.disabled) {
        saveBtn.click();
      }
    };
  }
  
  // Set up pill click handlers (delegated event handling)
  pillsContainer.onclick = function(e) {
    var target = e.target;
    if (target && target.classList.contains('change-category-selection-pill')) {
      var category = target.getAttribute('data-category');
      
      // Reset all pills
      var allPills = pillsContainer.querySelectorAll('.change-category-selection-pill');
      allPills.forEach(function(pill) {
        pill.style.background = '#f8fafc';
        pill.style.color = '#64748b';
        pill.style.border = '1px solid #e2e8f0';
      });
      
      // Activate selected pill
      target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      target.style.color = 'white';
      target.style.border = 'none';
      
      selectedCategory = category;
      
      if (category === 'custom') {
        customSection.style.display = 'block';
        saveBtn.disabled = true;
        customInput.focus();
      } else {
        customSection.style.display = 'none';
        saveBtn.disabled = false;
      }
    }
  };
  
  // Save button handler
  saveBtn.onclick = function() {
    var finalCategory = '';
    
    if (selectedCategory === 'custom') {
      finalCategory = customInput.value.trim();
      if (!finalCategory) {
        showLeftPanelFeedback('Please enter a category name', 'error');
        return;
      }
    } else if (selectedCategory) {
      finalCategory = selectedCategory;
    } else {
      showLeftPanelFeedback('Please select a category', 'error');
      return;
    }
    
    if (finalCategory === messageData.category) {
      showLeftPanelFeedback('Message is already in this category', 'error');
      return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Changing...';
    
    changeSavedMessageCategory(messageData.id, finalCategory, function(success) {
      if (success) {
        overlay.remove();
      } else {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Change Category';
      }
    });
  };
  
  // Cancel button handler
  cancelBtn.onclick = function() {
    overlay.remove();
  };
  
  // Close on overlay click
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  };
}

// Load categories for change category pills
function loadCategoriesForChangeCategoryPills(pillsContainer, currentCategory) {
  if (!chrome || !chrome.runtime) {
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'getCategories' }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
      return;
    }
    
    if (response && response.categories) {
      // Clear existing pills
      pillsContainer.innerHTML = '';
      
      // Add pills for all categories except current one
      response.categories.forEach(function(category) {
        if (category !== currentCategory) {
          var icon = category === 'General' ? '📝' : category === 'Referral' ? '🤝' : '📁';
          var pill = createChangeCategorySelectionPill(category, icon + ' ' + category);
          pillsContainer.appendChild(pill);
        }
      });
      
      // Add "New Category" pill at the end
      var newCategoryPill = createChangeCategorySelectionPill('custom', '➕ New Category');
      pillsContainer.appendChild(newCategoryPill);
    }
  });
}

// Create change category selection pill element
function createChangeCategorySelectionPill(category, text) {
  var pill = document.createElement('button');
  pill.className = 'change-category-selection-pill';
  pill.setAttribute('data-category', category);
  pill.style.cssText = 
    'padding:10px 16px; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; ' +
    'border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; ' +
    'transition:all 0.2s ease; white-space:nowrap;';
  
  pill.textContent = text;
  
  // Add hover effects
  pill.onmouseover = function() {
    if (this.style.background === '#f8fafc' || this.style.background === '') {
      this.style.background = '#e2e8f0';
      this.style.color = '#374151';
    }
  };
  
  pill.onmouseout = function() {
    if (this.style.background === '#e2e8f0' || this.style.background === 'rgb(226, 232, 240)') {
      this.style.background = '#f8fafc';
      this.style.color = '#64748b';
    }
  };
  
  return pill;
}

// Change saved message category
function changeSavedMessageCategory(messageId, newCategory, callback) {
  if (!chrome || !chrome.runtime) {
    showLeftPanelFeedback('Extension context lost. Please reload the page.', 'error');
    if (callback) callback(false);
    return;
  }
  
  chrome.runtime.sendMessage({
    action: 'changeSavedMessageCategory',
    messageId: messageId,
    newCategory: newCategory
  }, function(response) {
    if (chrome.runtime.lastError) {
      showLeftPanelFeedback('Extension error. Please reload the page.', 'error');
      if (callback) callback(false);
      return;
    }
    
    if (response && response.success) {
      loadCategoryPills(); // Refresh category pills
      filterMessagesByCategory('all'); // Refresh all messages
      showLeftPanelFeedback('Category changed successfully!', 'success');
      if (callback) callback(true);
    } else {
      var errorMsg = response && response.error ? response.error : 'Failed to change category';
      showLeftPanelFeedback(errorMsg, 'error');
      if (callback) callback(false);
    }
  });
}

// Delete saved message
function deleteSavedMessage(messageId) {
  if (!chrome || !chrome.runtime) {
    showLeftPanelFeedback('Extension context lost. Please reload the page.', 'error');
    return;
  }
  
  chrome.runtime.sendMessage({
    action: 'deleteSavedMessage',
    messageId: messageId
  }, function(response) {
    if (chrome.runtime.lastError) {
      showLeftPanelFeedback('Extension error. Please reload the page.', 'error');
      return;
    }
    
    if (response && response.success) {
      loadSavedMessages(); // Refresh the list
      showLeftPanelFeedback('Message deleted', 'success');
    } else {
      showLeftPanelFeedback('Failed to delete message', 'error');
    }
  });
}





// Show feedback in left panel
function showLeftPanelFeedback(message, type) {
  var existingFeedback = document.getElementById('left-panel-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  var color = type === 'success' ? '#10b981' : '#ef4444';
  var bgColor = type === 'success' ? '#d1fae5' : '#fee2e2';
  
  var feedbackDiv = document.createElement('div');
  feedbackDiv.id = 'left-panel-feedback';
  feedbackDiv.style.cssText = 
    'position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:20000; ' +
    'padding:12px 20px; background:' + bgColor + '; color:' + color + '; ' +
    'border-radius:8px; font-size:12px; font-weight:600; box-shadow:0 4px 12px rgba(0,0,0,0.1);';
  feedbackDiv.textContent = message;
  
  document.body.appendChild(feedbackDiv);
  
  setTimeout(function() {
    if (feedbackDiv) {
      feedbackDiv.remove();
    }
  }, 3000);
}

// Hide UI function
function hideUI() {
  debugLog("Hiding UI...");
  var container = document.getElementById('linkedin-ai-helper');
  
  if (container) {
    container.remove();
    debugLog("UI hidden successfully");
  }
}

// Generate AI message directly into textarea
function generateAIMessage(messageType = 'connection') {
  debugLog("Generating AI message with type:", messageType);
  
  var btn = document.getElementById('generate-ai-btn');
  var textarea = document.getElementById('custom-message-input');
  
  if (!textarea) {
    console.error("Textarea not found");
    return;
  }
  
  // Show loading state on the button
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Generating...';
  }
  
  // Check if there's existing text in the textarea
  var existingText = textarea.value.trim();
  
  // Data extraction disabled for LinkedIn ToS compliance
  debugLog("Using generic prompt - data extraction disabled for ToS compliance");
  
  // Use generic persona for all users
  var persona = 'general';
  
  // Create prompt based on whether there's existing text
  var prompt;
  if (existingText && existingText.length > 0) {
    prompt = createImprovementPrompt(existingText);
    debugLog("Using improvement prompt for existing text:", existingText.substring(0, 50) + "...");
  } else {
    prompt = createPersonaPrompt(persona);
    debugLog("Using generic prompt for new message generation");
  }
  
  debugLog("Generated prompt:", prompt);
  
  // Check if chrome runtime is available and valid
  var chromeAvailable = false;
  try {
    chromeAvailable = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
  } catch (contextError) {
    console.log('Chrome context check failed:', contextError);
  }
  
  if (!chromeAvailable) {
    btn.disabled = false;
    btn.textContent = '🤖 Write with AI';
    showGenerateError('Extension context lost. Please reload the page.');
    return;
  }
  
  // Send message to background
  try {
    chrome.runtime.sendMessage(
      { action: 'getAISuggestion', prompt: prompt, persona: persona, messageType: messageType },
      function(response) {
        // Reset button state
        if (btn) {
          btn.disabled = false;
          btn.textContent = '🤖 Write with AI';
        }
        
        if (chrome.runtime.lastError) {
          showGenerateError('Extension error: ' + chrome.runtime.lastError.message);
          return;
        }
        
        if (!response) {
          showApiKeyPrompt();
          return;
        }
        
        if (response.error) {
          if (response.error.indexOf('API key') !== -1) {
            showApiKeyPrompt();
          } else {
            showGenerateError(response.error);
          }
          return;
        }
        
        if (response.suggestion) {
          // Put the first suggestion directly into the textarea
          var suggestions = response.suggestion.split('###');
          var firstSuggestion = suggestions[0].trim();
          if (firstSuggestion) {
            textarea.value = firstSuggestion;
            textarea.focus();
            
            // Show success message based on whether we improved existing text or generated new
            var actionLabel = existingText && existingText.length > 0 ? 'improved' : 'generated';
            showGenerateSuccess(`✅ LinkedIn message ${actionLabel}!`);
          }
        } else {
          showApiKeyPrompt();
        }
      }
    );
  } catch (sendError) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🤖 Write with AI';
    }
    showGenerateError('Failed to communicate with extension background. Please reload the page.');
    console.error('Chrome runtime sendMessage error:', sendError);
  }
}





// Show error message for generation
function showGenerateError(message) {
  showLeftPanelFeedback('❌ ' + message, 'error');
}

// Show success message for generation
function showGenerateSuccess(message = '✅ AI message generated!') {
  showLeftPanelFeedback(message, 'success');
}



// Show API key prompt
function showApiKeyPrompt() {
  var container = document.getElementById('linkedin-ai-helper');
  if (!container) return;
  
  // Create modal overlay for API key input
  var overlay = document.createElement('div');
  overlay.id = 'api-key-overlay';
  overlay.style.cssText = 
    'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); ' +
    'z-index:20000; display:flex; align-items:center; justify-content:center;';
  
  overlay.innerHTML = getTemplate('apiKeyModal');
  
  document.body.appendChild(overlay);
  
  // Set up handlers
  setTimeout(function() {
    setupApiKeyModalHandlers();
  }, 100);
}

// Set up API key modal handlers
function setupApiKeyModalHandlers() {
  var input = document.getElementById('api-key-input');
  var saveBtn = document.getElementById('save-api-key-btn');
  var cancelBtn = document.getElementById('cancel-api-key-btn');
  var overlay = document.getElementById('api-key-overlay');
  
  if (!input || !saveBtn || !cancelBtn || !overlay) return;
  
  // Load existing API key
  if (chrome && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'getApiKey' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error loading API key:', chrome.runtime.lastError);
        return;
      }
      if (response && response.apiKey) {
        input.value = response.apiKey;
      }
    });
  }
  
  // Save API key button
  saveBtn.onclick = function() {
    var apiKey = input.value.trim();
    if (!apiKey) {
      showLeftPanelFeedback('Please enter an API key', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      showLeftPanelFeedback('API key should start with "sk-"', 'error');
      return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    if (!chrome || !chrome.runtime) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Continue';
      showLeftPanelFeedback('Extension context lost. Please reload the page.', 'error');
      return;
    }
    
    chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey: apiKey }, function(response) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Continue';
      
      if (chrome.runtime.lastError) {
        showLeftPanelFeedback('Extension error. Please reload the page.', 'error');
        return;
      }
      
      if (response && response.success) {
        showLeftPanelFeedback('API key saved successfully!', 'success');
        overlay.remove();
      } else {
        showLeftPanelFeedback('Failed to save API key. Please try again.', 'error');
      }
    });
  };
  
  // Cancel button
  cancelBtn.onclick = function() {
    overlay.remove();
  };
  
  // Close on overlay click
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  };
  
  // Ensure input is clickable and focusable
  input.style.pointerEvents = 'auto';
  input.style.cursor = 'text';
  input.style.userSelect = 'text';
  
  // Add click handler to ensure focus works
  input.onclick = function() {
    this.focus();
  };
  
  // Add focus and blur styling
  input.onfocus = function() {
    this.style.borderColor = '#0077b5';
    this.style.boxShadow = '0 0 0 2px rgba(0, 119, 181, 0.2)';
  };
  
  input.onblur = function() {
    this.style.borderColor = '#d1d5db';
    this.style.boxShadow = 'none';
  };
  
  // Enter key to save
  input.onkeypress = function(e) {
    if (e.key === 'Enter') {
      saveBtn.click();
    }
  };
  
  // Focus input with a small delay to ensure it's rendered
  setTimeout(function() {
    if (input) {
      input.focus();
      input.select(); // Select any existing text
    }
  }, 100);
}

// Use note function
function useNote(text) {
  debugLog("Using note:", text);
  
  // Find LinkedIn textarea with multiple selectors
  var modal = document.querySelector('artdeco-modal') || 
             document.querySelector('[role="dialog"]') ||
             document.querySelector('.artdeco-modal');
  
  if (modal) {
    debugLog("Modal found for textarea search:", modal);
    var textarea = modal.querySelector('textarea[name="message"]') ||
                  modal.querySelector('textarea') ||
                  modal.querySelector('[contenteditable="true"]');
    
    if (textarea) {
      if (textarea.tagName === 'TEXTAREA') {
        textarea.value = text;
        var event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      } else {
        textarea.textContent = text;
        var event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }
      debugLog("Note inserted into textarea");
      
      // Show success feedback
      showSuccessFeedback();
      
      // Set up detection for Send button click (only once)
      if (!window.sendButtonDetectionSetup) {
        setupSendButtonDetection();
        window.sendButtonDetectionSetup = true;
      }
      
    } else {
      debugLog("Textarea not found in modal");
    }
  } else {
    debugLog("Modal not found for note insertion");
  }
}







// Simplified send button detection to just hide UI when modal is closed
function setupSendButtonDetection() {
  debugLog("Setting up Send button detection to hide UI...");
  
  // Find the LinkedIn modal with connection note
  var linkedinModal = null;
  var modals = document.querySelectorAll('artdeco-modal, [role="dialog"]');
  for (var i = 0; i < modals.length; i++) {
    var modal = modals[i];
    if (isConnectionModal(modal)) {
      linkedinModal = modal;
      break;
    }
  }
  
  if (!linkedinModal) {
    debugLog("Connection note modal not found for Send button detection");
    return;
  }
  
  debugLog("Modal found for send button detection:", linkedinModal);
  
  // Method 1: Mutation observer to detect modal changes
  var modalObserver = new MutationObserver(function(mutations) {
    var modalStillExists = document.body.contains(linkedinModal);
    if (!modalStillExists) {
      debugLog("Modal removed - hiding UI");
      hideUI();
      modalObserver.disconnect();
    }
  });
  
  modalObserver.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  // Method 2: Periodic check if modal is still visible
  var modalCheckInterval = setInterval(function() {
    var modalStillVisible = linkedinModal && 
                           document.body.contains(linkedinModal) && 
                           linkedinModal.offsetParent !== null;
    
    if (!modalStillVisible) {
      debugLog("Modal no longer visible - hiding UI");
      hideUI();
      clearInterval(modalCheckInterval);
    }
  }, 2000);
  
  // Clean up interval after 2 minutes
  setTimeout(function() {
    clearInterval(modalCheckInterval);
  }, 120000);
  
  debugLog("Send button detection setup completed");
}

// Show success feedback when note is used
function showSuccessFeedback() {
  var suggestionsArea = document.getElementById('suggestions-area');
  if (!suggestionsArea) return;
  
  var originalContent = suggestionsArea.innerHTML;
  
  // Show success message
  suggestionsArea.innerHTML = getTemplate('successFeedback');
  
  // Restore original content after 3 seconds
  setTimeout(function() {
    if (suggestionsArea && document.getElementById('linkedin-ai-helper')) {
      suggestionsArea.innerHTML = originalContent;
    }
  }, 3000);
}

// Add manual test function
function testInject() {
  debugLog("Manual test injection triggered");
  injectUI();
}

// Make it available globally for testing
window.testLinkedInHelper = testInject;

// Start the extension
debugLog("LinkedIn AI Note Helper: Script loaded, starting...");
startWhenReady();

// Also try to inject after a delay regardless of modal detection
setTimeout(function() {
  debugLog("Timeout injection attempt...");
  injectUI();
}, 5000); 



// Test function for textarea focus issue
function testTextareaFocus() {
  debugLog("=== TEXTAREA FOCUS TEST ===");
  
  var textarea = document.getElementById('custom-message-input');
  if (!textarea) {
    debugLog("No textarea found!");
    return;
  }
  
  debugLog("Textarea found:", textarea);
  debugLog("Textarea current styles:");
  debugLog("- pointerEvents:", textarea.style.pointerEvents);
  debugLog("- cursor:", textarea.style.cursor);
  debugLog("- userSelect:", textarea.style.userSelect);
  debugLog("- disabled:", textarea.disabled);
  debugLog("- readonly:", textarea.readOnly);
  debugLog("- tabIndex:", textarea.tabIndex);
  
  debugLog("Testing focus programmatically...");
  textarea.focus();
  
  setTimeout(function() {
    debugLog("After focus - activeElement:", document.activeElement === textarea ? "TEXTAREA" : document.activeElement.tagName);
    debugLog("Test typing...");
    textarea.value = "Test input - " + new Date().toLocaleTimeString();
  }, 100);
}

// Debug function to check all current modals
function debugCurrentModals() {
  console.log("=== DEBUGGING ALL CURRENT MODALS ===");
  
  var allModals = document.querySelectorAll('artdeco-modal, [role="dialog"], .artdeco-modal');
  console.log("Found", allModals.length, "total modals");
  
  for (var i = 0; i < allModals.length; i++) {
    var modal = allModals[i];
    var modalText = (modal.textContent || modal.innerText || '').substring(0, 200);
    var isConnection = isConnectionModal(modal);
    
    console.log("Modal", i + 1, ":");
    console.log("  - Text preview:", modalText);
    console.log("  - Is connection modal:", isConnection);
    console.log("  - Element:", modal);
    console.log("  ---");
  }
  
  if (allModals.length === 0) {
    console.log("No modals found on the page");
  }
}

// Make test functions available globally
window.testTextareaFocus = testTextareaFocus;
window.debugCurrentModals = debugCurrentModals;





// Create improvement prompt for existing text
function createImprovementPrompt(existingText) {
  var basePrompt = `Improve and enhance this LinkedIn connection request message. Make it more professional, engaging, and compelling while keeping the core intent. The improved message should be 200-250 characters max.

Original message:
"${existingText}"

Please provide an improved version that:
- Maintains the original intent and key points
- Sounds more professional and polished
- Is more likely to get a positive response
- Follows LinkedIn connection etiquette
- Is concise but impactful

Return only the improved message, no explanations.`;
  
  return basePrompt;
}

// Generate persona-specific AI prompts (simplified for ToS compliance)
function createPersonaPrompt(persona) {
  switch (persona) {
    case 'recruiter':
      return `Write a professional LinkedIn connection message to a recruiter. Focus on:
- Your background and what type of opportunities you're seeking
- Specific skills and experience that make you valuable
- Interest in learning about opportunities at their company
- Professional but personable tone
- 200-250 characters max

Make it clear you're a serious candidate worth their time.`;
      
    case 'engineering_manager':
      return `Write a professional LinkedIn connection message to an Engineering Manager. Focus on:
- Your technical background and engineering experience
- Interest in their team, projects, or engineering culture
- Specific technologies or methodologies you share
- Potential for technical collaboration or mentorship
- Professional and respectful tone
- 200-250 characters max

Show genuine interest in their technical leadership and engineering approach.`;
      
    case 'founder':
      return `Write a professional LinkedIn connection message to a startup founder/CEO. Focus on:
- Your entrepreneurial spirit or business acumen
- Interest in their company's mission and vision
- How you could potentially add value to their organization
- Admiration for what they've built
- Confident but respectful tone
- 200-250 characters max

Show you understand the challenges of building a company and respect their achievements.`;
      
    case 'general':
      return `Write a professional LinkedIn connection message (ToS compliant - no profile scraping). Focus on:
- Generic professional introduction
- Interest in connecting with like-minded professionals
- Mutual growth and networking opportunities
- Warm and professional tone
- 200-250 characters max

Create a generic but authentic connection message.`;
      
    default:
      return `Write a professional LinkedIn connection message. Focus on:
- Finding common ground or shared interests
- Professional background relevance
- Genuine interest in connecting
- Warm and approachable tone
- 200-250 characters max

Make it personalized and authentic.`;
  }
}



