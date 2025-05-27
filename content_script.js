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
  container.style.zIndex = '999999'; // Higher z-index to appear above LinkedIn modal
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  
  // Ensure container doesn't block interaction with page elements
  container.style.pointerEvents = 'auto';
  container.style.isolation = 'auto'; // Remove isolation to prevent stacking context issues
  
  // Critical: Ensure the container doesn't interfere with focus flow
  container.setAttribute('data-focus-trap', 'false');
  container.style.contain = 'none'; // Prevent containment that could block focus
  
  container.addEventListener('mouseenter', function() {
    debugLog("Mouse entered extension container");
  });
  
  container.addEventListener('mouseleave', function() {
    debugLog("Mouse left extension container");
    // Ensure textarea remains interactive even when mouse leaves container
    var textarea = document.getElementById('custom-message-input');
    if (textarea) {
      textarea.style.pointerEvents = 'auto';
      textarea.disabled = false;
      textarea.readOnly = false;
    }
  });
  
    // Add unified content combining message library and AI functionality
  container.innerHTML = getTemplate('mainContainer');
  
  // Add container to page
  document.body.appendChild(container);
  
  // Set up unified interface functionality immediately
  try {
    setupUnifiedHandlers();
  } catch (error) {
    console.error('Error setting up unified handlers:', error);
    // Even if handler setup fails, the UI should still be visible and partially functional
  }
  
  // Multiple aggressive attempts to ensure textarea is immediately usable
  var activateTextarea = function() {
    var textarea = document.getElementById('custom-message-input');
    if (textarea) {
      textarea.style.pointerEvents = 'auto';
      textarea.style.cursor = 'text';
      textarea.style.userSelect = 'text';
      textarea.style.webkitUserSelect = 'text';
      textarea.style.mozUserSelect = 'text';
      textarea.style.msUserSelect = 'text';
      textarea.disabled = false;
      textarea.readOnly = false;
      textarea.tabIndex = 0;
      textarea.removeAttribute('disabled');
      textarea.removeAttribute('readonly');
      debugLog("Textarea immediately activated for user interaction");
    }
  };
  
  // Immediate activation
  activateTextarea();
  
  // Multiple delayed attempts
  setTimeout(activateTextarea, 10);
  setTimeout(activateTextarea, 50);
  setTimeout(activateTextarea, 100);
  setTimeout(activateTextarea, 250);
  setTimeout(activateTextarea, 500);
  
  debugLog("UI injected successfully");
  
  // Automatically run focus test and attempt focus with multiple delays
  var attemptFocus = function() {
    debugLog("Attempting focus on textarea...");
    var textarea = document.getElementById('custom-message-input');
    if (textarea) {
        // Ensure textarea is accessible before attempting to focus
        textarea.style.pointerEvents = 'auto';
        textarea.disabled = false;
        textarea.readOnly = false;
        textarea.tabIndex = 0;
        
        textarea.focus();
        
        if (document.activeElement === textarea) {
            debugLog("✅ Textarea focus successful after attempt!");
        } else {
            debugLog("❌ Textarea focus failed after attempt.");
        }
    }
  };
  
  setTimeout(attemptFocus, 100); // Initial attempt
  setTimeout(attemptFocus, 500); // Second attempt
  setTimeout(attemptFocus, 1500); // Third attempt (longer delay)
  setTimeout(attemptFocus, 3000); // Fourth attempt (even longer delay)
  
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
    var existingTextarea = document.getElementById('custom-message-input');
    var charCounter = document.getElementById('char-count');
    
    if (!existingTextarea) {
      debugLog("Textarea not found for setup");
      return;
    }
    
    // Only setup if not already setup (check for custom flag)
    if (existingTextarea.hasAttribute('data-handlers-setup')) {
      debugLog("Textarea handlers already setup");
      return;
    }
    
    debugLog("Setting up textarea handlers");
    
    // COMPLETELY RECREATE the textarea to avoid any inherited issues
    var textareaContainer = existingTextarea.parentNode;
    var currentValue = existingTextarea.value || '';
    
    // Create a brand new textarea element
    var textarea = document.createElement('textarea');
    textarea.id = 'custom-message-input';
    textarea.name = 'custom-message-input';
    textarea.placeholder = 'Write your message here or Give prompt';
    textarea.autocomplete = 'off';
    textarea.spellcheck = true;
    textarea.value = currentValue;
    
    // Set all properties programmatically to ensure they stick
    textarea.disabled = false;
    textarea.readOnly = false;
    textarea.tabIndex = 0;
    
    // Apply all styles programmatically
    textarea.style.cssText = `
      width: 100% !important;
      height: 140px !important;
      padding: 16px !important;
      border: 2px solid #e5e7eb !important;
      border-radius: 12px !important;
      resize: vertical !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      box-sizing: border-box !important;
      outline: none !important;
      transition: all 0.2s ease !important;
      background: #ffffff !important;
      color: #111827 !important;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
      cursor: text !important;
      user-select: text !important;
      pointer-events: auto !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      touch-action: manipulation !important;
      position: relative !important;
      z-index: 10 !important;
    `;
    
    // Replace the old textarea
    textareaContainer.replaceChild(textarea, existingTextarea);
    
    // Mark as setup
    textarea.setAttribute('data-handlers-setup', 'true');
    
    debugLog("Textarea recreated successfully");
    
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
    
    // Simple event handlers without complex manipulations
    textarea.addEventListener('focus', function() {
      debugLog("Textarea focused");
      this.style.borderColor = '#3b82f6';
      this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    });
    
    textarea.addEventListener('blur', function() {
      debugLog("Textarea blurred");
      this.style.borderColor = '#e5e7eb';
      this.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    });
    
    textarea.addEventListener('input', function() {
      debugLog("Textarea input detected:", this.value.length, "characters");
      updateCharCount();
    });
    
    textarea.addEventListener('click', function(e) {
      debugLog("Textarea clicked - should focus naturally");
    });
    
    textarea.addEventListener('keyup', function(e) {
      updateCharCount();
    });
    
    textarea.addEventListener('paste', function(e) {
      debugLog("Paste event detected");
      setTimeout(updateCharCount, 10);
    });
    
    // Initial character count
    updateCharCount();
    
    // Test immediate focus capability
    setTimeout(function() {
      debugLog("Testing immediate focus on recreated textarea");
      textarea.focus();
      if (document.activeElement === textarea) {
        debugLog("✅ Textarea focus successful!");
      } else {
        debugLog("❌ Textarea focus failed");
      }
      textarea.blur(); // Don't leave it focused
    }, 100);
    
    // EMERGENCY BACKUP: Create invisible click interceptor overlay
    var clickInterceptor = document.createElement('div');
    clickInterceptor.style.cssText = `
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 999998 !important; /* High z-index to be above LinkedIn modal but below main extension container */
      background: transparent !important;
      cursor: text !important;
      pointer-events: auto !important;
    `;
    
    clickInterceptor.addEventListener('click', function(e) {
      debugLog("Click interceptor activated - focusing textarea");
      e.preventDefault();
      e.stopPropagation();
      textarea.focus();
      
      // Position cursor where the user clicked
      var rect = textarea.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      
      // Try to set cursor position (best effort)
      try {
        var textLength = textarea.value.length;
        var clickRatio = y / rect.height;
        var estimatedPosition = Math.round(textLength * clickRatio);
        textarea.setSelectionRange(estimatedPosition, estimatedPosition);
      } catch (err) {
        // Fallback: just focus
        textarea.focus();
      }
    });
    
    // Add interceptor as a sibling to the textarea
    var textareaParent = textarea.parentNode;
    textareaParent.style.position = 'relative';
    textareaParent.appendChild(clickInterceptor);
    
    debugLog("Emergency click interceptor added");
    
    debugLog("Textarea setup completed - fresh element ready");
    
  } catch (error) {
    console.error('Error setting up textarea:', error);
  }
}

