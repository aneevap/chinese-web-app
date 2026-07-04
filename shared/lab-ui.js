
/* ══════════════════════════════════════════════════════════════
   POTION SHOP — LABORATORY ENGINE
══════════════════════════════════════════════════════════════ */

var Lab = {};

Lab.sfx = (function () {
    var ctx = null;
    function getCtx() {
        if (!ctx) {
            try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
        }
        return ctx;
    }
    function play(freq, duration, type, vol) {
        var c = getCtx();
        if (!c) return;
        var osc = c.createOscillator();
        var gain = c.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, c.currentTime);
        gain.gain.setValueAtTime(vol || 0.12, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (duration || 0.15));
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + (duration || 0.15));
    }
    return {
        click: function () { play(800, 0.06, 'sine', 0.08); },
        success: function () {
            var c = getCtx();
            if (!c) return;
            [523, 659, 784].forEach(function (f, i) {
                var osc = c.createOscillator();
                var gain = c.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, c.currentTime + i * 0.08);
                gain.gain.setValueAtTime(0.10, c.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.08 + 0.2);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(c.currentTime + i * 0.08);
                osc.stop(c.currentTime + i * 0.08 + 0.2);
            });
        },
        fail: function () {
            var c = getCtx();
            if (!c) return;
            var osc = c.createOscillator();
            var gain = c.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, c.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, c.currentTime + 0.3);
            gain.gain.setValueAtTime(0.08, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + 0.3);
        },
        chain: function () {
            var c = getCtx();
            if (!c) return;
            [660, 880, 1100, 1320].forEach(function (f, i) {
                var osc = c.createOscillator();
                var gain = c.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, c.currentTime + i * 0.06);
                gain.gain.setValueAtTime(0.07, c.currentTime + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.06 + 0.25);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(c.currentTime + i * 0.06);
                osc.stop(c.currentTime + i * 0.06 + 0.25);
            });
        },
        decomp: function () {
            var c = getCtx();
            if (!c) return;
            for (var i = 0; i < 3; i++) {
                var osc = c.createOscillator();
                var gain = c.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(200 + i * 300, c.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.04, c.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.1 + 0.08);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(c.currentTime + i * 0.1);
                osc.stop(c.currentTime + i * 0.1 + 0.08);
            }
        },
        levelup: function () {
            var c = getCtx();
            if (!c) return;
            [523, 659, 784, 1047].forEach(function (f, i) {
                var osc = c.createOscillator();
                var gain = c.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, c.currentTime + i * 0.12);
                gain.gain.setValueAtTime(0.10, c.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.35);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(c.currentTime + i * 0.12);
                osc.stop(c.currentTime + i * 0.12 + 0.35);
            });
        },
        sparkle: function () {
            var c = getCtx();
            if (!c) return;
            [1047, 1319, 1568].forEach(function (f, i) {
                var osc = c.createOscillator();
                var gain = c.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, c.currentTime + i * 0.04);
                gain.gain.setValueAtTime(0.05, c.currentTime + i * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.04 + 0.12);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(c.currentTime + i * 0.04);
                osc.stop(c.currentTime + i * 0.04 + 0.12);
            });
        },
        retreat: function () {
            var c = getCtx();
            if (!c) return;
            [880, 660, 523].forEach(function (f, i) {
                var osc = c.createOscillator();
                var gain = c.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, c.currentTime + i * 0.05);
                gain.gain.setValueAtTime(0.04, c.currentTime + i * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.05 + 0.18);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(c.currentTime + i * 0.05);
                osc.stop(c.currentTime + i * 0.05 + 0.18);
            });
        }
    };
})();

Lab.state = {
    profileId: null,
    radicalData: null,
    reactionData: null,
    allRadicals: [],
    allReactions: [],
    // Mixing
    selectedRadicals: [null, null, null],
    // Random flask variant per radical
    flaskVariantMap: {},
    beakerAffinities: [null, null],
    tripleBlendMode: false,
    synthesisMode: false,
    lastResult: null,
    // Decomposition
    selectedDecompChar: null,
    // Collection filter
    collFilter: 'all',
    collCategory: 'all',
    // Shelf category filter
    shelfFilter: 'all',
    // Course data
    courseCharMap: {},
    wordData: {},
    grimoireFilter: 'all',
    selectedCreation: null,
    courseFiles: [
      'characters_1A.json', 'characters_1B.json',
      'characters_2a.json', 'characters_2b.json',
      'characters_3a.json', 'characters_3b.json',
      'characters_4a.json', 'characters_4b.json',
      'characters_5a.json', 'characters_5b.json',
      'characters_6a.json', 'characters_6b.json',
      'characters_hsk1.json', 'characters_hsk2.json',
      'characters_hsk3.json', 'characters_hsk4.json',
      'characters_hsk5.json', 'characters_hsk6.json',
      'characters_hsk20_1.json', 'characters_hsk20_2.json',
      'characters_hsk20_3.json', 'characters_hsk20_4.json',
      'characters_hsk20_5.json', 'characters_hsk20_6.json',
    ],
    ROUTE_SCHOOL: ['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'],
    ROUTE_HSK:   ['HSK1','HSK2','HSK3','HSK4','HSK5','HSK6','HSK20_1','HSK20_2','HSK20_3','HSK20_4','HSK20_5','HSK20_6'],
    userRoute: 'all'
};

// ── Helpers ──
function docID(id) { return document.getElementById(id); }
function setText(id, txt) { var el = docID(id); if (el) el.textContent = txt; }
function setStyle(id, prop, val) { var el = docID(id); if (el) el.style[prop] = val; }
function show(id) { var el = docID(id); if (el) el.style.display = ''; }
function hide(id) { var el = docID(id); if (el) el.style.display = 'none'; }

// ── Category metadata ──
var LAB_CATEGORY_META = {
    'abstract':     { emoji: '\uD83D\uDCAD', color: '#D4A574', glow: 'rgba(212,165,116,0.25)' },
    'body':         { emoji: '\uD83E\uDDCD', color: '#D89B9B', glow: 'rgba(216,155,155,0.25)' },
    'civilization': { emoji: '\uD83C\uDFDB', color: '#A4C2D9', glow: 'rgba(164,194,217,0.25)' },
    'fauna':        { emoji: '\uD83E\uDD8A', color: '#E8C547', glow: 'rgba(232,197,71,0.25)' },
    'nature':       { emoji: '\uD83C\uDF3F', color: '#94A88E', glow: 'rgba(148,168,142,0.25)' },
    'other':        { emoji: '\uD83D\uDCE6', color: '#A89580', glow: 'rgba(168,149,128,0.25)' }
};

function getCategoryColor(char) {
    var rads = Lab.state.allRadicals || [];
    for (var i = 0; i < rads.length; i++) {
        if (rads[i].char === char) {
            var cat = rads[i].doodle_category || rads[i].category || 'other';
            var meta = LAB_CATEGORY_META[cat];
            return meta ? meta.color : '#A89580';
        }
    }
    return '#A89580';
}

function getCategoryMeta(char) {
    var rads = Lab.state.allRadicals || [];
    for (var i = 0; i < rads.length; i++) {
        if (rads[i].char === char) {
            var cat = rads[i].doodle_category || rads[i].category || 'other';
            return LAB_CATEGORY_META[cat] || LAB_CATEGORY_META['other'];
        }
    }
    return LAB_CATEGORY_META['other'];
}

function getCategoryId(char) {
    var rads = Lab.state.allRadicals || [];
    for (var i = 0; i < rads.length; i++) {
        if (rads[i].char === char) {
            return rads[i].doodle_category || rads[i].category || 'other';
        }
    }
    return 'other';
}

// Convert hex color to rgba string with given opacity
function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (opacity || 0.3) + ')';
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */

