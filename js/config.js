// js/config.js
const SB_URL = "https://mywfygexyneumbctwhqu.supabase.co";
const SB_KEY = "sb_publishable_87elvO9hISERj5i1zq9uLQ_-A7NqLZP";

// Instância única para todo o projeto
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

console.log("✅ Conexão com Supabase configurada.");