// Set up unified interface handlers
function setupUnifiedHandlers() {
  debugLog("Setting up unified handlers...");
  
  // Simplified focus management
  var container = document.getElementById('linkedin-ai-helper');
  if (container) {
    debugLog("Container found, setting up simple focus management");
    
    // Add a click handler to the container to help with focus restoration
    container.addEventListener('click', function(e) {
      var textarea = document.getElementById('custom-message-input');
      if (!textarea) return;
      
      // Check if the click was on a button or interactive element within the container
      // If not, attempt to focus the textarea
      var targetTagName = e.target.tagName;
      var isInteractive = targetTagName === 'BUTTON' || targetTagName === 'A' || targetTagName === 'INPUT' || targetTagName === 'SELECT' || targetTagName === 'TEXTAREA' || e.target.closest('button, a, input, select, textarea');
      
      if (!isInteractive) {
        debugLog("Click within non-interactive area of container, attempting to focus textarea");
        // Ensure textarea is accessible before attempting to focus
        textarea.style.pointerEvents = 'auto';
        textarea.disabled = false;
        textarea.readOnly = false;
        
        // Attempt focus with a slight delay
        setTimeout(function() {
          textarea.focus();
          debugLog("After delayed focus attempt, activeElement:", document.activeElement === textarea ? "TEXTAREA" : document.activeElement.tagName);

          // Optional: try to restore cursor position (best effort)
          var rect = textarea.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;
          try {
            var pos = getCursorPositionByCoords(textarea, x, y);
            if (pos !== -1) {
               textarea.setSelectionRange(pos, pos);
            }
          } catch (err) {
            debugLog("Could not set cursor position:", err);
          }
        }, 50); // 50ms delay
        
      } else {
        debugLog("Click on interactive element within container, not focusing textarea");
      }
    });
    
    // Simple global handler to ensure textarea is always clickable
    var ensureTextareaAccessible = function() {
      var textarea = document.getElementById('custom-message-input');
      if (textarea) {
        // Only fix if something is actually wrong
        if (textarea.disabled || textarea.readOnly || textarea.style.pointerEvents === 'none') {
          textarea.disabled = false;
          textarea.readOnly = false;
          textarea.style.pointerEvents = 'auto';
          textarea.style.cursor = 'text';
          debugLog("Textarea accessibility restored");
        }
      }
    };
    
    // Check accessibility on any page interaction
    document.addEventListener('click', ensureTextareaAccessible);
    document.addEventListener('focus', ensureTextareaAccessible, true);
    
    // Periodic check (less frequent)
    if (!window.textareaAccessibilityChecker) {
      window.textareaAccessibilityChecker = setInterval(ensureTextareaAccessible, 3000); // Every 3 seconds
      debugLog("Periodic accessibility checker started");
    }
  }
  
  // Set up tab switching
  try {
    var createTab = document.getElementById('tab-create');
    var savedTab = document.getElementById('tab-saved');
    
    if (createTab) {
      createTab.onclick = function() {
        try {
          switchMainTab('create');
          setupTextareaHandlers();
        } catch (error) {
          console.error('Error in create tab handler:', error);
        }
      };
    }
    
    if (savedTab) {
      savedTab.onclick = function() {
        try {
          switchMainTab('saved');
          loadCategoryPills();
          loadSavedMessages();
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
  
  // Setup textarea
  setTimeout(function() {
    try {
      setupTextareaHandlers();
      debugLog("Textarea setup completed");
    } catch (error) {
      console.error('Error in textarea setup:', error);
    }
  }, 100);
}

// Switch between main tabs
function switchMainTab(tab) {
  debugLog("Switching to tab:", tab);
  
  var createTab = document.getElementById('tab-create');
  var savedTab = document.getElementById('tab-saved');
  var createContent = document.getElementById('create-content');
  var savedContent = document.getElementById('saved-content');
  
  // Reset all tabs to inactive state
  if (createTab) {
    createTab.style.background = 'transparent';
    createTab.style.color = '#64748b';
    createTab.classList.remove('active');
  }
  if (savedTab) {
    savedTab.style.background = 'transparent';
    savedTab.style.color = '#64748b';
    savedTab.classList.remove('active');
  }
  
  // Hide all content
  if (createContent) createContent.style.display = 'none';
  if (savedContent) savedContent.style.display = 'none';
  
  // Show selected tab and content
  if (tab === 'create') {
    if (createTab) {
      createTab.style.background = '#ffffff';
      createTab.style.color = '#0f172a';
      createTab.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      createTab.classList.add('active');
    }
    if (createContent) createContent.style.display = 'block';
    debugLog("Create tab activated");
  } else if (tab === 'saved') {
    if (savedTab) {
      savedTab.style.background = '#ffffff';
      savedTab.style.color = '#0f172a';
      savedTab.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      savedTab.classList.add('active');
    }
    if (savedContent) savedContent.style.display = 'block';
    debugLog("Saved tab activated");
  }
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
  if (!pillsContainer) {
    debugLog("Category pills container not found");
    return;
  }
  
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    console.error('LinkedIn AI Helper: Chrome runtime not available, cannot load categories.');
    // Optionally display a message to the user
    pillsContainer.innerHTML = '<div style="color:#ef4444; font-size:12px;">Error loading categories: Extension context lost.</div>';
    return;
  }
  
  try {
    chrome.runtime.sendMessage({ action: 'getCategories' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('LinkedIn AI Helper: Chrome runtime error loading categories:', chrome.runtime.lastError);
        // Optionally display a message to the user
        if (pillsContainer) {
          pillsContainer.innerHTML = '<div style="color:#ef4444; font-size:12px;">Error loading categories: ' + chrome.runtime.lastError.message + '</div>';
        }
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
      } else {
        // Handle empty or invalid response
         if (pillsContainer) {
          pillsContainer.innerHTML = '<div style="color:#9ca3af; font-size:12px;">No categories found.</div>';
        }
      }
    });
  } catch (sendError) {
    console.error('LinkedIn AI Helper: Error sending message to background (getCategories):', sendError);
     if (pillsContainer) {
       pillsContainer.innerHTML = '<div style="color:#ef4444; font-size:12px;">Communication error.</div>';
     }
  }
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
    prompt = createConnectionRequestPrompt(existingText);
    debugLog("Using connection request prompt with user instructions:", existingText.substring(0, 50) + "...");
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
            
            // Show success message based on whether we used instructions or generated new
            var actionLabel = existingText && existingText.length > 0 ? 'created from your instructions' : 'generated';
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
  var apiKeyInput = document.getElementById('api-key-input');
  var ollamaUrlInput = document.getElementById('ollama-url-input');
  var ollamaModelSelect = document.getElementById('ollama-model-select');
  var saveBtn = document.getElementById('save-config-btn');
  var cancelBtn = document.getElementById('cancel-config-btn');
  var overlay = document.getElementById('api-key-overlay');
  var providerOpenAI = document.getElementById('provider-openai');
  var providerOllama = document.getElementById('provider-ollama');
  var openaiConfig = document.getElementById('openai-config');
  var ollamaConfig = document.getElementById('ollama-config');
  
  if (!saveBtn || !cancelBtn || !overlay || !providerOpenAI || !providerOllama) return;
  
  // Provider selection handlers
  function showProviderConfig() {
    if (providerOpenAI.checked) {
      openaiConfig.style.display = 'block';
      ollamaConfig.style.display = 'none';
      document.getElementById('provider-openai-label').style.borderColor = '#3b82f6';
      document.getElementById('provider-openai-label').style.backgroundColor = '#eff6ff';
      document.getElementById('provider-ollama-label').style.borderColor = '#e5e7eb';
      document.getElementById('provider-ollama-label').style.backgroundColor = 'white';
    } else if (providerOllama.checked) {
      openaiConfig.style.display = 'none';
      ollamaConfig.style.display = 'block';
      document.getElementById('provider-ollama-label').style.borderColor = '#3b82f6';
      document.getElementById('provider-ollama-label').style.backgroundColor = '#eff6ff';
      document.getElementById('provider-openai-label').style.borderColor = '#e5e7eb';
      document.getElementById('provider-openai-label').style.backgroundColor = 'white';
    }
  }
  
  providerOpenAI.onchange = showProviderConfig;
  providerOllama.onchange = showProviderConfig;
  
  // Load existing configuration
  if (chrome && chrome.runtime) {
    // Load provider
    chrome.runtime.sendMessage({ action: 'getProvider' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error loading provider:', chrome.runtime.lastError);
        return;
      }
      if (response && response.provider) {
        if (response.provider === 'ollama') {
          providerOllama.checked = true;
        } else {
          providerOpenAI.checked = true;
        }
        showProviderConfig();
      } else {
        providerOpenAI.checked = true;
        showProviderConfig();
      }
    });
    
    // Load OpenAI API key
    chrome.runtime.sendMessage({ action: 'getApiKey' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error loading API key:', chrome.runtime.lastError);
        return;
      }
      if (response && response.apiKey && apiKeyInput) {
        apiKeyInput.value = response.apiKey;
      }
    });
    
    // Load Ollama config
    chrome.runtime.sendMessage({ action: 'getOllamaConfig' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error loading Ollama config:', chrome.runtime.lastError);
        return;
      }
      if (response) {
        if (ollamaUrlInput) ollamaUrlInput.value = response.url || 'http://localhost:11434';
        if (ollamaModelSelect) ollamaModelSelect.value = response.model || 'llama3.2';
      }
    });
  }
  
  // Auto-setup Ollama button
  var autoSetupBtn = document.getElementById('auto-setup-ollama');
  if (autoSetupBtn) {
    autoSetupBtn.onclick = function() {
      startOllamaAutoSetup();
    };
  }

  // Test Ollama connection button
  var testOllamaBtn = document.getElementById('test-ollama-connection');
  if (testOllamaBtn) {
    testOllamaBtn.onclick = function() {
      var url = ollamaUrlInput ? ollamaUrlInput.value.trim() : 'http://localhost:11434';
      if (!url) {
        showOllamaTestResult('Please enter a server URL', 'error');
        return;
      }
      
      testOllamaBtn.disabled = true;
      testOllamaBtn.textContent = '🔄 Testing...';
      
      if (!chrome || !chrome.runtime) {
        testOllamaBtn.disabled = false;
        testOllamaBtn.textContent = '🔍 Test Connection';
        showOllamaTestResult('Extension context lost. Please reload the page.', 'error');
        return;
      }
      
      chrome.runtime.sendMessage({ action: 'testOllamaConnection', url: url }, function(response) {
        testOllamaBtn.disabled = false;
        testOllamaBtn.textContent = '🔍 Test Connection';
        
        if (chrome.runtime.lastError) {
          showOllamaTestResult('Extension error: ' + chrome.runtime.lastError.message, 'error');
          return;
        }
        
        if (response && response.success) {
          var modelCount = response.models ? response.models.length : 0;
          showOllamaTestResult(`✅ Connected! Found ${modelCount} models available.`, 'success');
          
          // Update model dropdown with available models
          if (response.models && response.models.length > 0 && ollamaModelSelect) {
            updateModelDropdown(response.models);
          }
        } else {
          var errorMsg = response && response.error ? response.error : 'Unknown error';
          showOllamaTestResult('❌ ' + errorMsg, 'error');
        }
      });
    };
  }

  // Save configuration button
  saveBtn.onclick = function() {
    var selectedProvider = providerOpenAI.checked ? 'openai' : 'ollama';
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    if (!chrome || !chrome.runtime) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Continue';
      showLeftPanelFeedback('Extension context lost. Please reload the page.', 'error');
      return;
    }
    
    if (selectedProvider === 'openai') {
      var apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
      if (!apiKey) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save & Continue';
        showLeftPanelFeedback('Please enter an OpenAI API key', 'error');
        return;
      }
      
      if (!apiKey.startsWith('sk-')) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save & Continue';
        showLeftPanelFeedback('API key should start with "sk-"', 'error');
        return;
      }
      
      // Save OpenAI configuration
      chrome.runtime.sendMessage({ action: 'saveProvider', provider: 'openai' }, function(response) {
        if (chrome.runtime.lastError || !response || !response.success) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save & Continue';
          showLeftPanelFeedback('Failed to save provider. Please try again.', 'error');
          return;
        }
        
        chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey: apiKey }, function(response) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save & Continue';
          
          if (chrome.runtime.lastError || !response || !response.success) {
            showLeftPanelFeedback('Failed to save API key. Please try again.', 'error');
            return;
          }
          
          showLeftPanelFeedback('OpenAI configuration saved successfully!', 'success');
          overlay.remove();
        });
      });
    } else {
      // Save Ollama configuration
      var ollamaUrl = ollamaUrlInput ? ollamaUrlInput.value.trim() : 'http://localhost:11434';
      var ollamaModel = ollamaModelSelect ? ollamaModelSelect.value : 'llama3.2';
      
      if (!ollamaUrl) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save & Continue';
        showLeftPanelFeedback('Please enter Ollama server URL', 'error');
        return;
      }
      
      chrome.runtime.sendMessage({ action: 'saveProvider', provider: 'ollama' }, function(response) {
        if (chrome.runtime.lastError || !response || !response.success) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save & Continue';
          showLeftPanelFeedback('Failed to save provider. Please try again.', 'error');
          return;
        }
        
        chrome.runtime.sendMessage({ action: 'saveOllamaConfig', url: ollamaUrl, model: ollamaModel }, function(response) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save & Continue';
          
          if (chrome.runtime.lastError || !response || !response.success) {
            showLeftPanelFeedback('Failed to save Ollama configuration. Please try again.', 'error');
            return;
          }
          
          showLeftPanelFeedback('Ollama configuration saved successfully!', 'success');
          overlay.remove();
        });
      });
    }
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
  
  // Ensure inputs are clickable and focusable
  if (apiKeyInput) {
    apiKeyInput.style.pointerEvents = 'auto';
    apiKeyInput.style.cursor = 'text';
    apiKeyInput.style.userSelect = 'text';
    
    apiKeyInput.onclick = function() {
      this.focus();
    };
    
    apiKeyInput.onfocus = function() {
      this.style.borderColor = '#0077b5';
      this.style.boxShadow = '0 0 0 2px rgba(0, 119, 181, 0.2)';
    };
    
    apiKeyInput.onblur = function() {
      this.style.borderColor = '#d1d5db';
      this.style.boxShadow = 'none';
    };
    
    apiKeyInput.onkeypress = function(e) {
      if (e.key === 'Enter') {
        saveBtn.click();
      }
    };
  }
  
  if (ollamaUrlInput) {
    ollamaUrlInput.style.pointerEvents = 'auto';
    ollamaUrlInput.style.cursor = 'text';
    ollamaUrlInput.style.userSelect = 'text';
    
    ollamaUrlInput.onclick = function() {
      this.focus();
    };
    
    ollamaUrlInput.onfocus = function() {
      this.style.borderColor = '#0077b5';
      this.style.boxShadow = '0 0 0 2px rgba(0, 119, 181, 0.2)';
    };
    
    ollamaUrlInput.onblur = function() {
      this.style.borderColor = '#d1d5db';
      this.style.boxShadow = 'none';
    };
    
    ollamaUrlInput.onkeypress = function(e) {
      if (e.key === 'Enter') {
        saveBtn.click();
      }
    };
  }
  
  // Focus appropriate input with a small delay to ensure it's rendered
  setTimeout(function() {
    if (providerOpenAI.checked && apiKeyInput) {
      apiKeyInput.focus();
      apiKeyInput.select();
    } else if (providerOllama.checked && ollamaUrlInput) {
      ollamaUrlInput.focus();
      ollamaUrlInput.select();
    }
  }, 100);
}

