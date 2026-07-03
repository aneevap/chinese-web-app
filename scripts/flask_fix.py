#!/usr/bin/env python3
"""Fix the damaged laboratory-playground.html - restore missing JS functions and fix helpers location."""

path = '/Users/gu2026/Desktop/chinese-web-app/laboratory-playground.html'

with open(path, 'r') as f:
    content = f.read()

original = content

# ═══ 1. Fix helpers that were inserted at wrong location (inside Lab.init)
# Remove them from Lab.init and re-insert after exitSynthesis

# Find the mis-inserted helpers
bad_start = content.find('// \u2500\u2500 Flask Visual Helpers')
if bad_start >= 0:
    # Find where this section ends (before Decomposition Chamber)
    bad_end = content.find('// \u2500\u2500 Decomposition Chamber', bad_start)
    if bad_end >= 0:
        # Extract the helpers
        helpers_block = content[bad_start:bad_end]
        # Remove from current location
        content = content[:bad_start] + content[bad_end:]
        # Find the right place to insert - after exitSynthesis
        # Look for the onExtendClick function or the end of exitSynthesis-replacement
        # Actually, exitSynthesis was never properly placed. Let me find a good marker.
        # The helpers should go before '// \u2500\u2500 Decomposition Chamber'
        # But after the onMixClick/showToast section
        decomp_marker = content.find('// \u2500\u2500 Decomposition Chamber')
        if decomp_marker >= 0:
            # Find the end of onMixClick/showToast/onExtendClick section
            # Insert helpers before decomposition chamber
            content = content[:decomp_marker] + helpers_block + '\n\n' + content[decomp_marker:]
            print(f'1. Moved helpers to correct position')
        else:
            print('1. FAILED: Decomposition Chamber marker not found')
    else:
        print('1. FAILED: Decomposition Chamber end not found')
else:
    print('1. FAILED: Flask Visual Helpers not found')

# ═══ 2. Check if startSynthesis exists; if not, add it and exitSynthesis, onExtendClick
if 'Lab.startSynthesis' not in content:
    # Find a good insertion point - after closeResultToast and before decomposition
    # Find the decomposition marker
    decomp_marker = content.find('// \u2500\u2500 Decomposition Chamber')
    if decomp_marker >= 0:
        synthesis_functions = """
// \u2500\u2500 Stepwise Synthesis (Chain Reactions) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

Lab.startSynthesis = function () {
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
};

Lab.exitSynthesis = function () {
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
};

function onExtendClick() {
    if (!Lab.state.synthesisMode) return;
    var last = Lab.state.lastResult;
    if (!last) return;

    var sel = Lab.state.selectedRadicals;
    var addedRadical = sel[0] || sel[1];
    if (!addedRadical) return;

    var chain = XHZ.checkChainReaction(last.char, addedRadical);
    var resultEl = document.getElementById('mix-beaker-result');

    if (chain) {
        resultEl.className = 'lab-beaker-result extended';
        var chainHtml = '';
        chainHtml += '<span class=\"result-char\">' + chain.result + '</span>';
        chainHtml += '<span class=\"result-meaning\">' + (chain.pinyin || '') + ' \u00b7 ' + (chain.meaning || '') + '</span>';
        chainHtml += '<div class=\"result-chain-recipe\">';
        chainHtml += '<span class=\"chain-step\">' + last.radicals.join('+') + '</span>';
        chainHtml += ' <span class=\"chain-arrow\">\u2192</span> ' + last.char;
        chainHtml += ' <span class=\"chain-arrow\">+</span> ' + addedRadical;
        chainHtml += ' <span class=\"chain-arrow\">\u2192</span> ';
        chainHtml += '<span class=\"chain-step\">' + chain.result + '</span>';
        chainHtml += '</div>';
        if (chain.intermediate_recipe && chain.intermediate_recipe.length > 0) {
            chainHtml += '<div class=\"result-chain-recipe\" style=\"margin-top:1px;\">';
            chainHtml += 'Full recipe: ' + chain.intermediate_recipe.join(' + ') + ' + ' + addedRadical + ' \u2192 ' + chain.result;
            chainHtml += '</div>';
        }
        resultEl.innerHTML = chainHtml;

        var pid = Lab.state.profileId;
        var alreadyDiscovered = XHZ.hasDiscoveredCharacter(pid, chain.result);

        var fullRecipe = last.radicals.concat([addedRadical]);
        Lab.showChainResultToast(chain, last.char, addedRadical, alreadyDiscovered);

        XHZ.addDiscoveredCharacter(pid, chain.result, fullRecipe, {
            pinyin: chain.pinyin,
            meaning: chain.meaning,
            chain: {
                intermediate: last.char,
                intermediate_recipe: last.radicals,
                added_radical: addedRadical
            }
        });

        var btn = document.getElementById('btn-mix');
        btn.disabled = true;
        btn.innerHTML = '\u2705 Extended!';
    } else {
        resultEl.className = 'lab-beaker-result';
        resultEl.innerHTML = '<span class=\"result-empty-text\" style=\"color:var(--ink-light);\">\U0001f512 ' + last.char + ' stabilizes \u2014 no further extension</span>';
        var btn = document.getElementById('btn-mix');
        btn.disabled = true;
        btn.innerHTML = '\u2713 Complete';

        Lab.showToast('\U0001f52c', 'Reaction Stabilized', last.char + ' (' + (last.pinyin || '') + ') is stable. No known extension with ' + addedRadical + '.', 'Close');
    }
}

Lab.showChainResultToast = function (chain, intermediate, addedRadical, alreadyDiscovered) {
    var toast = document.getElementById('lab-result-toast');
    document.getElementById('rt-char').textContent = chain.result;
    document.getElementById('rt-info').textContent = alreadyDiscovered ? '\U0001f504 Already discovered!' : '\U0001f389 Extended! Multi-element synthesis!';
    document.getElementById('rt-desc').textContent =
        intermediate + ' (' + (chain.intermediate_recipe || []).join('+') + ')' +
        ' + ' + addedRadical + ' \u2192 ' + chain.result +
        (chain.pinyin ? ' (' + chain.pinyin + ')' : '') +
        (chain.meaning ? ' \u00b7 ' + chain.meaning : '');
    var btn = document.getElementById('rt-close-btn');
    if (btn) btn.textContent = 'Awesome! \u2728';
    toast.classList.add('visible');
};
"""
        content = content[:decomp_marker] + synthesis_functions + content[decomp_marker:]
        print('2. Added missing synthesis functions')
    else:
        print('2. FAILED: Decomposition Chamber marker not found')
