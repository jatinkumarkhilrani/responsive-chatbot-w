# Sahaay - Privacy-First AI Messaging

Sahaay is a privacy-first AI messaging companion designed for India with hyperlocal intelligence, mood detection, and group insights. It combines the familiar interface of WhatsApp with advanced AI capabilities while maintaining strict privacy standards.

## Features

### 🛡️ Privacy-First Design
- **GDPR & DPDPB Compliant**: Built with Indian data protection laws in mind
- **Consent-Based Features**: All AI features require explicit user consent
- **Local Data Storage**: Messages and preferences stored locally on your device
- **No Data Mining**: Your conversations remain private

### 🤖 AI-Powered Assistance
- **Custom AI Integration**: Support for Azure OpenAI, OpenAI, and AI Foundry
- **Mood Detection**: Contextual responses based on user sentiment (opt-in)
- **Smart Suggestions**: Proactive assistance for routes, bills, and queries

### 🌍 Hyperlocal Intelligence
- **Bangalore-Focused**: Optimized for Bangalore's traffic, routes, and services
- **Route Planning**: Smart navigation considering traffic, tolls, and preferences
- **Local Context**: Understanding of Indian addresses, landmarks, and services

### 👥 Group Intelligence
- **Smart Summaries**: Auto-generated summaries of group conversations
- **Context Awareness**: Understands group dynamics and member preferences
- **Respectful Interaction**: Only responds when mentioned or needed

### 💳 Bill Processing
- **Photo Recognition**: Upload BESCOM bills for payment assistance
- **UPI Integration**: Generate payment links without storing sensitive data
- **Smart Reminders**: Automated payment reminders and due date tracking

## Quick Start

### For Users
1. **Visit the App**: [https://jatin-kumar-khilrani.github.io/sahaay-ai-messaging/](https://jatin-kumar-khilrani.github.io/sahaay-ai-messaging/)
2. **Set Privacy Preferences**: Configure your consent settings on first launch
3. **Configure AI Provider**: Set up your preferred AI service in Settings → AI Config
4. **Start Chatting**: Create a new chat and begin using Sahaay

### For Developers
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jatin-kumar-khilrani/sahaay-ai-messaging.git
   cd sahaay-ai-messaging
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

5. **Build for GitHub Pages**:
   ```bash
   npm run build:github
   ```

## Architecture

### Frontend
- **React 19** with TypeScript for modern UI development
- **Vite** for fast build tooling and development
- **Tailwind CSS** for responsive, utility-first styling
- **shadcn/ui** for consistent, accessible components

### State Management
- **Local Storage** fallback for standalone deployment
- **KV Storage** for persistent data when available
- **React Hooks** for reactive state management

### AI Integration
- **Provider Agnostic**: Support for multiple AI services
- **Configurable Models**: Switch between different AI models
- **Fallback Responses**: Mock responses when AI is unavailable

## Configuration

### AI Providers
Sahaay supports multiple AI providers:

1. **AI Foundry** (Default): Built-in AI capabilities
2. **Azure OpenAI**: Enterprise-grade AI with custom endpoints
3. **OpenAI**: Direct OpenAI API integration
4. **Custom**: Bring your own AI service

### Environment Variables
```bash
# For GitHub Pages deployment
GITHUB_PAGES=true

# For custom base path
VITE_BASE_PATH=/your-custom-path/
```

## Privacy & Compliance

### Data Protection
- **Local-First**: All data stored locally on user's device
- **Consent Management**: Granular control over data usage
- **Anonymization**: No personally identifiable information in logs
- **Right to Delete**: Users can clear all data instantly

### Indian Compliance
- **DPDPB Alignment**: Purpose limitation and data minimization
- **User Rights**: Access, correction, and erasure capabilities
- **Local Data Processing**: Preference for local processing over cloud

## Deployment

### GitHub Pages (Recommended)
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Push to main branch - automatic deployment via GitHub Actions
4. Access your app at `https://yourusername.github.io/sahaay-ai-messaging/`

### Custom Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure your web server for SPA routing
4. Set appropriate base path if needed

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── chat/           # Chat interface components
│   ├── ai/             # AI configuration and services
│   ├── settings/       # Settings and privacy panels
│   ├── groups/         # Group management
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── assets/             # Static assets
```

### Key Components
- **MessagingApp**: Main application container
- **ChatInterface**: Individual chat conversation view
- **PrivacySettings**: GDPR/DPDPB compliant consent management
- **AIConfigDialog**: AI provider configuration
- **EnhancedAIService**: AI service abstraction layer

## Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Ensure accessibility compliance
- Write meaningful commit messages
- Add tests for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
1. Check the [Issues](https://github.com/jatin-kumar-khilrani/sahaay-ai-messaging/issues) page
2. Create a new issue with detailed description
3. Include browser console logs if reporting bugs
4. Specify your browser and device information

## Roadmap

### Upcoming Features
- **Voice Messages**: Audio recording and transcription
- **File Sharing**: Document and media sharing capabilities
- **Offline Mode**: Enhanced offline functionality
- **PWA Features**: Push notifications and app installation
- **Multi-language**: Support for Indian languages

### Long-term Vision
- **Federated Learning**: Privacy-preserving model improvements
- **City Expansion**: Support for more Indian cities
- **Integration APIs**: Connect with local services and apps
- **Enterprise Features**: Team collaboration and management tools

---

**Built with ❤️ for India's digital future**