// Show Ollama test result
function showOllamaTestResult(message, type) {
  var resultDiv = document.getElementById('ollama-test-result');
  if (!resultDiv) return;
  
  resultDiv.style.display = 'block';
  resultDiv.style.color = type === 'success' ? '#10b981' : '#ef4444';
  resultDiv.style.backgroundColor = type === 'success' ? '#d1fae5' : '#fee2e2';
  resultDiv.style.padding = '8px 12px';
  resultDiv.style.borderRadius = '6px';
  resultDiv.style.border = '1px solid ' + (type === 'success' ? '#a7f3d0' : '#fecaca');
  resultDiv.textContent = message;
  
  // Auto-hide after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(function() {
      if (resultDiv) {
        resultDiv.style.display = 'none';
      }
    }, 5000);
  }
}

// Update model dropdown with available models
function updateModelDropdown(models) {
  var modelSelect = document.getElementById('ollama-model-select');
  if (!modelSelect || !models || models.length === 0) return;
  
  // Store current selection
  var currentValue = modelSelect.value;
  
  // Clear existing options
  modelSelect.innerHTML = '';
  
  // Add available models
  models.forEach(function(model) {
    var option = document.createElement('option');
    option.value = model.name;
    option.textContent = model.name + (model.size ? ' (' + formatBytes(model.size) + ')' : '');
    modelSelect.appendChild(option);
  });
  
  // Restore selection if it still exists
  if (currentValue) {
    var foundOption = Array.from(modelSelect.options).find(opt => opt.value === currentValue);
    if (foundOption) {
      modelSelect.value = currentValue;
    }
  }
  
  // If no selection or selection not found, select first option
  if (!modelSelect.value && modelSelect.options.length > 0) {
    modelSelect.value = modelSelect.options[0].value;
  }
}

