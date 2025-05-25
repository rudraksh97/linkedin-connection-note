// LinkedIn AI Note Helper - Bulletproof Version v0.3.1

// Debug configuration - set to true for debugging history issues
const DEBUG_MODE = true;

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
    
    // Initialize response tracking
    initResponseTracking();
    
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
    var historyTab = document.getElementById('tab-history');
    
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
          // Reload saved messages when switching to saved tab
          setTimeout(function() {
            loadSavedMessages();
          }, 100);
        } catch (error) {
          console.error('Error in saved tab handler:', error);
        }
      };
    }
    
    if (historyTab) {
      historyTab.onclick = function() {
        try {
          switchMainTab('history');
          // Reload message history when switching to history tab
          setTimeout(function() {
            loadMessageHistory();
          }, 100);
        } catch (error) {
          console.error('Error in history tab handler:', error);
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
  
  // Set up AI generation buttons
  try {
    var generateBtn = document.getElementById('generate-ai-btn');
    var referralBtn = document.getElementById('generate-referral-btn');
    
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
    
    if (referralBtn) {
      referralBtn.onclick = function() {
        generateAIMessage('referral');
      };
      
      // Add enhanced hover effects to referral button
      referralBtn.onmouseover = function() {
        this.style.background = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 8px 25px -8px rgba(245, 158, 11, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      };
      referralBtn.onmouseout = function() {
        this.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      };
    }
  } catch (error) {
    console.error('Error setting up generate buttons:', error);
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
        loadMessageHistory();
        debugLog("Initial data loading completed");
      } else {
        console.log('Chrome extension context invalidated, skipping data load');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      // If context is invalidated, we can still continue without the saved data
    }
  }, 200);
  
  // Display persona detection
  setTimeout(function() {
    try {
      displayPersonaDetection();
    } catch (error) {
      console.error('Error displaying persona detection:', error);
    }
  }, 500);
}

// Display persona detection in UI
function displayPersonaDetection() {
  var personaContainer = document.getElementById('persona-detection');
  var personaLabel = document.getElementById('persona-label');
  var personaIcon = document.getElementById('persona-icon');
  
  if (!personaContainer || !personaLabel || !personaIcon) {
    debugLog("Persona UI elements not found");
    return;
  }
  
  // Extract person information and detect persona
  var personInfo = extractPersonInfo();
  var persona = detectPersonaFromProfile(personInfo);
  
  debugLog("Displaying persona:", persona, "for person:", personInfo.name);
  
  // Set persona display
  var personaDisplay = getPersonaDisplayInfo(persona);
  personaLabel.textContent = personaDisplay.label;
  personaIcon.textContent = personaDisplay.icon;
  
  // Show the persona container
  personaContainer.style.display = 'block';
  
  // Add a subtle animation
  personaContainer.style.opacity = '0';
  personaContainer.style.transform = 'translateY(-10px)';
  setTimeout(function() {
    personaContainer.style.transition = 'all 0.3s ease';
    personaContainer.style.opacity = '1';
    personaContainer.style.transform = 'translateY(0)';
  }, 100);
}

// Get persona display information
function getPersonaDisplayInfo(persona) {
  switch (persona) {
    case 'recruiter':
      return { label: 'Recruiter / Talent Acquisition', icon: '🎯' };
    case 'engineering_manager':
      return { label: 'Engineering Manager / Tech Lead', icon: '⚙️' };
    case 'founder':
      return { label: 'Founder / CEO / Entrepreneur', icon: '🚀' };
    default:
      return { label: 'Professional', icon: '👤' };
  }
}

// Switch between main tabs
function switchMainTab(tab) {
  var createTab = document.getElementById('tab-create');
  var savedTab = document.getElementById('tab-saved');
  var historyTab = document.getElementById('tab-history');
  var createContent = document.getElementById('create-content');
  var savedContent = document.getElementById('saved-content');
  var historyContent = document.getElementById('history-content');
  
  // Reset all tabs
  if (createTab) {
    createTab.style.background = 'transparent';
    createTab.style.color = '#6b7280';
  }
  if (savedTab) {
    savedTab.style.background = 'transparent';
    savedTab.style.color = '#6b7280';
  }
  if (historyTab) {
    historyTab.style.background = 'transparent';
    historyTab.style.color = '#6b7280';
  }
  
  // Hide all content
  if (createContent) createContent.style.display = 'none';
  if (savedContent) savedContent.style.display = 'none';
  if (historyContent) historyContent.style.display = 'none';
  
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
  } else if (tab === 'history') {
    if (historyTab) {
      historyTab.style.background = '#0077b5';
      historyTab.style.color = 'white';
    }
    if (historyContent) historyContent.style.display = 'block';
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
            saveCustomMessage(message);
            if (input) {
              input.value = '';
            }
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
    var historyTab = document.getElementById('tab-history');
    
    if (savedTab) {
      savedTab.onclick = function() {
        try {
          switchTab('saved');
        } catch (error) {
          console.error('Error in saved tab handler:', error);
        }
      };
    }
    
    if (historyTab) {
      historyTab.onclick = function() {
        try {
          switchTab('history');
        } catch (error) {
          console.error('Error in history tab handler:', error);
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
      loadMessageHistory();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, 100);
}

// Switch between tabs
function switchTab(tab) {
  var savedTab = document.getElementById('tab-saved');
  var historyTab = document.getElementById('tab-history');
  var savedContainer = document.getElementById('saved-messages');
  var historyContainer = document.getElementById('history-messages');
  
  if (tab === 'saved') {
    savedTab.style.background = '#0077b5';
    savedTab.style.color = 'white';
    historyTab.style.background = '#f3f4f6';
    historyTab.style.color = '#666';
    savedContainer.style.display = 'block';
    historyContainer.style.display = 'none';
  } else {
    historyTab.style.background = '#0077b5';
    historyTab.style.color = 'white';
    savedTab.style.background = '#f3f4f6';
    savedTab.style.color = '#666';
    savedContainer.style.display = 'none';
    historyContainer.style.display = 'block';
  }
}

// Save custom message
function saveCustomMessage(message) {
  // Check chrome context
  var chromeAvailable = false;
  try {
    chromeAvailable = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
  } catch (contextError) {
    console.log('Chrome context check failed in saveCustomMessage:', contextError);
  }
  
  if (!chromeAvailable) {
    showLeftPanelFeedback('Extension context lost. Please reload the page.', 'error');
    return;
  }
  
  try {
    chrome.runtime.sendMessage({
      action: 'saveCustomMessage',
      message: message
    }, function(response) {
      if (chrome.runtime.lastError) {
        showLeftPanelFeedback('Extension error. Please reload the page.', 'error');
        return;
      }
      
      if (response && response.success) {
        loadSavedMessages(); // Refresh the list
        showLeftPanelFeedback('Message saved successfully!', 'success');
      } else {
        showLeftPanelFeedback('Failed to save message', 'error');
      }
    });
  } catch (sendError) {
    showLeftPanelFeedback('Failed to communicate with extension. Please reload the page.', 'error');
    console.error('Chrome runtime sendMessage error in saveCustomMessage:', sendError);
  }
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

// Load message history
function loadMessageHistory() {
  if (!chrome || !chrome.runtime) {
    var container = document.getElementById('history-messages-list');
    if (container) {
      container.innerHTML = 
        '<div style="text-align:center; padding:20px; color:#ef4444; font-size:14px;">' +
          '<div style="margin-bottom:8px; font-size:24px;">⚠️</div>' +
          '<p style="margin:0;">Extension context lost</p>' +
          '<p style="margin:4px 0 0 0; font-size:12px;">Please reload the page</p>' +
        '</div>';
    }
    return;
  }
  
  chrome.runtime.sendMessage({ action: 'getMessageHistory' }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
      return;
    }
    
    var container = document.getElementById('history-messages-list');
    if (!container) return;
    
    if (response && response.history && response.history.length > 0) {
      container.innerHTML = '';
      for (var i = 0; i < response.history.length; i++) {
        createHistoryMessageElement(response.history[i], container);
      }
    } else {
      container.innerHTML = 
        '<div style="text-align:center; padding:30px; color:#9ca3af; font-size:14px;">' +
          '<div style="margin-bottom:8px; font-size:24px;">📊</div>' +
          '<p style="margin:0;">No message history yet</p>' +
          '<p style="margin:4px 0 0 0; font-size:12px;">Sent messages will appear here</p>' +
        '</div>';
    }
  });
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
  
  var actionRow = document.createElement('div');
  actionRow.style.display = 'flex';
  actionRow.style.justifyContent = 'space-between';
  actionRow.style.alignItems = 'center';
  
  var dateElement = document.createElement('span');
  dateElement.style.fontSize = '11px';
  dateElement.style.color = '#9ca3af';
  dateElement.textContent = new Date(messageData.timestamp).toLocaleDateString();
  
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
  buttonContainer.appendChild(deleteBtn);
  actionRow.appendChild(dateElement);
  actionRow.appendChild(buttonContainer);
  
  wrapper.appendChild(textElement);
  wrapper.appendChild(actionRow);
  container.appendChild(wrapper);
}

// Create history message element
function createHistoryMessageElement(historyData, container) {
  var wrapper = document.createElement('div');
  wrapper.style.marginBottom = '12px';
  wrapper.style.padding = '12px';
  wrapper.style.backgroundColor = '#fef7ff';
  wrapper.style.border = '1px solid #e9d5ff';
  wrapper.style.borderRadius = '8px';
  wrapper.style.cursor = 'pointer';
  
  wrapper.onmouseover = function() {
    this.style.backgroundColor = '#faf5ff';
    this.style.borderColor = '#d8b4fe';
  };
  wrapper.onmouseout = function() {
    this.style.backgroundColor = '#fef7ff';
    this.style.borderColor = '#e9d5ff';
  };
  
  var textElement = document.createElement('p');
  textElement.style.margin = '0 0 8px 0';
  textElement.style.fontSize = '13px';
  textElement.style.lineHeight = '1.4';
  textElement.style.color = '#374151';
  textElement.textContent = historyData.message;
  
  var actionRow = document.createElement('div');
  actionRow.style.display = 'flex';
  actionRow.style.justifyContent = 'space-between';
  actionRow.style.alignItems = 'center';
  
  var infoElement = document.createElement('span');
  infoElement.style.fontSize = '11px';
  infoElement.style.color = '#9ca3af';
  infoElement.textContent = '📤 ' + new Date(historyData.timestamp).toLocaleDateString();
  
  var buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '6px';
  
  var useBtn = document.createElement('button');
  useBtn.style.padding = '4px 8px';
  useBtn.style.backgroundColor = '#8b5cf6';
  useBtn.style.color = 'white';
  useBtn.style.border = 'none';
  useBtn.style.borderRadius = '4px';
  useBtn.style.cursor = 'pointer';
  useBtn.style.fontSize = '11px';
  useBtn.style.fontWeight = '600';
  useBtn.textContent = '↻ Reuse';
  
  useBtn.onclick = function(e) {
    e.stopPropagation();
    useNote(historyData.message);
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
    deleteHistoryMessage(historyData.id);
  };
  
  buttonContainer.appendChild(useBtn);
  buttonContainer.appendChild(deleteBtn);
  
  actionRow.appendChild(infoElement);
  actionRow.appendChild(buttonContainer);
  
  wrapper.appendChild(textElement);
  wrapper.appendChild(actionRow);
  container.appendChild(wrapper);
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

// Delete history message
function deleteHistoryMessage(messageId) {
  if (!chrome || !chrome.runtime) {
    showLeftPanelFeedback('Extension context lost. Please reload the page.', 'error');
    return;
  }
  
  chrome.runtime.sendMessage({
    action: 'deleteHistoryMessage',
    messageId: messageId
  }, function(response) {
    if (chrome.runtime.lastError) {
      showLeftPanelFeedback('Extension error. Please reload the page.', 'error');
      return;
    }
    
    if (response && response.success) {
      loadMessageHistory(); // Refresh the history
      showLeftPanelFeedback('History item deleted', 'success');
    } else {
      showLeftPanelFeedback('Failed to delete history item', 'error');
    }
  });
}

// Add message to history
function addToHistory(message, source) {
  debugLog("=== addToHistory called ===");
  debugLog("Message:", message);
  debugLog("Source:", source);
  
  if (!chrome || !chrome.runtime) {
    debugLog('Chrome runtime not available, skipping history update');
    console.log('Chrome runtime not available, skipping history update');
    return;
  }
  
  debugLog('Chrome runtime is available, sending message to background...');
  
  chrome.runtime.sendMessage({
    action: 'addToHistory',
    message: message,
    source: source
  }, function(response) {
    if (chrome.runtime.lastError) {
      debugLog('Chrome runtime error adding to history:', chrome.runtime.lastError);
      console.error('Chrome runtime error adding to history:', chrome.runtime.lastError);
      return;
    }
    
    debugLog('addToHistory response received:', response);
    
    if (response && response.success) {
      debugLog('History added successfully, refreshing history list...');
      loadMessageHistory(); // Refresh history
    } else {
      debugLog('History add failed or no success response:', response);
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
  var referralBtn = document.getElementById('generate-referral-btn');
  var textarea = document.getElementById('custom-message-input');
  
  if (!textarea) {
    console.error("Textarea not found");
    return;
  }
  
  // Show loading state on the appropriate button
  var activeBtn = messageType === 'referral' ? referralBtn : btn;
  if (activeBtn) {
    activeBtn.disabled = true;
    activeBtn.textContent = messageType === 'referral' ? 'Generating...' : 'Generating...';
  }
  
  // Extract person information for personalized message
  var personInfo = extractPersonInfo();
  
  // Detect persona from profile
  var persona = detectPersonaFromProfile(personInfo);
  debugLog("Detected persona:", persona, "for person:", personInfo.name);
  
  // Create persona-specific prompt
  var prompt = createPersonaPrompt(persona, personInfo, messageType);
  
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
    btn.textContent = '🤖 Generate AI';
    showGenerateError('Extension context lost. Please reload the page.');
    return;
  }
  
  // Send message to background
  try {
    chrome.runtime.sendMessage(
      { action: 'getAISuggestion', prompt: prompt, persona: persona, messageType: messageType },
      function(response) {
        // Reset button state
        if (activeBtn) {
          activeBtn.disabled = false;
          activeBtn.textContent = messageType === 'referral' ? '🤝 Ask Referral' : '🤖 Generate AI';
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
            
            // Show persona-specific success message
            var personaLabel = getPersonaLabel(persona);
            var messageTypeLabel = messageType === 'referral' ? 'referral request' : 'connection message';
            showGenerateSuccess(`✅ ${personaLabel} ${messageTypeLabel} generated!`);
            
            // Track the generated message with persona info
            addToHistory(firstSuggestion, `ai_${persona}_${messageType}`);
          }
        } else {
          showApiKeyPrompt();
        }
      }
    );
  } catch (sendError) {
    if (activeBtn) {
      activeBtn.disabled = false;
      activeBtn.textContent = messageType === 'referral' ? '🤝 Ask Referral' : '🤖 Generate AI';
    }
    showGenerateError('Failed to communicate with extension background. Please reload the page.');
    console.error('Chrome runtime sendMessage error:', sendError);
  }
}

// Create personalized prompt based on tone and person info
function createPersonalizedPrompt(tone, personInfo) {
  var toneDesc = 'warm and approachable';
  if (tone === 'professional') toneDesc = 'formal and business-focused';
  else if (tone === 'polite') toneDesc = 'respectful and courteous';
  else if (tone === 'assertive') toneDesc = 'confident and direct';
  else if (tone === 'casual') toneDesc = 'relaxed and informal';
  
  var basePrompt = 'Write 3 unique LinkedIn connection request messages that are ' + toneDesc + '. Each message should be under 250 characters and personalized. Separate with "###".';
  
  // Add person context if available
  var contextParts = [];
  
  if (personInfo.name) {
    contextParts.push('Person name: ' + personInfo.name);
  }
  
  if (personInfo.title) {
    contextParts.push('Job title: ' + personInfo.title);
  }
  
  if (personInfo.company) {
    contextParts.push('Company: ' + personInfo.company);
  }
  
  if (personInfo.location) {
    contextParts.push('Location: ' + personInfo.location);
  }
  
  if (personInfo.mutualConnections) {
    contextParts.push('Mutual connections: ' + personInfo.mutualConnections);
  }
  
  if (personInfo.about && personInfo.about.length > 0) {
    contextParts.push('About: ' + personInfo.about);
  }
  
  if (contextParts.length > 0) {
    var contextString = '\n\nContext about the person:\n' + contextParts.join('\n');
    var personalizedPrompt = basePrompt + contextString + '\n\nUse this information to create personalized, relevant connection messages that reference specific details when appropriate. Make them feel genuine and tailored to this person.';
    
    console.log("Generated personalized prompt:", personalizedPrompt);
    return personalizedPrompt;
  } else {
    console.log("No person context found, using generic prompt");
    return basePrompt;
  }
}

// Legacy function for backward compatibility
// function createPrompt(tone) {
//   return createPersonalizedPrompt(tone, {});
// }

// Show error message for generation
function showGenerateError(message) {
  showLeftPanelFeedback('❌ ' + message, 'error');
}

// Show success message for generation
function showGenerateSuccess(message = '✅ AI message generated!') {
  showLeftPanelFeedback(message, 'success');
}

// Get user-friendly persona label
function getPersonaLabel(persona) {
  switch (persona) {
    case 'recruiter':
      return 'Recruiter-focused';
    case 'engineering_manager':
      return 'Engineering Manager';
    case 'founder':
      return 'Founder-focused';
    default:
      return 'Generic';
  }
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

// Extract person information from LinkedIn page
function extractPersonInfo() {
  var personInfo = {
    name: '',
    title: '',
    company: '',
    location: '',
    industry: '',
    mutualConnections: '',
    about: ''
  };
  
  try {
    // First try to get info from the connection modal itself
    var modal = document.querySelector('artdeco-modal') || 
               document.querySelector('[role="dialog"]');
    
    if (modal) {
      // Try to find name in modal header or content
      var nameElement = modal.querySelector('h2') || 
                       modal.querySelector('[data-test-modal-title]') ||
                       modal.querySelector('.invite-connect-node__name') ||
                       modal.querySelector('strong');
      
      if (nameElement) {
        var nameText = nameElement.textContent || nameElement.innerText;
        if (nameText && !nameText.toLowerCase().includes('invite') && !nameText.toLowerCase().includes('connect')) {
          personInfo.name = nameText.trim();
        }
      }
    }
    
    // If name not found in modal, try to get it from page URL or main content
    if (!personInfo.name) {
      // Try multiple profile page selectors (LinkedIn changes these frequently)
      var nameSelectors = [
        'h1.text-heading-xlarge',
        '.pv-text-details__name',
        '.ph5 h1',
        'h1[data-anonymize="person-name"]',
        '.pv-top-card--list h1',
        // More recent LinkedIn selectors
        '.pv-text-details__name .text-heading-xlarge',
        '.pv-top-card .pv-text-details__name',
        '.pv-top-card h1',
        '.text-heading-xlarge.inline',
        '.pv-text-details__name h1',
        // Generic fallbacks
        'main h1',
        'section h1',
        '[data-field="name"]',
        '.profile-photo-edit__name',
        '.pv-top-card--photo h1'
      ];
      
      var profileName = null;
      for (var i = 0; i < nameSelectors.length; i++) {
        profileName = document.querySelector(nameSelectors[i]);
        if (profileName) {
          var nameText = (profileName.textContent || profileName.innerText).trim();
          // Filter out non-name content
          if (nameText && 
              !nameText.toLowerCase().includes('linkedin') &&
              !nameText.toLowerCase().includes('profile') &&
              !nameText.toLowerCase().includes('connect') &&
              nameText.length > 2 &&
              nameText.length < 100) {
            personInfo.name = nameText;
            console.log("Found name using selector:", nameSelectors[i], "->", nameText);
            break;
          }
        }
      }
    }
    
    // Try to extract name from page title if still not found
    if (!personInfo.name) {
      var pageTitle = document.title;
      if (pageTitle) {
        // LinkedIn titles are usually like "John Smith | LinkedIn" or "John Smith - Software Engineer | LinkedIn"
        var titleMatch = pageTitle.match(/^([^|•\-\(]+)/);
        if (titleMatch) {
          var nameFromTitle = titleMatch[1].trim();
          if (nameFromTitle && 
              !nameFromTitle.toLowerCase().includes('linkedin') &&
              !nameFromTitle.toLowerCase().includes('profile') &&
              nameFromTitle.length > 2 &&
              nameFromTitle.length < 100) {
            personInfo.name = nameFromTitle;
            console.log("Found name from page title:", nameFromTitle);
          }
        }
      }
    }
    
    // Extract job title and company
    var titleElement = document.querySelector('.pv-text-details__sub-text') ||
                      document.querySelector('.text-body-medium.break-words') ||
                      document.querySelector('.pv-top-card--list .text-body-medium') ||
                      document.querySelector('[data-anonymize="job-title"]');
    
    if (titleElement) {
      var titleText = (titleElement.textContent || titleElement.innerText).trim();
      personInfo.title = titleText;
      
      // Try to extract company from title (usually after "at" or "•")
      var atMatch = titleText.match(/\bat\s+([^•\n]+)/i);
      var bulletMatch = titleText.match(/•\s*([^•\n]+)/);
      
      if (atMatch) {
        personInfo.company = atMatch[1].trim();
      } else if (bulletMatch) {
        personInfo.company = bulletMatch[1].trim();
      }
    }
    
    // Try alternative company selector
    if (!personInfo.company) {
      var companyElement = document.querySelector('.pv-text-details__company-name') ||
                          document.querySelector('[data-anonymize="company-name"]') ||
                          document.querySelector('.pv-entity__secondary-title');
      
      if (companyElement) {
        personInfo.company = (companyElement.textContent || companyElement.innerText).trim();
      }
    }
    
    // Extract location
    var locationElement = document.querySelector('.pv-text-details__location') ||
                         document.querySelector('[data-anonymize="location"]') ||
                         document.querySelector('.pv-top-card--list-bullet.pv-top-card--list-bullet--has-bullet');
    
    if (locationElement) {
      personInfo.location = (locationElement.textContent || locationElement.innerText).trim();
    }
    
    // Extract mutual connections info
    var mutualElement = document.querySelector('[data-control-name="topcard_view_mutual_connections"]') ||
                       document.querySelector('.pv-top-card-v2-ctas .link') ||
                       document.querySelector('.pv-top-card--list .link');
    
    if (mutualElement) {
      var mutualText = (mutualElement.textContent || mutualElement.innerText).trim();
      if (mutualText.toLowerCase().includes('mutual') || mutualText.includes('connection')) {
        personInfo.mutualConnections = mutualText;
      }
    }
    
    // Extract about/summary (first few lines)
    var aboutElement = document.querySelector('.pv-about__summary-text') ||
                      document.querySelector('[data-field="summary"]') ||
                      document.querySelector('.pv-about-section .pv-about__summary-text .lt-line-clamp__raw-line');
    
    if (aboutElement) {
      var aboutText = (aboutElement.textContent || aboutElement.innerText).trim();
      // Limit to first 200 characters to keep prompt reasonable
      if (aboutText.length > 200) {
        aboutText = aboutText.substring(0, 200) + '...';
      }
      personInfo.about = aboutText;
    }
    
    // Try to extract name from URL if still not found
    if (!personInfo.name) {
      var urlMatch = window.location.href.match(/\/in\/([^\/\?]+)/);
      if (urlMatch) {
        var urlSlug = urlMatch[1];
        // Skip if it's just numbers or too generic
        if (urlSlug && 
            !urlSlug.match(/^\d+$/) && 
            urlSlug.length > 3 && 
            urlSlug !== 'unknown' &&
            !urlSlug.includes('anonymous')) {
          // Convert URL slug to readable name (rough approximation)
          var nameFromUrl = urlSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          personInfo.name = nameFromUrl;
          console.log("Found name from URL:", nameFromUrl);
        }
      }
    }
    
    // Try alternative approaches for name extraction
    if (!personInfo.name) {
      // Look for meta tags
      var metaTitle = document.querySelector('meta[property="og:title"]');
      if (metaTitle) {
        var metaContent = metaTitle.getAttribute('content');
        if (metaContent) {
          var metaMatch = metaContent.match(/^([^|•\-\(]+)/);
          if (metaMatch) {
            var nameFromMeta = metaMatch[1].trim();
            if (nameFromMeta && 
                !nameFromMeta.toLowerCase().includes('linkedin') &&
                nameFromMeta.length > 2 &&
                nameFromMeta.length < 100) {
              personInfo.name = nameFromMeta;
              console.log("Found name from meta tag:", nameFromMeta);
            }
          }
        }
      }
    }
    
    // Last resort: look for any h1 that looks like a name
    if (!personInfo.name) {
      var allH1s = document.querySelectorAll('h1');
      for (var i = 0; i < allH1s.length; i++) {
        var h1Text = (allH1s[i].textContent || allH1s[i].innerText).trim();
        // Check if it looks like a name (contains spaces, reasonable length, no common UI words)
        if (h1Text && 
            h1Text.includes(' ') &&
            h1Text.length > 5 &&
            h1Text.length < 60 &&
            !h1Text.toLowerCase().includes('linkedin') &&
            !h1Text.toLowerCase().includes('profile') &&
            !h1Text.toLowerCase().includes('connect') &&
            !h1Text.toLowerCase().includes('message') &&
            !h1Text.toLowerCase().includes('follow') &&
            /^[a-zA-Z\s\.\-\']+$/.test(h1Text)) {
          personInfo.name = h1Text;
          console.log("Found name from generic h1:", h1Text);
          break;
        }
      }
    }
    
    console.log("Extracted person info:", personInfo);
    return personInfo;
    
  } catch (error) {
    console.error("Error extracting person info:", error);
    return personInfo; // Return empty object on error
  }
}

// Simple function to save sent message to history
function saveSentMessageToHistory(sentMessage) {
  debugLog("=== saveSentMessageToHistory called ===");
  debugLog("Sent message:", sentMessage);
  
  if (sentMessage && sentMessage.trim()) {
    var trimmedMessage = sentMessage.trim();
    debugLog("Saving sent message to history:", trimmedMessage);
    console.log("Saving sent message to history:", trimmedMessage);
    addToHistory(trimmedMessage, 'sent');
  } else {
    debugLog("No valid message to save to history");
    console.log("No valid message to save to history");
  }
}

// Enhanced send button detection with better message capturing
function setupSendButtonDetection() {
  debugLog("Setting up enhanced Send button detection...");
  
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
  
  // Look for Send button with multiple approaches
  var sendButton = null;
  
  // Try multiple selectors for the send button
  var sendButtonSelectors = [
    'button[aria-label*="Send"]',
    'button[aria-label*="send"]', 
    'button[data-control-name*="send"]',
    'button[data-control-name*="invite"]',
    'button[data-control-name*="connect"]',
    'button[type="submit"]',
    '.send-invite__actions button',
    '.artdeco-button--primary',
    'button.artdeco-button--primary'
  ];
  
  for (var i = 0; i < sendButtonSelectors.length; i++) {
    sendButton = linkedinModal.querySelector(sendButtonSelectors[i]);
    if (sendButton) {
      debugLog("Found send button using selector:", sendButtonSelectors[i]);
      break;
    }
  }
  
  // If not found by selectors, look by text content
  if (!sendButton) {
    var buttons = linkedinModal.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var buttonText = (buttons[i].textContent || buttons[i].innerText || '').trim().toLowerCase();
      if (buttonText === 'send' || 
          buttonText === 'send invitation' ||
          buttonText === 'send invite' ||
          buttonText === 'connect' ||
          buttonText.includes('send now')) {
        sendButton = buttons[i];
        debugLog("Found Send button by text content:", buttonText);
        break;
      }
    }
  }
  
  // Enhanced message capture function
  function captureAndSaveMessage() {
    debugLog("Attempting to capture message for history...");
    
    // Try multiple selectors for the message textarea
    var messageSelectors = [
      'textarea[name="message"]',
      'textarea[aria-label*="message"]',
      'textarea[placeholder*="message"]',
      'textarea',
      '[contenteditable="true"]',
      '.send-invite__custom-message textarea',
      '#custom-message',
      '[data-control-name="compose_message"] textarea'
    ];
    
    var textarea = null;
    var messageContent = '';
    
    for (var i = 0; i < messageSelectors.length; i++) {
      textarea = linkedinModal.querySelector(messageSelectors[i]);
      if (textarea) {
        debugLog("Found message input using selector:", messageSelectors[i]);
        
        if (textarea.tagName === 'TEXTAREA') {
          messageContent = textarea.value;
        } else {
          messageContent = textarea.textContent || textarea.innerText;
        }
        
        messageContent = messageContent.trim();
        if (messageContent && messageContent.length > 0) {
          debugLog("Captured message content:", messageContent);
          break;
        }
      }
    }
    
    if (messageContent && messageContent.length > 0) {
      debugLog("Saving message to history:", messageContent);
      saveSentMessageToHistory(messageContent);
      return true;
    } else {
      debugLog("No message content found to save to history");
      return false;
    }
  }
  
  if (sendButton) {
    debugLog("Send button found and setting up click listener:", sendButton);
    
    // Add click listener to Send button with enhanced detection
    var originalOnClick = sendButton.onclick;
    
    // Method 1: Direct click event listener
    sendButton.addEventListener('click', function(event) {
      debugLog("Send button clicked - Method 1 (addEventListener)");
      
      setTimeout(function() {
        captureAndSaveMessage();
        setTimeout(function() {
          hideUI();
        }, 1000);
      }, 100);
    }, true); // Use capture phase
    
    // Method 2: Override onclick
    sendButton.onclick = function(event) {
      debugLog("Send button clicked - Method 2 (onclick override)");
      
      setTimeout(function() {
        captureAndSaveMessage();
        setTimeout(function() {
          hideUI();
        }, 1000);
      }, 100);
      
      // Call original onclick if it existed
      if (originalOnClick) {
        return originalOnClick.call(this, event);
      }
    };
    
    // Method 3: Monitor form submission
    var form = sendButton.closest('form');
    if (form) {
      debugLog("Found form containing send button, adding submit listener");
      form.addEventListener('submit', function(event) {
        debugLog("Form submitted - Method 3 (form submit)");
        
        setTimeout(function() {
          captureAndSaveMessage();
          setTimeout(function() {
            hideUI();
          }, 1000);
        }, 100);
      }, true);
    }
    
    // Method 4: Mutation observer to detect modal changes
    var modalObserver = new MutationObserver(function(mutations) {
      var modalStillExists = document.body.contains(linkedinModal);
      if (!modalStillExists) {
        debugLog("Modal removed - Method 4 (mutation observer)");
        captureAndSaveMessage();
        hideUI();
        modalObserver.disconnect();
      }
    });
    
    modalObserver.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Method 5: Periodic check if modal is still visible
    var modalCheckInterval = setInterval(function() {
      var modalStillVisible = linkedinModal && 
                             document.body.contains(linkedinModal) && 
                             linkedinModal.offsetParent !== null;
      
      if (!modalStillVisible) {
        debugLog("Modal no longer visible - Method 5 (periodic check)");
        captureAndSaveMessage();
        hideUI();
        clearInterval(modalCheckInterval);
      }
    }, 2000);
    
    // Clean up interval after 2 minutes
    setTimeout(function() {
      clearInterval(modalCheckInterval);
    }, 120000);
    
  } else {
    debugLog("Send button not found - setting up fallback detection");
    
    // Fallback Method: Monitor for any button clicks in the modal
    linkedinModal.addEventListener('click', function(event) {
      var target = event.target;
      if (target && target.tagName === 'BUTTON') {
        var buttonText = (target.textContent || target.innerText || '').trim().toLowerCase();
        if (buttonText === 'send' || 
            buttonText === 'send invitation' ||
            buttonText === 'send invite' ||
            buttonText === 'connect' ||
            buttonText.includes('send now')) {
          
          debugLog("Detected send action via fallback click detection:", buttonText);
          
          setTimeout(function() {
            captureAndSaveMessage();
            setTimeout(function() {
              hideUI();
            }, 1000);
          }, 100);
        }
      }
    }, true);
    
    // Fallback: Detect modal removal
    setTimeout(function() {
      var checkModal = setInterval(function() {
        var currentModal = document.querySelector('artdeco-modal') || 
                          document.querySelector('[role="dialog"]');
        if (!currentModal || !document.body.contains(linkedinModal)) {
          debugLog("Modal disappeared - fallback detection");
          captureAndSaveMessage();
          hideUI();
          clearInterval(checkModal);
        }
      }, 2000);
      
      // Stop checking after 2 minutes
      setTimeout(function() {
        clearInterval(checkModal);
      }, 120000);
    }, 1000);
  }
  
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

// Manual test function for history
function testHistoryCapture() {
  debugLog("=== MANUAL HISTORY TEST ===");
  
  // Find modal
  var modal = document.querySelector('artdeco-modal') || 
             document.querySelector('[role="dialog"]');
  
  if (!modal) {
    debugLog("No modal found for history test");
    return;
  }
  
  debugLog("Modal found:", modal);
  
  // Find textarea
  var messageSelectors = [
    'textarea[name="message"]',
    'textarea[aria-label*="message"]',
    'textarea[placeholder*="message"]',
    'textarea',
    '[contenteditable="true"]'
  ];
  
  var textarea = null;
  var messageContent = '';
  
  for (var i = 0; i < messageSelectors.length; i++) {
    textarea = modal.querySelector(messageSelectors[i]);
    if (textarea) {
      debugLog("Found textarea using selector:", messageSelectors[i]);
      
      if (textarea.tagName === 'TEXTAREA') {
        messageContent = textarea.value;
      } else {
        messageContent = textarea.textContent || textarea.innerText;
      }
      
      messageContent = messageContent.trim();
      if (messageContent && messageContent.length > 0) {
        debugLog("Found message content:", messageContent);
        break;
      }
    }
  }
  
  if (messageContent) {
    debugLog("Testing history save with message:", messageContent);
    saveSentMessageToHistory(messageContent);
    debugLog("History save attempted");
  } else {
    debugLog("No message content found in any textarea");
  }
}

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
window.testHistoryCapture = testHistoryCapture;
window.testTextareaFocus = testTextareaFocus;
window.debugCurrentModals = debugCurrentModals;

// Add response tracking functionality
function initResponseTracking() {
  // Set up conversation monitoring
  setupConversationMonitoring();
  
  // Check for responses to previously sent messages
  checkForResponses();
}

function setupConversationMonitoring() {
  // Monitor for new messages in conversations
  const conversationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.querySelector) {
            // Check if this is a new message thread or conversation
            const messageElements = node.querySelectorAll('[data-test-id*="message"]') || 
                                   node.querySelectorAll('.msg-s-message-list-item') ||
                                   node.querySelectorAll('.message-item');
            
            if (messageElements.length > 0) {
              debugLog("New conversation activity detected, checking for responses...");
              setTimeout(checkForResponses, 2000);
            }
          }
        });
      }
    });
  });

  // Start observing messaging areas
  const messagingContainer = document.querySelector('[data-test-id="messaging-container"]') ||
                            document.querySelector('.messaging-container') ||
                            document.querySelector('.msg-overlay-bubble-header') ||
                            document.body;
  
  if (messagingContainer) {
    conversationObserver.observe(messagingContainer, { 
      childList: true, 
      subtree: true 
    });
    debugLog("Response tracking initialized - monitoring conversations");
  }
}