Lab.init = function () {
    var p = XHZ.getActiveProfile();
    if (!p) {
        var allProfiles = XHZ.getAllProfiles ? XHZ.getAllProfiles() : [];
        if (allProfiles.length > 0) {
            XHZ.setActive(allProfiles[0].id);
            p = allProfiles[0];
        } else {
            try {
                var raw = localStorage.getItem('xhz_profiles');
                if (raw) {
                    var parsed = JSON.parse(raw);
                    var arr = parsed && parsed.profiles ? parsed.profiles : [];
                    if (arr.length > 0) {
                        XHZ.setActive(arr[0].id);
                        p = arr[0];
                    }
                }
            } catch(e) {}
        }
    }
    if (!p) {
        var banner = document.createElement('div');
        banner.id = 'lab-no-profile-banner';
        banner.style.cssText = 'background:rgba(239,68,68,0.1);border:3px solid rgba(239,68,68,0.3);border-radius:var(--card-radius);padding:12px 16px;text-align:center;flex-shrink:0;';
        banner.innerHTML = '<span style="font-size:1.1em;">⚠️</span> <span style="font-weight:700;color:var(--lab-extract);">No profile detected!</span> '
            + '<span style="color:var(--lab-text-soft);font-size:0.85em;">Visit the </span>'
            + '<a href="dashboard.html" style="color:var(--lab-brew);font-weight:700;font-size:0.85em;">Dashboard</a>'
            + '<span style="color:var(--lab-text-soft);font-size:0.85em;"> to create or select a profile!</span>';
        var page = document.querySelector('.lab-page');
        if (page) page.insertBefore(banner, page.firstChild);
        return;
    }
    Lab.state.profileId = p.id;

    // Wire up right panel tabs (desktop)
    document.querySelectorAll('.right-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            Lab.switchTab(tab.dataset.tab);
        });
    });
    // Wire up mobile bar tab pills
    document.querySelectorAll('.lmb-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            Lab.switchTab(tab.dataset.tab);
        });
    });
    docID('lab-branch-modal').addEventListener('click', function (e) {
        if (e.target === this) Lab.closeBranchingModal();
    });

    fetch('radicals.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            XHZ.loadRadicalData(data);
            Lab.state.radicalData = data;
            Lab.state.allRadicals = data.radicals || [];
            Lab.renderGrimoire();
            Lab.renderSidebarCategories();
            Lab.renderRadicalPicker();
            XHZ.autoClaimLevelRewards(p.id);
            Lab.updateTopbar();
        })
        .catch(function (err) {
            console.error('Failed to load radicals.json', err);
        });

    fetch('reactions.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            XHZ.loadReactionData(data);
            Lab.state.reactionData = data;
            Lab.state.allReactions = data.reactions || [];
            Lab.renderDecompList();
            Lab.renderCreations();
        })
        .catch(function (err) {
            console.error('Failed to load reactions.json', err);
        });

    fetch('chain_reactions.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            XHZ.loadChainReactionData(data);
        })
        .catch(function (err) {
            console.error('Failed to load chain_reactions.json', err);
        });

    fetch('three_component_reactions.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            XHZ.loadThreeComponentData(data);
        })
        .catch(function (err) {
            console.error('Failed to load three_component_reactions.json', err);
        });

    Lab.updateBlendToggle();
    Lab.loadCourseData();
    Lab.updateTopbar();
    Lab.renderDecompList();
    Lab.renderCreations();

    console.log('🧪 Potion Shop init complete', {
        profileId: Lab.state.profileId,
        radicalDataLoaded: !!Lab.state.radicalData,
        reactionDataLoaded: !!Lab.state.reactionData
    });

    window.addEventListener('focus', function () {
        Lab.updateTopbar();
    });

    // Re-measure shelf row height on resize (grid column count changes)
    var _resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(function () {
            Lab._updateShelfRowHeight();
        }, 200);
    });
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { Lab.init(); });
} else {
    Lab.init();
}

/* ══════════════════════════════════════════════════════════════
   TAB SWITCHING — Right panel tabs
══════════════════════════════════════════════════════════════ */

Lab.switchTab = function (tabId) {
    // Desktop tabs
    document.querySelectorAll('.right-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    // Mobile bar tabs
    document.querySelectorAll('.lmb-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    document.querySelectorAll('.rc-panel').forEach(function (panel) {
        panel.classList.toggle('active', panel.id === 'rc-' + tabId);
    });

    // Show/hide left column (flask area) — hidden on grimoire for full-width book
    var labLeft = document.querySelector('.lab-left');
    if (labLeft) {
        labLeft.classList.toggle('lab-left-hidden', tabId === 'grimoire');
    }

    // Hide sidebar and remove content padding in grimoire mode for full-width book
    var panelBody = docID('right-panel-body');
    if (panelBody) {
        panelBody.classList.toggle('grimoire-mode', tabId === 'grimoire');
    }
    // Also toggle grimoire-mode on right-panel to fix corner clipping
    var rightPanel = docID('right-panel');
    if (rightPanel) {
        rightPanel.classList.toggle('grimoire-mode', tabId === 'grimoire');
    }
    // Remove page bottom padding in grimoire mode so the book reaches the bottom
    var labPage = document.querySelector('.lab-page');
    if (labPage) {
        labPage.classList.toggle('grimoire-mode', tabId === 'grimoire');
    }

    // Clear decomp state when leaving decomp tab
    if (tabId !== 'decomp' && Lab.state.selectedDecompChar) {
        Lab.state.selectedDecompChar = null;
        Lab.state.selectedRadicals = [null, null, null];
        var detail = docID('extract-detail');
        if (detail) detail.classList.remove('visible');
        var flaskOverlay = docID('flask-result-overlay');
        if (flaskOverlay) flaskOverlay.classList.remove('visible');
        Lab.updateFlaskSlots();
    }
    // Reset panda message if leaving decomp
    if (tabId === 'shelf') {
        var msgEl = docID('panda-msg');
        if (msgEl) msgEl.textContent = 'Drop some ingredients in the cauldron! \uD83C\uDF3F';
    }

    var pid = Lab.state.profileId;
    if (!pid) return;
    if (tabId === 'shelf') {
        Lab.renderRadicalPicker();
        Lab.renderSidebarCategories();
    } else if (tabId === 'decomp') {
        Lab.renderDecompList();
    } else if (tabId === 'grimoire') {
        Lab.renderGrimoire();
    }
};

/* ══════════════════════════════════════════════════════════════
   PLAYER CARD / STATS — Left column player card + grimoire
══════════════════════════════════════════════════════════════ */

Lab.updateTopbar = function () {
    var pid = Lab.state.profileId;
    if (!pid) return;
    var level = XHZ.getLevel(pid);
    var progress = XHZ.getLevelProgress(pid);
    var totalStars = XHZ.getTotalStars(pid);
    var energy = XHZ.getLabEnergy(pid);
    var maxEnergy = XHZ.getMaxLabEnergy();

    // Player card in left column (desktop)
    setText('lab-level-val', 'Lv ' + level);
    setText('lab-stars-val', totalStars);
    setText('lab-energy-val', energy + '/' + maxEnergy);
    setText('lab-xp-text', progress.starsOwned + ' / ' + (progress.starsNeeded || 0));
    setStyle('lab-xp-bar', 'width', progress.progressPercent + '%');

    // Mobile bar
    setText('lmb-level', 'Lv ' + level);
    setText('lmb-energy', '\u26A1' + energy);
    setText('lmb-stars', '\u2B50' + totalStars);

    // Profile name
    var p = XHZ.getActiveProfile();
    if (p) {
        setText('lab-profile-name', p.name || '—');
    }

    if (pid && Lab.state.radicalData) {
        var allRads = XHZ.getAllUserRadicals ? XHZ.getAllUserRadicals(pid) : [];
        // Update creations count in the book
        var discovered = XHZ.getDiscoveredCharacters(pid);
        var chars = Object.keys(discovered);
        setText('gb-creations-count', chars.length);
    }
};

/* ══════════════════════════════════════════════════════════════
   BREW — Flask drop zones
══════════════════════════════════════════════════════════════ */