// Format bytes to human readable format
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  var k = 1024;
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Auto-setup Ollama with guided installation
function startOllamaAutoSetup() {
  var setupBtn = document.getElementById('auto-setup-ollama');
  var progressDiv = document.getElementById('setup-progress');
  var progressBar = document.getElementById('progress-bar');
  var statusText = document.getElementById('setup-status');
  
  if (!setupBtn || !progressDiv || !progressBar || !statusText) return;
  
  // Show progress and disable button
  setupBtn.disabled = true;
  setupBtn.textContent = '⏳ Setting up...';
  progressDiv.style.display = 'block';
  
  // Step 1: Detect operating system
  updateSetupProgress(10, 'Detecting your operating system...');
  
  setTimeout(function() {
    var os = detectOperatingSystem();
    updateSetupProgress(20, 'Detected: ' + os);
    
    setTimeout(function() {
      // Step 2: Check if Ollama is already installed
      updateSetupProgress(30, 'Checking for existing Ollama installation...');
      
      setTimeout(function() {
        checkOllamaInstallation(function(isInstalled) {
          if (isInstalled) {
            updateSetupProgress(60, 'Ollama found! Checking for models...');
            setTimeout(function() {
              checkAndSetupModels();
            }, 1000);
          } else {
            updateSetupProgress(40, 'Ollama not found. Opening installation guide...');
            setTimeout(function() {
              openInstallationGuide(os);
            }, 1000);
          }
        });
      }, 1000);
    }, 1000);
  }, 1000);
}

