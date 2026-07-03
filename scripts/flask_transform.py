#!/usr/bin/env python3
"""Transform laboratory-playground.html: replace beaker layout with inline flask SVG."""

import re, os

path = '/Users/gu2026/Desktop/chinese-web-app/laboratory-playground.html'

with open(path, 'r') as f:
    content = f.read()

original = content

# ═══ 1. Replace beaker CSS with flask CSS ═══

old_beaker_css = """/* Mixing beakers */
.lab-mix-beakers {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 0;
}
.lab-beaker {
    width: 80px;
    height: 100px;
    border-radius: 8px 8px 20px 20px;
    border: 2px solid var(--paper-deep);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    background: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
    flex-shrink: 0;
}
.lab-beaker:hover { border-color: var(--ink-light); }
.lab-beaker.selected {
    border-color: var(--botes-sage);
    box-shadow: 0 0 16px rgba(148,168,142,0.2);
    background: rgba(148,168,142,0.08);
}
.lab-beaker .beaker-char {
    font-family: var(--lab-font-hanzi);
    font-size: 2em;
    color: var(--ink-dark);
    line-height: 1;
}
.lab-beaker .beaker-label {
    font-size: 0.6em;
    font-weight: 700;
    color: var(--ink-light);
    text-align: center;
    line-height: 1.2;
}
.lab-beaker .beaker-placeholder {
    font-size: 0.7em;
    color: var(--ink-light);
    opacity: 0.4;
}

/* Affinity hints below beakers */
.beaker-aff-wrap {
    min-height: 28px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}
.beaker-affinities {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    margin-top: 4px;
    max-width: 220px;
}
.beaker-aff-chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.55em;
    font-weight: 700;
    background: rgba(232,197,71,0.08);
    border: 1px solid rgba(232,197,71,0.15);
    color: var(--botes-mustard);
    white-space: nowrap;
    line-height: 1.3;
}
.beaker-aff-chip .aff-arrow {
    color: var(--ink-light);
    margin: 0 1px;
}
.beaker-aff-empty {
    font-size: 0.55em;
    color: var(--ink-light);
    opacity: 0.4;
    font-weight: 600;
    margin-top: 4px;
}
.beaker-aff-title {
    font-size: 0.5em;
    color: var(--ink-light);
    font-weight: 600;
    opacity: 0.5;
    text-align: center;
    margin-top: 3px;
    width: 100%;
}

.lab-mix-plus {
    font-size: 1.5em;
    color: var(--ink-light);
    font-weight: 700;
    flex-shrink: 0;
}
.lab-mix-equals {
    font-size: 1.5em;
    color: var(--ink-light);
    font-weight: 700;
    flex-shrink: 0;
}
"""

new_flask_css = """/* ═══════════════════════════════════════════
   FLASK — Alchemist's Potion Bottle
═══════════════════════════════════════════ */
.lab-flask-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 2px 0;
}
.lab-flask-wrap {
    position: relative;
    width: 180px;
    height: 220px;
    flex-shrink: 0;
}
.lab-flask-svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
}
.flask-glass {
    fill: rgba(255,255,255,0.08);
    stroke: var(--ink-dark);
    stroke-width: 4;
    stroke-linejoin: round;
    stroke-linecap: round;
}
.flask-glass-bg {
    fill: rgba(255,255,255,0.12);
    stroke: none;
}
.flask-liquid {
    fill: var(--liquid-color, transparent);
    transition: fill 0.5s ease;
}
.flask-liquid.has-color {
    fill: var(--liquid-color);
}
.flask-shine {
    stroke: rgba(255,255,255,0.55);
    stroke-width: 2.5;
    stroke-linecap: round;
    fill: none;
}

/* Drop zones inside the flask */
.flask-drop-zone {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 12px;
    background: transparent;
    border: 2px dashed rgba(0,0,0,0.08);
}
.flask-drop-zone:hover {
    border-color: rgba(0,0,0,0.2);
    background: rgba(255,255,255,0.08);
}
.flask-drop-zone.selected {
    border-color: var(--botes-sage);
    background: rgba(148,168,142,0.1);
    box-shadow: 0 0 12px rgba(148,168,142,0.15);
}
.flask-drop-zone .dz-char {
    font-family: var(--lab-font-hanzi);
    font-size: 1.9em;
    line-height: 1;
    color: var(--ink-dark);
}
.flask-drop-zone .dz-label {
    font-size: 0.5em;
    font-weight: 700;
    color: var(--ink-light);
    line-height: 1.1;
}
.flask-drop-zone .dz-placeholder {
    font-size: 0.6em;
    color: var(--ink-light);
    opacity: 0.25;
}

/* Drop zone positions (2-radical mode) */
.flask-drop-zone.dz-left {
    left: 18px;
    top: 100px;
    width: 56px;
    height: 60px;
}
.flask-drop-zone.dz-right {
    right: 18px;
    top: 100px;
    width: 56px;
    height: 60px;
}
.flask-drop-zone.dz-third { display: none; }

/* Triple blend — 3 vertical drop zones */
.lab-flask-wrap.triple .flask-drop-zone.dz-left {
    left: 50%;
    transform: translateX(-50%);
    top: 92px;
    width: 52px;
    height: 34px;
}
.lab-flask-wrap.triple .flask-drop-zone.dz-right {
    left: 50%;
    transform: translateX(-50%);
    top: 131px;
    width: 52px;
    height: 34px;
}
.lab-flask-wrap.triple .flask-drop-zone.dz-third {
    display: flex;
    left: 50%;
    transform: translateX(-50%);
    top: 170px;
    width: 52px;
    height: 34px;
}

/* Synthesis mode */
.lab-flask-wrap.synthesis .flask-drop-zone.dz-left {
    border-color: var(--botes-sky);
    background: rgba(127,163,189,0.08);
    cursor: default;
    border-style: solid;
}
.lab-flask-wrap.synthesis .flask-drop-zone.dz-left:hover {
    background: rgba(127,163,189,0.08);
}

/* Affinity hints below the flask */
.flask-affinity-area {
    min-height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex-wrap: wrap;
    max-width: 220px;
    padding: 0 4px;
}
.flask-aff-chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.5em;
    font-weight: 700;
    background: rgba(232,197,71,0.08);
    border: 1px solid rgba(232,197,71,0.15);
    color: var(--botes-mustard);
    white-space: nowrap;
    line-height: 1.3;
}
.flask-aff-chip .aff-arrow {
    color: var(--ink-light);
    margin: 0 1px;
}
.flask-aff-empty {
    font-size: 0.5em;
    color: var(--ink-light);
    opacity: 0.4;
    font-weight: 600;
    text-align: center;
}

/* Bubble animation */
@keyframes flaskBubble {
    0% { transform: translateY(0) scale(1); opacity: 0.5; }
    50% { opacity: 0.8; }
    100% { transform: translateY(-18px) scale(0.5); opacity: 0; }
}
.flask-bubble {
    animation: flaskBubble 2s ease-in-out infinite;
}
.flask-bubble:nth-child(2) { animation-delay: 0.4s; }
.flask-bubble:nth-child(3) { animation-delay: 0.8s; }

/* Flask shake on mix */
@keyframes flaskShake {
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(-3deg); }
    40% { transform: rotate(3deg); }
    60% { transform: rotate(-2deg); }
    80% { transform: rotate(2deg); }
}
.lab-flask-wrap.shaking {
    animation: flaskShake 0.4s ease;
}

/* Result pop inside flask */
.flask-result-overlay {
    position: absolute;
    inset: 8px;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 2px;
    background: rgba(245,237,216,0.88);
    border-radius: 18px;
    z-index: 5;
    backdrop-filter: blur(4px);
    animation: resultPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.flask-result-overlay.visible { display: flex; }
.flask-result-overlay .fr-char {
    font-family: var(--lab-font-hanzi);
    font-size: 2.8em;
    color: var(--botes-mustard);
    line-height: 1;
    text-shadow: 0 0 20px rgba(232,197,71,0.3);
}
.flask-result-overlay .fr-meaning {
    font-size: 0.55em;
    font-weight: 700;
    color: var(--ink-soft);
    text-align: center;
    line-height: 1.2;
}
.flask-result-overlay .fr-recipe {
    font-size: 0.45em;
    font-weight: 600;
    color: var(--ink-light);
    text-align: center;
    margin-top: 2px;
}
"""