Lab.updateFlaskSlots = function () {
    var sel = Lab.state.selectedRadicals;
    for (var i = 0; i < 2; i++) {
        var charEl = docID('dz-char-' + i);
        var labelEl = docID('dz-label-' + i);
        var zoneEl = docID(i === 0 ? 'dz-left' : 'dz-right');
        if (sel[i]) {
            if (charEl) { charEl.textContent = sel[i]; charEl.style.display = ''; }
            if (labelEl) labelEl.style.display = 'none';
            if (zoneEl) {
                zoneEl.classList.add('selected');
                var glowColor = getCategoryColor(sel[i]);
                zoneEl.style.setProperty('--dz-glow-color', glowColor);
                zoneEl.style.setProperty('--dz-glow-soft', glowColor);
                zoneEl.style.setProperty('--dz-glow-bg', hexToRgba(glowColor, 0.3));
                zoneEl.style.setProperty('--dz-char-color', '#000000');
            }
        } else {
            if (charEl) { charEl.style.display = 'none'; }
            if (labelEl) { labelEl.style.display = ''; labelEl.textContent = '?'; }
            if (zoneEl) {
                zoneEl.classList.remove('selected');
                zoneEl.style.removeProperty('--dz-glow-color');
                zoneEl.style.removeProperty('--dz-glow-soft');
                zoneEl.style.removeProperty('--dz-glow-bg');
                zoneEl.style.removeProperty('--dz-char-color');
            }
        }
    }

    // Third slot
    var thirdZone = docID('dz-third');
    var thirdChar = docID('dz-char-2');
    var thirdLabel = docID('dz-label-2');
    if (sel[2]) {
        if (thirdChar) { thirdChar.textContent = sel[2]; thirdChar.style.display = ''; }
        if (thirdLabel) thirdLabel.style.display = 'none';
        if (thirdZone) {
            thirdZone.classList.add('selected');
            thirdZone.classList.add('visible');
            var tColor = getCategoryColor(sel[2]);
            thirdZone.style.setProperty('--dz-glow-color', tColor);
            thirdZone.style.setProperty('--dz-glow-soft', tColor);
            thirdZone.style.setProperty('--dz-glow-bg', hexToRgba(tColor, 0.3));
            thirdZone.style.setProperty('--dz-char-color', '#4a3a28');
        }
    } else {
        if (thirdChar) thirdChar.style.display = 'none';
        if (thirdLabel) { thirdLabel.style.display = ''; thirdLabel.textContent = '?'; }
        if (thirdZone) {
            thirdZone.classList.remove('selected');
            thirdZone.style.removeProperty('--dz-glow-color');
            thirdZone.style.removeProperty('--dz-glow-soft');
            thirdZone.style.removeProperty('--dz-glow-bg');
            thirdZone.style.removeProperty('--dz-char-color');
        }
    }

    // Show/hide 3rd slot based on whether extend options exist
    if (sel[0] && sel[1] && Lab.state._extendOptions && Lab.state._extendOptions.length > 0) {
        if (thirdZone) thirdZone.classList.add('visible');
    } else if (!sel[2]) {
        if (thirdZone) thirdZone.classList.remove('visible');
    }

    // Compute filled count
    var filledCount = (sel[0] ? 1 : 0) + (sel[1] ? 1 : 0) + (sel[2] ? 1 : 0);

    // Show appropriate lower frame state
    if (filledCount > 0) {
        Lab.showLowerFrame('actions');
    } else {
        Lab.showLowerFrame('welcome');
    }
    // Hide result if it was showing
    Lab.hideLowerFrameResult();

    // Update lower-frame action prompt text
    var promptEl = docID('lf-action-prompt');
    if (promptEl) {
        if (filledCount === 0) promptEl.textContent = 'Select ingredients from the shelf above!';
        else if (filledCount === 1) promptEl.textContent = 'Pick a second ingredient to brew!';
        else if (filledCount === 2 && Lab.state._extendOptions && Lab.state._extendOptions.length > 0) {
            promptEl.textContent = '2 ingredients ready! Or extend to 3 below! \u2697\uFE0F';
        } else if (filledCount === 2) {
            promptEl.textContent = '2 ingredients ready! Hit the Brew button! \u2697\uFE0F';
        } else {
            promptEl.textContent = 'Ready to brew! Hit the Brew button! \u2728';
        }
    }

    // Update panda message
    Lab.updatePandaMessage(sel);

    // Show rotating tip in welcome state
    var tipEl = docID('brew-tip');
    if (tipEl && !sel[0] && !sel[1]) {
        var tips = [
            '\uD83D\uDD25 Try: \u706B + \u706B = \u708E! (flame)',
            '\uD83C\uDF1E \u65E5 + \u6708 = \u660E! (bright)',
            '\uD83D\uDD25 \u706B + \u706B + \u706B = \u708E\u708E... wait, that\'s 3!',
            '\uD83D\uDD0D \u53E3 + \u53E3 + \u53E3 = \u54C1!',
            '\u2728 You have ' + (Lab.state.profileId ? XHZ.getAllUserRadicals(Lab.state.profileId).length : 0) + ' ingredients to explore!'
        ];
        tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
    }

    // Clear button visibility (visible only when at least 1 radical is in the flask)
    var clearBtn = docID('flask-clear-btn');
    if (clearBtn) {
        clearBtn.classList.toggle('visible', filledCount > 0);
    }

    // Flask stove button brew-readiness
    var flaskBtn = docID('flask-mix-btn');
    if (flaskBtn) {
        var wasDisabled = flaskBtn.classList.contains('disabled');
        flaskBtn.classList.toggle('disabled', filledCount < 2);
        var nowDisabled = filledCount < 2;
        // Subtle animation when button re-enables (disabled → enabled)
        if (wasDisabled && !nowDisabled) {
            if (Lab.state._mixReEnableTimer) {
                clearTimeout(Lab.state._mixReEnableTimer);
                Lab.state._mixReEnableTimer = null;
            }
            flaskBtn.classList.remove('mix-reenabled');
            void flaskBtn.offsetWidth;
            flaskBtn.classList.add('mix-reenabled');
            Lab.state._mixReEnableTimer = setTimeout(function () {
                flaskBtn.classList.remove('mix-reenabled');
                Lab.state._mixReEnableTimer = null;
            }, 700);
        }
    }

    // Compute chain options
    if (Lab.state.profileId && sel[0] && sel[1]) {
        var filled = [sel[0], sel[1]];
        var extendOpts = Lab.computeExtendOptions(Lab.state.profileId, filled);
        Lab.state._extendOptions = extendOpts.length > 0 ? extendOpts : null;
    } else {
        Lab.state._extendOptions = null;
    }
    Lab.renderChainButtons();
};

Lab.updatePandaMessage = function (sel) {
    var msgEl = docID('panda-msg');
    if (!msgEl) return;

    var filled = (sel[0] ? 1 : 0) + (sel[1] ? 1 : 0) + (sel[2] ? 1 : 0);

    // Remove mood classes from panda image
    var pandaImg = docID('panda-image');
    if (pandaImg) pandaImg.classList.remove('excited', 'sad');

    if (filled === 0) {
        msgEl.textContent = 'Drop some ingredients in the cauldron! \uD83C\uDF3F';
    } else if (filled === 1) {
        msgEl.textContent = 'Pick a second ingredient to brew!';
    } else if (filled === 2) {
        msgEl.textContent = 'Ready to brew! Hit the button! \u2697\uFE0F';
    } else {
        msgEl.textContent = 'A triple brew! This could be powerful! \u2728';
    }
};

Lab.setPandaExcited = function () {
    var pandaImg = docID('panda-image');
    if (pandaImg) {
        pandaImg.classList.remove('sad');
        pandaImg.classList.add('excited');
    }
};

Lab.setPandaSad = function () {
    var pandaImg = docID('panda-image');
    if (pandaImg) {
        pandaImg.classList.remove('excited');
        pandaImg.classList.add('sad');
    }
};

Lab.resetMixState = function () {
    Lab.state.selectedRadicals = [null, null, null];
    Lab.state.tripleBlendMode = false;
    Lab.state.lastResult = null;
    Lab.state.synthesisMode = false;

    // Show welcome state in lower frame
    Lab.showLowerFrame('welcome');
    Lab.hideLowerFrameResult();

    Lab.state._extendOptions = null;
    Lab.updateFlaskSlots();
    Lab.updatePandaMessage([null, null, null]);
};

function onFlaskDropClick(index) {
    if (Lab.state.synthesisMode) return;
    var sel = Lab.state.selectedRadicals;
    if (sel[index]) {
        var removedChar = sel[index];
        sel[index] = null;
        Lab.updateFlaskSlots();
        Lab.renderRadicalPicker();
        Lab.sfx.click();

        // Reverse sparkle trail from drop zone back to flask card
        if (removedChar) {
            var fromZone = docID(index === 0 ? 'dz-left' : index === 1 ? 'dz-right' : 'dz-third');
            var allCards = document.querySelectorAll('#brew-shelves .flask-card');
            var targetCard = null;
            for (var ci = 0; ci < allCards.length; ci++) {
                var charEl = allCards[ci].querySelector('.flask-char');
                if (charEl && charEl.textContent === removedChar) {
                    targetCard = allCards[ci];
                    break;
                }
            }
            if (fromZone && targetCard) {
                Lab.spawnSparkleTrail(fromZone, targetCard, removedChar, true);
            }
        }
    }
}

function clearMixSelection() {
    // Also clear decomp state if it was active
    if (Lab.state.selectedDecompChar) {
        clearDecompSelection();
        return;
    }
    if (Lab.state.synthesisMode) {
        Lab.state.synthesisMode = false;
        Lab.resetMixState();
    }
    Lab.state._extendOptions = null;
    Lab.resetMixState();
    Lab.updateFlaskSlots();
    Lab.renderRadicalPicker();
}

/* ══════════════════════════════════════════════════════════════
   BREW — Chain reactions & Mix
══════════════════════════════════════════════════════════════ */

Lab.computeExtendOptions = function (pid, filled) {
    if (!pid || !filled || filled.length < 2) return [];
    var earnedRads = XHZ.getAllUserRadicals ? XHZ.getAllUserRadicals(pid) : [];
    var ownedSet = {};
    for (var oi = 0; oi < earnedRads.length; oi++) { ownedSet[earnedRads[oi]] = true; }

    var all3Comp = XHZ.getAllThreeComponentReactions ? XHZ.getAllThreeComponentReactions() : [];
    if (!all3Comp || !all3Comp.length) return [];

    var extendOptions = [];
    for (var ei = 0; ei < all3Comp.length; ei++) {
        var tc = all3Comp[ei];
        var tcRads = tc.radicals || [];
        if (tcRads.length !== 3) continue;

        var r1 = filled[0], r2 = filled[1];
        var tcSet = {};
        for (var si = 0; si < tcRads.length; si++) { tcSet[tcRads[si]] = (tcSet[tcRads[si]] || 0) + 1; }

        var remaining = {};
        for (var k in tcSet) { remaining[k] = tcSet[k]; }

        var r1found = false;
        if (remaining[r1] && remaining[r1] > 0) { remaining[r1]--; r1found = true; }
        var r2found = false;
        if (r2 !== r1 && remaining[r2] && remaining[r2] > 0) { remaining[r2]--; r2found = true; }
        else if (r2 === r1 && r1found && remaining[r1] && remaining[r1] > 0) { remaining[r1]--; r2found = true; }

        if (!r1found || !r2found) continue;

        var thirdRad = null;
        for (var k in remaining) { if (remaining[k] > 0) { thirdRad = k; break; } }
        if (!thirdRad) continue;

        var tcResult = tc.result || tc.char;
        var already = false;
        for (var di = 0; di < extendOptions.length; di++) {
            if (extendOptions[di].char === tcResult) { already = true; break; }
        }
        if (!already) {
            extendOptions.push({
                char: tcResult,
                pinyin: tc.pinyin || '',
                meaning: tc.meaning || '',
                thirdRad: thirdRad,
                radicals: tcRads,
                locked: !ownedSet[thirdRad] && thirdRad !== r1 && thirdRad !== r2
            });
        }
    }
    return extendOptions;
};