// Update setup progress
function updateSetupProgress(percentage, status) {
  var progressBar = document.getElementById('progress-bar');
  var statusText = document.getElementById('setup-status');
  
  if (progressBar) progressBar.style.width = percentage + '%';
  if (statusText) statusText.textContent = status;
}

// Detect operating system
function detectOperatingSystem() {
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('win') !== -1) return 'Windows';
  if (userAgent.indexOf('mac') !== -1) return 'macOS';
  if (userAgent.indexOf('linux') !== -1) return 'Linux';
  return 'Unknown';
}

// Check if Ollama is already installed
function checkOllamaInstallation(callback) {
  if (!chrome || !chrome.runtime) {
    callback(false);
    return;
  }
  
  chrome.runtime.sendMessage({ 
    action: 'testOllamaConnection', 
    url: 'http://localhost:11434' 
  }, function(response) {
    if (chrome.runtime.lastError) {
      callback(false);
      return;
    }
    callback(response && response.success);
  });
}

// Check and setup models
function checkAndSetupModels() {
  chrome.runtime.sendMessage({ 
    action: 'testOllamaConnection', 
    url: 'http://localhost:11434' 
  }, function(response) {
    if (chrome.runtime.lastError || !response || !response.success) {
      updateSetupProgress(70, 'Ollama server not running. Please start it manually.');
      setTimeout(function() {
        showOllamaStartInstructions();
      }, 2000);
      return;
    }
    
    var models = response.models || [];
    var hasRecommendedModel = models.some(function(model) {
      return model.name.includes('llama3.2') || model.name.includes('llama3.1');
    });
    
    if (hasRecommendedModel) {
      updateSetupProgress(100, '✅ Setup complete! Ollama is ready to use.');
      setTimeout(function() {
        completeAutoSetup(true);
      }, 1500);
    } else {
      updateSetupProgress(80, 'Installing recommended model...');
      setTimeout(function() {
        showModelInstallInstructions();
      }, 1000);
    }
  });
}