function checkForResponses() {
  // Get message history from storage
  chrome.storage.local.get(['messageHistory'], function(result) {
    const messageHistory = result.messageHistory || [];
    const unresponded = messageHistory.filter(msg => !msg.hasResponse);
    
    if (unresponded.length === 0) return;
    
    debugLog(`Checking for responses to ${unresponded.length} messages...`);
    
    // Check each unresponded message
    unresponded.forEach(function(messageData) {
      checkMessageForResponse(messageData);
    });
  });
}

function checkMessageForResponse(messageData) {
  // Try to find conversation with the person
  const personName = messageData.personInfo?.name;
  if (!personName) return;
  
  // Look for conversation elements
  const conversationElements = document.querySelectorAll('[data-test-id*="conversation"]') ||
                              document.querySelectorAll('.msg-conversation-listitem') ||
                              document.querySelectorAll('.conversation-item');
  
  conversationElements.forEach(function(element) {
    const elementText = element.textContent || '';
    if (elementText.toLowerCase().includes(personName.toLowerCase())) {
      // Found potential conversation, check for response indicators
      const hasNewMessage = element.querySelector('.msg-conversation-card__unread-count') ||
                           element.querySelector('[data-test-id*="unread"]') ||
                           element.classList.contains('unread');
      
      const lastActivity = element.querySelector('.msg-conversation-card__time-stamp') ||
                          element.querySelector('.time-stamp') ||
                          element.querySelector('[data-test-id*="timestamp"]');
      
      if (hasNewMessage || checkRecentActivity(lastActivity, messageData.timestamp)) {
        debugLog(`Potential response detected for message to ${personName}`);
        markMessageAsResponded(messageData.id);
        updateResponseAnalytics();
      }
    }
  });
}

