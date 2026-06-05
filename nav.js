/* =====================================================
   SHARED NAVIGATION BAR — UNIFIED STYLE
   Usage:
   <div id="app-nav"></div>
   <script src="nav.js"></script>
   <script>initNav('write')</script>
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

    document.querySelectorAll('.nav-lang-btn')
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

    /* ── inject CSS ── */
    var style = document.createElement('style');
    style.textContent = `
        :root {
            --nav-teal:        #1B7B5E;
            --nav-teal-dark:   #145C47;
            --nav-teal-light:  #D0F0E4;
            --nav-bg:          #F2F1EC;
            --nav-white:       #FFFFFF;
            --nav-text-light:  #999999;
            --nav-radius-pill: 999px;
            --nav-shadow:      0 2px 8px rgba(0,0,0,0.1);
        }

        /* ════════════════════════════
           TOP NAV BAR (minimal — single home icon)
        ════════════════════════════ */
        .app-nav {
            background: var(--nav-teal);
            padding: 0 12px;
            padding-top: env(safe-area-inset-top);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            height: 52px;
            z-index: 100;
            font-family: 'Nunito', 'Segoe UI', Tahoma, sans-serif;
            gap: 8px;
        }

        .nav-brand {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 1.05em;
            font-weight: 900;
            color: white;
            text-decoration: none;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .nav-brand:hover { opacity: 0.85; }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* ── Dashboard home button ── */
        .nav-home-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 14px;
            border-radius: var(--nav-radius-pill);
            text-decoration: none;
            font-size: 0.8em;
            font-weight: 800;
            color: rgba(255,255,255,0.8);
            transition: all 0.2s;
            white-space: nowrap;
            min-height: 36px;
        }
        .nav-home-btn:hover {
            background: rgba(255,255,255,0.15);
            color: white;
        }
        .nav-home-btn.active {
            background: var(--nav-white);
            color: var(--nav-teal);
            box-shadow: var(--nav-shadow);
        }

        /* ── Language toggle ── */
        .nav-lang-btn {
            display: flex;
            align-items: center;
            background: rgba(255,255,255,0.15);
            border: none;
            border-radius: var(--nav-radius-pill);
            padding: 4px 5px;
            cursor: pointer;
            gap: 2px;
            margin-left: 4px;
            transition: background 0.2s;
            min-height: 36px;
            flex-shrink: 0;
        }
        .nav-lang-btn:hover { background: rgba(255,255,255,0.25); }
        .nav-lang-btn span {
            font-size: 0.7em;
            font-weight: 800;
            color: rgba(255,255,255,0.5);
            padding: 3px 7px;
            border-radius: var(--nav-radius-pill);
            transition: all 0.2s;
            line-height: 1.4;
        }
        .nav-lang-btn span.lang-active {
            background: white;
            color: var(--nav-teal);
        }

        /* ════════════════════════════
           RESPONSIVE — MOBILE
        ════════════════════════════ */
        @media (max-width: 600px) {
            .app-nav {
                height: 48px;
                padding: 0 8px;
                padding-top: env(safe-area-inset-top);
                gap: 6px;
            }
            .nav-brand {
                font-size: 0.92em;
            }
            .nav-home-btn {
                padding: 6px 10px;
                min-height: 34px;
                font-size: 0.9em;
            }
            .nav-lang-btn {
                padding: 3px 4px;
                margin-left: 2px;
                min-height: 32px;
            }
            .nav-lang-btn span {
                font-size: 0.62em;
                padding: 2px 6px;
            }
        }
    `;
    document.head.appendChild(style);

    /* ── language toggle HTML ── */
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

        var isDashboard = (activePage === 'dashboard');
        var homeIcon = isDashboard ? '🏠' : '🏠';
        var homeLabel = isDashboard ? '' : '';

        topNav.innerHTML =
            '<a class="nav-brand" href="dashboard.html">🐼 学汉字</a>' +
            '<div class="nav-right">' +
                '<a href="dashboard.html" class="nav-home-btn' +
                    (isDashboard ? ' active' : '') + '">' +
                    homeIcon + ' ' + homeLabel +
                '</a>' +
                langHTML +
            '</div>';
    }
}

/* ── theme color sync ── */
function setNavTheme(hex) {
    document.documentElement.style.setProperty('--theme-color',       hex);
    document.documentElement.style.setProperty('--theme-color-light',  hex + '55');
    document.documentElement.style.setProperty('--theme-color-pale',   hex + '18');
}