// Open installation guide based on OS
function openInstallationGuide(os) {
  var instructions = getInstallationInstructions(os);
  updateSetupProgress(50, 'Opening installation guide...');
  
  // Create a modal with installation instructions
  var modal = createInstallationModal(os, instructions);
  document.body.appendChild(modal);
  
  setTimeout(function() {
    updateSetupProgress(60, 'Follow the installation guide, then click "Check Again"');
  }, 1000);
}

// Get OS-specific installation instructions
function getInstallationInstructions(os) {
  switch (os) {
    case 'Windows':
      return {
        title: 'Install Ollama on Windows',
        steps: [
          'Download Ollama for Windows from ollama.ai',
          'Run the installer (OllamaSetup.exe)',
          'Follow the installation wizard',
          'Ollama will start automatically after installation'
        ],
        downloadUrl: 'https://ollama.ai/download/windows',
        commands: [
          'After installation, open Command Prompt and run:',
          'ollama pull llama3.2'
        ]
      };
    case 'macOS':
      return {
        title: 'Install Ollama on macOS',
        steps: [
          'Download Ollama for macOS from ollama.ai',
          'Open the downloaded .zip file',
          'Drag Ollama to your Applications folder',
          'Open Ollama from Applications'
        ],
        downloadUrl: 'https://ollama.ai/download/mac',
        commands: [
          'After installation, open Terminal and run:',
          'ollama pull llama3.2'
        ]
      };
    case 'Linux':
      return {
        title: 'Install Ollama on Linux',
        steps: [
          'Open Terminal',
          'Run the installation command below',
          'Wait for installation to complete',
          'Ollama will start automatically'
        ],
        downloadUrl: 'https://ollama.ai/download/linux',
        commands: [
          'curl -fsSL https://ollama.ai/install.sh | sh',
          'ollama pull llama3.2'
        ]
      };
    default:
      return {
        title: 'Install Ollama',
        steps: [
          'Visit ollama.ai',
          'Download the version for your operating system',
          'Follow the installation instructions',
          'Start Ollama after installation'
        ],
        downloadUrl: 'https://ollama.ai',
        commands: [
          'After installation, run:',
          'ollama pull llama3.2'
        ]
      };
  }
}

// Create installation modal
function createInstallationModal(os, instructions) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 
    'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); ' +
    'z-index:30000; display:flex; align-items:center; justify-content:center;';
  
  var modal = document.createElement('div');
  modal.style.cssText = 
    'background:white; padding:32px; border-radius:16px; max-width:500px; width:90%; ' +
    'box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25); max-height:80vh; overflow-y:auto;';
  
  modal.innerHTML = `
    <div style="text-align:center; margin-bottom:24px;">
      <div style="width:64px; height:64px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius:16px; margin:0 auto 16px auto; display:flex; align-items:center; justify-content:center; font-size:28px;">🚀</div>
      <h3 style="margin:0 0 8px 0; color:#111827; font-size:20px; font-weight:700;">${instructions.title}</h3>
      <p style="margin:0; color:#6b7280; font-size:14px;">Follow these steps to install Ollama</p>
    </div>
    
    <div style="margin-bottom:24px;">
      <h4 style="margin:0 0 12px 0; color:#374151; font-size:16px; font-weight:600;">Installation Steps:</h4>
      <ol style="margin:0; padding-left:20px; color:#374151; font-size:14px; line-height:1.6;">
        ${instructions.steps.map(step => `<li style="margin-bottom:8px;">${step}</li>`).join('')}
      </ol>
    </div>
    
    <div style="margin-bottom:24px;">
      <h4 style="margin:0 0 12px 0; color:#374151; font-size:16px; font-weight:600;">Commands to Run:</h4>
      <div style="background:#f8fafc; padding:12px; border-radius:8px; border-left:4px solid #3b82f6;">
        ${instructions.commands.map(cmd => 
          cmd.startsWith('curl') || cmd.startsWith('ollama') ? 
            `<code style="display:block; background:#e5e7eb; padding:8px; border-radius:4px; margin:4px 0; font-family:monospace; font-size:12px;">${cmd}</code>` :
            `<p style="margin:4px 0; font-size:12px; color:#374151;">${cmd}</p>`
        ).join('')}
      </div>
    </div>
    
    <div style="display:flex; gap:12px;">
      <button id="download-ollama" style="flex:1; padding:14px 20px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color:white; border:none; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600;">
        📥 Download Ollama
      </button>
      <button id="check-again" style="flex:1; padding:14px 20px; background:#10b981; color:white; border:none; border-radius:12px; cursor:pointer; font-size:14px; font-weight:600;">
        🔄 Check Again
      </button>
    </div>
    
    <button id="close-modal" style="position:absolute; top:16px; right:16px; background:none; border:none; font-size:24px; cursor:pointer; color:#6b7280;">×</button>
  `;
  
  overlay.appendChild(modal);
  
  // Set up event handlers
  setTimeout(function() {
    var downloadBtn = modal.querySelector('#download-ollama');
    var checkBtn = modal.querySelector('#check-again');
    var closeBtn = modal.querySelector('#close-modal');
    
    if (downloadBtn) {
      downloadBtn.onclick = function() {
        window.open(instructions.downloadUrl, '_blank');
      };
    }
    
    if (checkBtn) {
      checkBtn.onclick = function() {
        overlay.remove();
        updateSetupProgress(60, 'Checking for Ollama installation...');
        setTimeout(function() {
          checkOllamaInstallation(function(isInstalled) {
            if (isInstalled) {
              updateSetupProgress(80, 'Ollama found! Checking models...');
              setTimeout(checkAndSetupModels, 1000);
            } else {
              updateSetupProgress(50, 'Ollama not found. Please complete installation first.');
              setTimeout(function() {
                resetAutoSetup();
              }, 3000);
            }
          });
        }, 1000);
      };
    }
    
    if (closeBtn) {
      closeBtn.onclick = function() {
        overlay.remove();
        resetAutoSetup();
      };
    }
    
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        overlay.remove();
        resetAutoSetup();
      }
    };
  }, 100);
  
  return overlay;
}

