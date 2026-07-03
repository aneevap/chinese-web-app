/**
 * extract-chain-reactions.js
 *
 * Mines reactions.json for "build-up chains":
 *   Step 1: A + B → intermediate (where intermediate is ALSO a radical)
 *   Step 2: intermediate + C → final character
 *
 * These form the chain_reactions data for the triple blend system.
 *
 * Usage: node scripts/extract-chain-reactions.js
 * Output: chain_reactions.json (in project root)
 */

var fs = require('fs');
var path = require('path');

var reactions = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'reactions.json'), 'utf-8'));
var radicalsData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'radicals.json'), 'utf-8'));
var rxnList = reactions.reactions || [];

// ── Build radical set ──────────────────────────────────────────
var radicalSet = {};
radicalsData.radicals.forEach(function (r) {
    radicalSet[r.char] = r;
});

// ── Find reaction results that are ALSO radicals ──────────────
var intermediateSet = {};  // char → true
var intermediateChars = [];

rxnList.forEach(function (r) {
    if (radicalSet[r.result]) {
        if (!intermediateSet[r.result]) {
            intermediateSet[r.result] = true;
            intermediateChars.push(r.result);
        }
    }
});

console.log('Found ' + intermediateChars.length + ' intermediates that are also radicals:');
console.log('  ' + intermediateChars.join(', '));
console.log('');

// ── For each intermediate, find reactions where it acts as a radical ──
// We want: intermediate + C → finalChar
// This means: look through all reactions, find where radicals[0] or radicals[1] === intermediate

var chains = [];
var seenPairs = {};  // "intermediate+added" → true, to deduplicate

intermediateChars.forEach(function (intermediate) {
    // Find the recipe(s) for this intermediate (how it's made)
    var sourceReactions = rxnList.filter(function (r) {
        return r.result === intermediate;
    });

    // For each appearance of intermediate as a radical, find extension reactions
    rxnList.forEach(function (r) {
        var idx = r.radicals.indexOf(intermediate);
        if (idx === -1) return;

        // The intermediate appears as one radical — the other radical is the "added" one
        var addedRadical = r.radicals[1 - idx];
        var finalResult = r.result;

        // Skip if the final result is the same as the intermediate (same radical repeated)
        if (finalResult === intermediate) return;

        // Skip if the added radical is the same as the other component of the intermediate
        // This would be a degenerate chain (e.g., 木+木→林, then 林+木→??)
        // Actually, 木+木→林, then 林+木→森 is a VALID chain! So don't skip.

        // Deduplicate: same intermediate+added → same result
        var pairKey = intermediate + '+' + addedRadical;
        if (seenPairs[pairKey]) return;
        seenPairs[pairKey] = true;

        // Get pinyin and meaning from the reaction
        var chain = {
            intermediate: intermediate,
            intermediate_recipe: sourceReactions.length > 0 ? sourceReactions[0].radicals : [],
            added_radical: addedRadical,
            result: finalResult,
            pinyin: r.pinyin || '',
            meaning: r.meaning || '',
            // Track decomp_category from source
            decomp_category: r.decomp_category || null
        };

        chains.push(chain);
    });
});

// Sort: by intermediate char code, then by result char code
chains.sort(function (a, b) {
    if (a.intermediate < b.intermediate) return -1;
    if (a.intermediate > b.intermediate) return 1;
    if (a.result < b.result) return -1;
    if (a.result > b.result) return 1;
    return 0;
});

console.log('Extracted ' + chains.length + ' chain reactions:');
console.log('');

// Group by intermediate for nice output
var grouped = {};
chains.forEach(function (c) {
    if (!grouped[c.intermediate]) grouped[c.intermediate] = [];
    grouped[c.intermediate].push(c);
});

Object.keys(grouped).sort().forEach(function (intermediate) {
    console.log('[' + intermediate + '] ' + (radicalSet[intermediate] && radicalSet[intermediate].meaning ? radicalSet[intermediate].meaning : '') + ' — ' + grouped[intermediate].length + ' chains');
    var recipe = grouped[intermediate][0].intermediate_recipe;
    console.log('    Made from: ' + recipe.join(' + '));
    grouped[intermediate].forEach(function (c) {
        console.log('    + ' + c.added_radical + ' → ' + c.result + ' (' + (c.pinyin || '') + ') ' + (c.meaning || ''));
    });
    console.log('');
});

// ── Write output ──────────────────────────────────────────────
var output = {
    generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    source: 'reactions.json + radicals.json',
    total_intermediates: intermediateChars.length,
    total_chains: chains.length,
    chains: chains
};

var outPath = path.join(__dirname, '..', 'chain_reactions.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

console.log('Written to: ' + outPath);
console.log('File size: ' + (fs.statSync(outPath).size / 1024).toFixed(1) + ' KB');