if old_beaker_css in content:
    content = content.replace(old_beaker_css, new_flask_css, 1)
    print("1. Replaced beaker base CSS with flask CSS")
else:
    print("1. FAILED: old_beaker_css not found")

# ═══ 2. Replace triple blend beaker layout CSS ═══

old_triple_css = """/* Triple blend 3-beaker layout */
.lab-mix-beakers.triple {
    gap: 6px;
}
.lab-mix-beakers.triple .lab-beaker {
    width: 64px;
    height: 88px;
}
.lab-mix-beakers.triple .lab-beaker .beaker-char {
    font-size: 1.6em;
}
.lab-mix-beakers.triple .lab-beaker-result {
    width: 80px;
    height: 100px;
}
.lab-mix-beakers.triple .lab-beaker-result .result-char {
    font-size: 2.2em;
}
.lab-beaker-result.triple {
    border-color: var(--botes-sky);
    background: rgba(127,163,189,0.08);
    box-shadow: 0 0 24px rgba(127,163,189,0.2);
    animation: chainPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lab-beaker-result.triple .result-char {
    color: var(--botes-sky);
    text-shadow: 0 0 24px rgba(127,163,189,0.3);
    font-size: 2.5em;
}
.lab-beaker-result.triple .result-meaning {
    color: var(--ink-soft);
}
"""

new_triple_css = """/* Triple blend result styles */
.lab-beaker-result.triple {
    border-color: var(--botes-sky);
    background: rgba(127,163,189,0.08);
    box-shadow: 0 0 24px rgba(127,163,189,0.2);
    animation: chainPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lab-beaker-result.triple .result-char {
    color: var(--botes-sky);
    text-shadow: 0 0 24px rgba(127,163,189,0.3);
    font-size: 2.5em;
}
.lab-beaker-result.triple .result-meaning {
    color: var(--ink-soft);
}
"""

if old_triple_css in content:
    content = content.replace(old_triple_css, new_triple_css, 1)
    print("2. Replaced triple blend CSS")
else:
    print("2. FAILED: old_triple_css not found")

# ═══ 3. Replace synthesis beaker CSS ═══

old_synth = """.lab-beaker.synthesis {
    border-color: var(--botes-sky);
    box-shadow: 0 0 16px rgba(127,163,189,0.2);
    background: rgba(127,163,189,0.06);
    cursor: default;
}
.lab-beaker.synthesis:hover {
    border-color: var(--botes-sky);
}
"""

new_synth = """.lab-flask-wrap.synthesis .flask-drop-zone.dz-intermediate {
    border-color: var(--botes-sky);
    box-shadow: 0 0 16px rgba(127,163,189,0.2);
    background: rgba(127,163,189,0.06);
    cursor: default;
    border-style: solid;
}
.lab-flask-wrap.synthesis .flask-drop-zone.dz-intermediate:hover {
    border-color: var(--botes-sky);
}
"""

if old_synth in content:
    content = content.replace(old_synth, new_synth, 1)
    print("3. Replaced synthesis beaker CSS")
else:
    print("3. FAILED: old_synth not found")

# ═══ 4. Replace HTML beakers with flask HTML ═══

old_html = """            <!-- Beakers -->
            <div class=\"lab-mix-beakers\" id=\"mix-beakers\">
                <div class=\"lab-beaker\" id=\"mix-beaker-0\" onclick=\"onBeakerClick(0)\">
                    <span class=\"beaker-placeholder\">?</span>
                </div>
                <div class=\"lab-mix-plus\">+</div>
                <div class=\"lab-beaker\" id=\"mix-beaker-1\" onclick=\"onBeakerClick(1)\">
                    <span class=\"beaker-placeholder\">?</span>
                </div>
                <!-- 3rd beaker for triple blend (hidden by default) -->
                <div class=\"lab-mix-plus\" id=\"plus-2\" style=\"display:none;\">+</div>
                <div class=\"lab-beaker\" id=\"mix-beaker-2\" onclick=\"onBeakerClick(2)\" style=\"display:none;\">
                    <span class=\"beaker-placeholder\">?</span>
                </div>
                <div class=\"lab-mix-equals\">=</div>
                <div class=\"lab-beaker-result\" id=\"mix-beaker-result\">
                    <span class=\"result-empty-text\">?</span>
                </div>
            </div>"""

