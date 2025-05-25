# Changelog

All notable changes to the Invitation Notepad extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2024-12-20

### 🎯 **Persona-Based Messaging Revolution**

#### ✨ **Smart Persona Detection**
- **Automatic Profile Analysis**: Detects if you're messaging a recruiter, engineering manager, founder, or generic professional
- **Visual Persona Indicators**: Clear UI display showing detected persona type with relevant icons
- **Context-Aware AI**: AI prompts automatically adjust based on detected persona for more targeted messages
- **Real-time Detection**: Persona identified immediately when the extension loads

#### 👥 **Role-Specific Message Generation**
- **🎯 Recruiter-Focused Messages**: Emphasizes background, skills, and opportunity interest
- **⚙️ Engineering Manager Messages**: Highlights technical experience and collaboration potential  
- **🚀 Founder-Targeted Messages**: Shows entrepreneurial spirit and value proposition
- **👤 Generic Professional**: Balanced approach for general networking
- **Smart Tone Adaptation**: Each persona gets appropriate professional tone and messaging style

#### 🤝 **Referral Request System**
- **Dedicated Referral Generation**: Separate AI system for asking referrals vs. connection requests
- **Persona-Specific Referral Messages**: Tailored referral requests based on recipient's role
- **Professional Referral Templates**: Pre-built templates for different scenarios
- **Respectful Asking Framework**: AI ensures appropriate tone for referral requests

#### 📚 **Advanced Template Management**
- **Persona Template Library**: Save and manage templates for each professional role
- **Template Categories**: Separate connection and referral templates
- **Dynamic Variables**: Use {name}, {company}, {title} placeholders for personalization
- **Template Analytics**: Track which templates perform best (future feature)

### 🎨 **Enhanced User Interface**
- **Dual Generation Buttons**: Separate "Generate Connection" and "Ask Referral" options
- **Persona Detection Display**: Visual indicator showing detected profile type
- **Template Management UI**: Comprehensive interface for managing persona-specific templates
- **Improved Button Layout**: Better organization of generation and action buttons
- **Professional Icons**: Role-specific emojis and visual indicators throughout

### 🔧 **Technical Improvements**
- **Advanced Profile Parsing**: Enhanced extraction of job titles, companies, and role indicators
- **Keyword-Based Classification**: Sophisticated persona detection using multiple keyword sets
- **Smart Prompt Engineering**: Different AI prompts optimized for each persona type
- **Enhanced History Tracking**: Track message source including persona and message type
- **Improved Error Handling**: Better fallbacks when persona detection fails

### 📈 **Analytics Enhancements**
- **Persona-Specific Metrics**: Track success rates by persona type
- **Message Type Analytics**: Separate tracking for connection vs. referral messages
- **AI Generation Insights**: Understand which persona messages perform best
- **Template Usage Statistics**: See which saved templates are most effective

## [0.4.0] - 2024-12-20

### 🚀 **Major Feature Expansion**

#### ✨ **New Analytics Dashboard**
- **Performance Metrics**: Track messages sent, response rates, average length, AI vs manual usage
- **Activity Visualization**: 7-day activity chart showing message sending patterns
- **Smart Insights**: AI-powered recommendations based on your messaging patterns
- **Time Analysis**: Discover your most productive messaging times

#### 📊 **Response Tracking System**
- **Automatic Detection**: Monitors LinkedIn conversations for responses to your connection messages
- **Real-time Updates**: Response rate calculations update automatically
- **Success Feedback**: Visual notifications when responses are detected
- **Historical Analysis**: Track which message types get the best response rates

#### ⚙️ **Enhanced Settings & Preferences**
- **Default Tone Selection**: Set your preferred AI generation tone (professional, casual, friendly, assertive)
- **Message Length Preferences**: Configure optimal message length ranges
- **Auto-save Options**: Automatically save successful messages to your library
- **Analytics Toggle**: Control analytics data collection

#### 📤 **Data Management Features**
- **Export Functionality**: Download all your data as JSON backup
- **Import Capability**: Restore data from previous backups
- **Analytics Reset**: Clear analytics data while preserving messages
- **Cross-device Sync**: Prepare for multi-device usage

### 🎨 **UI/UX Improvements**
- **Tabbed Interface**: Organized popup with Overview, Analytics, and Settings tabs
- **Modern Design**: Updated visual design with improved spacing and colors
- **Activity Charts**: Visual representation of messaging activity over time
- **Responsive Layout**: Better adaptation to different popup sizes

### 🔧 **Technical Enhancements**
- **Improved Monitoring**: Enhanced DOM observation for better LinkedIn integration
- **Performance Optimization**: Reduced memory footprint and faster loading
- **Error Handling**: More robust error handling and recovery mechanisms
- **Debug Capabilities**: Enhanced debugging tools for development

### 🎯 **Smart Features**
- **Pattern Recognition**: Identifies optimal messaging times and patterns
- **Usage Analytics**: Tracks AI vs manual message usage for insights
- **Success Metrics**: Measures and reports on message effectiveness
- **Behavioral Insights**: Provides recommendations based on usage patterns

## [0.3.1] - 2024-12-19

### 🐛 Fixed
- **Critical**: Fixed text container focus issue where users had to click outside first before typing
- **Interaction**: Removed automatic focus on textarea initialization that was causing confusion
- **Event Handling**: Simplified click handler to use natural browser behavior for cursor positioning
- **Z-Index**: Increased textarea z-index to prevent overlay conflicts
- **Styling**: Added force styles to ensure immediate textarea interaction

