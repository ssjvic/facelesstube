// Quick test script to check Supabase Google auth configuration
// Run with: node test-supabase-auth.js

const SUPABASE_URL = "https://bmpxhntqtcgmqghydpxl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcHhobnRxdGNnbXFnaHlkcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjU0NjYsImV4cCI6MjA4MzM0MTQ2Nn0.AEIF40pVQhJ3N5QgjcWj-UzRGLEl8mfy-jtpeP5mXIc";

async function checkAuthSettings() {
  console.log("Checking Supabase auth settings...\n");
  
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!res.ok) {
      console.error("Failed to get settings:", res.status, res.statusText);
      const body = await res.text();
      console.error("Response:", body);
      return;
    }
    
    const settings = await res.json();
    
    console.log("=== External Providers ===");
    if (settings.external) {
      Object.entries(settings.external).forEach(([key, val]) => {
        if (val === true) console.log(`  ✅ ${key}: ENABLED`);
      });
    }
    
    console.log("\n=== Full Settings (relevant) ===");
    console.log(JSON.stringify(settings, null, 2));
    
  } catch (e) {
    console.error("Error:", e.message);
  }
}

checkAuthSettings();