new_html = """            <!-- Flask -->
            <div class=\"lab-flask-section\">
                <div class=\"lab-flask-wrap\" id=\"lab-flask-wrap\">
                    <!-- Inline SVG potion bottle -->
                    <svg class=\"lab-flask-svg\" viewBox=\"0 0 200 240\" preserveAspectRatio=\"xMidYMid meet\">
                        <!-- Glass background -->
                        <path class=\"flask-glass-bg\" d=\"M 76,0 L 124,0 L 124,4 L 120,4 L 114,56 C 114,68 145,85 178,92 C 185,120 185,150 178,172 C 165,205 140,236 100,240 C 60,236 35,205 22,172 C 15,150 15,120 22,92 C 55,85 86,68 86,56 L 80,4 L 76,4 Z\" />
                        <!-- Liquid fill (bottom portion, color via CSS var) -->
                        <path class=\"flask-liquid\" d=\"M 22,170 C 22,168 178,168 178,170 C 178,172 C 165,205 140,236 100,240 C 60,236 35,205 22,172 Z\" opacity=\"0\" />
                        <!-- Glass outline -->
                        <path class=\"flask-glass\" d=\"M 76,0 L 124,0 L 124,4 L 120,4 L 114,56 C 114,68 145,85 178,92 C 185,120 185,150 178,172 C 165,205 140,236 100,240 C 60,236 35,205 22,172 C 15,150 15,120 22,92 C 55,85 86,68 86,56 L 80,4 L 76,4 Z\" />
                        <!-- Glass shine -->
                        <path class=\"flask-shine\" d=\"M 82,8 L 80,8 M 80,16 L 79,40 M 38,105 L 30,115 M 30,130 L 33,150 M 34,170 L 38,185\" />
                    </svg>

                    <!-- Drop zones inside flask -->
                    <div class=\"flask-drop-zone dz-left\" id=\"drop-0\" onclick=\"onBeakerClick(0)\">
                        <span class=\"dz-placeholder\">?</span>
                    </div>
                    <div class=\"flask-drop-zone dz-right\" id=\"drop-1\" onclick=\"onBeakerClick(1)\">
                        <span class=\"dz-placeholder\">?</span>
                    </div>
                    <div class=\"flask-drop-zone dz-third\" id=\"drop-2\" onclick=\"onBeakerClick(2)\">
                        <span class=\"dz-placeholder\">?</span>
                    </div>

                    <!-- Result overlay -->
                    <div class=\"flask-result-overlay\" id=\"flask-result-overlay\">
                        <div class=\"fr-char\" id=\"fr-char\">\u660e</div>
                        <div class=\"fr-meaning\" id=\"fr-meaning\">ming \u00b7 bright</div>
                        <div class=\"fr-recipe\" id=\"fr-recipe\">\u65e5 + \u6708</div>
                    </div>
                </div>

                <!-- Affinity hints -->
                <div class=\"flask-affinity-area\" id=\"flask-affinity-area\">
                    <span class=\"flask-aff-empty\">Click a radical to see pairings</span>
                </div>
            </div>

            <!-- Result below flask -->
            <div class=\"lab-beaker-result\" id=\"mix-beaker-result\">
                <span class=\"result-empty-text\">?</span>
            </div>"""

if old_html in content:
    content = content.replace(old_html, new_html, 1)
    print("4. Replaced HTML beakers with flask HTML")
else:
    print("4. FAILED: old_html not found")
    # Debug
    for kw in ['<!-- Beakers -->', 'lab-mix-beakers', 'mix-beaker-0']:
        print(f"   '{kw}' in content: {kw in content}")

# ═══ 5. Replace JS: onBeakerClick ═══

old_oc = """function onBeakerClick(index) {
    var sel = Lab.state.selectedRadicals;
    sel[index] = null;
    if (index < 2) {
        Lab.state.beakerAffinities[index] = null;
    }
    Lab.updateBeakers();
    Lab.renderRadicalPicker();
    // Clear result
    var result = document.getElementById('mix-beaker-result');
    result.className = 'lab-beaker-result';
    result.innerHTML = '<span class=\"result-empty-text\">?</span>';
}"""

new_oc = """function onBeakerClick(index) {
    var sel = Lab.state.selectedRadicals;
    sel[index] = null;
    if (index < 2) {
        Lab.state.beakerAffinities[index] = null;
    }
    Lab.updateBeakers();
    Lab.renderRadicalPicker();
    // Clear result
    var result = document.getElementById('mix-beaker-result');
    result.className = 'lab-beaker-result';
    result.innerHTML = '<span class=\"result-empty-text\">?</span>';
    hideFlaskResult();
}"""

if old_oc in content:
    content = content.replace(old_oc, new_oc, 1)
    print("5. Replaced onBeakerClick")
else:
    print("5. FAILED: onBeakerClick not found")

# ═══ 6. Replace JS: clearMixSelection ═══

old_cl = """function clearMixSelection() {
    Lab.state.selectedRadicals = [null, null, null];
    Lab.state.beakerAffinities = [null, null];
    Lab.updateBeakers();
    Lab.renderRadicalPicker();
    // Clear result
    var result = document.getElementById('mix-beaker-result');
    result.className = 'lab-beaker-result';
    result.innerHTML = '<span class=\"result-empty-text\">?</span>';
}"""

new_cl = """function clearMixSelection() {
    Lab.state.selectedRadicals = [null, null, null];
    Lab.state.beakerAffinities = [null, null];
    Lab.updateBeakers();
    Lab.renderRadicalPicker();
    // Clear result
    var result = document.getElementById('mix-beaker-result');
    result.className = 'lab-beaker-result';
    result.innerHTML = '<span class=\"result-empty-text\">?</span>';
    hideFlaskResult();
    clearFlaskLiquid();
}"""

