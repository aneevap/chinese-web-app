#!/usr/bin/env python3
"""Append missing JS functions to laboratory-playground.html"""

with open('laboratory-playground.html', 'r') as f:
    content = f.read()

# ── 1. Fix duplicate collCategory in state ──
old_state = """    collFilter: 'all',
    collCategory: 'all',
    collCategory: 'all',"""
new_state = """    collFilter: 'all',
    collCategory: 'all',"""
content = content.replace(old_state, new_state)

# ── 2. Remove duplicate closeBranchingModal at the end ──
old_dup = """Lab.closeBranchingModal = function () {
    document.getElementById('lab-branch-modal').classList.remove('visible');
}


</script>"""
new_dedup = """

</script>"""
content = content.replace(old_dup, new_dedup)

# ── 3. Find the insertion point (before </script>) ──
insert_marker = '</script>'
insert_idx = content.rfind(insert_marker)
if insert_idx < 0:
    print('ERROR: </script> not found')
    exit(1)

# Build all missing functions
missing_js = """

/* ══════════════════════════════════════════════════════════════
   MISSING FUNCTIONS — RESTORED
══════════════════════════════════════════════════════════════ */

/**
 * Get character mastery from profile data
 */
Lab.getCharMastery = function (char) {
    var pid = Lab.state.profileId;
    if (!pid) return null;
    // Look up in courseCharMap first
    var entry = Lab.state.courseCharMap[char];
    if (!entry) return null;
    // Get mastery from profile
    var p = XHZ.getProfile(pid);
    if (!p) return null;
    var courseData = p.courses ? p.courses[entry.course] : null;
    if (!courseData) return null;
    var words = courseData.words || {};
    var wd = words[entry.word_id];
    if (!wd) return null;
    return {
        status: wd.status || 'unseen',
        course: entry.course,
        word_id: entry.word_id
    };
}

/**
 * Load course data to build character → mastery mapping
 */
Lab.loadCourseData = function () {
    var loaded = 0;
    var total = Lab.state.courseFiles.length;
    Lab.state.courseFiles.forEach(function (url) {
        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var words = data.words || data.characters || [];
                var course = data.course || url.replace('.json', '').replace('characters_', '');
                words.forEach(function (w) {
                    var ch = w.ch || w.character;
                    if (!ch) return;
                    var wid = w.word_id;
                    Lab.state.courseCharMap[ch] = {
                        word_id: wid,
                        course: course,
                        pinyin: w.py || w.pinyin || '',
                        meaning: w.en || w.meaning || ''
                    };
                    Lab.state.wordData[wid] = {
                        ch: ch,
                        pinyin: w.py || w.pinyin || '',
                        meaning: w.en || w.meaning || '',
                        course: course
                    };
                });
                loaded++;
                if (loaded === total) {
                    // All course data loaded
                    Lab.renderDecompList();
                }
            })
            .catch(function (err) {
                loaded++;
                console.warn('Failed to load course data from ' + url, err);
            });
    });
}

/**
 * Switch active tab
 */
Lab.switchTab = function (tab) {
    // Update tab buttons
    document.querySelectorAll('.lab-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    // Update panels
    document.querySelectorAll('.lab-panel').forEach(function (p) {
        p.classList.toggle('active', p.id === 'panel-' + tab);
    });
    // Render appropriate panel content
    if (tab === 'collection') {
        Lab.renderCollection();
    } else if (tab === 'discovered') {
        Lab.renderDiscovered();
    } else if (tab === 'stats') {
        Lab.renderStats();
    } else if (tab === 'decomp') {
        Lab.renderDecompList();
    }
}

/**
 * Update top bar — level, XP, stars, energy
 */
Lab.updateTopbar = function () {
    var pid = Lab.state.profileId;
    if (!pid) return;

    // Level from total stars
    var profile = XHZ.getProfile ? XHZ.getProfile(pid) : null;
    var totalStars = profile ? XHZ.getTotalStars(pid) : 0;
    var levelInfo = XHZ.getMyLevel ? XHZ.getMyLevel(pid) : { level: 1, progress: 0, needed: 23 };
    var level = levelInfo.level || 1;
    var progress = levelInfo.progress || 0;
    var needed = levelInfo.needed || 23;

    // Update level stat
    var levelEl = document.getElementById('lab-level-val');
    if (levelEl) levelEl.textContent = 'Lv ' + level;

    // Update XP bar
    var xpText = document.getElementById('lab-xp-text');
    var xpPct = document.getElementById('lab-xp-pct');
    var xpBar = document.getElementById('lab-xp-bar');
    if (xpText) xpText.textContent = progress + ' / ' + needed;
    if (xpPct) xpPct.textContent = Math.round((progress / needed) * 100) + '%';
    if (xpBar) xpBar.style.width = Math.min(100, (progress / needed) * 100) + '%';

    // Update stars
    var starsEl = document.getElementById('lab-stars-val');
    if (starsEl) starsEl.textContent = totalStars;

    // Update energy
    var energy = XHZ.getLabEnergy ? XHZ.getLabEnergy(pid) : 0;
    var maxEnergy = XHZ.MAX_LAB_ENERGY || 2;
    var energyEl = document.getElementById('lab-energy-val');
    var energyStat = document.getElementById('lab-energy-stat');
    if (energyEl) energyEl.textContent = energy + '/' + maxEnergy;
    if (energyStat) {
        energyStat.classList.toggle('ls-energy-empty', energy <= 0);
    }

    // Update blend toggle visibility
    Lab.updateBlendToggle();

    // Check for unclaimed branching rewards
    Lab.checkBranching();

    // Update decomposition energy hint
    var decompHint = document.getElementById('decomp-energy-hint');
    if (decompHint) {
        decompHint.textContent = '⚡ ' + energy + ' decomposition' + (energy !== 1 ? 's' : '') + ' remaining today';
    }

    // Update radical picker count
    var countEl = document.getElementById('rad-picker-count');
    if (countEl && Lab.state.allRadicals.length > 0) {
        var pid2 = Lab.state.profileId;
        var earned = pid2 ? XHZ.getAllUserRadicals(pid2) : [];
        countEl.textContent = earned.length + ' / ' + Lab.state.allRadicals.length;
    }
}

/**
 * Update beakers/drop zones with selected radicals
 */
Lab.updateBeakers = function () {
    var sel = Lab.state.selectedRadicals;
    for (var i = 0; i < 3; i++) {
        var drop = document.getElementById('drop-' + i);
        if (!drop) continue;
        if (sel[i]) {
            var radInfo = Lab.getRadicalInfo(sel[i]);
            var pinyin = radInfo ? radInfo.pinyin || '' : '';
            drop.innerHTML =
                '<span class="dz-char">' + sel[i] + '</span>' +
                (pinyin ? '<span class="dz-label">' + pinyin + '</span>' : '');
            drop.classList.add('selected');
        } else {
            // Check if this drop zone should still show something (synthesis)
            if (Lab.state.synthesisMode && i === 0) {
                // Don't clear the intermediate char
            } else if (Lab.state.tripleBlendMode && i === 2 && !sel[i]) {
                drop.innerHTML = '<span class="dz-placeholder">?</span>';
                drop.style.display = 'flex';
            } else {
                drop.innerHTML = '<span class="dz-placeholder">?</span>';
                drop.classList.remove('selected');
            }
        }
    }

    // Update flask liquid
    var r1 = sel[0] || null;
    var r2 = sel[1] || null;
    updateFlaskLiquid(r1, r2);

    // Update mix button
    var btn = document.getElementById('btn-mix');
    if (!Lab.state.synthesisMode) {
        var filled = (Lab.state.tripleBlendMode) ? (sel[0] && sel[1] && sel[2]) : (sel[0] && sel[1]);
        btn.disabled = !filled;
    }
}

/**
 * Render the radical picker grid
 */
Lab.renderRadicalPicker = function () {
    var grid = document.getElementById('rad-picker-grid');
    if (!grid || !Lab.state.allRadicals.length) return;

    var pid = Lab.state.profileId;
    var earnedRads = pid ? XHZ.getAllUserRadicals(pid) : [];
    var earnedSet = {};
    earnedRads.forEach(function (r) { earnedSet[r] = true; });

    // Sort: owned first, then by level
    var sorted = Lab.state.allRadicals.slice().sort(function (a, b) {
        var aOwned = !!earnedSet[a.char];
        var bOwned = !!earnedSet[b.char];
        if (aOwned !== bOwned) return aOwned ? -1 : 1;
        return (a.unlock_level || 999) - (b.unlock_level || 999);
    });

    var sel = Lab.state.selectedRadicals;
    var selSet = {};
    for (var i = 0; i < sel.length; i++) {
        if (sel[i]) selSet[sel[i]] = true;
    }

    // Find compatible radicals for affinity hints
    var firstRad = sel[0] || sel[1] || null;
    var compatibleSet = {};
    if (firstRad && Lab.state.allReactions.length) {
        Lab.state.allReactions.forEach(function (r) {
            if (r.radicals.indexOf(firstRad) >= 0) {
                r.radicals.forEach(function (rc) {
                    if (rc !== firstRad) compatibleSet[rc] = true;
                });
            }
        });
    }

    grid.innerHTML = '';
    sorted.forEach(function (rad) {
        var owned = !!earnedSet[rad.char];
        var selected = !!selSet[rad.char];
        var compatible = !!compatibleSet[rad.char];

        var chip = document.createElement('div');
        chip.className = 'lab-rad-chip' +
            (owned ? '' : ' locked') +
            (selected ? ' selected' : '') +
            (compatible && owned && !selected ? ' compatible' : '');

        chip.innerHTML =
            '<span class="rc-char">' + rad.char + '</span>' +
            (rad.pinyin ? '<span class="rc-pinyin">' + rad.pinyin + '</span>' : '') +
            (owned && compatible && !selected ? '<span class="rc-tip">✨ pair</span>' : '');

        if (owned) {
            chip.addEventListener('click', function () {
                Lab.sfx.click();
                var radChar = rad.char;
                // Find first empty slot or deselect if already selected
                if (selected) {
                    for (var j = 0; j < sel.length; j++) {
                        if (sel[j] === radChar) {
                            sel[j] = null;
                            break;
                        }
                    }
                } else {
                    // Don't allow selecting more slots than available
                    var slots = Lab.state.tripleBlendMode ? 3 : 2;
                    // If in synthesis mode, only allow slot 1 (right drop zone)
                    if (Lab.state.synthesisMode) {
                        slots = 1;
                        sel[0] = null;
                        sel[1] = radChar;
                    } else {
                        var placed = false;
                        for (var j = 0; j < slots; j++) {
                            if (!sel[j]) {
                                sel[j] = radChar;
                                placed = true;
                                break;
                            }
                        }
                        if (!placed) {
                            // Replace the first slot
                            sel[0] = radChar;
                        }
                    }
                }
                Lab.updateBeakers();
                Lab.renderRadicalPicker();
                // Update affinity hints
                Lab.updateAffinityHints();
            });
        }

        grid.appendChild(chip);
    });

    // Update count
    var countEl = document.getElementById('rad-picker-count');
    if (countEl) {
        countEl.textContent = earnedRads.length + ' / ' + Lab.state.allRadicals.length;
    }
}

/**
 * Update visible affinity hints based on selected radicals
 */
Lab.updateAffinityHints = function () {
    var area = document.getElementById('flask-affinity-area');
    if (!area || !Lab.state.allReactions.length) return;

    var sel = Lab.state.selectedRadicals;
    var filledRadicals = [];
    for (var i = 0; i < sel.length; i++) {
        if (sel[i]) filledRadicals.push(sel[i]);
    }

    if (filledRadicals.length === 0) {
        area.innerHTML = '<span class="flask-aff-empty">Click a radical to see pairings</span>';
        return;
    }

    // Find possible reactions
    var pairings = {};
    Lab.state.allReactions.forEach(function (r) {
        filledRadicals.forEach(function (fr) {
            if (r.radicals.indexOf(fr) >= 0) {
                var partner = r.radicals.filter(function (rc) { return rc !== fr; });
                partner.forEach(function (p) {
                    if (filledRadicals.indexOf(p) >= 0) return; // already paired
                    if (!pairings[fr]) pairings[fr] = {};
                    pairings[fr][p] = {
                        result: r.result,
                        pinyin: r.pinyin || '',
                        meaning: r.meaning || ''
                    };
                });
            }
        });
    });

    var html = '';
    var hasAny = false;
    Object.keys(pairings).forEach(function (rad) {
        Object.keys(pairings[rad]).forEach(function (partner) {
            hasAny = true;
            var info = pairings[rad][partner];
            html += '<span class="flask-aff-chip">' +
                rad + ' <span class="aff-arrow">+</span> ' + partner +
                ' <span class="aff-arrow">→</span> ' + info.result +
                ' (' + info.pinyin + ')' +
                '</span>';
        });
    });

    if (!hasAny) {
        if (filledRadicals.length >= 2) {
            area.innerHTML = '<span class="flask-aff-empty">🤔 No known reaction for this combination</span>';
        } else {
            area.innerHTML = '<span class="flask-aff-empty">No known pairings for this radical</span>';
        }
    } else {
        area.innerHTML = html;
    }
}

/**
 * Show/hide the triple blend mode toggle based on level
 */
Lab.updateBlendToggle = function () {
    var wrap = document.getElementById('blend-toggle-wrap');
    var locked = document.getElementById('blend-locked');
    if (!wrap || !locked) return;

    var pid = Lab.state.profileId;
    if (!pid) return;

    var levelInfo = XHZ.getMyLevel ? XHZ.getMyLevel(pid) : { level: 1 };
    var level = levelInfo.level || 1;

    if (level >= 25) {
        wrap.style.display = 'flex';
        locked.style.display = 'none';
    } else {
        wrap.style.display = 'none';
        // Only show locked message if close to unlocking
        if (level >= 20) {
            locked.style.display = 'inline';
            locked.textContent = '🔒 Reach Lv 25 (currently Lv ' + level + ')';
        } else {
            locked.style.display = 'none';
        }
    }
}

/**
 * Set blend mode (2 = two radicals, 3 = three radicals)
 */
Lab.setBlendMode = function (mode) {
    if (mode === 3 && !Lab.state.tripleBlendMode) {
        Lab.state.tripleBlendMode = true;
        // Swap 2 slots → 3 slots
        var sel = Lab.state.selectedRadicals;
        Lab.state.selectedRadicals = [sel[0], sel[1], null];
        Lab.state.beakerAffinities = [null, null, null];
    } else if (mode === 2 && Lab.state.tripleBlendMode) {
        Lab.state.tripleBlendMode = false;
        // Swap 3 slots → 2 slots
        var sel = Lab.state.selectedRadicals;
        Lab.state.selectedRadicals = [sel[0], sel[1], null];
        Lab.state.beakerAffinities = [null, null];
    } else {
        return; // Already in this mode
    }

    // Update UI classes
    var wrap = document.getElementById('lab-flask-wrap');
    if (wrap) wrap.classList.toggle('triple', mode === 3);

    // Update mode buttons
    document.getElementById('mode-opt-2').classList.toggle('active', mode === 2);
    document.getElementById('mode-opt-2').classList.toggle('triple', false);
    document.getElementById('mode-opt-3').classList.toggle('active', mode === 3);
    document.getElementById('mode-opt-3').classList.toggle('triple', mode === 3);

    // Reset beaker state
    hideFlaskResult();

    Lab.updateBeakers();
    Lab.renderRadicalPicker();
    Lab.updateAffinityHints();
}

/**
 * Clear decomposition selection and UI
 */
Lab.clearDecompSelection = function () {
    Lab.state.selectedDecompChar = null;
    document.querySelectorAll('.lab-decomp-char').forEach(function (el) {
        el.classList.remove('selected');
    });
    var detail = document.getElementById('lab-decomp-detail');
    if (detail) detail.classList.remove('visible');
}

/**
 * Claim a branching reward (level + radical)
 */
Lab.claimBranchReward = function (level, rad) {
    var pid = Lab.state.profileId;
    if (!pid) return;

    var success = XHZ.claimLevelReward ? XHZ.claimLevelReward(pid, level, rad) : false;
    if (success) {
        Lab.sfx.success();
        Lab.closeBranchingModal();
        Lab.updateTopbar();
        Lab.renderRadicalPicker();
        Lab.renderCollection();
        Lab.checkBranching();
        Lab.showToast('🎉', 'Radical Unlocked!', 'You earned ' + rad + '! Check your Collection.', 'Awesome!');
    } else {
        Lab.showToast('⚠️', 'Failed', 'Something went wrong claiming this reward.', 'Close');
    }
}

/**
 * Render category filter pills for collection tab
 */
Lab.renderCategoryFilters = function () {
    var container = document.getElementById('collection-cat-filters');
    if (!container) return;

    var cats = {
        'all': 'All',
        'nature': 'Nature',
        'body': 'Body',
        'civilization': 'Civilization',
        'fauna': 'Fauna',
        'abstract': 'Abstract',
        'other': 'Other'
    };

    var allRads = Lab.state.allRadicals;
    var catCounts = {};
    allRads.forEach(function (r) {
        var cat = r.doodle_category || 'other';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    var html = '';
    Object.keys(cats).forEach(function (key) {
        var label = cats[key];
        var count = key === 'all' ? allRads.length : (catCounts[key] || 0);
        var active = Lab.state.collCategory === key;

        var catMeta = key === 'all' ? null : Lab.getCategoryMeta(key);
        var dotHtml = catMeta ? '<span class="cat-dot" style="background:' + catMeta.color + ';"></span>' : '';

        html += '<button class="lab-cat-chip' + (active ? ' active' : '') + (key === 'all' ? ' cat-all' : '') +
            '" onclick="setCollCategory(\\'' + key + '\\')">' +
            dotHtml +
            (key === 'all' ? '' : catMeta.emoji + ' ') +
            label + ' <span class="cat-count">' + count + '</span>' +
            '</button>';
    });

    container.innerHTML = html;
}

/**
 * Show a temporary toast notification
 */
Lab.showToast = function (emoji, title, desc, btnText) {
    var toast = document.getElementById('lab-result-toast');
    if (!toast) return;

    document.getElementById('rt-char').textContent = emoji;
    document.getElementById('rt-info').textContent = title || '';
    document.getElementById('rt-desc').textContent = desc || '';
    var btn = document.getElementById('rt-close-btn');
    if (btn) btn.textContent = btnText || 'Close';

    toast.classList.add('visible');

    // Auto-hide after 5 seconds if not a permanent toast
    setTimeout(function () {
        toast.classList.remove('visible');
    }, 5000);
}

/**
 * closeResultToast — closes the result toast overlay
 */
function closeResultToast() {
    var toast = document.getElementById('lab-result-toast');
    if (toast) toast.classList.remove('visible');
}

/**
 * onMixClick — handle the Mix button
 */
function onMixClick() {
    var sel = Lab.state.selectedRadicals;
    var pid = Lab.state.profileId;
    if (!pid) return;

    // Get filled radicals
    var filled = [];
    for (var i = 0; i < sel.length; i++) {
        if (sel[i]) filled.push(sel[i]);
    }
    if (filled.length < 2) return;

    // Check for a reaction
    var result = XHZ.checkReaction(filled[0], filled[1]);
    var isTripleBlend = Lab.state.tripleBlendMode && filled.length >= 3;
    var tripleResult = null;

    if (isTripleBlend) {
        tripleResult = XHZ.checkThreeComponent(filled[0], filled[1], filled[2]);
    }

    // Shake the flask for animation
    shakeFlask();

    // Track stats
    XHZ.incrementLabStat(pid, 'total_mix_attempts');

    var resultEl = document.getElementById('mix-beaker-result');
    var reaction = result || tripleResult;

    if (reaction) {
        // Success!
        var char = reaction.result || reaction.char;
        var pinyin = reaction.pinyin || '';
        var meaning = reaction.meaning || '';
        var radicals = reaction.radicals || filled;

        XHZ.incrementLabStat(pid, 'total_mix_successes');

        // Track radical usage
        filled.forEach(function (r) {
            XHZ.incrementLabStat(pid, 'radical_usage', r);
        });

        // Show result in flask overlay
        showFlaskResult(char, pinyin + ' · ' + meaning, radicals.join(' + '));

        // Update result beaker below
        resultEl.className = 'lab-beaker-result' + (isTripleBlend ? ' triple' : ' has-result');
        resultEl.innerHTML =
            '<span class="result-char">' + char + '</span>' +
            '<span class="result-meaning">' + (pinyin || '') + (meaning ? ' · ' + meaning : '') + '</span>';

        // Check if already discovered
        var alreadyDiscovered = XHZ.hasDiscoveredCharacter(pid, char);
        if (alreadyDiscovered) {
            resultEl.innerHTML += '<div class="result-chain-recipe">🔄 Already discovered!</div>';
        }

        // Check if chain reaction is possible (2-radical only)
        if (!isTripleBlend && XHZ.checkChainReaction && XHZ.checkChainReaction(char, null)) {
            resultEl.innerHTML += '<div class="result-extend-hint">⛓ This character can be extended!</div>' +
                '<button class="result-extend-btn" onclick="Lab.startSynthesis()">⛓ Extend!</button>';
            Lab.state.lastResult = {
                char: char,
                pinyin: pinyin,
                meaning: meaning,
                radicals: radicals
            };
        } else if (!isTripleBlend && !alreadyDiscovered) {
            // Test for any potential chain
            var hasChains = false;
            var allChainData = XHZ.getChainReactionData && XHZ.getChainReactionData();
            if (allChainData) {
                for (var ci = 0; ci < allChainData.length; ci++) {
                    if (allChainData[ci].intermediate === char) {
                        hasChains = true;
                        break;
                    }
                }
            }
            if (hasChains) {
                resultEl.innerHTML += '<div class="result-extend-hint">⛓ This character can be extended!</div>' +
                    '<button class="result-extend-btn" onclick="Lab.startSynthesis()">⛓ Extend!</button>';
                Lab.state.lastResult = {
                    char: char,
                    pinyin: pinyin,
                    meaning: meaning,
                    radicals: radicals
                };
            }
        }

        // Save as discovered character
        XHZ.addDiscoveredCharacter(pid, char, radicals, {
            pinyin: pinyin,
            meaning: meaning
        });

        // Update discovered tab
        if (!alreadyDiscovered) {
            Lab.renderDiscovered();
            Lab.sfx.success();
        }

        // Show toast
        if (!alreadyDiscovered) {
            showFlaskResult(char, pinyin + ' · ' + meaning, radicals.join(' + '));
        }

        // Disable mix button until cleared
        var btn = document.getElementById('btn-mix');
        btn.disabled = true;
        btn.innerHTML = '✅ Done!';

    } else {
        // No reaction — failure
        XHZ.incrementLabStat(pid, 'total_mix_failures');

        resultEl.className = 'lab-beaker-result';
        resultEl.innerHTML = '<span class="result-empty-text" style="color:var(--botes-coral);">💥 No reaction! Try different radicals.</span>';

        Lab.sfx.fail();

        var btn = document.getElementById('btn-mix');
        btn.disabled = true;
        btn.innerHTML = '💥 No Reaction';
    }
}

/**
 * onBeakerClick — handle click on a drop zone
 */
function onBeakerClick(index) {
    if (Lab.state.synthesisMode) return; // Don't allow changes in synthesis mode

    var sel = Lab.state.selectedRadicals;
    if (sel[index]) {
        // Deselect this radical
        sel[index] = null;
        Lab.updateBeakers();
        Lab.renderRadicalPicker();
        Lab.updateAffinityHints();
        Lab.sfx.click();
    }
}

/**
 * clearMixSelection — clear all mixing selections
 */
function clearMixSelection() {
    if (Lab.state.synthesisMode) {
        Lab.exitSynthesis();
        return;
    }

    var slots = Lab.state.tripleBlendMode ? 3 : 2;
    Lab.state.selectedRadicals = [];
    for (var i = 0; i < 3; i++) {
        Lab.state.selectedRadicals.push(null);
    }
    Lab.state.beakerAffinities = [null, null, null];
    Lab.state.lastResult = null;

    // Reset UI
    hideFlaskResult();
    clearFlaskLiquid();

    var resultEl = document.getElementById('mix-beaker-result');
    if (resultEl) {
        resultEl.className = 'lab-beaker-result';
        resultEl.innerHTML = '<span class=\"result-empty-text\">?</span>';
    }

    var btn = document.getElementById('btn-mix');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⚗️ Mix!';
    }

    Lab.updateBeakers();
    Lab.renderRadicalPicker();
    Lab.updateAffinityHints();
}

"""

# Insert before </script>
content = content[:insert_idx] + missing_js + content[insert_idx:]

with open('laboratory-playground.html', 'w') as f:
    f.write(content)

print('✅ All missing JS functions appended')
print(f'   File size: {len(content)} chars')

# Verify key functions exist
import re
functions = [
    'Lab.getCharMastery',
    'Lab.loadCourseData',
    'Lab.switchTab',
    'Lab.updateTopbar',
    'Lab.updateBeakers',
    'Lab.renderRadicalPicker',
    'Lab.updateAffinityHints',
    'Lab.updateBlendToggle',
    'Lab.setBlendMode',
    'Lab.clearDecompSelection',
    'Lab.claimBranchReward',
    'Lab.renderCategoryFilters',
    'Lab.showToast',
    'function closeResultToast',
    'function onMixClick',
    'function onBeakerClick',
    'function clearMixSelection',
]
for fn in functions:
    if fn in content:
        print(f'  ✅ {fn}')
    else:
        print(f'  ❌ MISSING: {fn}')
