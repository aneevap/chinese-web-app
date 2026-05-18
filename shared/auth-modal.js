/* =========================================================================
   auth-modal.js
   Inline modal for anonymous -> email/password upgrade and sign-in.
   Depends on: shared/supabase-client.js, profiles.js, strings.js, nav.js
   Provides:
     window.showAuthModal(mode)   - 'upgrade' | 'signin'
     window.closeAuthModal()      - programmatic close
   ========================================================================= */

(function () {
  'use strict';

  var OVERLAY_ID = 'auth-modal-overlay';

  // -- Helper: translate or fallback --
  function _t(key, fallback) {
    return typeof t === 'function' ? t(key) : fallback;
  }

  // -- Init: inject modal HTML once --
  function ensureModal() {
    if (document.getElementById(OVERLAY_ID)) return;

    var div = document.createElement('div');
    div.id = OVERLAY_ID;
    div.className = 'auth-modal-overlay';
    div.innerHTML = [
      '<div class="auth-modal-box" id="auth-modal-box">',
      '  <button class="auth-modal-close" id="auth-modal-close" aria-label="Close">\u2715</button>',
      '  <div id="auth-modal-body"></div>',
      '</div>',
    ].join('\n');

    document.body.appendChild(div);

    div.addEventListener('click', function (e) {
      if (e.target === div) closeModal();
    });

    document.getElementById('auth-modal-close').addEventListener('click', closeModal);

    if (!document.getElementById('auth-modal-style')) {
      var style = document.createElement('style');
      style.id = 'auth-modal-style';
      style.textContent = getStyles();
      document.head.appendChild(style);
    }
  }

  function showModal(mode) {
    ensureModal();
    var body = document.getElementById('auth-modal-body');
    body.innerHTML = mode === 'signin' ? buildSignInForm() : buildUpgradeForm();
    document.getElementById(OVERLAY_ID).classList.add('visible');
    document.body.style.overflow = 'hidden';

    var firstInput = body.querySelector('input');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 300);
    wireForm(mode);
  }

  function closeModal() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  window.showAuthModal = showModal;
  window.closeAuthModal = closeModal;

  // -- Build upgrade form --
  function buildUpgradeForm() {
    return [
      '<div class="auth-modal-icon">\uD83D\uDD10</div>',
      '<h2 class="auth-modal-title" data-i18n="upgrade_title"></h2>',
      '<p class="auth-modal-sub" data-i18n="upgrade_sub"></p>',
      '<div class="auth-modal-error" id="auth-error" style="display:none;"></div>',
      '<form id="auth-form" novalidate>',
      '  <div class="auth-form-group">',
      '    <label data-i18n="upgrade_email_label"></label>',
      '    <input type="email" id="auth-email" name="email" autocomplete="email" inputmode="email" spellcheck="false" data-i18n-placeholder="upgrade_email_ph" required />',
      '  </div>',
      '  <div class="auth-form-group">',
      '    <label data-i18n="upgrade_password_label"></label>',
      '    <input type="password" id="auth-pass" name="password" autocomplete="new-password" minlength="6" data-i18n-placeholder="upgrade_password_ph" required />',
      '  </div>',
      '  <div class="auth-form-group">',
      '    <label data-i18n="upgrade_confirm_label"></label>',
      '    <input type="password" id="auth-pass-confirm" name="confirm" autocomplete="new-password" minlength="6" data-i18n-placeholder="upgrade_password_ph" required />',
      '  </div>',
      '  <div class="auth-form-group">',
      '    <label data-i18n="upgrade_name_label"></label>',
      '    <input type="text" id="auth-name" name="name" autocomplete="name" spellcheck="false" data-i18n-placeholder="upgrade_name_ph" />',
      '  </div>',
      '  <button type="submit" class="auth-modal-btn" id="auth-submit"><span data-i18n="upgrade_submit"></span></button>',
      '</form>',
      '<p class="auth-switch"><a href="#" onclick="window.showAuthModal(\'signin\');return false;" data-i18n="signin_title">Already have an account? Sign In</a></p>',
    ].join('\n');
  }

  function buildSignInForm() {
    return [
      '<div class="auth-modal-icon">\uD83D\uDC4B</div>',
      '<h2 class="auth-modal-title" data-i18n="signin_title"></h2>',
      '<p class="auth-modal-sub" data-i18n="signin_sub"></p>',
      '<div class="auth-modal-error" id="auth-error" style="display:none;"></div>',
      '<form id="auth-form" novalidate>',
      '  <div class="auth-form-group">',
      '    <label data-i18n="signin_email_label"></label>',
      '    <input type="email" id="auth-email" name="email" autocomplete="email" inputmode="email" spellcheck="false" data-i18n-placeholder="signin_email_ph" required />',
      '  </div>',
      '  <div class="auth-form-group">',
      '    <label data-i18n="signin_password_label"></label>',
      '    <input type="password" id="auth-pass" name="password" autocomplete="current-password" data-i18n-placeholder="signin_password_ph" required />',
      '  </div>',
      '  <button type="submit" class="auth-modal-btn" id="auth-submit"><span data-i18n="signin_submit"></span></button>',
      '</form>',
      '<p class="auth-switch"><a href="#" onclick="window.showAuthModal(\'upgrade\');return false;" data-i18n="upgrade_title">Don\'t have an account? Save your progress</a></p>',
    ].join('\n');
  }

  function buildSuccessView() {
    return [
      '<div class="auth-modal-icon" style="font-size:3.5rem;">\uD83C\uDF89</div>',
      '<h2 class="auth-modal-title" data-i18n="upgrade_success_title"></h2>',
      '<p class="auth-modal-sub" data-i18n="upgrade_success_body"></p>',
      '<button class="auth-modal-btn" onclick="window.closeAuthModal();window.location.href=\'progress.html\'"><span data-i18n="upgrade_continue"></span></button>',
    ].join('\n');
  }

  function wireForm(mode) {
    var form = document.getElementById('auth-form');
    if (!form) return;

    if (typeof refreshStrings === 'function') refreshStrings();

    form.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (typeof t === 'function') el.placeholder = t(key);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit(mode);
    });
  }

  function handleSubmit(mode) {
    var email    = (document.getElementById('auth-email').value || '').trim();
    var password = document.getElementById('auth-pass').value || '';
    var errorEl  = document.getElementById('auth-error');
    var submitBtn = document.getElementById('auth-submit');

    if (!email || !isValidEmail(email)) {
      showError(errorEl, _t('auth_error_email', 'Please enter a valid email address.'));
      return;
    }
    if (!password || password.length < 6) {
      showError(errorEl, _t('auth_error_password', 'Password must be at least 6 characters.'));
      return;
    }
    if (mode === 'upgrade') {
      var confirmVal = (document.getElementById('auth-pass-confirm').value || '');
      if (password !== confirmVal) {
        showError(errorEl, _t('auth_error_confirm', 'Passwords do not match.'));
        return;
      }
    }

    hideError(errorEl);
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent =
      mode === 'upgrade'
        ? _t('upgrade_submitting', 'Creating account...')
        : _t('signin_submitting', 'Signing in...');

    var promise = mode === 'upgrade' ? doUpgrade(email, password) : doSignIn(email, password);

    promise
      .then(function () {
        var profile = (typeof XHZ !== 'undefined') ? XHZ.getActiveProfile() : null;
        if (profile && profile.is_guest) {
          XHZ.updateProfile(profile.id, { is_guest: false });
        }

        if (mode === 'upgrade') {
          var body = document.getElementById('auth-modal-body');
          body.innerHTML = buildSuccessView();
          if (typeof refreshStrings === 'function') refreshStrings();
        } else {
          closeModal();
          // Trigger cloud sync after sign-in
          if (window.__SUPABASE_SYNC && profile) {
            window.__SUPABASE_SYNC.pushAll();
          }
        }
      })
      .catch(function (err) {
        showError(errorEl, err.message || _t('auth_error_generic', 'Something went wrong. Please try again.'));
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent =
          mode === 'upgrade'
            ? _t('upgrade_submit', 'Create Account & Save')
            : _t('signin_submit', 'Sign In');
      });
  }

  function doUpgrade(email, password) {
    // Upgrade anonymous session to email/password
    if (typeof window.__supabaseUpgrade === 'function') {
      return window.__supabaseUpgrade(email, password);
    }
    return Promise.reject(new Error('Supabase auth not available'));
  }

  function doSignIn(email, password) {
    if (typeof window.__supabaseSignIn === 'function') {
      return window.__supabaseSignIn(email, password);
    }
    return Promise.reject(new Error('Supabase auth not available'));
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(el, msg) {
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  function hideError(el) {
    if (el) {
      el.textContent = '';
      el.style.display = 'none';
    }
  }

  // -- Inline styles using design system tokens --
  function getStyles() {
    return [
      '#auth-modal-overlay {',
      '  position: fixed; inset: 0;',
      '  background: rgba(74, 56, 40, 0.45);',
      '  z-index: 9000;',
      '  display: flex; align-items: center; justify-content: center;',
      '  padding: 20px;',
      '  opacity: 0; pointer-events: none;',
      '  transition: opacity 0.25s ease;',
      '}',
      '#auth-modal-overlay.visible {',
      '  opacity: 1; pointer-events: all;',
      '}',
      '.auth-modal-box {',
      '  background: var(--paper-warm, #F5F0E8);',
      '  border-radius: 20px;',
      '  padding: 30px 24px 24px;',
      '  width: 100%; max-width: 380px;',
      '  box-shadow: 0 8px 32px rgba(74, 56, 40, 0.2);',
      '  position: relative;',
      '  transform: scale(0.92) translateY(10px);',
      '  transition: transform 0.25s ease;',
      '  max-height: 90dvh; overflow-y: auto;',
      '}',
      '#auth-modal-overlay.visible .auth-modal-box {',
      '  transform: scale(1) translateY(0);',
      '}',
      '.auth-modal-close {',
      '  position: absolute; top: 10px; right: 14px;',
      '  background: none; border: none;',
      '  font-size: 1.2em; color: var(--ink-light, #B0A090);',
      '  cursor: pointer; line-height: 1; padding: 4px;',
      '}',
      '.auth-modal-close:hover { color: var(--ink-soft, #8C7A6A); }',
      '.auth-modal-icon {',
      '  text-align: center; font-size: 2.8rem;',
      '  margin-bottom: 4px;',
      '}',
      '.auth-modal-title {',
      '  text-align: center; font-size: 1.15em;',
      '  font-weight: 800; color: var(--ink-dark, #3D2E22);',
      '  margin: 0 0 4px;',
      '}',
      '.auth-modal-sub {',
      '  text-align: center; font-size: 0.78em;',
      '  color: var(--ink-soft, #8C7A6A);',
      '  margin: 0 0 16px; line-height: 1.5;',
      '}',
      '.auth-modal-error {',
      '  background: var(--danger-bg, #FFEBEE);',
      '  color: var(--danger, #D32F2F);',
      '  border-radius: 10px; padding: 8px 12px;',
      '  font-size: 0.72em; margin-bottom: 12px;',
      '  text-align: center; line-height: 1.4;',
      '}',
      '.auth-form-group {',
      '  margin-bottom: 12px;',
      '}',
      '.auth-form-group label {',
      '  display: block; font-size: 0.72em;',
      '  font-weight: bold; color: var(--ink-soft, #8C7A6A);',
      '  margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;',
      '}',
      '.auth-form-group input {',
      '  width: 100%; padding: 10px 12px;',
      '  border: 2px solid var(--paper-deep, #E5DDD0);',
      '  border-radius: 10px; font-size: 0.88em;',
      '  font-family: var(--font-main, inherit);',
      '  background: var(--paper-cool, #F0ECE4);',
      '  color: var(--ink-dark, #3D2E22);',
      '  outline: none; box-sizing: border-box;',
      '  transition: border-color 0.2s;',
      '}',
      '.auth-form-group input:focus {',
      '  border-color: var(--botes-ochre, #C48B5C);',
      '}',
      '.auth-form-group input::placeholder {',
      '  color: var(--ink-light, #B0A090);',
      '}',
      '.auth-modal-btn {',
      '  width: 100%; padding: 12px; margin-top: 4px;',
      '  background: var(--botes-ochre, #C48B5C);',
      '  color: white; border: none;',
      '  border-radius: 12px; font-size: 0.92em;',
      '  font-weight: 800; cursor: pointer;',
      '  font-family: var(--font-main, inherit);',
      '  transition: background 0.2s;',
      '}',
      '.auth-modal-btn:hover:not(:disabled) {',
      '  background: var(--botes-ochre-deep, #A87145);',
      '}',
      '.auth-modal-btn:disabled {',
      '  opacity: 0.6; cursor: default;',
      '}',
      '.auth-switch {',
      '  text-align: center; font-size: 0.75em;',
      '  margin: 14px 0 0;',
      '}',
      '.auth-switch a {',
      '  color: var(--botes-ochre, #C48B5C);',
      '  text-decoration: underline; cursor: pointer;',
      '}',
    ].join('\n');
  }

})();