if old_cl in content:
    content = content.replace(old_cl, new_cl, 1)
    print("6. Replaced clearMixSelection")
else:
    print("6. FAILED: clearMixSelection not found")

# ═══ 7. Replace JS: Lab.updateBeakers ═══

old_upd = """Lab.updateBeakers = function () {
    var sel = Lab.state.selectedRadicals;

    // Synthesis mode: beaker 0 is locked (intermediate), only update beaker 1
    if (Lab.state.synthesisMode) {
        var beaker1 = document.getElementById('mix-beaker-1');
        if (beaker1) {
            if (sel[0]) {
                var rad = Lab.getRadicalInfo(sel[0]);
                beaker1.className = 'lab-beaker selected';
                beaker1.innerHTML =
                    '<span class=\"beaker-char\">' + sel[0] + '</span>' +
                    (rad && rad.pinyin ? '<span class=\"beaker-label\">' + rad.pinyin + '</span>' : '');
            } else {
                beaker1.className = 'lab-beaker';
                beaker1.innerHTML = '<span class=\"beaker-placeholder\">Pick a radical</span>';
            }
        }
        // Enable extend button when a radical is selected
        var btn = document.getElementById('btn-mix');
        btn.disabled = !sel[0];
        return;
    }

    var slotCount = Lab.state.tripleBlendMode ? 3 : 2;
    for (var i = 0; i < slotCount; i++) {
        var beaker = document.getElementById('mix-beaker-' + i);
        if (!beaker) continue;
        beaker.className = 'lab-beaker' + (sel[i] ? ' selected' : '');
        if (sel[i]) {
            var rad = Lab.getRadicalInfo(sel[i]);
            beaker.innerHTML =
                '<span class=\"beaker-char\">' + sel[i] + '</span>' +
                (rad && rad.pinyin ? '<span class=\"beaker-label\">' + rad.pinyin + '</span>' : '');
        } else {
            beaker.innerHTML = '<span class=\"beaker-placeholder\">?</span>';
            if (!Lab.state.tripleBlendMode && i < 2) {
                Lab.state.beakerAffinities[i] = null;
            }
        }
    }

    // Fetch and render affinity hints (only for 2-radical mode)
    if (!Lab.state.tripleBlendMode) {
        Lab.updateAffinityHints();
    }

    // Enable/disable mix button
    var btn = document.getElementById('btn-mix');
    if (Lab.state.tripleBlendMode) {
        btn.disabled = !(sel[0] && sel[1] && sel[2]);
    } else {
        btn.disabled = !(sel[0] && sel[1]);
    }
};"""

new_upd = """Lab.updateBeakers = function () {
    var sel = Lab.state.selectedRadicals;
    var wrap = document.getElementById('lab-flask-wrap');
    if (!wrap) return;

    // Hide any previous result overlay
    hideFlaskResult();

    // Synthesis mode: left drop zone is locked (intermediate)
    if (Lab.state.synthesisMode) {
        var drop1 = document.getElementById('drop-1');
        if (drop1) {
            if (sel[0]) {
                var rad = Lab.getRadicalInfo(sel[0]);
                drop1.className = 'flask-drop-zone dz-right selected';
                drop1.innerHTML =
                    '<span class=\"dz-char\">' + sel[0] + '</span>' +
                    (rad && rad.pinyin ? '<span class=\"dz-label\">' + rad.pinyin + '</span>' : '');
            } else {
                drop1.className = 'flask-drop-zone dz-right';
                drop1.innerHTML = '<span class=\"dz-placeholder\">Pick a radical</span>';
            }
        }
        var btn = document.getElementById('btn-mix');
        btn.disabled = !sel[0];
        return;
    }

    // Normal / triple blend mode
    wrap.classList.toggle('triple', !!Lab.state.tripleBlendMode);

    var slotCount = Lab.state.tripleBlendMode ? 3 : 2;
    var dropIds = ['drop-0', 'drop-1', 'drop-2'];
    for (var i = 0; i < slotCount; i++) {
        var drop = document.getElementById(dropIds[i]);
        if (!drop) continue;
        var cls = i === 0 ? 'dz-left' : i === 1 ? 'dz-right' : 'dz-third';
        drop.className = 'flask-drop-zone ' + cls + (sel[i] ? ' selected' : '');
        if (sel[i]) {
            var rad = Lab.getRadicalInfo(sel[i]);
            drop.innerHTML =
                '<span class=\"dz-char\">' + sel[i] + '</span>' +
                (rad && rad.pinyin ? '<span class=\"dz-label\">' + rad.pinyin + '</span>' : '');
        } else {
            drop.innerHTML = '<span class=\"dz-placeholder\">?</span>';
        }
    }

    // Update liquid color based on selected radicals
    updateFlaskLiquid(sel[0], sel[1]);

    // Fetch and render affinity hints (only for 2-radical mode)
    if (!Lab.state.tripleBlendMode) {
        Lab.updateAffinityHints();
    }

    // Enable/disable mix button
    var btn = document.getElementById('btn-mix');
    if (Lab.state.tripleBlendMode) {
        btn.disabled = !(sel[0] && sel[1] && sel[2]);
    } else {
        btn.disabled = !(sel[0] && sel[1]);
    }

    // If both slots filled, shake flask slightly
    if (sel[0] && sel[1]) {
        wrap.classList.remove('shaking');
        void wrap.offsetWidth;
        wrap.classList.add('shaking');
    }
};"""

if old_upd in content:
    content = content.replace(old_upd, new_upd, 1)
    print("7. Replaced Lab.updateBeakers")
else:
    print("7. FAILED: Lab.updateBeakers not found")

# ═══ 8. Replace JS: Lab.updateAffinityHints ═══

