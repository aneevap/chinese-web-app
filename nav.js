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
    var hideLinks = options.hideLinks === true;

    var pages = [
        { id: 'study', href: 'study.html', icon: '📖', label: 'Study' },
        { id: 'write', href: 'write.html', icon: '✍️',  label: 'Write' },
        { id: 'print', href: 'print.html', icon: '🖨️', label: 'Print' },
        { id: 'dojo',  href: 'dojo.html',  icon: '🥋', label: 'Dojo' },
        { id: 'progress', href: 'progress.html', icon: '🏆', label: 'Progress' }
    ];

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
           TOP NAV BAR (all screen sizes)
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
            font-size: 1.05em;
            font-weight: 900;
            color: white;
            text-decoration: none;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 4px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        .nav-right::-webkit-scrollbar { display: none; }

        /* ── Nav links ── */
        .nav-links {
            display: flex;
            gap: 3px;
            align-items: center;
        }
        .nav-link {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            border-radius: var(--nav-radius-pill);
            text-decoration: none;
            font-size: 0.8em;
            font-weight: 800;
            color: rgba(255,255,255,0.7);
            transition: all 0.2s;
            white-space: nowrap;
            min-height: 36px;
            flex-shrink: 0;
        }
        .nav-link:hover {
            background: rgba(255,255,255,0.15);
            color: white;
        }
        .nav-link.active {
            background: var(--nav-white);
            color: var(--nav-teal);
            box-shadow: var(--nav-shadow);
        }
        .nav-link .nav-icon  { font-size: 1em; }
        .nav-link .nav-label { font-size: 0.88em; }

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
           NO BOTTOM NAV — removed entirely
        ════════════════════════════ */

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

            /* Show links on mobile too — same style, just compact */
            .nav-links {
                display: flex;
                gap: 2px;
            }

            /* Hide labels on mobile, show only icons */
            .nav-link .nav-label {
                display: none;
            }
            .nav-link {
                padding: 6px 10px;
                min-height: 34px;
                font-size: 0.9em;
            }

            /* Active item: show label */
            .nav-link.active .nav-label {
                display: inline;
                font-size: 0.82em;
            }
            .nav-link.active {
                padding: 6px 12px;
            }

            /* Smaller lang toggle */
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

        @media (max-width: 900px) and (orientation: landscape) {
            .nav-link .nav-label { display: none; }
            .nav-link { padding: 6px 10px; }
            .nav-link.active .nav-label { display: inline; }
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

    /* ── NO bottom nav created ── */
}

/* ── theme color sync ── */
function setNavTheme(hex) {
    document.documentElement.style.setProperty('--theme-color',       hex);
    document.documentElement.style.setProperty('--theme-color-light',  hex + '55');
    document.documentElement.style.setProperty('--theme-color-pale',   hex + '18');
}