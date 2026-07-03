/**
 * lab-engine.js
 *
 * XP/Level system, radical storage, decomposition energy, and level-up rewards.
 * Extends XHZ with lab-specific methods.
 *
 * Dependencies: XHZ (profiles.js), radicals.json (loaded as RADICAL_DATA global)
 */

(function () {
  'use strict';

  var XHZ = window.XHZ;
  if (!XHZ) {
    console.error('lab-engine.js: XHZ not found — load profiles.js first');
    return;
  }

  // ── Radical data (loaded externally from radicals.json) ───────────

  var _radicalData = null;
  var _thresholds = null;

  /**
   * Load radical data from radicals.json.
   * Call once during app init, e.g.:
   *   fetch('radicals.json').then(r => r.json()).then(XHZ.loadRadicalData);
   */
  XHZ.loadRadicalData = function (data) {
    _radicalData = data;
    _thresholds = data.level_thresholds || [];
    console.log('lab-engine.js: loaded ' + (data.radicals ? data.radicals.length : 0) + ' radicals');
  };

  /**
   * Get the current loaded radical data.
   */
  XHZ.getRadicalData = function () {
    return _radicalData;
  };

  /**
   * Get level thresholds array.
   */
  XHZ.getLevelThresholds = function () {
    return _thresholds || [];
  };


  // ── Level computation ────────────────────────────────────────────

  /**
   * Compute the current level for a profile based on total stars.
   * @param {string} profileId
   * @returns {number} Level (1-80)
   */
  XHZ.getLevel = function (profileId) {
    if (!_thresholds || !_thresholds.length) return 1;
    var totalStars = this.getTotalStars(profileId);
    // Find the highest level whose threshold is met
    for (var i = _thresholds.length - 1; i >= 0; i--) {
      if (totalStars >= _thresholds[i].stars_required) return _thresholds[i].level;
    }
    return 1;
  };

  /**
   * Get level progress details.
   * @param {string} profileId
   * @returns {object} { currentLevel, currentStars, nextLevel, starsForNext, starsOwned, progressPercent }
   */
  XHZ.getLevelProgress = function (profileId) {
    var currentLevel = this.getLevel(profileId);
    var totalStars = this.getTotalStars(profileId);
    var nextThreshold = null;
    var currentThreshold = (_thresholds && _thresholds[currentLevel - 1]) || { stars_required: 0 };

    // Find next threshold
    for (var i = currentLevel; i < (_thresholds ? _thresholds.length : 0); i++) {
      if (totalStars < _thresholds[i].stars_required) {
        nextThreshold = _thresholds[i];
        break;
      }
    }

    if (!nextThreshold) {
      // Max level reached
      return {
        currentLevel: currentLevel,
        currentStars: totalStars,
        nextLevel: null,
        starsForNext: 0,
        starsOwned: totalStars - currentThreshold.stars_required,
        progressPercent: 100
      };
    }

    var needed = nextThreshold.stars_required - currentThreshold.stars_required;
    var earned = totalStars - currentThreshold.stars_required;
    var pct = needed > 0 ? Math.min(100, Math.floor((earned / needed) * 100)) : 0;

    return {
      currentLevel: currentLevel,
      currentStars: totalStars,
      nextLevel: nextThreshold.level,
      starsForNext: nextThreshold.stars_required,
      starsOwned: earned,
      starsNeeded: needed,
      progressPercent: pct
    };
  };

  /**
   * Convenience: get level info for the active profile.
   * @returns {object|null}
   */
  XHZ.getMyLevel = function () {
    var p = this.getActiveProfile();
    if (!p) return null;
    return this.getLevelProgress(p.id);
  };


  // ── Lab data storage ─────────────────────────────────────────────

  XHZ._labKey = function (profileId) {
    return 'xhz_lab_' + profileId;
  };

  XHZ._loadLabData = function (profileId) {
    try {
      var raw = localStorage.getItem(this._labKey(profileId));
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('lab-engine.js: failed to load lab data', e.message);
    }
    return {
      earned_radicals: [],
      discovered_chars: {},
      decomposed_chars: {},
      lab_energy: {
        date: '',
        used_today: 0,
        max_per_day: 2
      },
      claimed_levels: []
    };
  };

  XHZ._saveLabData = function (profileId, data) {
    try {
      localStorage.setItem(this._labKey(profileId), JSON.stringify(data));
      // Note: no Supabase sync for lab data yet — Phase 4
    } catch (e) {
      console.error('lab-engine.js: failed to save lab data', e.message);
    }
  };


  // ── Radical collection ───────────────────────────────────────────

  /**
   * Get earned radicals for a profile.
   * @param {string} profileId
   * @returns {string[]} Array of radical characters
   */
  XHZ.getEarnedRadicals = function (profileId) {
    var data = this._loadLabData(profileId);
    return data.earned_radicals || [];
  };

  /**
   * Check if a radical is in the user's collection.
   * @param {string} profileId
   * @param {string} char - The radical character (e.g. "口")
   * @returns {boolean}
   */
  XHZ.hasRadical = function (profileId, char) {
    return this.getEarnedRadicals(profileId).indexOf(char) !== -1;
  };

  /**
   * Add a radical to the user's collection (if not already owned).
   * @param {string} profileId
   * @param {string} char - Radical character
   * @returns {boolean} true if newly added
   */
  XHZ.addEarnedRadical = function (profileId, char) {
    var data = this._loadLabData(profileId);
    if (data.earned_radicals.indexOf(char) !== -1) return false; // already owned
    data.earned_radicals.push(char);
    this._saveLabData(profileId, data);
    return true;
  };

  /**
   * Get all radicals the user should have (leveled + earned through decomposition).
   * @param {string} profileId
   * @returns {string[]} All radicals user has access to
   */
  XHZ.getAllUserRadicals = function (profileId) {
    // Copy to avoid mutating stored data
    var earned = (this.getEarnedRadicals(profileId) || []).slice();

    // Add leveled radicals (up to current level)
    var level = this.getLevel(profileId);
    if (_radicalData && _radicalData.radicals) {
      for (var i = 0; i < _radicalData.radicals.length; i++) {
        var rad = _radicalData.radicals[i];
        if (rad.unlock_level !== null && rad.unlock_level <= level) {
          if (earned.indexOf(rad.char) === -1) {
            earned.push(rad.char);
          }
        }
      }
    }

    return earned;
  };


  // ── Discovered characters ──────────────────────────────────────

  /**
   * Record a discovered character from mixing.
   * @param {string} profileId
   * @param {string} char - The discovered character
   * @param {string[]} recipe - The two radicals used
   * @param {object} [extra] - Optional pinyin, meaning
   * @returns {object} The discovery entry
   */
  XHZ.addDiscoveredCharacter = function (profileId, char, recipe, extra) {
    var data = this._loadLabData(profileId);
    var entry = {
      recipe: recipe,
      discovered_at: this.today(),
      pinyin: (extra && extra.pinyin) || '',
      meaning: (extra && extra.meaning) || '',
      decomposed: false
    };

    if (!data.discovered_chars[char]) {
      data.discovered_chars[char] = entry;
      this._saveLabData(profileId, data);
    }

    return entry;
  };

  /**
   * Get all discovered characters.
   * @param {string} profileId
   * @returns {object} Keyed by character
   */
  XHZ.getDiscoveredCharacters = function (profileId) {
    var data = this._loadLabData(profileId);
    return data.discovered_chars || {};
  };

  /**
   * Check if a character has been discovered.
   * @param {string} profileId
   * @param {string} char
   * @returns {boolean}
   */
  XHZ.hasDiscoveredCharacter = function (profileId, char) {
    var data = this._loadLabData(profileId);
    return !!(data.discovered_chars && data.discovered_chars[char]);
  };


  // ── Decomposition tracking ─────────────────────────────────────

  /**
   * Mark a character as decomposed and record earned radicals.
   * @param {string} profileId
   * @param {string} char
   * @param {string[]} earnedRadicals - Radicals that were NEW (decomp-only ones)
   * @returns {boolean}
   */
  XHZ.markCharAsDecomposed = function (profileId, char, earnedRadicals) {
    var data = this._loadLabData(profileId);

    if (!data.decomposed_chars[char]) {
      data.decomposed_chars[char] = {
        decomposed_at: this.today(),
        earned: earnedRadicals || []
      };
    }

    // Also mark the discovered char entry if it exists
    if (data.discovered_chars[char]) {
      data.discovered_chars[char].decomposed = true;
    }

    // Add the new radicals to collection
    if (earnedRadicals && earnedRadicals.length) {
      for (var i = 0; i < earnedRadicals.length; i++) {
        if (data.earned_radicals.indexOf(earnedRadicals[i]) === -1) {
          data.earned_radicals.push(earnedRadicals[i]);
        }
      }
    }

    this._saveLabData(profileId, data);
    return true;
  };

  /**
   * Check if a character has been decomposed.
   * @param {string} profileId
   * @param {string} char
   * @returns {boolean}
   */
  XHZ.isCharDecomposed = function (profileId, char) {
    var data = this._loadLabData(profileId);
    return !!(data.decomposed_chars && data.decomposed_chars[char]);
  };

  /**
   * Get decomposition info for a character.
   * @param {string} profileId
   * @param {string} char
   * @returns {object|null}
   */
  XHZ.getDecompositionInfo = function (profileId, char) {
    var data = this._loadLabData(profileId);
    return (data.decomposed_chars && data.decomposed_chars[char]) || null;
  };


  // ── Lab energy system ──────────────────────────────────────────

  /**
   * Get available lab energy for today.
   * @param {string} profileId
   * @returns {number} Remaining decompositions for today (0-2)
   */
  XHZ.getLabEnergy = function (profileId) {
    var data = this._loadLabData(profileId);
    var today = this.today();

    // Reset if a new day
    if (data.lab_energy.date !== today) {
      data.lab_energy.date = today;
      data.lab_energy.used_today = 0;
      this._saveLabData(profileId, data);
    }

    return Math.max(0, data.lab_energy.max_per_day - data.lab_energy.used_today);
  };

  /**
   * Check if user can decompose a character today.
   * @param {string} profileId
   * @returns {boolean}
   */
  XHZ.canDecompose = function (profileId) {
    return this.getLabEnergy(profileId) > 0;
  };

  /**
   * Consume one unit of lab energy (use one decomposition).
   * @param {string} profileId
   * @returns {boolean} true if energy was available and consumed
   */
  XHZ.useDecomposition = function (profileId) {
    var data = this._loadLabData(profileId);
    var today = this.today();

    // Reset if new day
    if (data.lab_energy.date !== today) {
      data.lab_energy.date = today;
      data.lab_energy.used_today = 0;
    }

    if (data.lab_energy.used_today >= data.lab_energy.max_per_day) return false;

    data.lab_energy.used_today++;
    this._saveLabData(profileId, data);
    return true;
  };

  /**
   * Get the max daily decompositions.
   * @returns {number}
   */
  XHZ.getMaxLabEnergy = function () {
    return 2;
  };


  // ── Level-up rewards ───────────────────────────────────────────

  /**
   * Get which levels have unclaimed radical rewards.
   * @param {string} profileId
   * @returns {number[]} Array of unclaimed level numbers
   */
  XHZ.getUnclaimedLevelRewards = function (profileId) {
    var data = this._loadLabData(profileId);
    var currentLevel = this.getLevel(profileId);
    var claimed = data.claimed_levels || [];
    var unclaimed = [];

    for (var i = 1; i <= currentLevel; i++) {
      if (claimed.indexOf(i) === -1) {
        // Check if this level has a radical reward
        var radical = this.getRadicalForLevel(i);
        if (radical) {
          // Check if radical is already owned (from decomposition)
          if (!this.hasRadical(profileId, radical.char)) {
            unclaimed.push(i);
          }
        }
      }
    }

    return unclaimed;
  };

  /**
   * Get the radical assigned to a specific level.
   * @param {number} level
   * @returns {object|null} Radical object or null
   */
  XHZ.getRadicalForLevel = function (level) {
    if (!_radicalData || !_radicalData.radicals) return null;
    for (var i = 0; i < _radicalData.radicals.length; i++) {
      if (_radicalData.radicals[i].unlock_level === level) {
        return _radicalData.radicals[i];
      }
    }
    return null;
  };

  /**
   * Get level-up reward options (for branching).
   * Levels 1-5: auto-award (returns single option).
   * Levels 6-80: returns 3 themed options from different categories.
   * @param {string} profileId
   * @param {number} level
   * @returns {object[]} Array of radical options
   */
  XHZ.getLevelRewardOptions = function (profileId, level) {
    var primary = this.getRadicalForLevel(level);
    if (!primary) return [];

    // Levels 1-5: simple single award (no branching)
    if (level <= 5) return [primary];

    // Levels 6+: branching — find 2 more alternatives from different categories
    var options = [primary];
    var usedCategories = {};
    usedCategories[primary.doodle_category || primary.category] = true;

    // Look at nearby levels for alternatives from different categories
    var nearby = [];
    for (var offset = -3; offset <= 3; offset++) {
      var lv = level + offset;
      if (lv < 1 || lv > 80 || lv === level) continue;
      var rad = this.getRadicalForLevel(lv);
      if (rad && !usedCategories[rad.doodle_category || rad.category]) {
        nearby.push(rad);
        usedCategories[rad.doodle_category || rad.category] = true;
      }
    }

    // Add up to 2 more from different categories
    for (var i = 0; i < nearby.length && options.length < 3; i++) {
      options.push(nearby[i]);
    }

    return options;
  };

  /**
   * Claim a level-up reward and add the radical to the collection.
   * @param {string} profileId
   * @param {number} level - The level whose reward is being claimed
   * @param {string} selectedChar - The radical char selected (for branching)
   * @returns {object} { success, radical, level }
   */
  XHZ.claimLevelReward = function (profileId, level, selectedChar) {
    var data = this._loadLabData(profileId);
    var claimed = data.claimed_levels || [];

    // Prevent double-claiming
    if (claimed.indexOf(level) !== -1) {
      return { success: false, reason: 'already_claimed' };
    }

    // Verify the radical exists
    var radical = this.getRadicalForLevel(level);
    if (!radical || radical.char !== selectedChar) {
      // If the selected char differs from the primary level radical,
      // it must be a branching choice — verify the char is valid
      var options = this.getLevelRewardOptions(profileId, level);
      var isValid = false;
      for (var i = 0; i < options.length; i++) {
        if (options[i].char === selectedChar) {
          isValid = true;
          radical = options[i];
          break;
        }
      }
      if (!isValid) {
        return { success: false, reason: 'invalid_choice' };
      }
    }

    // Add radical
    var added = this.addEarnedRadical(profileId, selectedChar);

    // Mark level as claimed
    claimed.push(level);
    data.claimed_levels = claimed;
    this._saveLabData(profileId, data);

    return {
      success: true,
      reason: added ? 'new_radical' : 'already_owned',
      radical: radical,
      level: level
    };
  };

  /**
   * Convenience: auto-claim all unclaimed level rewards up to current level.
   * For levels 1-5: auto-award. For 6+: silently skips (user picks via UI).
   * @param {string} profileId
   * @returns {number} Number of auto-claimed rewards
   */
  XHZ.autoClaimLevelRewards = function (profileId) {
    var unclaimed = this.getUnclaimedLevelRewards(profileId);
    var autoClaimed = 0;

    for (var i = 0; i < unclaimed.length; i++) {
      var level = unclaimed[i];
      var radical = this.getRadicalForLevel(level);
      if (!radical) continue;

      // Only auto-claim levels 1-5
      if (level <= 5) {
        var result = this.claimLevelReward(profileId, level, radical.char);
        if (result.success) autoClaimed++;
      }
    }

    return autoClaimed;
  };


  // ── Mixing helper ──────────────────────────────────────────────

  /**
   * Try to mix two radicals and see if they form a character.
   * @param {string} radical1
   * @param {string} radical2
   * @returns {object|null} Reaction result or null if no match
   */
  XHZ.checkReaction = function (radical1, radical2) {
    // reactions.json is loaded separately, stored as _reactionData
    if (!this._reactionData) return null;

    // Only match 2-radical reactions (skip 3+ radical reactions)
    var reactions = this._reactionData.reactions || [];
    for (var i = 0; i < reactions.length; i++) {
      var r = reactions[i];
      if (r.radicals.length !== 2) continue;
      var hasBoth = (r.radicals[0] === radical1 && r.radicals[1] === radical2) ||
                    (r.radicals[0] === radical2 && r.radicals[1] === radical1);
      if (hasBoth) return r;
    }
    return null;
  };

  /**
   * Load reaction data (from reactions.json).
   * Call during init: fetch('reactions.json').then(r => r.json()).then(XHZ.loadReactionData)
   */
  XHZ.loadReactionData = function (data) {
    this._reactionData = data;
    console.log('lab-engine.js: loaded ' + (data.reactions ? data.reactions.length : 0) + ' reactions');
  };

  /**
   * Get affinity pairs for a radical (what other radicals it combines with).
   * @param {string} radicalChar
   * @returns {object[]} Array of { partner, result, meaning }
   */
  XHZ.getAffinities = function (radicalChar) {
    if (!this._reactionData) return [];
    var results = [];
    var reactions = this._reactionData.reactions || [];
    for (var i = 0; i < reactions.length; i++) {
      var r = reactions[i];
      var rads = r.radicals || [];
      var idx = rads.indexOf(radicalChar);
      if (idx !== -1) {
        // Return ALL other radicals as partners (handles 3+ radical reactions)
        var seenPartner = {};
        for (var p = 0; p < rads.length; p++) {
          if (p === idx) continue;
          var partner = rads[p];
          // Deduplicate (e.g., 口+口+口→品 should only show "口" once)
          if (seenPartner[partner]) continue;
          seenPartner[partner] = true;
          results.push({
            partner: partner,
            result: r.result,
            meaning: r.meaning,
            pinyin: r.pinyin
          });
        }
      }
    }
    return results;
  };


  // ── Chain reaction data (chain_reactions.json) ───────────────────

  /**
   * Load chain reaction data from chain_reactions.json.
   * Call during init:
   *   fetch('chain_reactions.json').then(r => r.json()).then(XHZ.loadChainReactionData)
   */
  XHZ.loadChainReactionData = function (data) {
    this._chainReactionData = data;
    console.log('lab-engine.js: loaded ' + (data.chains ? data.chains.length : 0) + ' chain reactions');
  };

  /**
   * Check if an intermediate character + added radical forms a chain reaction.
   * @param {string} intermediate - The intermediate character (result of a 2-radical mix)
   * @param {string} addedRadical - The 3rd radical to add
   * @returns {object|null} Chain reaction result or null if no match
   */
  XHZ.checkChainReaction = function (intermediate, addedRadical) {
    if (!this._chainReactionData) return null;
    var chains = this._chainReactionData.chains || [];
    for (var i = 0; i < chains.length; i++) {
      var c = chains[i];
      if (c.intermediate === intermediate && c.added_radical === addedRadical) {
        return c;
      }
    }
    return null;
  };

  /**
   * Get all chain extensions available for an intermediate character.
   * @param {string} intermediate - The intermediate character
   * @returns {object[]} Array of chain reaction objects
   */
  XHZ.getChainReactions = function (intermediate) {
    if (!this._chainReactionData) return [];
    var chains = this._chainReactionData.chains || [];
    var results = [];
    for (var i = 0; i < chains.length; i++) {
      if (chains[i].intermediate === intermediate) {
        results.push(chains[i]);
      }
    }
    return results;
  };

  /**
   * Get all chain reaction data.
   * @returns {object|null} Full chain reaction data object
   */
  XHZ.getAllChainReactions = function () {
    return this._chainReactionData || null;
  };


  // ── 3-component reaction data (three_component_reactions.json) ──

  /**
   * Load 3-component reaction data from three_component_reactions.json.
   * Call during init:
   *   fetch('three_component_reactions.json').then(r => r.json()).then(XHZ.loadThreeComponentData)
   */
  XHZ.loadThreeComponentData = function (data) {
    this._threeComponentData = data;
    console.log('lab-engine.js: loaded ' + (data.reactions ? data.reactions.length : 0) + ' three-component reactions');
  };

  /**
   * Check if three radicals form a known 3-component character.
   * Order does not matter — all permutations are checked.
   * @param {string} r1 - Radical 1
   * @param {string} r2 - Radical 2
   * @param {string} r3 - Radical 3
   * @returns {object|null} Reaction result (normalized with `result` field) or null if no match
   */
  XHZ.checkThreeComponentReaction = function (r1, r2, r3) {
    if (!this._threeComponentData) return null;
    var reactions = this._threeComponentData.reactions || [];

    // Build a sorted key from the 3 radicals for comparison
    var key = [r1, r2, r3].sort().join('|');

    for (var i = 0; i < reactions.length; i++) {
      var r = reactions[i];
      if (!r.radicals || r.radicals.length !== 3) continue;
      var rKey = r.radicals.slice().sort().join('|');
      if (rKey === key) {
        // Normalize: add `result` field for API consistency with checkReaction
        if (r.result === undefined && r.char) {
          r.result = r.char;
        }
        return r;
      }
    }
    return null;
  };

  /**
   * Get all 3-component reactions (normalized with `result` field for API consistency).
   * @returns {object[]} Array of 3-component reaction objects
   */
  XHZ.getAllThreeComponentReactions = function () {
    if (!this._threeComponentData) return [];
    var raw = this._threeComponentData.reactions || [];
    // Normalize: add `result` field for API consistency with checkReaction
    for (var i = 0; i < raw.length; i++) {
      if (raw[i].result === undefined && raw[i].char) {
        raw[i].result = raw[i].char;
      }
    }
    return raw;
  };

  /**
   * Get 3-component reactions that contain a specific radical.
   * @param {string} radicalChar - The radical to search for
   * @returns {object[]} Array of matching reactions
   */
  XHZ.getThreeComponentByRadical = function (radicalChar) {
    if (!this._threeComponentData) return [];
    var reactions = this._threeComponentData.reactions || [];
    var results = [];
    for (var i = 0; i < reactions.length; i++) {
      if (reactions[i].radicals && reactions[i].radicals.indexOf(radicalChar) !== -1) {
        // Normalize: add `result` field
        if (reactions[i].result === undefined && reactions[i].char) {
          reactions[i].result = reactions[i].char;
        }
        results.push(reactions[i]);
      }
    }
    return results;
  };

  // ── Lab statistics tracking ───────────────────────────────────

  /**
   * Get lab stats for a profile.
   * @param {string} profileId
   * @returns {object} Stats object
   */
  XHZ.getLabStats = function (profileId) {
    var data = this._loadLabData(profileId);
    if (!data.stats) {
      data.stats = {
        total_mix_attempts: 0,
        total_mix_successes: 0,
        total_mix_failures: 0,
        total_decompositions: 0,
        total_syntheses: 0,
        total_triple_blends: 0,
        total_discoveries: 0,
        radical_usage: {},
        favorite_radicals: []
      };
      this._saveLabData(profileId, data);
    }
    return data.stats;
  };

  /**
   * Increment a lab stat counter.
   * @param {string} profileId
   * @param {string} statName - One of the stat keys above
   * @param {number} [amount=1]
   */
  XHZ.incrementLabStat = function (profileId, statName, amount) {
    var data = this._loadLabData(profileId);
    if (!data.stats) {
      data.stats = {
        total_mix_attempts: 0,
        total_mix_successes: 0,
        total_mix_failures: 0,
        total_decompositions: 0,
        total_syntheses: 0,
        total_triple_blends: 0,
        total_discoveries: 0,
        radical_usage: {},
        favorite_radicals: []
      };
    }
    if (typeof data.stats[statName] === 'number') {
      data.stats[statName] += (amount || 1);
    }
    this._saveLabData(profileId, data);
  };

  /**
   * Record radical usage (for favorite radicals tracking).
   * @param {string} profileId
   * @param {string} radicalChar
   * @param {number} [count=1]
   */
  XHZ.recordRadicalUsage = function (profileId, radicalChar, count) {
    var data = this._loadLabData(profileId);
    if (!data.stats) {
      data.stats = {
        total_mix_attempts: 0, total_mix_successes: 0, total_mix_failures: 0,
        total_decompositions: 0, total_syntheses: 0, total_triple_blends: 0,
        total_discoveries: 0, radical_usage: {}, favorite_radicals: []
      };
    }
    if (!data.stats.radical_usage) data.stats.radical_usage = {};
    data.stats.radical_usage[radicalChar] = (data.stats.radical_usage[radicalChar] || 0) + (count || 1);
    this._saveLabData(profileId, data);
  };

  /**
   * Check if user has unclaimed branching rewards (Lv 6+).
   * @param {string} profileId
   * @returns {boolean}
   */
  XHZ.hasUnclaimedBranchingRewards = function (profileId) {
    var unclaimed = this.getUnclaimedLevelRewards(profileId);
    for (var i = 0; i < unclaimed.length; i++) {
      if (unclaimed[i] >= 6) return true;
    }
    return false;
  };

  /**
   * Check if user has any unclaimed level rewards (including 1-5).
   * @param {string} profileId
   * @returns {boolean}
   */
  XHZ.hasAnyUnclaimedRewards = function (profileId) {
    return this.getUnclaimedLevelRewards(profileId).length > 0;
  };

  console.log('lab-engine.js: loaded successfully');
})();