old_aff = """Lab.updateAffinityHints = function () {
    var sel = Lab.state.selectedRadicals;
    var pid = Lab.state.profileId;

    for (var i = 0; i < 2; i++) {
        var beaker = document.getElementById('mix-beaker-' + i);
        if (!beaker || !sel[i]) {
            Lab.state.beakerAffinities[i] = null;
            continue;
        }

        // Get affinities for this radical
        var allAffinities = XHZ.getAffinities(sel[i]);

        // Filter to only show partners the user actually owns
        var ownedRads = pid ? XHZ.getAllUserRadicals(pid) : [];
        var affinities = allAffinities.filter(function (a) {
            return ownedRads.indexOf(a.partner) !== -1;
        });
        Lab.state.beakerAffinities[i] = affinities;

        // Create or update affinity container
        var affContainer = beaker.querySelector('.beaker-aff-wrap');
        if (!affContainer) {
            affContainer = document.createElement('div');
            affContainer.className = 'beaker-aff-wrap';
            beaker.appendChild(affContainer);
        }

        if (affinities.length === 0) {
            affContainer.innerHTML = '<div class=\"beaker-aff-empty\">No usable pairs with your radicals</div>';
        } else {
            // Show top 4 affinities
            var topAffs = affinities.slice(0, 4);
            var html = '<div class=\"beaker-affinities\">';
            topAffs.forEach(function (a, idx) {
                html +=
                    '<span class=\"beaker-aff-chip\">' +
                        a.partner + ' <span class=\"aff-arrow\">\u2192</span> ' + a.result +
                        (a.pinyin ? ' ' + a.pinyin : '') +
                    '</span>';
            });
            html += '</div>';
            if (allAffinities.length > affinities.length) {
                html += '<div class=\"beaker-aff-title\">+' + (allAffinities.length - affinities.length) + ' more (level up!)</div>';
            }
            affContainer.innerHTML = html;
        }
    }
};"""

new_aff = """Lab.updateAffinityHints = function () {
    var sel = Lab.state.selectedRadicals;
    var pid = Lab.state.profileId;
    var area = document.getElementById('flask-affinity-area');
    if (!area) return;

    // Find the first filled slot
    var filledChar = null;
    for (var i = 0; i < 2; i++) {
        if (sel[i]) { filledChar = sel[i]; break; }
    }

    if (!filledChar) {
        area.innerHTML = '<span class=\"flask-aff-empty\">Click a radical to see pairings</span>';
        Lab.state.beakerAffinities = [null, null];
        return;
    }

    // Get affinities for the filled radical
    var allAffinities = XHZ.getAffinities(filledChar);
    var ownedRads = pid ? XHZ.getAllUserRadicals(pid) : [];
    var affinities = allAffinities.filter(function (a) {
        return ownedRads.indexOf(a.partner) !== -1;
    });

    // Store for the other slot
    var slotIdx = sel[0] ? 0 : 1;
    Lab.state.beakerAffinities = [null, null];
    Lab.state.beakerAffinities[slotIdx] = affinities;

    if (affinities.length === 0) {
        area.innerHTML = '<span class=\"flask-aff-empty\">No usable pairs with your radicals</span>';
    } else {
        var topAffs = affinities.slice(0, 4);
        var html = '';
        topAffs.forEach(function (a) {
            html +=
                '<span class=\"flask-aff-chip\">' +
                    a.partner + ' <span class=\"aff-arrow\">\u2192</span> ' + a.result +
                    (a.pinyin ? ' ' + a.pinyin : '') +
                '</span>';
        });
        area.innerHTML = html;
    }
};"""

if old_aff in content:
    content = content.replace(old_aff, new_aff, 1)
    print("8. Replaced Lab.updateAffinityHints")
else:
    print("8. FAILED: Lab.updateAffinityHints not found")

# ═══ 9. Replace Lab.setBlendMode (update mix-beakers refs) ═══

old_sb1 = """        Lab.state.tripleBlendMode = true;
        document.getElementById('mode-opt-2').classList.remove('active');
        document.getElementById('mode-opt-3').classList.add('active');
        document.getElementById('mix-beakers').classList.add('triple');
        document.getElementById('mix-beaker-2').style.display = 'flex';
        document.getElementById('plus-2').style.display = '';"""

new_sb1 = """        Lab.state.tripleBlendMode = true;
        document.getElementById('mode-opt-2').classList.remove('active');
        document.getElementById('mode-opt-3').classList.add('active');
        document.getElementById('lab-flask-wrap').classList.add('triple');
        document.getElementById('drop-2').style.display = 'flex';"""

if old_sb1 in content:
    content = content.replace(old_sb1, new_sb1, 1)
    print("9a. Replaced Lab.setBlendMode triple")
else:
    print("9a. FAILED: setBlendMode triple not found")

old_sb2 = """        Lab.state.tripleBlendMode = false;
        document.getElementById('mode-opt-3').classList.remove('active');
        document.getElementById('mode-opt-2').classList.add('active');
        document.getElementById('mix-beakers').classList.remove('triple');
        document.getElementById('mix-beaker-2').style.display = 'none';
        document.getElementById('plus-2').style.display = 'none';"""

new_sb2 = """        Lab.state.tripleBlendMode = false;
        document.getElementById('mode-opt-3').classList.remove('active');
        document.getElementById('mode-opt-2').classList.add('active');
        document.getElementById('lab-flask-wrap').classList.remove('triple');
        document.getElementById('drop-2').style.display = 'none';"""

if old_sb2 in content:
    content = content.replace(old_sb2, new_sb2, 1)
    print("9b. Replaced Lab.setBlendMode normal")
else:
    print("9b. FAILED: setBlendMode normal not found")

# ═══ 10. Replace JS: Lab.startSynthesis ═══

