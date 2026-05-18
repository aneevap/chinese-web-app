// ============================================================
//  supabase-client.js
//  Initializes Supabase client via dynamic import from CDN.
//  Supports anonymous auth + anonymous→email upgrade.
//  Exposes:
//    window.__supabase              — the Supabase client instance
//    window.__supabaseReady         — Promise that resolves when ready
//    window.__supabaseUserId        — anonymous user ID
//    window.__supabaseConnected     — boolean
//    window.__supabaseAuthUser      — current user object (or null)
//    window.__supabaseIsAnon        — boolean, true if anonymous session
//    window.__supabaseEmail         — current user's email (or null)
//    window.__supabaseSession       — current session object (or null)
//    window.__supabaseUpgrade()     — upgrade anonymous to email/password
//    window.__supabaseSignIn()      — sign in with email/password
//    window.__supabaseSignOut()     — sign out
//    window.__supabaseResetPassword() — send password reset email
//    window.__supabaseUpdatePassword() — set new password after recovery
//    window.__supabaseIsRecovery    — boolean, true if `type=recovery` in URL
//    window.__supabaseOnAuth()      — register auth state change listener
// ============================================================

(function () {
  'use strict';

  if (window.__supabaseReady) return;

  // ── Detect password recovery flow from URL hash ────────────
  // Must run BEFORE Supabase client initializes (may consume the hash).
  window.__supabaseIsRecovery =
    window.location.hash.indexOf('type=recovery') !== -1;

  var SUPABASE_URL = 'https://zbvrzibbacuphqllfqix.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidnJ6aWJiYWN1cGhxbGxmcWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTA5NTcsImV4cCI6MjA5NDIyNjk1N30.rFWGI7f5YedAcSdEjaVFJYEY9wxZcWTHT9-39XdFlKo';

  // ── Auth state ──────────────────────────────────────────────
  window.__supabaseAuthUser = null;
  window.__supabaseIsAnon = true;
  window.__supabaseEmail = null;
  window.__supabaseSession = null;
  window.__supabaseAuthListeners = [];

  // Register an auth state change listener
  window.__supabaseOnAuth = function (cb) {
    window.__supabaseAuthListeners.push(cb);
    // If already initialized, fire immediately with current state
    if (window.__supabaseSession) {
      try { cb(null, window.__supabaseSession); } catch (e) {}
    }
  };

  // ── Upgrade anonymous account to email/password ────────────
  // Preserves the same user_id so all data stays linked.
  window.__supabaseUpgrade = async function (email, password) {
    var sb = window.__supabase;
    if (!sb) throw new Error('Supabase not initialized');
    var { data, error } = await sb.auth.updateUser({ email: email, password: password });
    if (error) throw error;
    return data;
  };

  // ── Sign in with email/password ─────────────────────────────
  window.__supabaseSignIn = async function (email, password) {
    var sb = window.__supabase;
    if (!sb) throw new Error('Supabase not initialized');
    var { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });
    if (error) throw error;
    return data;
  };

    // ── Password reset ───────────────────────────────────────────
  // Sends a password reset email via Supabase.
  window.__supabaseResetPassword = async function (email) {
    var sb = window.__supabase;
    if (!sb) throw new Error('Supabase not initialized');
    var { data, error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/index.html'
    });
    if (error) throw error;
    return data;
  };

  // ── Update password (after recovery) ───────────────────────
  window.__supabaseUpdatePassword = async function (newPassword) {
    var sb = window.__supabase;
    if (!sb) throw new Error('Supabase not initialized');
    var { data, error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  };

  // ── Sign out ────────────────────────────────────────────────
  window.__supabaseSignOut = async function () {
    var sb = window.__supabase;
    if (!sb) return;
    var { error } = await sb.auth.signOut();
    if (error) throw error;
  };

  // ── Client initialization ──────────────────────────────────
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
      "  console.log('\uD83D\uDD0C Supabase client ready');",
      "",
      "  // Auth state listener — fires on sign-in, upgrade, sign-out",
      "  _supabase.auth.onAuthStateChange(function (event, session) {",
      "    window.__supabaseSession = session;",
      "    window.__supabaseAuthUser = session?.user || null;",
      "    window.__supabaseIsAnon = session?.user?.is_anonymous !== false;",
      "    window.__supabaseEmail = session?.user?.email || null;",
      "    // Notify registered listeners",
      "    var listeners = window.__supabaseAuthListeners || [];",
      "    for (var i = 0; i < listeners.length; i++) {",
      "      try { listeners[i](event, session); } catch(e) {}",
      "    }",
      "  });",
      "",
      "  // Sign in anonymously",
      "  var sessionRes = await _supabase.auth.getSession();",
      "  if (sessionRes.data?.session) {",
      "    // Already have a session (restored from storage)",
      "    window.__supabaseUserId = sessionRes.data.session.user.id;",
      "    window.__supabaseIsAnon = sessionRes.data.session.user.is_anonymous !== false;",
      "    window.__supabaseEmail = sessionRes.data.session.user.email || null;",
      "    console.log('\uD83D\uDD11 Session restored:', window.__supabaseUserId);",
      "  } else {",
      "    // Sign in anonymously",
      "    var _anonRes = await _supabase.auth.signInAnonymously();",
      "    if (!_anonRes.error && _anonRes.data?.user) {",
      "      window.__supabaseUserId = _anonRes.data.user.id;",
      "      console.log('\uD83D\uDD11 Anonymous session:', window.__supabaseUserId);",
      "    }",
      "  }",
      "  window.__supabaseResolve(true);",
      "} catch(e) {",
      "  console.warn('\u26A0\uFE0F Supabase init error:', e.message);",
      "  window.__supabaseConnected = false;",
      "  window.__supabaseResolve(false);",
      "}",
    ].join('\n');

    document.head.appendChild(script);

    // Timeout fallback
    setTimeout(function () {
      if (!window.__supabase) {
        console.warn('\u26A0\uFE0F Supabase not available (offline/CDN blocked)');
        window.__supabaseConnected = false;
        try { window.__supabaseResolve(false); } catch(e) {}
      }
    }, 5000);
  });
})();