function checkRecentActivity(timeElement, originalTimestamp) {
  if (!timeElement || !originalTimestamp) return false;
  
  const timeText = timeElement.textContent || '';
  const originalTime = new Date(originalTimestamp);
  const cutoffTime = new Date(originalTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after
  
  // Simple heuristic: if activity shows very recent time (minutes, hours) 
  // and it's after our message was sent
  if (timeText.includes('min') || timeText.includes('hour') || timeText.includes('now')) {
    return new Date() > originalTime;
  }
  
  return false;
}

function markMessageAsResponded(messageId) {
  chrome.storage.local.get(['messageHistory'], function(result) {
    const messageHistory = result.messageHistory || [];
    const updatedHistory = messageHistory.map(function(msg) {
      if (msg.id === messageId) {
        return { ...msg, hasResponse: true, responseDetectedAt: new Date().toISOString() };
      }
      return msg;
    });
    
    chrome.storage.local.set({ messageHistory: updatedHistory }, function() {
      debugLog(`Message ${messageId} marked as responded`);
      showSuccessFeedback("Response detected! 🎉");
    });
  });
}

function updateResponseAnalytics() {
  chrome.storage.local.get(['messageHistory', 'analytics'], function(result) {
    const messageHistory = result.messageHistory || [];
    const analytics = result.analytics || {};
    
    const totalSent = messageHistory.length;
    const totalResponded = messageHistory.filter(msg => msg.hasResponse).length;
    const responseRate = totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : 0;
    
    analytics.responseRate = responseRate;
    analytics.totalResponses = totalResponded;
    analytics.lastUpdated = new Date().toISOString();
    
    chrome.storage.local.set({ analytics: analytics }, function() {
      debugLog(`Analytics updated: ${responseRate}% response rate`);
    });
  });
}

// Add persona detection functionality
function detectPersonaFromProfile(personInfo) {
  const title = (personInfo.title || '').toLowerCase();
  const company = (personInfo.company || '').toLowerCase();
  const about = (personInfo.about || '').toLowerCase();
  
  // Combine all text for analysis
  const profileText = `${title} ${company} ${about}`.toLowerCase();
  
  // Recruiter indicators
  const recruiterKeywords = [
    'recruiter', 'recruiting', 'talent acquisition', 'talent partner', 'talent specialist',
    'people operations', 'people partner', 'hr', 'human resources', 'staffing',
    'head hunter', 'headhunter', 'sourcing', 'talent scout'
  ];
  
  // Engineering Manager indicators
  const engineeringManagerKeywords = [
    'engineering manager', 'engineering lead', 'tech lead', 'technical lead',
    'vp of engineering', 'vp engineering', 'head of engineering', 'engineering director',
    'director of engineering', 'principal engineer', 'staff engineer', 'team lead',
    'development manager', 'software manager', 'platform lead'
  ];
  
  // Founder indicators
  const founderKeywords = [
    'founder', 'co-founder', 'cofounder', 'ceo', 'chief executive', 'entrepreneur',
    'startup', 'owner', 'president', 'founding', 'creator', 'established'
  ];
  
  // Check for recruiter
  for (const keyword of recruiterKeywords) {
    if (profileText.includes(keyword)) {
      return 'recruiter';
    }
  }
  
  // Check for engineering manager
  for (const keyword of engineeringManagerKeywords) {
    if (profileText.includes(keyword)) {
      return 'engineering_manager';
    }
  }
  
  // Check for founder
  for (const keyword of founderKeywords) {
    if (profileText.includes(keyword)) {
      return 'founder';
    }
  }
  
  // Default to generic
  return 'generic';
}

// Generate persona-specific AI prompts
function createPersonaPrompt(persona, personInfo, messageType = 'connection') {
  const contextParts = [];
  
  if (personInfo.name) contextParts.push(`Name: ${personInfo.name}`);
  if (personInfo.title) contextParts.push(`Job title: ${personInfo.title}`);
  if (personInfo.company) contextParts.push(`Company: ${personInfo.company}`);
  if (personInfo.location) contextParts.push(`Location: ${personInfo.location}`);
  
  const context = contextParts.length > 0 ? `\n\nContext:\n${contextParts.join('\n')}` : '';
  
  let basePrompt = '';
  
  if (messageType === 'referral') {
    return createReferralPrompt(persona, personInfo);
  }
  
  switch (persona) {
    case 'recruiter':
      basePrompt = `Write a professional LinkedIn connection message to a recruiter. Focus on:
- Your background and what type of opportunities you're seeking
- Specific skills and experience that make you valuable
- Interest in learning about opportunities at their company
- Professional but personable tone
- 200-250 characters max

Make it clear you're a serious candidate worth their time.`;
      break;
      
    case 'engineering_manager':
      basePrompt = `Write a professional LinkedIn connection message to an Engineering Manager. Focus on:
- Your technical background and engineering experience
- Interest in their team, projects, or engineering culture
- Specific technologies or methodologies you share
- Potential for technical collaboration or mentorship
- Professional and respectful tone
- 200-250 characters max

Show genuine interest in their technical leadership and engineering approach.`;
      break;
      
    case 'founder':
      basePrompt = `Write a professional LinkedIn connection message to a startup founder/CEO. Focus on:
- Your entrepreneurial spirit or business acumen
- Interest in their company's mission and vision
- How you could potentially add value to their organization
- Admiration for what they've built
- Confident but respectful tone
- 200-250 characters max

Show you understand the challenges of building a company and respect their achievements.`;
      break;
      
    default:
      basePrompt = `Write a professional LinkedIn connection message. Focus on:
- Finding common ground or shared interests
- Professional background relevance
- Genuine interest in connecting
- Warm and approachable tone
- 200-250 characters max

Make it personalized and authentic.`;
  }
  
  return basePrompt + context + '\n\nUse this information to create a personalized, relevant message.';
}

// Generate referral request prompts
function createReferralPrompt(persona, personInfo) {
  const contextParts = [];
  
  if (personInfo.name) contextParts.push(`Name: ${personInfo.name}`);
  if (personInfo.title) contextParts.push(`Job title: ${personInfo.title}`);
  if (personInfo.company) contextParts.push(`Company: ${personInfo.company}`);
  
  const context = contextParts.length > 0 ? `\n\nContext:\n${contextParts.join('\n')}` : '';
  
  let basePrompt = '';
  
  switch (persona) {
    case 'recruiter':
      basePrompt = `Write a LinkedIn message asking a recruiter for a referral. Focus on:
- Brief introduction of your background
- Specific role or type of position you're interested in
- Why you're interested in their company
- Polite request for referral or introduction
- Offer to share resume or portfolio
- Professional and courteous tone
- 250-300 characters max

Make it clear you're a qualified candidate seeking a referral opportunity.`;
      break;
      
    case 'engineering_manager':
      basePrompt = `Write a LinkedIn message asking an Engineering Manager for a referral. Focus on:
- Your technical background and relevant experience
- Specific interest in their team or engineering organization
- Technologies or projects that align with their work
- Respectful request for referral consideration
- Offer to discuss your experience further
- Professional tone
- 250-300 characters max

Show you're a serious engineer interested in their team specifically.`;
      break;
      
    case 'founder':
      basePrompt = `Write a LinkedIn message asking a founder for a referral. Focus on:
- Your professional background and what you bring to the table
- Genuine interest in their company's mission
- How you could contribute to their organization
- Respectful request for referral consideration
- Admiration for what they've built
- Confident but humble tone
- 250-300 characters max

Show you understand their business and could be a valuable addition.`;
      break;
      
    default:
      basePrompt = `Write a LinkedIn message asking for a referral. Focus on:
- Brief professional introduction
- Interest in their company or industry
- Polite request for referral consideration
- How you might add value
- Professional and respectful tone
- 250-300 characters max

Make it personalized and show genuine interest.`;
  }
  
  return basePrompt + context + '\n\nUse this information to create a personalized referral request.';
}