old_ss = """Lab.startSynthesis = function () {
    var last = Lab.state.lastResult;
    if (!last) return;

    Lab.state.synthesisMode = true;

    // Update header
    var header = document.querySelector('.lab-mix-header');
    header.classList.add('synthesis');
    header.querySelector('h2').textContent = '\u2bdb Step 2: Extend the Character';
    header.querySelector('p').textContent = last.char + ' (' + (last.pinyin || '') + ') \u2014 add one more radical to extend!';

    // Update beaker 0 to show the intermediate
    var beaker0 = document.getElementById('mix-beaker-0');
    beaker0.className = 'lab-beaker synthesis';
    beaker0.innerHTML =
        '<span class=\"beaker-char\">' + last.char + '</span>' +
        '<span class=\"beaker-label\">' + (last.pinyin || '') + '</span>';
    beaker0.onclick = null; // disable beaker click in synthesis mode

    // Make beaker 1 the \"picker\" beaker
    var beaker1 = document.getElementById('mix-beaker-1');
    beaker1.className = 'lab-beaker';
    beaker1.innerHTML = '<span class=\"beaker-placeholder\">Pick a radical</span>';
    beaker1.onclick = null;

    // Update result beaker
    var resultEl = document.getElementById('mix-beaker-result');
    resultEl.className = 'lab-beaker-result';
    resultEl.innerHTML = '<span class=\"result-empty-text\">?</span>';

    // Update plus/equals signs
    var plus = document.querySelector('.lab-mix-plus');
    if (plus) plus.textContent = '\u2bdb';
    var equals = document.querySelector('.lab-mix-equals');
    if (equals) equals.textContent = '\u2192';

    // Switch to extend button
    var btn = document.getElementById('btn-mix');
    btn.className = 'lab-btn lb-extend';
    btn.innerHTML = '\u2bdb Extend!';
    btn.disabled = true;
    btn.onclick = onExtendClick;

    // Change clear to back
    var clearBtn = document.querySelector('.lab-btn-secondary');
    if (clearBtn) {
        clearBtn.textContent = '\U0001f519 Back';
        clearBtn.onclick = Lab.exitSynthesis;
    }

    // Re-render the radical picker with compatible highlighting
    Lab.state.selectedRadicals = [null, null];
    Lab.renderRadicalPicker();
};"""

new_ss = """Lab.startSynthesis = function () {
    var last = Lab.state.lastResult;
    if (!last) return;

    Lab.state.synthesisMode = true;
    var wrap = document.getElementById('lab-flask-wrap');
    if (wrap) wrap.classList.add('synthesis');

    // Update header
    var header = document.querySelector('.lab-mix-header');
    header.classList.add('synthesis');
    header.querySelector('h2').textContent = '\u2bdb Step 2: Extend the Character';
    header.querySelector('p').textContent = last.char + ' (' + (last.pinyin || '') + ') \u2014 add one more radical to extend!';

    // Lock left drop zone with the intermediate character
    var drop0 = document.getElementById('drop-0');
    if (drop0) {
        drop0.className = 'flask-drop-zone dz-left dz-intermediate';
        drop0.innerHTML =
            '<span class=\"dz-char\">' + last.char + '</span>' +
            '<span class=\"dz-label\">' + (last.pinyin || '') + '</span>';
        drop0.onclick = null;
    }

    // Make right drop zone the picker
    var drop1 = document.getElementById('drop-1');
    if (drop1) {
        drop1.className = 'flask-drop-zone dz-right';
        drop1.innerHTML = '<span class=\"dz-placeholder\">Pick a radical</span>';
        drop1.onclick = null;
    }

    // Hide 3rd drop zone
    var drop2 = document.getElementById('drop-2');
    if (drop2) drop2.style.display = 'none';

    // Update result beaker
    var resultEl = document.getElementById('mix-beaker-result');
    resultEl.className = 'lab-beaker-result';
    resultEl.innerHTML = '<span class=\"result-empty-text\">?</span>';
    hideFlaskResult();

    // Switch to extend button
    var btn = document.getElementById('btn-mix');
    btn.className = 'lab-btn lb-extend';
    btn.innerHTML = '\u2bdb Extend!';
    btn.disabled = true;
    btn.onclick = onExtendClick;

    // Change clear to back
    var clearBtn = document.querySelector('.lab-btn-secondary');
    if (clearBtn) {
        clearBtn.textContent = '\U0001f519 Back';
        clearBtn.onclick = Lab.exitSynthesis;
    }

    // Re-render the radical picker with compatible highlighting
    Lab.state.selectedRadicals = [null, null];
    Lab.renderRadicalPicker();
};"""

if old_ss in content:
    content = content.replace(old_ss, new_ss, 1)
    print("10. Replaced Lab.startSynthesis")
else:
    print("10. FAILED: Lab.startSynthesis not found")

# ═══ 11. Replace JS: Lab.exitSynthesis ═══

old_es = """Lab.exitSynthesis = function () {
    Lab.state.synthesisMode = false;
    Lab.state.lastResult = null;

    // Restore header
    var header = document.querySelector('.lab-mix-header');
    header.classList.remove('synthesis');
    header.querySelector('h2').textContent = '\u2697\ufe0f Mixing Station';
    header.querySelector('p').textContent = 'Select two radicals to mix and discover new characters!';

    // Restore beakers
    var beaker0 = document.getElementById('mix-beaker-0');
    beaker0.className = 'lab-beaker';
    beaker0.innerHTML = '<span class=\"beaker-placeholder\">?</span>';
    beaker0.onclick = function () { onBeakerClick(0); };

    var beaker1 = document.getElementById('mix-beaker-1');
    beaker1.className = 'lab-beaker';
    beaker1.innerHTML = '<span class=\"beaker-placeholder\">?</span>';
    beaker1.onclick = function () { onBeakerClick(1); };

    // Restore result
    var resultEl = document.getElementById('mix-beaker-result');
    resultEl.className = 'lab-beaker-result';
    resultEl.innerHTML = '<span class=\"result-empty-text\">?</span>';

    // Restore plus/equals signs
    var plus = document.querySelector('.lab-mix-plus');
    if (plus) plus.textContent = '+';
    var equals = document.querySelector('.lab-mix-equals');
    if (equals) equals.textContent = '=';

    // Restore buttons
    var btn = document.getElementById('btn-mix');
    btn.className = 'lab-btn lb-primary';
    btn.innerHTML = '\u2697\ufe0f Mix!';
    btn.disabled = true;
    btn.onclick = onMixClick;

    var clearBtn = document.querySelector('.lab-btn-secondary');
    if (clearBtn) {
        clearBtn.textContent = '\U0001f504 Clear';
        clearBtn.onclick = clearMixSelection;
    }

    // Reset mix state
    Lab.state.selectedRadicals = [null, null];
    Lab.state.beakerAffinities = [null, null];
    Lab.updateBeakers();
    Lab.renderRadicalPicker();
};"""

