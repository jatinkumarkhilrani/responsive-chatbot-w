# Sahaay - Privacy-First AI Messaging

A WhatsApp-like messaging application with AI capabilities, privacy-first design, and hyperlocal intelligence for India.

## 🚀 Features

- **Privacy-First Design**: All data stored locally, you control what's shared
- **AI-Powered Messaging**: Configurable AI providers (Azure OpenAI, OpenAI, AI Foundry)
- **Hyperlocal Intelligence**: Context-aware suggestions for Indian locations
- **Mood Detection**: Adaptive communication based on message tone
- **Group Intelligence**: Smart conversation summaries and insights
- **Bill Processing**: Photo-based bill analysis and payment assistance
- **Route Optimization**: Traffic-aware navigation suggestions

## 🔧 Setup & Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/username/sahaay-ai-messaging.git
cd sahaay-ai-messaging
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:5000 in your browser

### Building for Production

```bash
# Regular build
npm run build

# Build for GitHub Pages
npm run build:github
```

## 🌐 Deployment

### GitHub Pages (Automatic)

1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. The GitHub Action will automatically build and deploy

### Manual GitHub Pages Deployment

```bash
# Install gh-pages globally
npm install -g gh-pages

# Deploy to GitHub Pages
npm run deploy
```

### Other Hosting Platforms

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build` 
3. Set publish directory: `dist`

## ⚙️ Configuration

### AI Providers

The app supports multiple AI providers:

- **AI Foundry (Built-in)**: No configuration needed
- **Azure OpenAI**: Requires endpoint and API key
- **OpenAI**: Requires API key
- **Custom Endpoint**: Requires endpoint URL and API key

Configure through Settings > AI Configuration in the app.

### Privacy Settings

- **Mood Detection**: Enable/disable emotional tone analysis
- **Location Services**: Enable/disable hyperlocal features
- **Group Intelligence**: Enable/disable conversation summaries

## 📱 Mobile Support

The app is fully responsive and works on:
- Desktop browsers
- Mobile browsers (iOS Safari, Android Chrome)
- Can be added to home screen as PWA

## 🔒 Privacy & Security

- **Local Data Storage**: All data stays on your device
- **No External Tracking**: No analytics or tracking scripts
- **Configurable AI**: Choose your own AI provider
- **Consent-Based**: Granular privacy controls
- **DPDPB Compliant**: Follows Indian data protection guidelines

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Icons**: Phosphor Icons
- **Build Tool**: Vite
- **Deployment**: GitHub Pages / Vercel / Netlify

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`

---

**Note**: This is a privacy-first application. No data is sent to external services without explicit user consent and configuration.