else:
    print('2. startSynthesis already exists')

# ═══ 3. Fix onMixClick to show flask result on success
# Check if shakeFlask is already in onMixClick
if 'shakeFlask()' not in content:
    # Find and update the success display point
    old_success = """        resultEl.innerHTML = resultHtml;
        resultEl.className = 'lab-beaker-result has-result';"""
    new_success = """        resultEl.innerHTML = resultHtml;
        resultEl.className = 'lab-beaker-result has-result';
        shakeFlask();
        showFlaskResult(reaction.result,
            (reaction.pinyin || '') + ' \u00b7 ' + (reaction.meaning || ''),
            reaction.radicals.join(' + '));"""
    if old_success in content:
        content = content.replace(old_success, new_success, 1)
        print('3a. Updated onMixClick success to show flask result')

    # Triple blend success
    old_triple_success = """            resultEl.className = 'lab-beaker-result triple';"""
    new_triple_success = """            resultEl.className = 'lab-beaker-result triple';
            shakeFlask();
            showFlaskResult(reaction.result,
                (reaction.pinyin || '') + ' \u00b7 ' + (reaction.meaning || ''),
                reaction.radicals.join(' + '));"""
    if old_triple_success in content:
        content = content.replace(old_triple_success, new_triple_success, 1)
        print('3b. Updated triple blend success to show flask result')

    # Failure case
    old_fail = """        resultEl.className = 'lab-beaker-result';
        resultEl.innerHTML = '<span class=\"result-empty-text\" style=\"color:var(--botes-coral);\">\U0001f4a5 No reaction!</span>';"""
    new_fail = """        resultEl.className = 'lab-beaker-result';
        resultEl.innerHTML = '<span class=\"result-empty-text\" style=\"color:var(--botes-coral);\">\U0001f4a5 No reaction!</span>';
        shakeFlask();
        hideFlaskResult();"""
    if old_fail in content:
        content = content.replace(old_fail, new_fail, 1)
        print('3c. Updated mix failure to shake flask')

    if not any(x in content for x in ['shakeFlask();\n        showFlaskResult', 'shakeFlask();\n            showFlaskResult']):
        # Try to find the patterns differently - they might use different quotes or formatting
        print('3. Fewer flask result updates than expected (some may already be applied)')

# ═══ 4. Check if Lab.updateBeakers was properly replaced
if 'flask-drop-zone' in content and 'updateBeakers' not in content:
    print('4. WARNING: updateBeakers function is missing!')
    # Find where it should be - after selectRadicalForMix
    # This is bad - the function was likely deleted. Need to rebuild.
    # Let me check if there's a function reference we can find
    if 'selectRadicalForMix' in content:
        print('   selectRadicalForMix exists, updateBeakers needs to be restored')

# ═══ 5. Save
with open(path, 'w') as f:
    f.write(content)

print(f'\nDone! Size: {len(content)} (was {len(original)})')
print(f'Delta: {len(content) - len(original)}')
