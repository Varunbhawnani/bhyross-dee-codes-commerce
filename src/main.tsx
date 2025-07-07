// src/main.tsx
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAnalytics } from '@/utils/analytics';
import { initializeFacebookPixel } from '@/utils/facebookPixel';
import { initializeUTMTracking } from '@/utils/utmTracking';

// Initialize analytics before rendering the app
initializeAnalytics();
initializeFacebookPixel();
initializeUTMTracking();

createRoot(document.getElementById("root")!).render(<App />);