### 🔧 Technical Improvements
- Enhanced debug logging for textarea interaction troubleshooting
- Added test functions for diagnosing focus issues
- Improved event listener management to prevent conflicts
- Better error handling in textarea setup

### 📝 Developer Features
- Added `testTextareaFocus()` function for debugging
- Enhanced console logging for development
- Better separation of concerns in event handling

## [0.3.0] - 2024-12-18

### 🔒 Security Enhancements
- **API Key Validation**: Enhanced validation for OpenAI API keys with format checking (`sk-` prefix)
- **Input Sanitization**: Improved input validation and sanitization for all user inputs
- **Secure Storage**: Better encryption and validation of stored data
- **Production Logging**: Configurable debug logging (disabled by default for production)

### ✨ New Features
- **Browser Popup**: Added comprehensive extension popup for easy access to settings
- **Message Management**: Full CRUD operations for saved messages and history
- **Duplicate Prevention**: Prevents saving duplicate messages to library
- **Character Limits**: Enforced 300-character limit with visual feedback
- **Export/Import**: Backup and restore functionality for messages

### 🎨 UI/UX Improvements
- **Modern Design**: Complete UI redesign with modern gradients and animations
- **Responsive Layout**: Better responsive design for different screen sizes
- **Visual Feedback**: Improved success/error messages and loading states
- **Tab System**: Organized interface with Create, Saved, and History tabs

### 🐛 Bug Fixes
- **Manifest Issues**: Fixed popup action configuration and CSS path references
- **Version Consistency**: Synchronized version numbers across all components
- **Error Messages**: More helpful error messages with actionable guidance

## [0.2.0] - 2024-12-15

### 🎯 AI Personalization
- **Smart Profile Analysis**: Automatically extracts person's profile information
- **Context-Aware Generation**: AI uses profile data for highly personalized messages
- **Multi-Data Extraction**: Name, job title, company, location, mutual connections, and bio
- **Profile Detection**: Multiple fallback methods for reliable data extraction

### 📊 Profile Information Extracted
- 👤 **Name**: From profile header, URL, or page title
- 💼 **Job Title**: Current position and role
- 🏢 **Company**: Current organization
- 📍 **Location**: Geographic location
- 🤝 **Mutual Connections**: Shared network information
- 📝 **About Section**: Professional summary (truncated for context)

### 🤖 Enhanced AI Features
- **Multiple Tones**: Professional, casual, friendly, assertive options
- **Contextual Messages**: References specific profile details
- **Improved Prompts**: Better prompt engineering for more relevant suggestions
- **Error Handling**: Graceful fallbacks when profile data is unavailable

### 🔧 Technical Improvements
- Better modal detection and positioning
- Improved reliability across different LinkedIn layouts
- Enhanced error handling and recovery

## [0.1.1] - 2024-12-10

### 🐛 Critical Fixes
- **Textarea Responsiveness**: Fixed text container becoming unresponsive after initial load
- **Event Handler Conflicts**: Resolved multiple event listener setup causing UI freezing
- **Focus Management**: Improved focus handling without automatic focusing

### 📈 History Improvements
- **Accurate Tracking**: Only tracks messages actually sent (Send button click detection)
- **Deletable History**: Added delete functionality for history items
- **Source Simplification**: Removed complex source tracking, focus on sent messages
- **Better Detection**: Multiple methods for detecting successful message sends

### 🔧 Code Quality
- Removed redundant function calls causing conflicts
- Simplified event listener management
- Improved error handling and debugging
- Better separation of setup and interaction logic

### 🎨 UI Enhancements
- Added delete buttons (×) to history items
- Improved visual feedback for user actions
- Better error message display
- Enhanced button hover effects

## [0.1.0] - 2024-12-05

### 🎉 Initial Release
- **Core Functionality**: Basic message creation and insertion
- **AI Integration**: OpenAI GPT integration for message generation
- **LinkedIn Integration**: Automatic modal detection and positioning
- **Message Storage**: Local storage for custom messages
- **Basic UI**: Simple interface with essential features

### ✨ Launch Features
- **Custom Messages**: Create and save personalized connection messages
- **AI Suggestions**: Generate AI-powered connection requests
- **Smart Positioning**: Automatic positioning next to LinkedIn modals
- **Secure Storage**: Local storage of API keys and messages
- **Basic History**: Track created messages

### 🔧 Technical Foundation
- Chrome Extension Manifest V3 compatibility
- Content script injection for LinkedIn
- Background service worker for API calls
- CSS styling with modern design principles
- Error handling and user feedback

### 🎯 Supported Features
- LinkedIn connection modal detection
- OpenAI API integration
- Local data storage and retrieval
- Cross-browser compatibility (Chrome-based browsers)
- Responsive design for different screen sizes

---

## Version Numbering

We use [Semantic Versioning](https://semver.org/) for version numbers:

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner  
- **PATCH** version when you make backwards compatible bug fixes

## Contributing

When contributing, please:

1. Update this changelog with your changes
2. Follow the established format and categorization
3. Include issue numbers where applicable
4. Use clear, descriptive language
5. Separate breaking changes, new features, and bug fixes

## Legend

- 🎉 **New Features**
- 🐛 **Bug Fixes** 
- 🔒 **Security**
- 🎨 **UI/UX**
- 🔧 **Technical**
- 📈 **Performance**
- 📝 **Documentation**
- ⚠️ **Breaking Changes** 