import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Lazy load analytics to prevent render blocking
const loadAnalytics = async () => {
  try {
    // Dynamic imports for analytics
    const [
      { initializeAnalytics },
      { initializeFacebookPixel },
      { initializeUTMTracking }
    ] = await Promise.all([
      import('@/utils/analytics'),
      import('@/utils/facebookPixel'),
      import('@/utils/utmTracking')
    ]);

    // Initialize after page load
    initializeAnalytics();
    initializeFacebookPixel();
    initializeUTMTracking();
    
    console.log('Analytics loaded successfully');
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};

// Load analytics after initial render
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => loadAnalytics(), { timeout: 2000 });
} else {
  setTimeout(() => loadAnalytics(), 1000);
}

// Render the app immediately
createRoot(document.getElementById("root")!).render(<App />);