// Show model installation instructions
function showModelInstallInstructions() {
  updateSetupProgress(90, 'Opening model installation guide...');
  
  var modal = document.createElement('div');
  modal.style.cssText = 
    'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); ' +
    'background:white; padding:24px; border-radius:12px; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25); ' +
    'z-index:30000; max-width:400px; width:90%;';
  
  modal.innerHTML = `
    <h3 style="margin:0 0 16px 0; color:#111827; font-size:18px; font-weight:700;">Install AI Model</h3>
    <p style="margin:0 0 16px 0; color:#374151; font-size:14px;">Run this command in your terminal:</p>
    <code style="display:block; background:#f8fafc; padding:12px; border-radius:8px; font-family:monospace; font-size:13px; border-left:4px solid #3b82f6;">ollama pull llama3.2</code>
    <div style="display:flex; gap:12px; margin-top:20px;">
      <button id="model-done" style="flex:1; padding:12px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Done</button>
      <button id="model-close" style="flex:1; padding:12px; background:#6b7280; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Cancel</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(function() {
    var doneBtn = modal.querySelector('#model-done');
    var closeBtn = modal.querySelector('#model-close');
    
    if (doneBtn) {
      doneBtn.onclick = function() {
        modal.remove();
        updateSetupProgress(95, 'Verifying model installation...');
        setTimeout(function() {
          checkAndSetupModels();
        }, 1000);
      };
    }
    
    if (closeBtn) {
      closeBtn.onclick = function() {
        modal.remove();
        resetAutoSetup();
      };
    }
  }, 100);
}

// Show Ollama start instructions
function showOllamaStartInstructions() {
  var modal = document.createElement('div');
  modal.style.cssText = 
    'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); ' +
    'background:white; padding:24px; border-radius:12px; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25); ' +
    'z-index:30000; max-width:400px; width:90%;';
  
  modal.innerHTML = `
    <h3 style="margin:0 0 16px 0; color:#111827; font-size:18px; font-weight:700;">Start Ollama Server</h3>
    <p style="margin:0 0 16px 0; color:#374151; font-size:14px;">Run this command in your terminal:</p>
    <code style="display:block; background:#f8fafc; padding:12px; border-radius:8px; font-family:monospace; font-size:13px; border-left:4px solid #3b82f6;">ollama serve</code>
    <p style="margin:12px 0 0 0; color:#6b7280; font-size:12px;">Keep this terminal window open while using the extension.</p>
    <div style="display:flex; gap:12px; margin-top:20px;">
      <button id="server-done" style="flex:1; padding:12px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Server Started</button>
      <button id="server-close" style="flex:1; padding:12px; background:#6b7280; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">Cancel</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(function() {
    var doneBtn = modal.querySelector('#server-done');
    var closeBtn = modal.querySelector('#server-close');
    
    if (doneBtn) {
      doneBtn.onclick = function() {
        modal.remove();
        updateSetupProgress(80, 'Checking server connection...');
        setTimeout(function() {
          checkAndSetupModels();
        }, 1000);
      };
    }
    
    if (closeBtn) {
      closeBtn.onclick = function() {
        modal.remove();
        resetAutoSetup();
      };
    }
  }, 100);
}