Lab.renderChainButtons = function () {
    // Chain reactions info shown on flask stove button
    var options = Lab.state._extendOptions;
    var flaskBtn = docID('flask-mix-btn');
    if (!flaskBtn) return;
    var label = flaskBtn.querySelector('.fmb-label');
    if (options && options.length > 0) {
        if (label) label.textContent = 'MIX +' + options.length;
    } else {
        if (label) label.textContent = 'MIX';
    }

    // Render chain option buttons in the lower frame
    var chainSection = docID('lf-chain-section');
    var chainGrid = docID('lf-chain-grid');
    if (!chainSection || !chainGrid) return;

    if (options && options.length > 0) {
        chainSection.style.display = '';
        var html = '';
        for (var i = 0; i < options.length; i++) {
            var opt = options[i];
            var btnClass = 'lf-chain-btn' + (opt.locked ? ' locked' : '');
            html += '<button class="' + btnClass + '" onclick="onChainClick(' + i + ')" title="' + (opt.meaning || '') + '">' +
                '<span class="lcb-rad">' + opt.thirdRad + '</span>' +
                '<span class="lcb-arrow">→</span>' +
                '<span class="lcb-char">' + opt.char + '</span>' +
                (opt.locked ? '<span class="lcb-lock">🔒</span>' : '') +
                '</button>';
        }
        chainGrid.innerHTML = html;
    } else {
        chainSection.style.display = 'none';
        chainGrid.innerHTML = '';
    }
};

function onChainClick(index) {
    if (!Lab.state || !Lab.state._extendOptions) return;
    var opt = Lab.state._extendOptions[index];
    if (!opt) return;
    if (opt.locked) {
        Lab.showToast('\ud83d\udd12', 'Locked!', 'You need the radical ' + opt.thirdRad + ' to extend this combination.', 'Got it');
        return;
    }
    var pid = Lab.state.profileId;
    if (!pid) return;

    docID('flask-mix-btn').classList.add('disabled');

    Lab.sfx.chain();

    var allRads = opt.radicals || [];
    Lab.state.lastResult = { char: opt.char, pinyin: opt.pinyin || '', meaning: opt.meaning || '', radicals: allRads };
    Lab.state._extendOptions = null;

    showFlaskOverlay(true, opt.char, opt.pinyin, opt.meaning, allRads);

    XHZ.incrementLabStat(pid, 'total_triple_blends');
    XHZ.incrementLabStat(pid, 'total_mix_successes');
    allRads.forEach(function (r) { XHZ.incrementLabStat(pid, 'radical_usage', r); });

    var alreadyDiscovered = XHZ.hasDiscoveredCharacter(pid, opt.char);
    XHZ.addDiscoveredCharacter(pid, opt.char, allRads, { pinyin: opt.pinyin || '', meaning: opt.meaning || '' });

    if (!alreadyDiscovered) {
        Lab.renderCreations();
        Lab.sfx.success();
        setTimeout(function () {
            Lab.showToast('\ud83d\udd2e', 'Extended!', allRads.join(' + ') + ' \u2192 ' + opt.char + (opt.pinyin ? ' (' + opt.pinyin + ')' : ''), 'Awesome!');
        }, 400);
    }
}

function onMixClick() {
    var sel = Lab.state.selectedRadicals;
    var pid = Lab.state.profileId;
    if (!pid) return;

    Lab.state._extendOptions = null;
    Lab.renderChainButtons();

    var filled = [];
    for (var i = 0; i < sel.length; i++) {
        if (sel[i]) filled.push(sel[i]);
    }
    if (filled.length < 2) return;

    var result = XHZ.checkReaction(filled[0], filled[1]);

    if (result && filled[0] === filled[1]) {
        var all3Comp = XHZ.getAllThreeComponentReactions ? XHZ.getAllThreeComponentReactions() : [];
        for (var ti = 0; ti < all3Comp.length; ti++) {
            var tc = all3Comp[ti];
            var tcRads = tc.radicals || [];
            if (tcRads.length === 3 &&
                tcRads[0] === filled[0] && tcRads[1] === filled[0] && tcRads[2] === filled[0] &&
                (tc.result === result.result || tc.char === result.result)) {
                result = null;
                break;
            }
        }
    }

    XHZ.incrementLabStat(pid, 'total_mix_attempts');

    if (result) {
        var char = result.result || result.char;
        var pinyin = result.pinyin || '';
        var meaning = result.meaning || '';
        var radicals = result.radicals || filled;

        XHZ.incrementLabStat(pid, 'total_mix_successes');
        filled.forEach(function (r) { XHZ.incrementLabStat(pid, 'radical_usage', r); });

        Lab.state.lastResult = { char: char, pinyin: pinyin, meaning: meaning, radicals: radicals };

        if (!XHZ.hasDiscoveredCharacter(pid, char)) { Lab.sfx.success(); }

        showFlaskOverlay(true, char, pinyin, meaning, radicals);

        var alreadyDisc = XHZ.hasDiscoveredCharacter(pid, char);
        XHZ.addDiscoveredCharacter(pid, char, radicals, { pinyin: pinyin, meaning: meaning });

        if (!alreadyDisc) { Lab.renderCreations(); }

        var flaskBtn = docID('flask-mix-btn');
        if (flaskBtn) flaskBtn.classList.add('disabled');
    } else {
        var hintRads = XHZ.getAllThreeComponentReactions ? XHZ.getAllThreeComponentReactions() : [];
        var failMsg = '\uD83D\uDCA5 No reaction! Try different ingredients.';
        for (var fi = 0; fi < hintRads.length; fi++) {
            var hr = hintRads[fi];
            var hrRads = hr.radicals || [];
            if (hrRads.length !== 3) continue;
            var hSet = {};
            for (var si2 = 0; si2 < hrRads.length; si2++) { hSet[hrRads[si2]] = (hSet[hrRads[si2]] || 0) + 1; }
            var had1 = false, had2 = false;
            if (hSet[filled[0]] && hSet[filled[0]] > 0) { hSet[filled[0]]--; had1 = true; }
            if (hSet[filled[1]] && hSet[filled[1]] > 0) { hSet[filled[1]]--; had2 = true; }
            if (had1 && had2) {
                for (var k in hSet) {
                    if (hSet[k] > 0) {
                        var ownedRads3 = XHZ.getAllUserRadicals ? XHZ.getAllUserRadicals(pid) : [];
                        var ownedSet3 = {};
                        for (var oi3 = 0; oi3 < ownedRads3.length; oi3++) { ownedSet3[ownedRads3[oi3]] = true; }
                        if (ownedSet3[k] || k === filled[0] || k === filled[1]) {
                            failMsg = '\uD83D\uDCA5 Needs 3! Try adding ' + k + ' to create ' + (hr.char || hr.result) + '.';
                        }
                        break;
                    }
                }
                break;
            }
        }

        XHZ.incrementLabStat(pid, 'total_mix_failures');
        Lab.state._extendOptions = null;
        Lab.state.lastResult = { char: null, pinyin: '', meaning: failMsg, radicals: filled };
        var flaskBtn = docID('flask-mix-btn');
        if (flaskBtn) flaskBtn.classList.add('disabled');
        showFlaskOverlay(false, '?', '', failMsg, filled);
        Lab.sfx.fail();
    }
}

/* ══════════════════════════════════════════════════════════════
   LOWER FRAME — Result / hint / chain display (replaces overlay)
══════════════════════════════════════════════════════════════ */

Lab.showLowerFrame = function (state) {
    // Hide all states
    var states = ['lf-welcome', 'lf-result', 'lf-brewing', 'lf-actions'];
    for (var si = 0; si < states.length; si++) {
        var el = docID(states[si]);
        if (el) el.style.display = 'none';
    }
    // Show requested state
    var target = docID('lf-' + state);
    if (target) target.style.display = '';
};

Lab.hideLowerFrameResult = function () {
    var lfResult = docID('lf-result');
    if (lfResult) {
        lfResult.classList.remove('success', 'fail');
        lfResult.style.display = 'none';
    }
};

function lowerFrameContinue() {
    // Clear mix state and return to welcome
    Lab.state.lastResult = null;
    Lab.state._extendOptions = null;
    
    // Clear liquid fill in hero flask
    var heroLiquid = docID('hero-liquid');
    if (heroLiquid) {
        heroLiquid.classList.remove('filling');
        heroLiquid.style.setProperty('--liquid-color', '');
    }
    
    // Hide flask result character overlay
    var flaskOverlay = docID('flask-result-overlay');
    if (flaskOverlay) flaskOverlay.classList.remove('visible');
    
    // Remove any smoke particles
    var smokeContainer = docID('flask-smoke');
    if (smokeContainer) {
        smokeContainer.classList.remove('active');
        smokeContainer.innerHTML = '';
    }
    
    Lab.resetMixState();
}