new_es = """Lab.exitSynthesis = function () {
    Lab.state.synthesisMode = false;
    Lab.state.lastResult = null;
    var wrap = document.getElementById('lab-flask-wrap');
    if (wrap) wrap.classList.remove('synthesis');

    // Restore header
    var header = document.querySelector('.lab-mix-header');
    header.classList.remove('synthesis');
    header.querySelector('h2').textContent = '\u2697\ufe0f Mixing Station';
    header.querySelector('p').textContent = 'Select two radicals to mix and discover new characters!';

    // Restore drop zones
    var drop0 = document.getElementById('drop-0');
    if (drop0) {
        drop0.className = 'flask-drop-zone dz-left';
        drop0.innerHTML = '<span class=\"dz-placeholder\">?</span>';
        drop0.onclick = function () { onBeakerClick(0); };
    }
    var drop1 = document.getElementById('drop-1');
    if (drop1) {
        drop1.className = 'flask-drop-zone dz-right';
        drop1.innerHTML = '<span class=\"dz-placeholder\">?</span>';
        drop1.onclick = function () { onBeakerClick(1); };
    }

    // Restore result
    var resultEl = document.getElementById('mix-beaker-result');
    resultEl.className = 'lab-beaker-result';
    resultEl.innerHTML = '<span class=\"result-empty-text\">?</span>';
    hideFlaskResult();

    // Restore buttons
    var btn = document.getElementById('btn-mix');
    btn.className = 'lab-btn lb-primary';
    btn.innerHTML = '\u2697\ufe0f Mix!';
    btn.disabled = true;
    btn.onclick = onMixClick;

    var clearBtn = document.querySelector('.lab-btn-secondary');
    if (clearBtn) {
        clearBtn.textContent = '\U0001f504 Clear';
        clearBtn.onclick = clearMixSelection;
    }

    // Reset mix state
    Lab.state.selectedRadicals = [null, null];
    Lab.state.beakerAffinities = [null, null];
    Lab.updateBeakers();
    Lab.renderRadicalPicker();
};"""

if old_es in content:
    content = content.replace(old_es, new_es, 1)
    print("11. Replaced Lab.exitSynthesis")
else:
    print("11. FAILED: Lab.exitSynthesis not found")

# ═══ 12. Add flask helper functions ═══

marker = "    Lab.renderRadicalPicker();\n};\n\n// \u2500\u2500 Decomposition Chamber \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"

helpers = """    Lab.renderRadicalPicker();
};

// \u2500\u2500 Flask Visual Helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function getCategoryColor(char) {
    if (!Lab.state.allRadicals) return null;
    for (var i = 0; i < Lab.state.allRadicals.length; i++) {
        var r = Lab.state.allRadicals[i];
        if (r.char === char && r.doodle_category) {
            var meta = Lab.getCategoryMeta(r.doodle_category);
            return meta ? meta.color : null;
        }
    }
    return null;
}

function updateFlaskLiquid(r1, r2) {
    var wrap = document.getElementById('lab-flask-wrap');
    var liquid = wrap ? wrap.querySelector('.flask-liquid') : null;
    if (!liquid) return;

    if (r1 && r2) {
        // Both filled — use first radical's category color
        var color = null;
        if (r1) color = getCategoryColor(r1);
        if (!color && r2) color = getCategoryColor(r2);
        if (color) {
            liquid.style.setProperty('--liquid-color', color);
            liquid.setAttribute('fill', color);
            liquid.style.opacity = '0.35';
        }
    } else if (r1 || r2) {
        var char = r1 || r2;
        var color = getCategoryColor(char);
        if (color) {
            liquid.style.setProperty('--liquid-color', color);
            liquid.setAttribute('fill', color);
            liquid.style.opacity = '0.2';
        }
    } else {
        clearFlaskLiquid();
    }
}

function clearFlaskLiquid() {
    var liquid = document.querySelector('.flask-liquid');
    if (liquid) {
        liquid.style.setProperty('--liquid-color', 'transparent');
        liquid.setAttribute('fill', 'transparent');
        liquid.style.opacity = '0';
    }
}

function showFlaskResult(char, meaning, recipe) {
    var overlay = document.getElementById('flask-result-overlay');
    if (!overlay) return;
    document.getElementById('fr-char').textContent = char;
    document.getElementById('fr-meaning').textContent = meaning || '';
    document.getElementById('fr-recipe').textContent = recipe || '';
    overlay.classList.add('visible');
}

function hideFlaskResult() {
    var overlay = document.getElementById('flask-result-overlay');
    if (overlay) overlay.classList.remove('visible');
}

function shakeFlask() {
    var wrap = document.getElementById('lab-flask-wrap');
    if (!wrap) return;
    wrap.classList.remove('shaking');
    void wrap.offsetWidth;
    wrap.classList.add('shaking');
}

// \u2500\u2500 Decomposition Chamber \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"""

# Find the exact marker text in the file
idx_marker = content.find('Lab.renderRadicalPicker();')
idx_marker_end = content.find('// \u2500\u2500 Decomposition Chamber', idx_marker) if idx_marker >= 0 else -1

if idx_marker >= 0 and idx_marker_end >= 0:
    old_text = content[idx_marker:idx_marker_end]
    # Find the whole block from the end of exitSynthesis to Decomposition Chamber
    idx_exit_end = content.find('};\n\n// \u2500\u2500', idx_marker)
    if idx_exit_end >= 0:
        content = content[:idx_exit_end+2] + helpers + content[idx_marker_end:]
        print("12. Added flask helper functions")
    else:
        print("12. FAILED: exitSynthesis boundary not found")
else:
    print("12. FAILED: marker not found")
    # Try finding by simple string
    if 'Lab.renderRadicalPicker();' in content:
        print("   'Lab.renderRadicalPicker();' found")

# ═══ 13. Update onMixClick to show flask result ═══

old_mix_show = """        resultEl.innerHTML = resultHtml;
        resultEl.className = 'lab-beaker-result has-result';"""

new_mix_show = """        resultEl.innerHTML = resultHtml;
        resultEl.className = 'lab-beaker-result has-result';
        shakeFlask();
        showFlaskResult(reaction.result,
            (reaction.pinyin || '') + ' \u00b7 ' + (reaction.meaning || ''),
            reaction.radicals.join(' + '));"""

