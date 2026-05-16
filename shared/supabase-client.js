// ============================================================
//  supabase-client.js
//  Initializes Supabase client via dynamic import from CDN.
//  Uses anonymous auth (upgradeable to real auth later).
//  Exposes:
//    window.__supabase         — the Supabase client instance
//    window.__supabaseReady    — Promise that resolves when ready
//    window.__supabaseUserId   — anonymous user ID
//    window.__supabaseConnected— boolean
// ============================================================

(function () {
  'use strict';

  if (window.__supabaseReady) return;

  var SUPABASE_URL = 'https://zbvrzibbacuphqllfqix.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidnJ6aWJiYWN1cGhxbGxmcWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTA5NTcsImV4cCI6MjA5NDIyNjk1N30.rFWGI7f5YedAcSdEjaVFJYEY9wxZcWTHT9-39XdFlKo';

  window.__supabaseReady = new Promise(function (resolve) {
    window.__supabaseResolve = resolve;

    var script = document.createElement('script');
    script.type = 'module';
    script.textContent = [
      "import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';",
      "var SUPABASE_URL = '" + SUPABASE_URL + "';",
      "var SUPABASE_ANON_KEY = '" + SUPABASE_ANON_KEY + "';",
      "try {",
      "  var _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {",
      "    auth: { persistSession: true, autoRefreshToken: true }",
      "  });",
      "  window.__supabase = _supabase;",
      "  window.__supabaseConnected = true;",
      "  console.log('\ud83d\udd0c Supabase client ready');",
      "  var _anonRes = await _supabase.auth.signInAnonymously();",
      "  if (!_anonRes.error && _anonRes.data?.user) {",
      "    window.__supabaseUserId = _anonRes.data.user.id;",
      "    console.log('\ud83d\udd11 Anonymous session:', _anonRes.data.user.id);",
      "  }",
      "  window.__supabaseResolve(true);",
      "} catch(e) {",
      "  console.warn('\u26a0\ufe0f Supabase init error:', e.message);",
      "  window.__supabaseConnected = false;",
      "  window.__supabaseResolve(false);",
      "}",
    ].join('\n');

    document.head.appendChild(script);

    setTimeout(function () {
      if (!window.__supabase) {
        console.warn('\u26a0\ufe0f Supabase not available (offline/CDN blocked)');
        window.__supabaseConnected = false;
        try { window.__supabaseResolve(false); } catch(e) {}
      }
    }, 5000);
  });
})();