function showFlaskOverlay(isSuccess, char, pinyin, meaning, radicals) {
    // This now shows results in the lower frame instead of a full-screen overlay
    // First: show brewing state + shake animation
    Lab.showLowerFrame('brewing');

    // Shake the flask
    var heroFlask = docID('hero-flask');
    if (heroFlask) heroFlask.classList.add('shaking');
    
    // Liquid fill effect in hero flask
    var heroLiquid = docID('hero-liquid');
    if (heroLiquid) {
        var color = null;
        if (radicals && radicals[0]) color = getCategoryColor(radicals[0]);
        if (color) {
            heroLiquid.style.setProperty('--liquid-color', color);
            setTimeout(function () {
                heroLiquid.classList.add('filling');
            }, 150);
        }
    }

    var duration = isSuccess ? 1400 : 1000;
    setTimeout(function () {
        // Stop shaking
        if (heroFlask) heroFlask.classList.remove('shaking');
        
        // Populate lower frame result
        var lfResult = docID('lf-result');
        var lfChar = docID('lf-result-char');
        var lfInfo = docID('lf-result-info');
        var lfRecipe = docID('lf-result-recipe');
        var lfBadge = docID('lf-result-badge');
        if (lfChar) lfChar.textContent = char;
        var recipeStr = radicals.join(' + ');
        // Truncate long meanings
        var fullMeaning = (pinyin || '') + (meaning ? ' \u00B7 ' + meaning : '') + '  \u2502  ' + recipeStr;
        var shortMeaning = (pinyin || '') + (meaning ? ' \u00B7 ' + meaning : '');
        var maxMeaningChars = 50;
        if (shortMeaning.length > maxMeaningChars) {
            shortMeaning = shortMeaning.substring(0, maxMeaningChars) + '\u2026';
        }
        if (lfInfo) {
            lfInfo.textContent = shortMeaning + '  \u2502  ' + recipeStr;
            lfInfo.title = fullMeaning;
        }
        if (lfRecipe) lfRecipe.style.display = 'none';

        if (lfResult) {
            lfResult.className = 'lf-content lf-result';
            if (isSuccess) {
                lfResult.classList.add('success');
                if (lfBadge) {
                    lfBadge.textContent = '\u2705 Discovered!';
                    lfBadge.className = 'lf-result-badge success';
                }
                // Sparkle burst!
                Lab.spawnBurstParticles();
                Lab.setPandaExcited();
                
                // Show result character in the flask itself
                var flaskOverlay = docID('flask-result-overlay');
                var flaskChar = docID('flask-result-char');
                if (flaskChar) flaskChar.textContent = char;
                if (flaskOverlay) flaskOverlay.classList.add('visible');

                // Add category-colored glow to hero flask
                if (radicals && radicals[0] && heroFlask) {
                    var glowColor = getCategoryColor(radicals[0]);
                    heroFlask.style.setProperty('--reaction-color', glowColor);
                    heroFlask.classList.add('reaction-glow');
                    setTimeout(function () {
                        heroFlask.classList.remove('reaction-glow');
                    }, 2500);
                }
            } else {
                lfResult.classList.add('fail');
                if (lfBadge) {
                    lfBadge.textContent = '\u274C No reaction';
                    lfBadge.className = 'lf-result-badge fail';
                }
                Lab.setPandaSad();
                // Spawn smoke effect on the flask
                Lab.spawnSmoke();
            }
        }
        Lab.showLowerFrame('result');

        // Clear radical characters from drop zones now that brewing is complete
        Lab.state.selectedRadicals = [null, null, null];
        for (var si = 0; si < 2; si++) {
            var charEl = docID('dz-char-' + si);
            var labelEl = docID('dz-label-' + si);
            var zoneEl = docID(si === 0 ? 'dz-left' : 'dz-right');
            if (charEl) { charEl.textContent = ''; charEl.style.display = 'none'; }
            if (labelEl) { labelEl.style.display = ''; labelEl.textContent = '?'; }
            if (zoneEl) zoneEl.classList.remove('selected');
        }
        // Clear third slot too
        var tChar = docID('dz-char-2');
        var tLabel = docID('dz-label-2');
        var tZone = docID('dz-third');
        if (tChar) { tChar.textContent = ''; tChar.style.display = 'none'; }
        if (tLabel) { tLabel.style.display = ''; tLabel.textContent = '?'; }
        if (tZone) { tZone.classList.remove('selected', 'visible'); }

        // Re-enable the flask mix button now that slots are cleared
        var flaskBtn = docID('flask-mix-btn');
        if (flaskBtn) {
            flaskBtn.classList.remove('disabled');
        }
    }, duration);
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR CATEGORY FILTERS
══════════════════════════════════════════════════════════════ */

Lab.renderSidebarCategories = function () {
    var catsContainer = docID('sidebar-cats');
    if (!catsContainer) return;

    var cats = [];
    var seen = {};
    for (var i = 0; i < Lab.state.allRadicals.length; i++) {
        var r = Lab.state.allRadicals[i];
        var cat = r.doodle_category || r.category || 'other';
        if (!seen[cat]) {
            seen[cat] = true;
            var meta = LAB_CATEGORY_META[cat] || LAB_CATEGORY_META['other'];
            var pid = Lab.state.profileId;
            var count = 0;
            if (pid) {
                var allUser = XHZ.getAllUserRadicals ? XHZ.getAllUserRadicals(pid) : [];
                var userSet = {};
                for (var ui = 0; ui < allUser.length; ui++) { userSet[allUser[ui]] = true; }
                for (var ri = 0; ri < Lab.state.allRadicals.length; ri++) {
                    var rc = Lab.state.allRadicals[ri];
                    if ((rc.doodle_category || rc.category || 'other') === cat && userSet[rc.char]) { count++; }
                }
            }
            cats.push({ id: cat, emoji: meta.emoji, color: meta.color, glow: meta.glow, count: count });
        }
    }
    cats.sort(function (a, b) { return a.id.localeCompare(b.id); });

    var html = '';
    for (var ci = 0; ci < cats.length; ci++) {
        var c = cats[ci];
        html += '<div class="sidebar-cat' + (Lab.state.shelfFilter === c.id ? ' active' : '') + '" ' +
            'style="--cat-color:' + c.color + ';" ' +
            'onclick="Lab.setShelfFilter(\'' + c.id + '\')">' +
            '<span class="sc-dot" style="background:' + c.color + ';"></span>' +
            '<span class="sc-emoji">' + c.emoji + '</span>' +
            '<span class="sc-count">' + c.count + '</span></div>';
    }
    catsContainer.innerHTML = html;
};

Lab.setShelfFilter = function (catId) {
    Lab.state.shelfFilter = catId;
    Lab.renderSidebarCategories();
    Lab.renderRadicalPicker();
    Lab.sfx.click();
};

/* ══════════════════════════════════════════════════════════════
   RADICAL PICKER — Pantry shelves
══════════════════════════════════════════════════════════════ */

Lab.renderRadicalPicker = function () {
    var grid = docID('brew-shelves');
    if (!grid) return;

    var pid = Lab.state.profileId;
    if (!pid || !Lab.state.allRadicals.length) {
        grid.innerHTML = '<div class="lab-empty" style="padding:12px;"><div class="emp-panda" style="font-size:2rem;">\uD83D\uDC3C</div><div class="emp-sub">The Potion Shop is preparing your ingredients...</div></div>';
        return;
    }

    var allUser = XHZ.getAllUserRadicals ? XHZ.getAllUserRadicals(pid) : [];
    var userSet = {};
    for (var ui = 0; ui < allUser.length; ui++) { userSet[allUser[ui]] = true; }

    // Ensure each radical has a random flask variant assigned
    var fm = Lab.state.flaskVariantMap;
    if (Object.keys(fm).length === 0) {
        for (var vi = 0; vi < Lab.state.allRadicals.length; vi++) {
            var rv = Lab.state.allRadicals[vi];
            fm[rv.char] = Math.floor(Math.random() * 3) + 1;
        }
    }

    var cats = {};
    for (var i = 0; i < Lab.state.allRadicals.length; i++) {
        var r = Lab.state.allRadicals[i];
        var cat = r.doodle_category || r.category || 'other';
        if (Lab.state.shelfFilter !== 'all' && Lab.state.shelfFilter !== cat) continue;
        if (!cats[cat]) cats[cat] = [];
        cats[cat].push(r);
    }

    var catKeys = Object.keys(cats).sort();
    var html = '';
    for (var ci = 0; ci < catKeys.length; ci++) {
        var catId = catKeys[ci];
        var rads = cats[catId];
        var meta = LAB_CATEGORY_META[catId] || LAB_CATEGORY_META['other'];

        html += '<div class="brew-shelf" style="--sh-color:' + meta.color + ';">' +
            '<div class="brew-shelf-header">' +
            '<span class="sh-emoji">' + meta.emoji + '</span>' +
            '<span>' + catId.charAt(0).toUpperCase() + catId.slice(1) + '</span>' +
            '<span class="sh-count">' + rads.length + '</span></div>' +
            '<div class="brew-shelf-grid">';

        for (var ri = 0; ri < rads.length; ri++) {
            var rad = rads[ri];
            var owned = !!userSet[rad.char];
            var selected = Lab.state.selectedRadicals.indexOf(rad.char) !== -1;
            var flaskNum = fm[rad.char] || 1;
            var cls = 'flask-card';
            if (selected) cls += ' selected';
            if (!owned) cls += ' locked';

            var catId = rad.doodle_category || rad.category || 'other';
            var catMeta = LAB_CATEGORY_META[catId] || LAB_CATEGORY_META['other'];

            html += '<div class="' + cls + '" onclick="Lab.selectRadical(\'' + rad.char + '\')" title="' + (rad.meaning || '') + '">' +
                '<div class="flask-visual">' +
                '<img src="images/lab/flask_s_' + flaskNum + '.svg" class="flask-s-img" alt="" />' +
                '<div class="flask-liquid" style="background:' + catMeta.color + ';"></div>';

            if (owned) {
                html += '<span class="flask-char">' + rad.char + '</span>';
            } else {
                html += '<div class="flask-lock-badge">Lv ' + (rad.unlock_level || '\u221E') + '</div>';
            }

            html += '</div>' +
                '<span class="flask-pinyin">' + (owned ? (rad.pinyin || '') : '\uD83D\uDD12 Lv ' + (rad.unlock_level || '\u221E')) + '</span>' +
                '</div>';
        }
        html += '</div></div>';
    }

    if (!html) {
        html = '<div class="lab-empty" style="padding:12px;"><div class="emp-emoji">\uD83D\uDD0D</div><div class="emp-sub">No ingredients in this category</div></div>';
    }
    grid.innerHTML = html;

    // Measure the actual row height from the first flask card and set CSS variable for shelf line
    // Deferred slightly so SVG images have a chance to load for accurate height
    Lab._updateShelfRowHeight(grid);
};

/**
 * Measure and set the --row-h CSS variable on shelf grids for the repeating shelf line.
 * Deferred to let SVG images load first; also used on window resize.
 */
Lab._updateShelfRowHeight = function (grid) {
    if (!grid) {
        grid = docID('brew-shelves');
        if (!grid) return;
    }
    setTimeout(function () {
        var firstCard = grid.querySelector('.flask-card');
        if (firstCard) {
            var rowH = firstCard.offsetHeight;
            grid.style.setProperty('--row-h', rowH + 'px');
        }
    }, 100);
};

Lab.selectRadical = function (char) {
    var pid = Lab.state.profileId;
    if (!pid) return;
    var allUser = XHZ.getAllUserRadicals ? XHZ.getAllUserRadicals(pid) : [];
    if (allUser.indexOf(char) === -1) return;

    // If a result is showing, dismiss it first
    if (Lab.state.lastResult) {
        lowerFrameContinue();
    }

    var sel = Lab.state.selectedRadicals;

    var emptySlot = -1;
    for (var i = 0; i < 2; i++) {
        if (!sel[i]) { emptySlot = i; break; }
    }

    var wasNewSelection = false;
    var slotIndex = -1;

    if (emptySlot !== -1) {
        sel[emptySlot] = char;
        wasNewSelection = true;
        slotIndex = emptySlot;
    } else {
        if (sel[0] === char && sel[1] === char) {
            sel[1] = null;
        } else if (sel[0] === char) {
            sel[1] = char;
            slotIndex = 1;
        } else if (sel[1] === char) {
            sel[0] = char;
            slotIndex = 0;
        } else {
            sel[1] = char;
            slotIndex = 1;
        }
        wasNewSelection = sel[slotIndex] === char;
    }

    Lab.sfx.click();
    Lab.updateFlaskSlots();
    Lab.renderRadicalPicker();

    // Spawn sparkle trail from flask card to drop zone
    if (wasNewSelection && slotIndex >= 0 && slotIndex < 2) {
        // Find the specific flask card by character
        var allCards = document.querySelectorAll('#brew-shelves .flask-card');
        var targetCard = null;
        for (var ci = 0; ci < allCards.length; ci++) {
            var charEl = allCards[ci].querySelector('.flask-char');
            if (charEl && charEl.textContent === char) {
                targetCard = allCards[ci];
                break;
            }
        }
        if (targetCard) {
            var targetZone = docID(slotIndex === 0 ? 'dz-left' : 'dz-right');
            if (targetZone) {
                Lab.spawnSparkleTrail(targetCard, targetZone, char);
            }
        }
    }
};

/* ══════════════════════════════════════════════════════════════
   SPARKLE TRAIL
══════════════════════════════════════════════════════════════ */

Lab.spawnSparkleTrail = function (fromEl, toEl, char, reverse) {
    if (reverse) { Lab.sfx.retreat(); } else { Lab.sfx.sparkle(); }
    var fromRect = fromEl.getBoundingClientRect();
    var toRect = toEl.getBoundingClientRect();

    var fromX = fromRect.left + fromRect.width / 2;
    var fromY = fromRect.top + fromRect.height / 2;
    var toX = toRect.left + toRect.width / 2;
    var toY = toRect.top + toRect.height / 2;

    var dx = toX - fromX;
    var dy = toY - fromY;

    var color = getCategoryColor(char) || 'rgba(240,208,96,0.8)';

    var particleCount = 10 + Math.floor(Math.random() * 6);
    var particles = [];

    for (var i = 0; i < particleCount; i++) {
        var el = document.createElement('div');
        el.className = 'sparkle-particle';

        // Spread start position slightly around the chip
        var startOffX = (Math.random() - 0.5) * 20;
        var startOffY = (Math.random() - 0.5) * 20;

        // Randomized arc: scatter in a cone toward the target
        var scatter = 0.3 + Math.random() * 0.4;
        var arcUp = -40 - Math.random() * 60;

        var tx = dx * scatter + (Math.random() - 0.5) * 40;
        var ty = dy * scatter + arcUp;
        var tx2 = dx * (0.6 + Math.random() * 0.4) + (Math.random() - 0.5) * 30;
        var ty2 = dy * (0.6 + Math.random() * 0.4) + (Math.random() - 0.5) * 30 - 20;

        el.style.left = (fromX + startOffX) + 'px';
        el.style.top = (fromY + startOffY) + 'px';
        el.style.setProperty('--tx', tx + 'px');
        el.style.setProperty('--ty', ty + 'px');
        el.style.setProperty('--tx2', tx2 + 'px');
        el.style.setProperty('--ty2', ty2 + 'px');
        el.style.background = color;
        el.style.boxShadow = '0 0 6px ' + color + ', 0 0 12px rgba(240,208,96,0.2)';
        el.style.animationDuration = (0.5 + Math.random() * 0.4) + 's';
        el.style.animationDelay = (Math.random() * 0.15) + 's';
        el.style.width = (4 + Math.random() * 5) + 'px';
        el.style.height = el.style.width;

        document.body.appendChild(el);
        particles.push(el);
    }

    // Glow pulse on the drop zone when particles arrive (forward only)
    if (!reverse) {
        var glowDelay = 750 + Math.random() * 200;
        setTimeout(function () {
            if (!toEl) return;
            toEl.style.setProperty('--dz-glow-color', color);
            toEl.style.setProperty('--dz-glow-soft', color);
            toEl.classList.add('glow-pulse');
            setTimeout(function () {
                toEl.classList.remove('glow-pulse');
            }, 800);
        }, glowDelay);
    }

    // Clean up particles from DOM
    setTimeout(function () {
        for (var pi = 0; pi < particles.length; pi++) {
            if (particles[pi].parentNode) {
                particles[pi].parentNode.removeChild(particles[pi]);
            }
        }
    }, 1000);
};

/* ══════════════════════════════════════════════════════════════
   COURSE DATA
══════════════════════════════════════════════════════════════ */

Lab.loadCourseData = function () {
    var files = Lab.state.courseFiles || [];
    var loaded = 0;
    files.forEach(function (file) {
        fetch(file)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var words = data.words || [];
                for (var i = 0; i < words.length; i++) {
                    var w = words[i];
                    var ch = w.ch || w.char || '';
                    if (!ch) continue;
                    if (!Lab.state.courseCharMap[ch]) {
                        Lab.state.courseCharMap[ch] = {
                            word_id: w.word_id,
                            course: data.course || '',
                            pinyin: w.py || w.pinyin || '',
                            meaning: w.en || w.meaning || '',
                            etymology: w.etymology || null
                        };
                    }
                    if (w.word_id && !Lab.state.wordData[w.word_id]) {
                        Lab.state.wordData[w.word_id] = {
                            ch: ch,
                            pinyin: w.py || w.pinyin || '',
                            meaning: w.en || w.meaning || '',
                            course: data.course || ''
                        };
                    }
                }
                loaded++;
                if (loaded >= files.length) { Lab.renderDecompList(); }
            })
            .catch(function (err) {
                console.warn('Failed to load course file:', file, err.message);
                loaded++;
            });
    });
};

