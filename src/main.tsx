import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <main className="app-shell" aria-label="PiXies SoundScope">
      <h1>PiXies - SoundScope</h1>
    </main>
  </StrictMode>,
);
