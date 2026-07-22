// Konfigurasi Supabase untuk menyimpan hasil kuis.
// CATATAN KEAMANAN: anon key AMAN ditaruh di sini (memang publik). Keamanan dijaga oleh
// Row Level Security (RLS) di Supabase: siswa (anon) HANYA bisa MENYIMPAN, tak bisa membaca
// data siswa lain. Membaca hanya untuk admin yang login. Jangan pernah taruh service_role key di sini.
export const SUPABASE_URL = "https://igxtimicgvxlrkrsenul.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHRpbWljZ3Z4bHJrcnNlbnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2OTg2MzgsImV4cCI6MjEwMDI3NDYzOH0.5XY5j_7nZgRF2FMfcEitPbJRYfzDLuqCDt9gWvaPDz4";

export const isConfigured = () =>
  /^https:\/\/.+\.supabase\.co$/.test(SUPABASE_URL) && !/REPLACE/.test(SUPABASE_URL) && !/REPLACE/.test(SUPABASE_ANON_KEY);