/* ══════════════════════════════════════════════════════════════
   GRIMOIRE — Collection + Stats
══════════════════════════════════════════════════════════════ */

Lab.renderGrimoire = function () {
    var pid = Lab.state.profileId;
    if (!pid) return;

    // Render the creations list on the right page
    Lab._renderCreationsList();
};

Lab._renderCreationsList = function () {
    var list = docID('gb-creations-list');
    if (!list) return;

    var pid = Lab.state.profileId;
    if (!pid) {
        list.innerHTML = '<div class="lab-empty" style="padding:16px;"><div class="emp-panda" style="font-size:2rem;">\uD83D\uDC3C</div><div class="emp-text">No profile selected!</div></div>';
        return;
    }

    var discovered = XHZ.getDiscoveredCharacters(pid);
    var chars = Object.keys(discovered);

    if (chars.length === 0) {
        list.innerHTML = '<div class="lab-empty" style="padding:20px;"><div class="emp-emoji">\uD83D\uDCD6</div><div class="emp-text">Your potion journal is empty!</div><div class="emp-sub">Head to the Brew tab and combine ingredients to discover new characters!</div></div>';
        setText('gb-creations-count', '0');
        return;
    }

    // Filter
    var filter = Lab.state.grimoireFilter || 'all';
    var filtered = [];
    for (var i = 0; i < chars.length; i++) {
        var ch = chars[i];
        var entry = discovered[ch];
        if (filter === 'brewed' && entry.decomposed) continue;
        if (filter === 'extracted' && !entry.decomposed) continue;
        filtered.push({ char: ch, entry: entry });
    }

    setText('gb-creations-count', chars.length);

    var html = '';
    for (var fi = 0; fi < filtered.length; fi++) {
        var item = filtered[fi];
        var ch = item.char;
        var isSelected = Lab.state.selectedCreation === ch;

        html += '<div class="gb-entry' + (isSelected ? ' selected' : '') + '" onclick="selectCreation(\'' + ch + '\')">' +
            '<span class="gbe-char">' + ch + '</span>' +
            '</div>';
    }

    if (filtered.length === 0) {
        html = '<div class="lab-empty" style="padding:20px;"><div class="emp-emoji">\uD83D\uDD0D</div><div class="emp-text">No ' + filter + ' creations yet!</div></div>';
    }

    list.innerHTML = html;
};

function selectCreation(char) {
    // Toggle deselect if clicking the same character again
    if (Lab.state.selectedCreation === char) {
        Lab.state.selectedCreation = null;
        Lab._renderCreationsList();
        // Show welcome, hide detail
        var welcome = docID('gb-welcome');
        var detail = docID('gb-detail');
        if (welcome) welcome.style.display = '';
        if (detail) detail.style.display = 'none';
        return;
    }
    Lab.state.selectedCreation = char;
    Lab._renderCreationsList();
    Lab.renderGrimoireDetail(char);
}

