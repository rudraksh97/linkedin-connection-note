# LinkedIn AI Connection Note Helper

A secure Chrome extension that helps you generate personalized LinkedIn connection request messages using AI.

## Features

- **AI-Powered Suggestions**: Generate personalized connection messages in different tones (friendly, professional, polite, assertive, casual)
- **Smart Profile Analysis**: Automatically extracts profile information for contextual messages
- **Message Library**: Save frequently used messages for quick access
- **Send History**: Track messages you've actually sent (not just drafted)
- **Smart Positioning**: UI automatically positions itself next to LinkedIn connection modals
- **Secure API Key Management**: Safe local storage of your OpenAI API key with validation
- **Extension Popup**: Easy access to settings and saved messages via browser toolbar

## Recent Updates

### v0.3.0 - Security & Reliability Improvements 🔒

**SECURITY ENHANCEMENTS:**
- **Secure API Key Validation**: Enhanced validation for OpenAI API keys with format checking
- **Input Sanitization**: Improved input validation and sanitization for all user inputs
- **Secure ID Generation**: Better unique ID generation for saved messages and history
- **Production Logging**: Configurable debug logging (disabled by default for production)

**NEW FEATURES:**
- **Browser Popup**: Added extension popup for easy access to settings and message management
- **Duplicate Prevention**: Prevents saving duplicate messages to library
- **Message Length Limits**: Enforced character limits to prevent data issues
- **Improved Error Messages**: More helpful error messages with actionable guidance

**FIXES:**
- **Manifest Issues**: Fixed popup action configuration and CSS path references
- **Version Consistency**: Synchronized version numbers across all components

### v0.2.0 - Smart Profile Analysis & Personalization 🎯

**AI PERSONALIZATION:**
- **Auto-Detection**: Automatically extracts person's name, job title, company, location, and more
- **Smart Context**: AI uses profile information to generate highly personalized messages
- **Visual Feedback**: Shows detected profile info in the UI before generating suggestions
- **Contextual Messages**: References specific details like job title, company, mutual connections

**What Gets Extracted:**
- 👤 Name (from profile or URL)
- 💼 Job title and position
- 🏢 Company name
- 📍 Location
- 🤝 Mutual connections count
- 📝 About section summary

### v0.1.1 - Improved Reliability & History Management

**Fixed Issues:**
- **Textarea Responsiveness**: Fixed text container becoming unresponsive/stuck by improving event handler management
- **History Accuracy**: Now only tracks messages that are actually sent (when Send button is clicked), not just drafted
- **Deletable History**: Added delete functionality for history items

**Key Improvements:**
- Simplified source tracking - history just shows what was actually sent regardless of origin
- Better textarea handling with proper event listener management
- Added delete buttons (×) to history items for easy cleanup
- Removed redundant function calls that were causing UI conflicts
- Improved error handling and debugging

## Installation & Setup

### 1. Install the Extension
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder

### 2. Configure Your API Key
1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click the extension icon in Chrome's toolbar (or visit any LinkedIn profile)
3. Enter your API key when prompted (format: `sk-...`)
4. The key will be securely stored locally in your browser

### 3. Start Using
1. Navigate to any LinkedIn profile and click "Connect" → "Add a note"
2. The AI helper will automatically appear
3. Generate personalized messages based on the person's profile

## How It Works

1. **Setup**: Enter your OpenAI API key via the extension popup or when prompted
2. **Navigate**: Go to any LinkedIn profile and click "Connect" → "Add a note"
3. **Auto-Analysis**: The extension automatically extracts profile information (name, job, company, etc.)
4. **Customize**: Choose your preferred tone using the tone selection
5. **Generate**: Click "Generate AI Suggestions" to create personalized messages based on the profile
6. **Review**: See the detected profile info and generated suggestions
7. **Use**: Click "Use This Note" to insert the message into LinkedIn's textarea
8. **Edit**: Modify the message as needed before sending
9. **Track**: When you click LinkedIn's "Send" button, the actual sent message is saved to history

## Security Features

- **API Key Validation**: Validates OpenAI API key format before storage
- **Input Sanitization**: All user inputs are validated and sanitized
- **Local Storage Only**: Your API key and messages are stored only on your device
- **No External Tracking**: No data is sent to external servers except OpenAI for AI generation
- **Secure Communications**: All API calls use HTTPS with proper authentication

## Privacy & Data Protection

- ✅ **Local Storage**: All data stored locally in your browser
- ✅ **No External Servers**: No third-party data collection or storage
- ✅ **API Key Security**: Keys validated and stored securely
- ✅ **Input Validation**: All inputs sanitized to prevent security issues
- ✅ **Minimal Permissions**: Only requests necessary browser permissions

## Permissions Required

- **activeTab**: To interact with LinkedIn pages
- **storage**: To save your API key and messages locally
- **host_permissions**: To make secure API calls to OpenAI

## Troubleshooting

### Extension Not Appearing
- Ensure you're on LinkedIn (`linkedin.com`)
- Try refreshing the page
- Check that the extension is enabled in `chrome://extensions/`

### API Key Issues
- Verify your API key starts with `sk-` and is at least 20 characters
- Check you have available credits on your OpenAI account
- Try re-entering the key via the extension popup

### Connection Issues
- Check your internet connection
- Verify LinkedIn's modal is fully loaded
- Try disabling other LinkedIn-related extensions temporarily

## Development

### Debug Mode
To enable debug logging for development:
1. Open `content_script.js`
2. Change `const DEBUG_MODE = false;` to `const DEBUG_MODE = true;`
3. Reload the extension

### File Structure
```
linkedin-ai-helper/
├── manifest.json          # Extension configuration
├── background.js           # Service worker with API handling
├── content_script.js       # Main functionality on LinkedIn
├── css/style.css          # UI styling
├── ui/popup.html          # Extension popup interface
├── test-extraction.html   # Profile extraction testing
└── README.md              # This file
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with proper error handling
4. Test thoroughly on LinkedIn
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your OpenAI API key and credits
3. Try refreshing LinkedIn and reloading the extension
4. Report bugs with detailed steps to reproduce
