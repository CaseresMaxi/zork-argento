# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Azure DevOps Integration

This project is configured to work with Azure DevOps for:
- Work item tracking
- Build pipelines
- Code repositories

### Setup Instructions

1. **Configure Azure DevOps Connection:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Azure DevOps organization details
   - Create a Personal Access Token (PAT) in Azure DevOps
   - Update the `.env.local` file with your credentials

2. **VS Code Extensions Installed:**
   - DevOps Boards: View and manage work items
   - Azure Pipelines Runner: Run and monitor pipelines

3. **Pipeline Configuration:**
   - `azure-pipelines.yml` contains the CI/CD configuration
   - Automatically triggers on main branch commits
   - Builds and deploys the React application

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Azure DevOps Features

- **Work Items:** Track bugs, features, and user stories
- **Pipelines:** Automated build and deployment
- **Repositories:** Code versioning and pull requests
- **Boards:** Agile project management

For detailed Azure DevOps configuration, see `azure-devops-config.md`.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