Lab.renderGrimoireDetail = function (char) {
    var pid = Lab.state.profileId;
    if (!pid || !char) return;

    var discovered = XHZ.getDiscoveredCharacters(pid);
    var entry = discovered[char];
    if (!entry) return;

    // Show detail, hide welcome
    var welcome = docID('gb-welcome');
    var detail = docID('gb-detail');
    if (welcome) welcome.style.display = 'none';
    if (detail) detail.style.display = 'flex';

    // Character
    setText('gb-detail-char', char);

    // Pinyin
    setText('gb-detail-pinyin', entry.pinyin || '');

    // Meaning
    setText('gb-detail-meaning', entry.meaning || '');

    // Recipe
    var recipe = (entry.recipe || []).join(' + ');
    setText('gb-detail-recipe', recipe ? recipe + ' \u2192 ' + char : '');

    // Try to load flashcard illustration from word_id
    var courseInfo = Lab.state.courseCharMap[char];
    var illustContainer = docID('gb-detail-illust');
    var illustImg = docID('gb-detail-illust-img');
    // Hide immediately to prevent stale image flash from previous character
    if (illustContainer) illustContainer.style.display = 'none';
    if (illustContainer && illustImg && courseInfo && courseInfo.word_id) {
        var imgUrl = 'assets/characters/' + courseInfo.word_id + '.png';
        var testImg = new Image();
        testImg.onload = function () {
            illustImg.src = imgUrl;
            illustContainer.style.display = 'flex';
        };
        testImg.onerror = function () {
            illustContainer.style.display = 'none';
        };
        testImg.src = imgUrl;
    } else if (illustContainer) {
        illustContainer.style.display = 'none';
    }
    var etymology = courseInfo ? courseInfo.etymology : null;

    // Origin section
    var originSection = docID('gb-detail-origin-section');
    var etymologyEl = docID('gb-detail-etymology');
    if (originSection && etymologyEl) {
        if (etymology && etymology.notes) {
            originSection.style.display = '';
            etymologyEl.textContent = etymology.notes;
        } else {
            originSection.style.display = 'none';
        }
    }

    // Components section
    var compSection = docID('gb-detail-components-section');
    var compEl = docID('gb-detail-components');
    if (compSection && compEl) {
        var comps = etymology && etymology.components ? etymology.components : [];
        if (comps.length > 0) {
            compSection.style.display = '';
            compEl.textContent = comps.map(function (c) { return c.char + ' (' + c.type + ')'; }).join(', ');
        } else if (entry.recipe && entry.recipe.length > 0) {
            compSection.style.display = '';
            compEl.textContent = 'Formed from: ' + entry.recipe.join(', ') + (entry.decomposed ? ' (extracted)' : ' (discovered through brewing)');
        } else {
            compSection.style.display = 'none';
        }
    }

    // Course section
    var courseSection = docID('gb-detail-course-section');
    var courseEl = docID('gb-detail-course');
    if (courseSection && courseEl) {
        if (courseInfo && courseInfo.course) {
            courseSection.style.display = '';
            courseEl.textContent = 'Course: ' + courseInfo.course + ' \u00B7 ' + (courseInfo.pinyin || '') + ' \u00B7 ' + (courseInfo.meaning || '');
        } else {
            courseSection.style.display = 'none';
        }
    }
};

function setGrimoireFilter(filter) {
    Lab.state.grimoireFilter = filter;
    // Update active state on filter buttons using data-filter attribute
    document.querySelectorAll('#gb-right-filters .gb-filter').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
    Lab._renderCreationsList();
}

/* ══════════════════════════════════════════════════════════════
   EXTRACT — Decomposition
══════════════════════════════════════════════════════════════ */

Lab.renderDecompList = function () {
    var list = docID('extract-list');
    if (!list) return;

    var pid = Lab.state.profileId;
    if (!pid) {
        list.innerHTML = '<div class="lab-empty"><div class="emp-panda">\uD83D\uDC3C</div><div class="emp-text">No profile selected!</div></div>';
        return;
    }

    var studied = {};
    for (var ch in Lab.state.courseCharMap) { studied[ch] = Lab.state.courseCharMap[ch]; }

    var decompChars = [];
    var seenChar = {};
    for (var ri = 0; ri < Lab.state.allReactions.length; ri++) {
        var react = Lab.state.allReactions[ri];
        var result = react.result || react.char || '';
        if (result && studied[result] && !seenChar[result]) {
            seenChar[result] = true;
            decompChars.push({ char: result, courseInfo: studied[result], radicals: react.radicals || [] });
        }
    }

    decompChars.sort(function (a, b) {
        return (a.courseInfo.word_id || '').localeCompare(b.courseInfo.word_id || '');
    });

    if (decompChars.length === 0) {
        list.innerHTML = '<div class="lab-empty"><div class="emp-panda">\uD83D\uDC3C</div><div class="emp-text">The extraction chamber is empty!</div><div class="emp-sub">Study more characters in your courses, then come break them down into hidden ingredients! \uD83D\uDD2C</div></div>';
        return;
    }

    var energy = XHZ.getLabEnergy(pid);
    setText('decomp-energy-hint', '\u26A1 ' + energy + ' extractions remaining today');

    var html = '';
    for (var di = 0; di < decompChars.length; di++) {
        var dc = decompChars[di];
        var decomposed = XHZ.isCharDecomposed(pid, dc.char);
        var selected = Lab.state.selectedDecompChar === dc.char;
        var statusClass = decomposed ? 'done' : (energy > 0 ? 'ready' : 'locked');
        var extraCls = decomposed ? ' decomposed' : '';

        html += '<div class="extract-card' + (selected ? ' selected' : '') + extraCls + '" onclick="selectDecompChar(\'' + dc.char + '\')">' +
            '<span class="ec-char">' + dc.char + '</span>' +
            '<span class="ec-dot ' + statusClass + '"></span>' +
            '</div>';
    }
    list.innerHTML = html;
};

function selectDecompChar(char) {
    var pid = Lab.state.profileId;
    if (!pid) return;
    var decomposed = XHZ.isCharDecomposed(pid, char);
    if (decomposed) return;

    Lab.state.selectedDecompChar = char;
    Lab.renderDecompList();

    // Clear brew state — drop zones stay empty
    Lab.state.selectedRadicals = [null, null, null];
    Lab.updateFlaskSlots();

    // Show the character centered in the flask via the result overlay
    var flaskOverlay = docID('flask-result-overlay');
    var flaskChar = docID('flask-result-char');
    if (flaskChar) flaskChar.textContent = char;
    if (flaskOverlay) flaskOverlay.classList.add('visible');

    // Override the lower frame prompt (updateFlaskSlots sets it to brew text)
    var promptEl = docID('lf-action-prompt');
    if (promptEl) promptEl.textContent = 'Ready to extract ' + char + '! Hit the Extract button! \uD83D\uDD2C';
    var tipEl = docID('brew-tip');
    if (tipEl) tipEl.style.display = 'none';

    // Hide clear button and disable MIX button during decomp
    var clearBtn = docID('flask-clear-btn');
    if (clearBtn) clearBtn.classList.remove('visible');
    var flaskBtn = docID('flask-mix-btn');
    if (flaskBtn) flaskBtn.classList.add('disabled');

    // Update panda message
    var msgEl = docID('panda-msg');
    if (msgEl) msgEl.textContent = 'Breaking down ' + char + '... Hit Extract! \uD83D\uDD2C';

    var detail = docID('extract-detail');
    if (!detail) return;
    detail.classList.add('visible');

    for (var ri = 0; ri < Lab.state.allReactions.length; ri++) {
        var react = Lab.state.allReactions[ri];
        if ((react.result || react.char) === char) {
            var rads = react.radicals || [];
            var ciInfo = Lab.state.courseCharMap[char] || {};
            setText('ed-char', char + ' (' + (ciInfo.pinyin || '') + ')');

            var compoundsHtml = '';
            for (var i = 0; i < rads.length; i++) {
                if (i > 0) compoundsHtml += '<span class="ed-plus">+</span>';
                var isEarned = XHZ.getEarnedRadicals ? XHZ.getEarnedRadicals(pid).indexOf(rads[i]) !== -1 : false;
                var radInfo = null;
                for (var ri2 = 0; ri2 < Lab.state.allRadicals.length; ri2++) {
                    if (Lab.state.allRadicals[ri2].char === rads[i]) { radInfo = Lab.state.allRadicals[ri2]; break; }
                }
                var compCls = 'ed-comp';
                if (!isEarned) compCls += ' new-rad';
                else compCls += ' owned-rad';
                compoundsHtml += '<div class="' + compCls + '">' +
                    '<span class="edc-char">' + rads[i] + '</span>' +
                    '<span class="edc-label">' + (radInfo ? (radInfo.pinyin || '') : '') + '</span>' +
                    '</div>';
            }
            docID('ed-compounds').innerHTML = compoundsHtml;

            var desc = 'Break down ' + char + ' into its ' + rads.length + ' components.';
            var newRads = [];
            for (var ri3 = 0; ri3 < rads.length; ri3++) {
                if (!XHZ.hasRadical(pid, rads[ri3])) newRads.push(rads[ri3]);
            }
            if (newRads.length > 0) { desc += ' Will unlock: ' + newRads.join(', '); }
            docID('ed-desc').textContent = desc;
            break;
        }
    }
    Lab.sfx.click();
}