// Complete auto setup
function completeAutoSetup(success) {
  var setupBtn = document.getElementById('auto-setup-ollama');
  var progressDiv = document.getElementById('setup-progress');
  
  if (success) {
    if (setupBtn) {
      setupBtn.textContent = '✅ Setup Complete';
      setupBtn.style.background = '#10b981';
    }
    
    // Auto-populate Ollama configuration
    var ollamaUrlInput = document.getElementById('ollama-url-input');
    var ollamaModelSelect = document.getElementById('ollama-model-select');
    
    if (ollamaUrlInput) ollamaUrlInput.value = 'http://localhost:11434';
    if (ollamaModelSelect) ollamaModelSelect.value = 'llama3.2';
    
    setTimeout(function() {
      if (progressDiv) progressDiv.style.display = 'none';
      resetAutoSetup();
    }, 3000);
  } else {
    resetAutoSetup();
  }
}

// Reset auto setup button
function resetAutoSetup() {
  var setupBtn = document.getElementById('auto-setup-ollama');
  var progressDiv = document.getElementById('setup-progress');
  
  if (setupBtn) {
    setupBtn.disabled = false;
    setupBtn.textContent = '🚀 Auto-Setup Ollama';
    setupBtn.style.background = '#3b82f6';
  }
  
  if (progressDiv) {
    progressDiv.style.display = 'none';
  }
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
    console.log("No textarea found!");
    return;
  }
  
  debugLog("Textarea found:", textarea);
  console.log("Textarea found:", textarea);
  
  debugLog("Textarea current state:");
  console.log("Textarea current state:");
  console.log("- pointerEvents:", textarea.style.pointerEvents);
  console.log("- cursor:", textarea.style.cursor);
  console.log("- userSelect:", textarea.style.userSelect);
  console.log("- disabled:", textarea.disabled);
  console.log("- readonly:", textarea.readOnly);
  console.log("- tabIndex:", textarea.tabIndex);
  console.log("- display:", window.getComputedStyle(textarea).display);
  console.log("- visibility:", window.getComputedStyle(textarea).visibility);
  console.log("- offsetParent:", textarea.offsetParent);
  
  // Force fix any issues
  textarea.style.pointerEvents = 'auto';
  textarea.style.cursor = 'text';
  textarea.style.userSelect = 'text';
  textarea.disabled = false;
  textarea.readOnly = false;
  textarea.tabIndex = 0;
  textarea.removeAttribute('disabled');
  textarea.removeAttribute('readonly');
  
  debugLog("Textarea state after forced fixes:");
  console.log("Textarea state after forced fixes:");
  console.log("- pointerEvents:", textarea.style.pointerEvents);
  console.log("- disabled:", textarea.disabled);
  console.log("- readonly:", textarea.readOnly);
  
  debugLog("Testing focus programmatically...");
  console.log("Testing focus programmatically...");
  textarea.focus();
  
  setTimeout(function() {
    debugLog("After focus - activeElement:", document.activeElement === textarea ? "TEXTAREA" : document.activeElement.tagName);
    console.log("After focus - activeElement:", document.activeElement === textarea ? "TEXTAREA" : document.activeElement.tagName);
    
    debugLog("Testing click simulation...");
    console.log("Testing click simulation...");
    var clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    textarea.dispatchEvent(clickEvent);
    
    setTimeout(function() {
      debugLog("After click simulation - activeElement:", document.activeElement === textarea ? "TEXTAREA" : document.activeElement.tagName);
      console.log("After click simulation - activeElement:", document.activeElement === textarea ? "TEXTAREA" : document.activeElement.tagName);
      
      debugLog("Test completed - try clicking the textarea now");
      console.log("Test completed - try clicking the textarea now");
    }, 100);
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





// Create connection request prompt based on user instructions
function createConnectionRequestPrompt(userInstructions) {
  var basePrompt = `Write a professional LinkedIn connection request message based on these instructions: "${userInstructions}"

Create a LinkedIn connection message that:
- Incorporates the user's specific instructions and requirements
- Sounds professional, engaging, and compelling
- Is likely to get a positive response
- Follows LinkedIn connection etiquette
- Is 200-250 characters max
- Is concise but impactful

Return only the connection request message, no explanations.`;
  
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

// Set up message creation handlers
function setupMessageCreationHandlers() {
  debugLog("Setting up message creation handlers...");
  
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
          } else {
            showLeftPanelFeedback('Please enter a message first', 'error');
          }
        } catch (error) {
          console.error('Error in save button handler:', error);
        }
      };
      
      // Add hover effect
      saveBtn.onmouseover = function() {
        this.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 6px 20px -6px rgba(16, 185, 129, 0.4)';
      };
      saveBtn.onmouseout = function() {
        this.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
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
          } else {
            showLeftPanelFeedback('Please enter a message first', 'error');
          }
        } catch (error) {
          console.error('Error in use button handler:', error);
        }
      };
      
      // Add hover effect
      useBtn.onmouseover = function() {
        this.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
        this.style.transform = 'translateY(-1px)';
        this.style.boxShadow = '0 6px 20px -6px rgba(139, 92, 246, 0.4)';
      };
      useBtn.onmouseout = function() {
        this.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
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
            // Update character count
            var charCounter = document.getElementById('char-count');
            if (charCounter) {
              charCounter.textContent = '0';
              charCounter.style.color = '#9ca3af';
              charCounter.style.fontWeight = '500';
            }
          }
        } catch (error) {
          console.error('Error in clear button handler:', error);
        }
      };
      
      // Add hover effect
      clearBtn.onmouseover = function() {
        this.style.background = '#4b5563';
        this.style.transform = 'scale(1.05)';
      };
      clearBtn.onmouseout = function() {
        this.style.background = '#64748b';
        this.style.transform = 'scale(1)';
      };
    }
  } catch (error) {
    console.error('Error setting up clear button:', error);
  }
  
  debugLog("Message creation handlers setup completed");
}

// Switch between tabs (legacy function - only supports saved)



