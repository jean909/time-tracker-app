// Simple configuration file
// Update these values after setting up Supabase

window.PONTAJ_CONFIG = {
  // Database settings
  SUPABASE_URL: 'https://your-project-ref.supabase.co', // Replace with your Supabase URL
  SUPABASE_ANON_KEY: 'your-anon-key', // Replace with your anon key
  
  // App settings
  DEFAULT_LANGUAGE: 'de', // 'de' for German, 'en' for English
  ENABLE_OFFLINE_MODE: true,
  AUTO_SYNC_INTERVAL: 30000, // 30 seconds
  
  // Admin credentials
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'admin123', // Change this in production!
  
  // Feature flags
  FEATURES: {
    DATABASE_SYNC: true,
    REAL_TIME_UPDATES: true,
    AUDIT_LOG: true,
    PWA_INSTALL: true,
  }
};

// For development, you can override config
if (window.location.hostname === 'localhost') {
  window.PONTAJ_CONFIG.FEATURES.DATABASE_SYNC = false; // Use localStorage only in dev
}