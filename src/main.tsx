import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { UiProvider } from './ui/components';
import './ui/theme.css';
import { db } from './core/db';

// Nur in der Entwicklung: Zugriff auf die Datenbank für Tests/Debugging
if (import.meta.env.DEV) (window as unknown as { __kt: unknown }).__kt = { db };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <UiProvider>
        <App />
      </UiProvider>
    </HashRouter>
  </StrictMode>,
);
