# Invitation Notepad

A LinkedIn Chrome extension that helps you craft professional connection request messages using AI assistance and organize them with a comprehensive message library system.

## Features

### 🤖 AI-Powered Message Creation
- **Write with AI**: Generate professional LinkedIn connection messages using OpenAI's GPT-3.5
- **Instruction-Based Generation**: Provide instructions like "mention my startup experience" and get a tailored connection message
- **Text Improvement**: AI automatically frames any text as a proper LinkedIn connection request
- **Smart Prompts**: Context-aware prompts for different professional scenarios

### 📁 Message Library & Organization
- **Save Messages**: Build a personal library of connection messages
- **Category System**: Organize messages with categories (General, Referral, or custom categories)
- **Category Filtering**: Filter saved messages by category using visual pills
- **Category Management**: Create, change, and manage categories with an intuitive interface
- **Duplicate Prevention**: Automatic detection and prevention of duplicate messages within categories

### 💼 Professional Integration
- **LinkedIn ToS Compliant**: No profile data extraction or scraping
- **Modal Integration**: Seamlessly integrates with LinkedIn's connection request modals
- **Auto-Insert**: One-click insertion of messages into LinkedIn's message field
- **Character Limits**: Respects LinkedIn's character limits (200-250 characters)

### 🎨 Modern Interface
- **Clean Design**: Modern, intuitive interface with pill-based navigation
- **Responsive Layout**: Adapts to different screen sizes and positions
- **Visual Feedback**: Clear success/error messages and loading states
- **Hover Effects**: Interactive elements with smooth animations

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
6. The extension will prompt you to enter your API key on first use

## Usage

### Getting Started
1. Navigate to LinkedIn and click "Connect" on any profile
2. When the connection modal opens, the Invitation Notepad will appear
3. Enter your OpenAI API key when prompted (stored securely in your browser)

### Creating Messages
1. **AI Generation**: Click "🤖 Write with AI" to generate a professional message
2. **Custom Instructions**: Type instructions like "mention my background in marketing" and click "🤖 Write with AI"
3. **Manual Writing**: Type your message directly in the textarea
4. **Save**: Click "💾 Save" to add messages to your library with category selection
5. **Use**: Click "✉️ Use" to insert the message into LinkedIn's field

### Managing Your Library
1. **Switch to Saved Tab**: Click the "Saved" tab to view your message library
2. **Filter by Category**: Use category pills to filter messages
3. **Change Categories**: Click the "✏️" button on any message to change its category
4. **Delete Messages**: Click the "×" button to remove messages
5. **Create Categories**: Use "➕ New Category" when saving or changing categories

## Technical Details

### Architecture
- **Content Script**: Handles UI injection and LinkedIn integration
- **Background Script**: Manages OpenAI API calls and data storage
- **Template System**: Modular HTML templates for consistent UI
- **Storage**: Chrome extension storage for API keys and messages

### Security & Privacy
- **Local Storage**: All data stored locally in your browser
- **No Data Collection**: Extension doesn't collect or transmit personal data
- **API Key Security**: OpenAI API key stored securely in Chrome's extension storage
- **LinkedIn ToS Compliant**: No profile scraping or automated data extraction

### File Structure
```
linkedin-connection-note/
├── manifest.json          # Extension configuration
├── content_script.js      # Main functionality and UI
├── background.js          # API calls and storage management
├── ui/
│   └── templates.js       # HTML templates
├── css/                   # Styling (if any)
└── README.md             # This file
```

## API Key Setup

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. When prompted by the extension, paste your API key
5. The key is stored securely and used only for generating messages

## Version Information

- **Current Version**: 0.5.0
- **Chrome Extension API**: Manifest V3
- **OpenAI Model**: GPT-3.5 Turbo
- **LinkedIn Integration**: ToS Compliant (no data extraction)

## Support

If you encounter any issues:
1. Ensure your OpenAI API key is valid and has credits
2. Check that you're on a LinkedIn connection request modal
3. Reload the page and try again
4. Check browser console for any error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This extension is not affiliated with or endorsed by LinkedIn Corporation. Use responsibly and in accordance with LinkedIn's Terms of Service.
