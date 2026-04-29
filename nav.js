/* =====================================================
   SHARED NAVIGATION BAR
   Usage:
   <div id="app-nav"></div>
   <script src="nav.js"></script>
   <script>initNav('write')</script>

   Options (second argument):
   initNav('index', { hideLinks: true })
     → hides page links, keeps brand + language toggle

   Language:
   getNavLang()       → 'en' | 'th'
   onLangChange(fn)   → register callback, fired on toggle
===================================================== */

/* ── Language state ── */
var _navLang       = localStorage.getItem('xhz_lang') || 'en';
var _langCallbacks = [];

function getNavLang() { return _navLang; }

function onLangChange(fn) {
    if (typeof fn === 'function') _langCallbacks.push(fn);
}

function _setLang(lang) {
    _navLang = lang;
    localStorage.setItem('xhz_lang', lang);

    document.querySelectorAll('.nav-lang-btn, .bottom-lang-btn')
        .forEach(function(btn) {
            btn.querySelector('.lang-en').classList.toggle('lang-active', lang === 'en');
            btn.querySelector('.lang-th').classList.toggle('lang-active', lang === 'th');
        });

    _langCallbacks.forEach(function(fn) { fn(lang); });
}

/* =====================================================
   INIT NAV
===================================================== */
function initNav(activePage, options) {
    options = options || {};
    var hideLinks = options.hideLinks === true;

    var pages = [
        { id: 'study', href: 'study.html', icon: '📖', label: 'Study' },
        { id: 'write', href: 'write.html', icon: '✍️',  label: 'Write' },
        { id: 'print', href: 'print.html', icon: '🖨️', label: 'Print' },
        { id: 'dojo', href: 'dojo.html', icon: '🥋', label: 'Dojo' },
        { id: 'progress', href: 'progress.html', icon: '🏆', label: 'Progress' }
    ];

    /* ── inject CSS ── */
    var style = document.createElement('style');
    style.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --theme-color:       #FFB347;
            --theme-color-light: #FFE0B255;
            --theme-color-pale:  #FFB34718;
        }

        /* ════════════════════════════
           TOP NAV
        ════════════════════════════ */
        .app-nav {
            background: var(--theme-color);
            padding: 0 16px;
            padding-top: env(safe-area-inset-top);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            transition: background 0.4s;
            height: 48px;
            z-index: 100;
        }

        .nav-brand {
            font-size: 1.1em;
            font-weight: bold;
            color: white;
            text-decoration: none;
            white-space: nowrap;
        }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* top nav links */
        .nav-links {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        .nav-link {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 6px 14px;
            border-radius: 20px;
            text-decoration: none;
            font-size: 0.85em;
            font-weight: bold;
            color: rgba(255,255,255,0.85);
            transition: background 0.2s, color 0.2s;
            white-space: nowrap;
        }
        .nav-link:hover {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        .nav-link.active {
            background: white;
            color: var(--theme-color);
        }
        .nav-link .nav-icon  { font-size: 1em; }
        .nav-link .nav-label { font-size: 0.9em; }

        /* ── language toggle (top nav) ── */
        .nav-lang-btn {
            display: flex;
            align-items: center;
            background: rgba(255,255,255,0.15);
            border: none;
            border-radius: 20px;
            padding: 4px 5px;
            cursor: pointer;
            gap: 2px;
            margin-left: 6px;
            transition: background 0.2s;
        }
        .nav-lang-btn:hover { background: rgba(255,255,255,0.25); }
        .nav-lang-btn span {
            font-size: 0.72em;
            font-weight: bold;
            color: rgba(255,255,255,0.6);
            padding: 2px 6px;
            border-radius: 12px;
            transition: background 0.2s, color 0.2s;
            line-height: 1.4;
        }
        .nav-lang-btn span.lang-active {
            background: white;
            color: var(--theme-color);
        }

        /* ════════════════════════════
           BOTTOM NAV
        ════════════════════════════ */
        .bottom-nav {
            display: none;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: calc(56px + env(safe-area-inset-bottom));
            padding-bottom: env(safe-area-inset-bottom);
            background: white;
            border-top: 2px solid var(--theme-color-light);
            z-index: 200;
            justify-content: space-around;
            align-items: center;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
            transition: border-color 0.4s;
        }
        .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            text-decoration: none;
            flex: 1;
            height: 100%;
            color: #bbb;
            transition: color 0.2s;
            padding-top: 6px;
        }
        .bottom-nav-item.active   { color: var(--theme-color); }
        .bottom-nav-icon  { font-size: 1.4em; line-height: 1; }
        .bottom-nav-label { font-size: 0.6em; font-weight: bold; }

        /* ── language toggle (bottom nav) ── */
        .bottom-lang-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            height: 100%;
            padding-top: 6px;
            gap: 3px;
            background: none;
            border: none;
            cursor: pointer;
        }
        .bottom-lang-inner {
            display: flex;
            gap: 2px;
            background: #f5f5f5;
            border-radius: 10px;
            padding: 2px 4px;
        }
        .bottom-lang-btn span {
            font-size: 0.62em;
            font-weight: bold;
            color: #bbb;
            padding: 1px 5px;
            border-radius: 8px;
            transition: background 0.2s, color 0.2s;
            line-height: 1.5;
        }
        .bottom-lang-btn span.lang-active {
            background: var(--theme-color);
            color: white;
        }
        .bottom-lang-label {
            font-size: 0.6em;
            font-weight: bold;
            color: #bbb;
        }

        /* ════════════════════════════
           RESPONSIVE
        ════════════════════════════ */
        @media (max-width: 600px) and (orientation: portrait) {
            .nav-links    { display: none; }
            .nav-lang-btn { display: none; }
            .bottom-nav   { display: flex; }
            body { padding-bottom: calc(56px + env(safe-area-inset-bottom)); }
        }

        @media (max-width: 900px) and (orientation: landscape) {
            .nav-link .nav-label { display: none; }
            .nav-link { padding: 6px 10px; }
        }
    `;
    document.head.appendChild(style);

    /* ── language toggle HTML (shared) ── */
    var langHTML =
        '<button class="nav-lang-btn" ' +
        'onclick="_setLang(getNavLang()===\'en\'?\'th\':\'en\')">' +
        '<span class="lang-en' + (_navLang === 'en' ? ' lang-active' : '') + '">EN</span>' +
        '<span class="lang-th' + (_navLang === 'th' ? ' lang-active' : '') + '">TH</span>' +
        '</button>';

    /* ── build top nav ── */
    var topNav = document.getElementById('app-nav');
    if (topNav) {
        topNav.className = 'app-nav';

        /* Brand always links to ?picker so it never auto-redirects */
        var brandHTML =
            '<a class="nav-brand" href="index.html">🐼 学汉字</a>';

        var linksHTML = '';
        if (!hideLinks) {
            linksHTML =
                '<nav class="nav-links">' +
                pages.map(function(p) {
                    return '<a href="' + p.href + '" class="nav-link' +
                        (p.id === activePage ? ' active' : '') + '">' +
                        '<span class="nav-icon">'  + p.icon  + '</span>' +
                        '<span class="nav-label">' + p.label + '</span>' +
                        '</a>';
                }).join('') +
                '</nav>';
        }

        topNav.innerHTML =
            brandHTML +
            '<div class="nav-right">' +
                linksHTML +
                langHTML +
            '</div>';
    }

    /* ── build bottom nav ── */
    var bottomNav    = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    bottomNav.id        = 'bottom-nav';

    var botLangHTML =
        '<button class="bottom-lang-btn" ' +
        'onclick="_setLang(getNavLang()===\'en\'?\'th\':\'en\')">' +
        '<div class="bottom-lang-inner">' +
          '<span class="lang-en' + (_navLang === 'en' ? ' lang-active' : '') + '">EN</span>' +
          '<span class="lang-th' + (_navLang === 'th' ? ' lang-active' : '') + '">TH</span>' +
        '</div>' +
        '<span class="bottom-lang-label">Lang</span>' +
        '</button>';

    if (!hideLinks) {
        /* normal pages: show all nav items + lang toggle */
        bottomNav.innerHTML =
            pages.map(function(p) {
                return '<a href="' + p.href + '" class="bottom-nav-item' +
                    (p.id === activePage ? ' active' : '') + '">' +
                    '<span class="bottom-nav-icon">'  + p.icon  + '</span>' +
                    '<span class="bottom-nav-label">' + p.label + '</span>' +
                    '</a>';
            }).join('') +
            botLangHTML;
    } else {
        /* index page: lang toggle only in bottom nav */
        bottomNav.innerHTML = botLangHTML;
    }

    document.body.appendChild(bottomNav);
}

/* ── theme color sync ── */
function setNavTheme(hex) {
    document.documentElement.style.setProperty('--theme-color',       hex);
    document.documentElement.style.setProperty('--theme-color-light',  hex + '55');
    document.documentElement.style.setProperty('--theme-color-pale',   hex + '18');
}