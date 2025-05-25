# 🤝 Invitation Notepad

A powerful Chrome extension that helps you craft personalized LinkedIn connection messages with AI assistance. Never send generic connection requests again!

![Version](https://img.shields.io/badge/version-0.5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Chrome%20Extension-yellow.svg)

## ✨ Features

### 🤖 **AI-Powered Message Generation**
- Generate professional connection messages using OpenAI's GPT
- Generic message templates optimized for different professional contexts
- LinkedIn Terms of Service compliant (no profile data extraction)
- Multiple message types: standard connections and referral requests

### 📝 **Message Management**
- **Create Tab**: Compose custom messages with real-time character counting
- **Saved Tab**: Build your personal library of reusable messages
- **History Tab**: Track all sent messages for future reference
- One-click message insertion into LinkedIn's connection form

### 🎯 **Smart Integration**
- Automatically detects LinkedIn connection modals
- Positions itself intelligently next to the connection form
- Seamless integration with LinkedIn's interface
- No page reloads or navigation disruption

### 🔒 **Privacy & Security**
- Your API key is stored securely in your browser
- No data is sent to external servers (except OpenAI for AI generation)
- Messages are stored locally in Chrome storage
- Open source and transparent

## 🚀 Installation

### Option 1: Chrome Web Store (Recommended)
*Coming soon - extension is currently in development*

### Option 2: Developer Mode Installation

1. **Download the extension**
   ```bash
   git clone https://github.com/yourusername/linkedin-connection-note.git
   # or download as ZIP
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the extension folder
   - The extension icon should appear in your Chrome toolbar

4. **Set up your OpenAI API Key** (optional, for AI features)
   - Click the extension icon
   - Follow the setup wizard
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## 📖 Usage

### Basic Usage

1. **Navigate to LinkedIn** and find someone you want to connect with
2. **Click "Connect"** to open the connection modal
3. **The extension will automatically appear** next to the modal
4. **Choose your approach**:
   - Write a custom message in the "Create" tab
   - Use a saved message from your library
   - Generate an AI message based on their profile

### Creating Custom Messages

1. Switch to the **"Create"** tab
2. Type your message in the text area (300 character limit)
3. Use the buttons to:
   - **Generate**: Create AI-powered message
   - **Save**: Add to your message library
   - **Use**: Insert into LinkedIn's form
   - **Clear**: Start over

### AI Message Generation

1. Click **"Generate"** button for standard connection messages or **"Ask Referral"** for referral requests
2. The AI will create a professional, ToS-compliant message template
3. Review and edit the generated message if needed
4. Click **"Use"** to insert it into LinkedIn

### Managing Your Message Library

- **Saved Messages**: Access your reusable message templates
- **History**: View all messages you've sent
- **Quick Actions**: Export, import, or clear your data

## ⚙️ Configuration

### OpenAI API Setup

1. **Get an API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key

2. **Add to Extension**:
   - Click the extension icon
   - Enter your API key in the settings
   - Save and start using AI features

### Customization Options

- **Message types**: Standard connections and referral requests
- **Character limits**: Automatic counting and warnings
- **Auto-positioning**: Extension intelligently positions itself
- **Dark mode**: Automatically adapts to your browser theme

## 🛠️ Development

### Project Structure

```
linkedin-connection-note/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content_script.js      # Main functionality
├── css/
│   └── style.css         # Styling
├── ui/
│   ├── popup.html        # Extension popup
│   ├── popup.js          # Popup functionality
│   └── templates.js      # HTML templates
└── README.md
```

### Building from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/linkedin-connection-note.git
   cd linkedin-connection-note
   ```

2. **Install dependencies** (if any)
   ```bash
   npm install  # if package.json exists
   ```

3. **Load in Chrome**
   - Follow the installation steps above
   - Enable developer mode and load unpacked

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Extension not appearing on LinkedIn**
- Refresh the LinkedIn page
- Check that you're on a connection modal
- Ensure the extension is enabled in Chrome

**AI generation not working**
- Verify your OpenAI API key is correctly entered
- Check your OpenAI account has available credits
- Ensure you have an internet connection

**Messages not saving**
- Check Chrome storage permissions
- Try refreshing the page
- Clear extension data and restart

### Debug Mode

Enable debug logging by opening the console (F12) and running:
```javascript
// Test textarea functionality
testTextareaFocus()

// Check extension state
console.log("Extension loaded:", window.linkedinAIHelperLoaded)
```

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/linkedin-connection-note/issues)
- **Features**: [Feature Requests](https://github.com/yourusername/linkedin-connection-note/discussions)
- **Email**: support@yourwebsite.com

## 🙏 Acknowledgments

- OpenAI for the GPT API
- LinkedIn for the platform
- Chrome Extensions team for the framework
- All contributors and beta testers

---

**Made with ❤️ for better networking**

*Note: This extension is not affiliated with LinkedIn. LinkedIn is a trademark of LinkedIn Corporation.*