function onDecomposeClick() {
    var pid = Lab.state.profileId;
    var char = Lab.state.selectedDecompChar;
    if (!pid || !char) return;

    if (!XHZ.canDecompose(pid)) {
        Lab.showToast('\u26A0\uFE0F', 'No energy!', 'No lab energy remaining today. Come back tomorrow!', 'OK');
        return;
    }

    for (var ri = 0; ri < Lab.state.allReactions.length; ri++) {
        var react = Lab.state.allReactions[ri];
        if ((react.result || react.char) === char) {
            var rads = react.radicals || [];
            var newRads = [];
            for (var i = 0; i < rads.length; i++) {
                if (!XHZ.hasRadical(pid, rads[i])) { newRads.push(rads[i]); }
            }
            if (XHZ.useDecomposition(pid)) {
                XHZ.markCharAsDecomposed(pid, char, newRads);
                XHZ.incrementLabStat(pid, 'total_decompositions');
                Lab.sfx.decomp();

                // Show reverse reaction in flask: extracted radicals in the drop zones
                Lab.state.selectedRadicals = [null, null, null];
                var maxSlots = Math.min(rads.length, 2);
                for (var si = 0; si < maxSlots; si++) {
                    Lab.state.selectedRadicals[si] = rads[si];
                }
                Lab.updateFlaskSlots();

                // Override prompt for decomp success
                var promptEl = docID('lf-action-prompt');
                if (promptEl) promptEl.textContent = char + ' broke down into ' + rads.join(' + ') + '! \u2728';
                var tipEl = docID('brew-tip');
                if (tipEl) tipEl.style.display = 'none';

                // Hide flask overlay (character no longer in the center)
                var flaskOverlay = docID('flask-result-overlay');
                if (flaskOverlay) flaskOverlay.classList.remove('visible');

                // Hide clear button and disable MIX button
                var clearBtn = docID('flask-clear-btn');
                if (clearBtn) clearBtn.classList.remove('visible');
                var flaskBtn = docID('flask-mix-btn');
                if (flaskBtn) flaskBtn.classList.add('disabled');

                // Show the result in the lower frame: char → rads
                var lfResult = docID('lf-result');
                var lfChar = docID('lf-result-char');
                var lfInfo = docID('lf-result-info');
                var lfBadge = docID('lf-result-badge');
                if (lfChar) lfChar.textContent = char + ' \u2192 ' + rads.join(' + ');
                if (lfInfo) lfInfo.textContent = 'Extracted ' + rads.length + ' components!';
                if (lfBadge) {
                    lfBadge.textContent = '\u2705 Extracted!';
                    lfBadge.className = 'lf-result-badge success';
                }
                if (lfResult) {
                    lfResult.className = 'lf-content lf-result';
                    lfResult.classList.add('success');
                }
                Lab.showLowerFrame('result');

                // Sparkle burst
                Lab.spawnBurstParticles();
                Lab.setPandaExcited();

                // Auto-clear the flask after 2s
                setTimeout(function () {
                    Lab.state.selectedRadicals = [null, null, null];
                    Lab.updateFlaskSlots();
                }, 2500);

                Lab.state.selectedDecompChar = null;
                var detail = docID('extract-detail');
                if (detail) detail.classList.remove('visible');
                Lab.renderDecompList();
                Lab.updateTopbar();
                if (newRads.length > 0) {
                    setTimeout(function () {
                        Lab.showToast('\uD83D\uDD2C', 'Extracted!', 'Discovered ' + newRads.join(', ') + ' from ' + char, 'Awesome!');
                    }, 600);
                }
            }
            return;
        }
    }
}

function clearDecompSelection() {
    Lab.state.selectedDecompChar = null;
    // Hide flask overlay
    var flaskOverlay = docID('flask-result-overlay');
    if (flaskOverlay) flaskOverlay.classList.remove('visible');
    // Clear the flask
    Lab.state.selectedRadicals = [null, null, null];
    Lab.updateFlaskSlots();
    // Reset panda message
    var msgEl = docID('panda-msg');
    if (msgEl) msgEl.textContent = 'Select a character to decompose! \uD83D\uDD2C';
    Lab.showLowerFrame('welcome');
    // Restore the tip element
    var tipEl = docID('brew-tip');
    if (tipEl) tipEl.style.display = '';
    var detail = docID('extract-detail');
    if (detail) detail.classList.remove('visible');
    Lab.renderDecompList();
}

/* ══════════════════════════════════════════════════════════════
   CREATIONS — Discovered Characters
══════════════════════════════════════════════════════════════ */

Lab.renderCreations = function () {
    // Redirect to the new grimoire book renderer
    Lab._renderCreationsList();
};

/* ══════════════════════════════════════════════════════════════
   MODALS, TOASTS & UTILITIES
══════════════════════════════════════════════════════════════ */

Lab.updateBlendToggle = function () {
    var pid = Lab.state.profileId;
    if (!pid) return;
    // Triple blend is available at Lv 25+
};

Lab.closeBranchingModal = function () {
    docID('lab-branch-modal').classList.remove('visible');
};

Lab.showToast = function (emoji, title, desc, btnText) {
    var toast = docID('lab-result-toast');
    if (!toast) return;
    setText('rt-emoji', emoji || '\uD83C\uDF89');
    setText('rt-info', title || '');
    setText('rt-desc', desc || '');
    var btn = docID('rt-close-btn');
    if (btn && btnText) btn.textContent = btnText;
    toast.classList.add('visible');
};

function closeResultToast() {
    docID('lab-result-toast').classList.remove('visible');
}

/* ══════════════════════════════════════════════════════════════
   DISCOVERY CELEBRATION — Sparkle Burst
══════════════════════════════════════════════════════════════ */

Lab.spawnBurstParticles = function () {
    // Use the hero flask area as the burst origin
    var heroFlask = docID('hero-flask');
    if (!heroFlask) return;

    var rect = heroFlask.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    var colors = ['#F0D060', '#A58EDB', '#7BC8A4', '#E8836F', '#6CA7E8', '#FFD700'];
    var particleCount = 20;
    var particles = [];

    for (var i = 0; i < particleCount; i++) {
        var el = document.createElement('div');
        el.className = 'burst-particle ' + (Math.random() > 0.5 ? 'star' : 'circle');

        // Spread in a circle from center
        var angle = (Math.PI * 2 / particleCount) * i + (Math.random() - 0.5) * 0.5;
        var dist = 60 + Math.random() * 100;
        var dist2 = 120 + Math.random() * 80;

        var bx = Math.cos(angle) * dist * 0.4;
        var by = Math.sin(angle) * dist * 0.4 - 30;
        var bx2 = Math.cos(angle) * dist2;
        var by2 = Math.sin(angle) * dist2 - 60;

        el.style.left = cx + 'px';
        el.style.top = cy + 'px';
        el.style.setProperty('--bx', bx + 'px');
        el.style.setProperty('--by', by + 'px');
        el.style.setProperty('--bx2', bx2 + 'px');
        el.style.setProperty('--by2', by2 + 'px');

        var color = colors[Math.floor(Math.random() * colors.length)];
        el.style.background = color;
        el.style.boxShadow = '0 0 6px ' + color + ', 0 0 12px rgba(240,208,96,0.2)';
        el.style.width = (5 + Math.random() * 6) + 'px';
        el.style.height = el.style.width;
        el.style.animationDuration = (0.6 + Math.random() * 0.4) + 's';
        el.style.animationDelay = (Math.random() * 0.15) + 's';

        document.body.appendChild(el);
        particles.push(el);
    }

    // Clean up
    setTimeout(function () {
        for (var pi = 0; pi < particles.length; pi++) {
            if (particles[pi].parentNode) {
                particles[pi].parentNode.removeChild(particles[pi]);
            }
        }
    }, 1200);
};

/* ══════════════════════════════════════════════════════════════
   SMOKE EFFECT — Failed brew
══════════════════════════════════════════════════════════════ */

Lab.spawnSmoke = function () {
    var smokeContainer = docID('flask-smoke');
    if (!smokeContainer) return;

    // Clear any existing smoke
    smokeContainer.innerHTML = '';
    smokeContainer.classList.add('active');

    var count = 10 + Math.floor(Math.random() * 6); // 10-15 puffs
    var particles = [];

    for (var i = 0; i < count; i++) {
        var puff = document.createElement('div');
        puff.className = 'smoke-puff';

        // Spread across the top of the flask
        var left = 15 + Math.random() * 70; // % across flask width
        var top = 5 + Math.random() * 30;   // % from top, varied for natural look
        var size = 12 + Math.random() * 24;  // 12-36px

        puff.style.left = left + '%';
        puff.style.top = top + '%';
        puff.style.width = size + 'px';
        puff.style.height = size + 'px';
        puff.style.animationDuration = (1.2 + Math.random() * 1.0) + 's';
        puff.style.animationDelay = (Math.random() * 0.6) + 's';

        // Slight horizontal drift
        var driftX = (Math.random() - 0.5) * 40;
        puff.style.setProperty('--drift-x', driftX + 'px');

        smokeContainer.appendChild(puff);
        particles.push(puff);
    }

    // Clean up after animation completes
    var maxDuration = 1.2 + 1.0 + 0.6; // max anim duration + max delay
    setTimeout(function () {
        if (smokeContainer) {
            smokeContainer.classList.remove('active');
            smokeContainer.innerHTML = '';
        }
    }, maxDuration * 1000 + 200);
};

Lab.startSynthesis = function () {
    // Reserved for future synthesis mode
};
