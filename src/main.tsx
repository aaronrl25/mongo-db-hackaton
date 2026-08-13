import React from 'react'; import { createRoot } from 'react-dom/client'; import { ConversationProvider } from '@elevenlabs/react'; import App from './App'; import './styles.css'; import './public.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><ConversationProvider><App/></ConversationProvider></React.StrictMode>);