if old_mix_show in content:
    content = content.replace(old_mix_show, new_mix_show, 1)
    print("13. Updated onMixClick to show flask result")
else:
    print("13. FAILED: old_mix_show not found")

# Triple blend result
old_triple_show = """            resultEl.className = 'lab-beaker-result triple';"""

new_triple_show = """            resultEl.className = 'lab-beaker-result triple';
            shakeFlask();
            showFlaskResult(reaction.result,
                (reaction.pinyin || '') + ' \u00b7 ' + (reaction.meaning || ''),
                reaction.radicals.join(' + '));"""

if old_triple_show in content:
    content = content.replace(old_triple_show, new_triple_show, 1)
    print("13b. Updated triple blend to show flask result")
else:
    print("13b. FAILED: old_triple_show not found")

# Failure case
old_mix_fail = """        resultEl.className = 'lab-beaker-result';
        resultEl.innerHTML = '<span class=\"result-empty-text\" style=\"color:var(--botes-coral);\">\U0001f4a5 No reaction!</span>';"""

new_mix_fail = """        resultEl.className = 'lab-beaker-result';
        resultEl.innerHTML = '<span class=\"result-empty-text\" style=\"color:var(--botes-coral);\">\U0001f4a5 No reaction!</span>';
        shakeFlask();
        hideFlaskResult();"""

if old_mix_fail in content:
    content = content.replace(old_mix_fail, new_mix_fail, 1)
    print("13c. Updated mix failure to shake flask")
else:
    print("13c. FAILED: old_mix_fail not found")

# ═══ 14. Update responsive CSS ═══

old_resp_520 = """    .lab-beaker { width: 64px; height: 80px; }
    .lab-beaker .beaker-char { font-size: 1.5em; }
    .lab-beaker-result { width: 72px; height: 88px; }
    .lab-beaker-result .result-char { font-size: 2em; }"""

new_resp_520 = """    .lab-flask-wrap { width: 150px; height: 184px; }
    .flask-drop-zone.dz-left { left: 14px; top: 84px; width: 48px; height: 50px; }
    .flask-drop-zone.dz-right { right: 14px; top: 84px; width: 48px; height: 50px; }
    .flask-drop-zone .dz-char { font-size: 1.6em; }
    .lab-beaker-result { width: 72px; height: 88px; }
    .lab-beaker-result .result-char { font-size: 2em; }"""

if old_resp_520 in content:
    content = content.replace(old_resp_520, new_resp_520, 1)
    print("14a. Updated 520px responsive CSS")
else:
    print("14a. FAILED: responsive 520px not found")

old_resp_360 = """    .lab-beaker { width: 52px; height: 68px; }
    .lab-beaker .beaker-char { font-size: 1.2em; }
    .lab-beaker-result { width: 60px; height: 74px; }
    .lab-beaker-result .result-char { font-size: 1.5em; }
    .lab-mix-beakers.triple .lab-beaker { width: 38px; height: 50px; }
    .lab-mix-beakers.triple .lab-beaker .beaker-char { font-size: 0.85em; }
    .lab-mix-beakers.triple .lab-beaker-result { width: 46px; height: 56px; }
    .lab-mix-beakers.triple .lab-beaker-result .result-char { font-size: 1.1em; }
    .lab-mix-beakers { gap: 6px; }
    .lab-mix-plus, .lab-mix-equals { font-size: 1em; }"""

new_resp_360 = """    .lab-flask-wrap { width: 130px; height: 160px; }
    .flask-drop-zone.dz-left { left: 10px; top: 72px; width: 40px; height: 42px; }
    .flask-drop-zone.dz-right { right: 10px; top: 72px; width: 40px; height: 42px; }
    .flask-drop-zone .dz-char { font-size: 1.3em; }
    .lab-beaker-result { width: 60px; height: 74px; }
    .lab-beaker-result .result-char { font-size: 1.5em; }
    .lab-flask-wrap.triple .flask-drop-zone.dz-left { width: 36px; height: 26px; }
    .lab-flask-wrap.triple .flask-drop-zone.dz-right { width: 36px; height: 26px; }
    .lab-flask-wrap.triple .flask-drop-zone.dz-third { width: 36px; height: 26px; }"""

if old_resp_360 in content:
    content = content.replace(old_resp_360, new_resp_360, 1)
    print("14b. Updated 360px responsive CSS")
else:
    print("14b. FAILED: responsive 360px not found")

# Remove old triple beaker CSS in responsive
old_resp_triple = """    .lab-mix-beakers.triple .lab-beaker { width: 44px; height: 58px; }
    .lab-mix-beakers.triple .lab-beaker .beaker-char { font-size: 1em; }
    .lab-mix-beakers.triple .lab-beaker .beaker-label { font-size: 0.45em; }
    .lab-mix-beakers.triple .lab-beaker-result { width: 54px; height: 66px; }
    .lab-mix-beakers.triple .lab-beaker-result .result-char { font-size: 1.3em; }"""

if old_resp_triple in content:
    content = content.replace(old_resp_triple, '', 1)
    print("14c. Removed old responsive triple CSS")
else:
    print("14c. old_resp_triple not found (already cleaned)")

# Replace affinity chips in responsive
old_resp_aff = """    .beaker-aff-chip { font-size: 0.45em; padding: 1px 4px; }
    .beaker-aff-wrap { min-height: 20px; }
    .beaker-aff-empty { font-size: 0.45em; }
    .beaker-aff-title { font-size: 0.4em; }"""

new_resp_aff = """    .flask-aff-chip { font-size: 0.45em; padding: 1px 4px; }
    .flask-affinity-area { min-height: 18px; }"""

if old_resp_aff in content:
    content = content.replace(old_resp_aff, new_resp_aff, 1)
    print("14d. Updated responsive affinity CSS")
else:
    print("14d. FAILED: responsive affinity not found")

# ═══ Save ═══

with open(path, 'w') as f:
    f.write(content)

delta = len(original) - len(content)
print(f"\nDone! Delta: {delta} chars ({'larger' if delta < 0 else 'smaller'})")
print(f"Old: {len(original)}, New: {len(content)}")
