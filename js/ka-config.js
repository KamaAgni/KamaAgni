/* KamaAgni settings — edit and redeploy.
   Cloud sync + partner linking need a free Supabase project (see SETUP-CLOUD.md).
   Leave SUPABASE_URL blank and the app works fully offline on one device. */
window.KA_CONFIG = {
  LIBRARY: true,        // PDF Library (links to the source repo). Set false if you do not want to share PDFs.
  SHARE_URL: '',        // your public site URL; blank = current page
  APP_NAME: 'KamaAgni',
  SUPABASE_URL: 'https://hnjbpvursyypvxmjuoyf.supabase.co',     // e.g. https://abcdxyz.supabase.co
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuamJwdnVyc3l5cHZ4bWp1b3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MjQ0MTAsImV4cCI6MjEwODMwMDQxMH0.eIGanOLn2U8GEssRMJCCS2UVcxH6Mdm8cor4X37UsEw',// the project's public "anon" key (safe to publish; data is protected by row-level security)
  MOCK_URL: ''          // dev only: http://localhost:8787 (see dev/mock-server.js)
};
