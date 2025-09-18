# Deployment

This project is configured for GitHub Pages deployment.

## Automatic Deployment

The project automatically deploys to GitHub Pages when you push to the `main` branch using GitHub Actions.

## Manual Deployment

To deploy manually:

```bash
npm run deploy
```

This will build the project and push to the `gh-pages` branch.

## GitHub Pages Configuration

1. Go to your repository Settings
2. Navigate to Pages section
3. Set Source to "Deploy from a branch"
4. Select `gh-pages` branch
5. Set folder to `/ (root)`

## Build Configuration

The project includes specific GitHub Pages build configuration:
- Base path is set to `/sahaay-ai-messaging/` for GitHub Pages
- 404.html handles client-side routing
- GitHub Actions workflow builds and deploys automatically

## Local Testing

To test the production build locally:

```bash
npm run build:github
npm run preview
```

This will build with the GitHub Pages configuration and serve it locally.