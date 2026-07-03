// ============================================================
//  profiles.js  — v4
//  Shared data layer for 🐼 学汉字
//  Handles: profiles, scores, badges, word mastery
//  Phase 1: localStorage only (no auth, no server)
// ============================================================

const XHZ = {

  // ----------------------------------------------------------
  //  CONSTANTS
  // ----------------------------------------------------------

  STORAGE_KEY:  'xhz_profiles',
  ACTIVE_KEY:   'xhz_active_id',
  WARNED_KEY:   'xhz_guest_warned',

  // Anti-farming: max write scores per word per day
  MAX_DAILY_WRITES_PER_WORD: 3,

  AVATARS: [
    '🐼','🐯','🐸','🦊','🐨','🐧','🦋','🦄',
    '🐻','🐮','🐹','🦁','🐺','🐙','🦉','🐬',
    '🐝','🦩','🐲','🦕'
  ],

  COLORS: [
    { name: 'Orange', hex: '#FFB347' },
    { name: 'Green',  hex: '#AED581' },
    { name: 'Pink',   hex: '#F48FB1' },
    { name: 'Purple', hex: '#CE93D8' },
    { name: 'Cyan',   hex: '#80DEEA' },
    { name: 'Teal',   hex: '#98D8C8' },
    { name: 'Yellow', hex: '#FFF59D' },
    { name: 'Blue',   hex: '#90CAF9' },
  ],

  BADGE_TIERS: [
    { id: 'panda_master',  label: 'Panda Master',  emoji: '🐼', minScore: 500 },
    { id: 'rising_star',   label: 'Rising Star',   emoji: '🌟', minScore: 300 },
    { id: 'practice_hero', label: 'Practice Hero', emoji: '🏅', minScore: 150 },
    { id: 'keep_going',    label: 'Keep Going!',   emoji: '🥉', minScore:  50 },
  ],

  STUDY_BADGE_TIERS: [
    { id: 'deep_thinker', label: 'Deep Thinker', emoji: '🔬', minScore: 50 },
    { id: 'good_learner', label: 'Good Learner', emoji: '📚', minScore: 20 },
  ],

  MASTERY_ORDER: ['unseen', 'seen', 'practiced', 'mastered'],


  // ----------------------------------------------------------
  //  UTILS
  // ----------------------------------------------------------

  generateId() {
    return 'xhz_' + Math.random().toString(36).slice(2, 9);
  },

  today() {
    return new Date().toISOString().slice(0, 10);
  },

  formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  },

  _isMasteryHigher(current, next) {
    return this.MASTERY_ORDER.indexOf(next) > this.MASTERY_ORDER.indexOf(current);
  },


  // ----------------------------------------------------------
  //  SUPABASE SYNC HOOK
  // ----------------------------------------------------------

  /**
   * Forward local data changes to Supabase (fire-and-forget).
   * Silently no-ops if Supabase is not available.
   */
  _triggerSync(action, payload) {
    var sync = window.__SUPABASE_SYNC;
    if (!sync) return; // sync module not loaded

    if (!sync.ready) {
      // Module still initializing — queue for later
      sync.enqueue(action, payload);
      return;
    }

    switch (action) {
      case 'all_profiles':
        sync.pushAllProfiles(payload);
        break;
      case 'profile_delete':
        sync.deleteProfile(payload);
        break;
      case 'scores':
        sync.pushAllScores(payload.profileId, payload.days);
        break;
      case 'mastery':
        sync.pushMastery(payload.profileId, payload.words);
        break;
      case 'items':
        sync.pushItems(payload.profileId, payload.itemData);
        break;
      case 'notebook':
        sync.pushNotebook(payload.profileId, payload.entries);
        break;
      default:
        break;
    }
  },


  // ----------------------------------------------------------
  //  STORAGE — profiles index
  // ----------------------------------------------------------

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || { profiles: [] };
    } catch {
      return { profiles: [] };
    }
  },

  _save(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('profiles.js: failed to save', e);
    }
    this._triggerSync('all_profiles', data.profiles);
  },


  // ----------------------------------------------------------
  //  PROFILES — CRUD
  // ----------------------------------------------------------

  getAllProfiles() {
    var data = this._load();
    // Auto-merge duplicate profiles silently
    // Guard against re-entry from findDuplicateGroups() calling back into getAllProfiles()
    if (!this._merging && data.profiles.length > 0) {
      this._merging = true;
      try {
        var totalMerged = 0;
        for (var pass = 0; pass < 5; pass++) {
          var groups = this.findDuplicateGroups();
          if (!groups.length) break;
          totalMerged += this._mergeGroups(groups);
        }
        if (totalMerged > 0) {
          console.log('profiles.js: auto-merged ' + totalMerged + ' duplicate name group(s)');
          data = this._load();
        }
      } catch (e) {
        console.warn('profiles.js: auto-merge error', e);
      } finally {
        this._merging = false;
      }
    }
    return data.profiles;
  },

  _merging: false,

  getProfile(id) {
    return this.getAllProfiles().find(p => p.id === id) || null;
  },

  createProfile({ nickname, avatar, color }) {
    const data = this._load();
    const profile = {
      id:             this.generateId(),
      nickname:       nickname.trim(),
      avatar,
      color,
      is_guest:       true,
      created_at:     this.today(),
      equipped_items: {},
      coins:          0,
      coins_earned_total: 0,
      coins_sources:  {},
    };
    data.profiles.push(profile);
    this._save(data);
    return profile;
  },

  updateProfile(id, changes) {
    const data = this._load();
    const i = data.profiles.findIndex(p => p.id === id);
    if (i === -1) return false;
    ['nickname', 'avatar', 'color', 'equipped_items', 'is_guest'].forEach(field => {
      if (changes[field] !== undefined) data.profiles[i][field] = changes[field];
    });
    this._save(data);
    return true;
  },

  deleteProfile(id) {
    const data = this._load();
    data.profiles = data.profiles.filter(p => p.id !== id);
    this._save(data);
    this._triggerSync('profile_delete', id);
    [this._scoresKey, this._masteryKey, this._itemsKey].forEach(fn => {
      localStorage.removeItem(fn.call(this, id));
    });
    if (this.getActiveId() === id) this.clearActive();
  },

  isDuplicate(nickname) {
    return this.getAllProfiles().some(
      p => p.nickname.toLowerCase() === nickname.trim().toLowerCase()
    );
  },

  /**
   * Find groups of profiles with the same nickname (case-insensitive).
   * Returns an array of groups, each with { name, profiles, keeper, extras }.
   * keeper = the profile with the most total stars.
   * Only returns groups with 2+ profiles.
   */    findDuplicateGroups() {
      var groups = {};
      this.getAllProfiles().forEach(function (p) {
        if (!p || !p.nickname) return; // Skip profiles without a nickname
        var key = p.nickname.toLowerCase().trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    return Object.keys(groups)
      .filter(function (key) { return groups[key].length > 1; })
      .map(function (key) {
        var profiles = groups[key];
        // Sort by total stars descending — keeper is the first (most progress)
        profiles.sort(function (a, b) {
          return XHZ.getTotalStars(b.id) - XHZ.getTotalStars(a.id);
        });
        return {
          name: profiles[0].nickname,
          profiles: profiles,
          keeper: profiles[0],
          extras: profiles.slice(1)
        };
      });
  },

  /**
   * Group-level merge logic (extracted so getAllProfiles can loop it).
   * @private
   */
  _mergeGroups(groups) {
    var self = this;
    groups.forEach(function (group) {
      var keeper = group.keeper;
      var extras = group.extras;

      // Merge scores from each extra into keeper
      var keeperScores = self._loadScores(keeper.id);
      extras.forEach(function (extra) {
        var extraScores = self._loadScores(extra.id);
        Object.keys(extraScores.days).forEach(function (date) {
          if (!keeperScores.days[date]) {
            keeperScores.days[date] = extraScores.days[date];
          } else {
            var k = keeperScores.days[date];
            var e = extraScores.days[date];
            k.write_score = Math.max(k.write_score || 0, e.write_score || 0);
            k.study_score = Math.max(k.study_score || 0, e.study_score || 0);
            if (e.chars_practiced) {
              e.chars_practiced.forEach(function (wid) {
                if (k.chars_practiced.indexOf(wid) === -1) k.chars_practiced.push(wid);
              });
            }
            if (e.cards_studied) {
              e.cards_studied.forEach(function (wid) {
                if (k.cards_studied.indexOf(wid) === -1) k.cards_studied.push(wid);
              });
            }
          }
        });
      });
      self._saveScores(keeper.id, keeperScores);

      // Merge mastery from each extra into keeper
      var keeperMastery = self._loadMastery(keeper.id);
      extras.forEach(function (extra) {
        var extraMastery = self._loadMastery(extra.id);
        Object.keys(extraMastery.words).forEach(function (wordId) {
          var k = keeperMastery.words[wordId];
          var e = extraMastery.words[wordId];
          if (!k) {
            keeperMastery.words[wordId] = e;
          } else if (self.MASTERY_ORDER.indexOf(e.status) > self.MASTERY_ORDER.indexOf(k.status)) {
            keeperMastery.words[wordId] = e;
          }
        });
      });
      self._saveMastery(keeper.id, keeperMastery);

      // Merge items from each extra
      var keeperItems = self._loadItems(keeper.id);
      extras.forEach(function (extra) {
        var extraItems = self._loadItems(extra.id);
        if (extraItems.earned) {
          extraItems.earned.forEach(function (itemId) {
            if (keeperItems.earned.indexOf(itemId) === -1) keeperItems.earned.push(itemId);
          });
        }
      });
      self._saveItems(keeper.id, keeperItems);

      // Delete extra profiles
      extras.forEach(function (extra) {
        self.deleteProfile(extra.id);
      });
    });
    return groups.length;
  },

  /**
   * Merge duplicate profiles: consolidate scores, mastery, and items
   * from extras into the keeper, then delete extras.
   * Returns a summary object describing what was merged.
   */
  mergeDuplicates() {
    var groups = this.findDuplicateGroups();
    if (!groups.length) return { merged: 0, summary: [] };

    var summary = [];
    this._mergeGroups(groups);

    groups.forEach(function (g) {
      summary.push({
        name: g.name,
        keeper: g.keeper.avatar + ' ' + g.keeper.nickname,
        extrasMerged: g.extras.length,
        extras: g.extras.map(function (e) { return e.avatar + ' ' + e.nickname; })
      });
    });

    return { merged: groups.length, summary: summary };
  },


  // ----------------------------------------------------------
  //  ACTIVE PROFILE
  // ----------------------------------------------------------

  getActiveId() {
    return localStorage.getItem(this.ACTIVE_KEY) || null;
  },

  getActiveProfile() {
    const id = this.getActiveId();
    return id ? this.getProfile(id) : null;
  },

  setActive(id) {
    localStorage.setItem(this.ACTIVE_KEY, id);
  },

  clearActive() {
    localStorage.removeItem(this.ACTIVE_KEY);
  },

  tryAutoLogin() {
    const profiles = this.getAllProfiles();
    if (profiles.length === 1) {
      this.setActive(profiles[0].id);
      return profiles[0];
    }
    return null;
  },

  requireActive() {
    if (!this.getActiveId()) window.location.href = 'index.html';
  },


  // ----------------------------------------------------------
  //  STORAGE KEYS
  // ----------------------------------------------------------

  _scoresKey(id)  { return 'xhz_scores_'  + id; },
  _masteryKey(id) { return 'xhz_mastery_' + id; },
  _itemsKey(id)   { return 'xhz_items_'   + id; },


  // ----------------------------------------------------------
  //  SCORES
  // ----------------------------------------------------------

  _loadScores(profileId) {
    try {
      return JSON.parse(localStorage.getItem(this._scoresKey(profileId))) || { days: {} };
    } catch { return { days: {} }; }
  },

  _saveScores(profileId, data) {
    try {
      localStorage.setItem(this._scoresKey(profileId), JSON.stringify(data));
    } catch (e) {
      console.error('profiles.js: failed to save scores', e);
    }
    this._triggerSync('scores', { profileId, days: data.days });
  },

  /**
   * Add points to today's score for the active profile
   * 
   * ANTI-FARMING RULES (for source === 'write'):
   *   1. A word only gives write stars up to 3 times per day
   *   2. A word gives no write stars after write_cleared === true
   * 
   * @param {string} source - 'write' | 'study'
   * @param {number} points - stars to add (before filtering)
   * @param {string[]} wordIds - word_id strings e.g. ['1A_001']
   * @returns {object|null} result with badge info, pointsAwarded, pointsBlocked
   */
  addScore(source, points, wordIds = []) {
    const profile = this.getActiveProfile();
    if (!profile) return null;

    const scoreData = this._loadScores(profile.id);
    const day = this.today();

    // Initialize today's entry if needed
    if (!scoreData.days[day]) {
      scoreData.days[day] = {
        write_score:      0,
        study_score:      0,
        chars_practiced:  [],
        cards_studied:    [],
        badge:            null,
        study_badge:      null,
        // Track per-word write attempts for anti-farming
        write_attempts:   {},  // { word_id: count }
      };
    }

    const entry = scoreData.days[day];
    
    // Ensure write_attempts exists (for older entries)
    if (!entry.write_attempts) entry.write_attempts = {};

    const prevBadge = entry.badge;
    const prevStudyBadge = entry.study_badge;

    let pointsAwarded = 0;
    let pointsBlocked = 0;
    let coinsAwarded = 0;

    if (source === 'write') {
      // Apply anti-farming rules per word
      wordIds.forEach(wordId => {
        const canAward = this._canAwardWriteStars(profile.id, wordId, entry);
        
        if (canAward) {
          pointsAwarded += points;
          entry.write_attempts[wordId] = (entry.write_attempts[wordId] || 0) + 1;
          if (!entry.chars_practiced.includes(wordId)) {
            entry.chars_practiced.push(wordId);
          }
        } else {
          pointsBlocked += points;
          if (!entry.chars_practiced.includes(wordId)) {
            entry.chars_practiced.push(wordId);
          }
        }
      });
      
      entry.write_score = Math.max(0, entry.write_score + pointsAwarded);
      
    } else if (source === 'study') {
      // Study scores have no anti-farming limits currently
      pointsAwarded = points;
      entry.study_score = Math.max(0, entry.study_score + points);
      wordIds.forEach(id => {
        if (!entry.cards_studied.includes(id)) entry.cards_studied.push(id);
      });
    }

    // Recalculate badges
    const totalScore = entry.write_score + entry.study_score;
    const newBadge = this.getBadgeTier(totalScore);
    const newStudyBadge = this.getStudyBadgeTier(entry.study_score);

    const badgeChanged = newBadge !== prevBadge && newBadge !== null;
    const studyBadgeChanged = newStudyBadge !== prevStudyBadge && newStudyBadge !== null;

    entry.badge = newBadge;
    entry.study_badge = newStudyBadge;

    // Award 1 coin for the newly unlocked badge tier only
    if (badgeChanged && newBadge) {
      var coinAwarded = XHZ.addCoins(profile.id, 1, 'badge_' + newBadge);
      if (coinAwarded > 0) coinsAwarded += coinAwarded;
    }
    if (studyBadgeChanged && newStudyBadge) {
      var coinAwarded = XHZ.addCoins(profile.id, 1, 'badge_' + newStudyBadge);
      if (coinAwarded > 0) coinsAwarded += coinAwarded;
    }

    this._saveScores(profile.id, scoreData);

    return {
      entry,
      totalScore,
      pointsAwarded,
      pointsBlocked,
      coinsAwarded,
      newBadgeUnlocked: badgeChanged,
      newStudyUnlocked: studyBadgeChanged,
      badgeInfo: this.getBadgeInfo(entry.badge),
      studyBadgeInfo: this.getBadgeInfo(entry.study_badge, 'study'),
    };
  },

  /**
   * Check if write stars can be awarded for a word
   * 
   * Rule 1: Max 3 times per day per word
   * Rule 2: No stars if word is mastered (3 stars × 2 times)
   * 
   * @private
   */
  _canAwardWriteStars(profileId, wordId, todayEntry) {
    // Rule 2: Check if word is already mastered (needs 2 perfect scores now)
    const mastery = this.getWordMasteryForProfile(profileId, wordId);
    if (mastery && mastery.status === 'mastered') {
      return false;
    }

    // Rule 1: Check daily attempt count
    const attempts = todayEntry.write_attempts?.[wordId] || 0;
    return attempts < this.MAX_DAILY_WRITES_PER_WORD;
  },

  /**
   * Check if write stars can be awarded (public API for UI hints)
   * Returns { canAward, reason, attemptsToday, maxAttempts }
   */
  canAwardWriteStars(wordId) {
    const profile = this.getActiveProfile();
    if (!profile) return { canAward: false, reason: 'no_profile' };

    // Check if mastered (now requires 2 perfect scores)
    const mastery = this.getWordMastery(wordId);
    if (mastery && mastery.status === 'mastered') {
      return { 
        canAward: false, 
        reason: 'already_cleared',
        attemptsToday: 0,
        maxAttempts: this.MAX_DAILY_WRITES_PER_WORD
      };
    }

    // Check daily attempts
    const scoreData = this._loadScores(profile.id);
    const todayEntry = scoreData.days[this.today()];
    const attempts = todayEntry?.write_attempts?.[wordId] || 0;

    if (attempts >= this.MAX_DAILY_WRITES_PER_WORD) {
      return {
        canAward: false,
        reason: 'daily_limit',
        attemptsToday: attempts,
        maxAttempts: this.MAX_DAILY_WRITES_PER_WORD
      };
    }

    return {
      canAward: true,
      reason: null,
      attemptsToday: attempts,
      maxAttempts: this.MAX_DAILY_WRITES_PER_WORD
    };
  },

  getTodayScore() {
    const profile = this.getActiveProfile();
    if (!profile) return null;
    const scoreData = this._loadScores(profile.id);
    return scoreData.days[this.today()] || {
      write_score: 0, 
      study_score: 0,
      chars_practiced: [], 
      cards_studied: [],
      badge: null, 
      study_badge: null,
      write_attempts: {},
    };
  },

  getAllScores(profileId) {
    return this._loadScores(profileId).days;
  },


  // ----------------------------------------------------------
  //  BADGES
  // ----------------------------------------------------------

  getBadgeTier(totalScore) {
    return this.BADGE_TIERS.find(t => totalScore >= t.minScore)?.id || null;
  },

  getStudyBadgeTier(studyScore) {
    return this.STUDY_BADGE_TIERS.find(t => studyScore >= t.minScore)?.id || null;
  },

  getBadgeInfo(badgeId, source = 'combined') {
    if (!badgeId) return null;
    const list = source === 'study' ? this.STUDY_BADGE_TIERS : this.BADGE_TIERS;
    return list.find(t => t.id === badgeId) || null;
  },


  // ----------------------------------------------------------
  //  WORD MASTERY
  // ----------------------------------------------------------

  _loadMastery(profileId) {
    try {
      return JSON.parse(localStorage.getItem(this._masteryKey(profileId))) || { words: {} };
    } catch { return { words: {} }; }
  },

  _saveMastery(profileId, data) {
    try {
      localStorage.setItem(this._masteryKey(profileId), JSON.stringify(data));
    } catch (e) {
      console.error('profiles.js: failed to save mastery', e);
    }
    this._triggerSync('mastery', { profileId, words: data.words });
  },

  getWordMastery(wordId) {
    const profile = this.getActiveProfile();
    if (!profile) return null;
    return this._loadMastery(profile.id).words[wordId] || null;
  },

  getWordMasteryForProfile(profileId, wordId) {
    return this._loadMastery(profileId).words[wordId] || null;
  },

  getAllMastery(profileId) {
    return this._loadMastery(profileId).words;
  },

  /**
   * Get the effective perfect write count for a word.
   * Handles backward compatibility: if write_cleared is true but write_cleared_count
   * is undefined/missing, treat it as count 1.
   */
  _getWriteClearedCount(entry) {
    if (entry.write_cleared_count !== undefined && entry.write_cleared_count > 0) {
      return entry.write_cleared_count;
    }
    // Backward compat: old data has write_cleared: true but no counter
    if (entry.write_cleared === true) return 1;
    return 0;
  },

  _updateWordMastery(wordId, changes) {
    const profile = this.getActiveProfile();
    if (!profile) return { statusChanged: false, becameMastered: false };

    const data = this._loadMastery(profile.id);

    if (!data.words[wordId]) {
      data.words[wordId] = {
        word_id: wordId,
        status: 'unseen',
        write_cleared: false,
        write_cleared_count: 0,
        quiz_cleared: false,
        mastered_date: null,
      };
    }

    const entry = data.words[wordId];
    const prevStatus = entry.status;

    // Apply changes — only upgrade status
    if (changes.status && this._isMasteryHigher(entry.status, changes.status)) {
      entry.status = changes.status;
    }
    if (changes.write_cleared === true) {
      entry.write_cleared = true;
      entry.write_cleared_count = (entry.write_cleared_count || 0) + 1;
    }
    if (changes.quiz_cleared === true) entry.quiz_cleared = true;

    // Check mastery conditions — need 2 perfect scores (3 stars) + quiz cleared
    const perfectCount = this._getWriteClearedCount(entry);
    const nowMastered = perfectCount >= 2 && entry.quiz_cleared;
    const wasMastered = prevStatus === 'mastered';

    if (nowMastered && !wasMastered) {
      entry.status = 'mastered';
      entry.mastered_date = this.today();
    }

    this._saveMastery(profile.id, data);

    return {
      statusChanged: entry.status !== prevStatus,
      becameMastered: nowMastered && !wasMastered
    };
  },

  markSeen(wordId) {
    const current = this.getWordMastery(wordId);
    if (current && this.MASTERY_ORDER.indexOf(current.status) >= this.MASTERY_ORDER.indexOf('seen')) {
      return { statusChanged: false };
    }
    return this._updateWordMastery(wordId, { status: 'seen' });
  },

  markPracticed(wordId) {
    const current = this.getWordMastery(wordId);
    if (current && this.MASTERY_ORDER.indexOf(current.status) >= this.MASTERY_ORDER.indexOf('practiced')) {
      return { statusChanged: false };
    }
    return this._updateWordMastery(wordId, { status: 'practiced' });
  },

  markWriteCleared(wordId) {
    return this._updateWordMastery(wordId, { write_cleared: true });
  },

  markQuizCleared(wordId) {
    return this._updateWordMastery(wordId, { quiz_cleared: true });
  },

  /**
   * Migrate old word mastery data to the new 2-perfect-scores system.
   *
   * In the old system, a single perfect score (write_cleared=true) was enough
   * (combined with quiz_cleared). After changing to require 2 perfect scores,
   * existing words with write_cleared=true but no write_cleared_count may
   * never reach "mastered" status.
   *
   * This migration bumps those words to write_cleared_count=2 (treating their
   * existing progress as meeting the new threshold) so they become mastered.
   *
   * Run from the browser console:  XHZ.migrateOldMasteryData()
   *
   * @param {string} [profileId] - Optional profile ID (defaults to active profile)
   * @returns {{ migrated: number, alreadyMastered: number, summary: object[] }}
   */
  migrateOldMasteryData(profileId) {
    const profile = profileId ? { id: profileId } : this.getActiveProfile();
    if (!profile) return { migrated: 0, alreadyMastered: 0, summary: [] };

    const data = this._loadMastery(profile.id);
    let migrated = 0;
    let alreadyMastered = 0;
    const summary = [];

    Object.keys(data.words).forEach(wordId => {
      const entry = data.words[wordId];

      // Already mastered — skip
      if (entry.status === 'mastered') {
        alreadyMastered++;
        return;
      }

      // Has write_cleared from old system (or already has write_cleared_count)
      // but hasn't reached mastered yet
      const hasOldWriteCleared = entry.write_cleared === true;
      const currentCount = this._getWriteClearedCount(entry);

      if (hasOldWriteCleared && currentCount < 2) {
        // Capture previous status BEFORE changing anything
        const prevStatus = entry.status;

        // Bump to count 2 and set quiz_cleared for the new criteria
        entry.write_cleared_count = 2;
        entry.quiz_cleared = true;

        // Re-check mastery — it should pass now
        const perfectCount = this._getWriteClearedCount(entry);
        if (perfectCount >= 2 && entry.quiz_cleared) {
          entry.status = 'mastered';
          entry.mastered_date = this.today();
        }

        migrated++;
        summary.push({
          word_id: wordId,
          previous_status: prevStatus
        });
      }
    });

    if (migrated > 0) {
      this._saveMastery(profile.id, data);
      console.log(`profiles.js: migrated ${migrated} word(s) to new mastery system`);
    }

    return { migrated, alreadyMastered, summary };
  },


  // ----------------------------------------------------------
  //  UNLOCK PROGRESS — UPDATED FOR COURSE-BASED LOOKUP
  // ----------------------------------------------------------

  /**
   * Get seen percentage for a course
   * Can be called two ways:
   *   1. getCourseSeenPercent(courseId) - uses active profile, requires COURSE_DATA global
   *   2. getCourseSeenPercent(profileId, wordIdsArray) - explicit word IDs
   */
  getCourseSeenPercent(courseIdOrProfileId, wordIds) {
    // If wordIds is provided, use the old behavior (explicit word list)
    if (Array.isArray(wordIds) && wordIds.length > 0) {
      const profileId = courseIdOrProfileId;
      const masteryData = this._loadMastery(profileId).words;
      const seenCount = wordIds.filter(id => {
        const m = masteryData[id];
        return m && this.MASTERY_ORDER.indexOf(m.status) >= this.MASTERY_ORDER.indexOf('seen');
      }).length;
      return (seenCount / wordIds.length) * 100;
    }

    // Otherwise, treat first arg as courseId and look up from global COURSE_DATA
    const courseId = courseIdOrProfileId;
    const profile = this.getActiveProfile();
    if (!profile) return 0;

    // Check if COURSE_DATA exists globally
    if (typeof COURSE_DATA === 'undefined' || !COURSE_DATA[courseId]) {
      return 0;
    }

    const words = COURSE_DATA[courseId].words;
    if (!words || words.length === 0) return 0;

    const masteryData = this._loadMastery(profile.id).words;
    let seenCount = 0;

    for (let i = 0; i < words.length; i++) {
      const m = masteryData[words[i].word_id];
      if (m && this.MASTERY_ORDER.indexOf(m.status) >= this.MASTERY_ORDER.indexOf('seen')) {
        seenCount++;
      }
    }

    return (seenCount / words.length) * 100;
  },

  /**
   * Get mastered percentage for a course/year
   * Can be called two ways:
   *   1. getYearMasteredPercent(courseId) - uses active profile, requires COURSE_DATA global
   *   2. getYearMasteredPercent(profileId, wordIdsArray) - explicit word IDs
   */
  getYearMasteredPercent(courseIdOrProfileId, wordIds) {
    // If wordIds is provided, use the old behavior (explicit word list)
    if (Array.isArray(wordIds) && wordIds.length > 0) {
      const profileId = courseIdOrProfileId;
      const masteryData = this._loadMastery(profileId).words;
      const masteredCount = wordIds.filter(id => masteryData[id]?.status === 'mastered').length;
      return (masteredCount / wordIds.length) * 100;
    }

    // Otherwise, treat first arg as courseId and look up from global COURSE_DATA
    const courseId = courseIdOrProfileId;
    const profile = this.getActiveProfile();
    if (!profile) return 0;

    // Check if COURSE_DATA exists globally
    if (typeof COURSE_DATA === 'undefined' || !COURSE_DATA[courseId]) {
      return 0;
    }

    const words = COURSE_DATA[courseId].words;
    if (!words || words.length === 0) return 0;

    const masteryData = this._loadMastery(profile.id).words;
    let masteredCount = 0;

    for (let i = 0; i < words.length; i++) {
      if (masteryData[words[i].word_id]?.status === 'mastered') {
        masteredCount++;
      }
    }

    return (masteredCount / words.length) * 100;
  },

  /**
   * Get counts for a course - returns { seen, mastered, total }
   * Requires COURSE_DATA global to be loaded
   */
  getCourseProgress(courseId) {
    const profile = this.getActiveProfile();
    if (!profile) return { seen: 0, mastered: 0, total: 0 };

    if (typeof COURSE_DATA === 'undefined' || !COURSE_DATA[courseId]) {
      return { seen: 0, mastered: 0, total: 0 };
    }

    const words = COURSE_DATA[courseId].words;
    if (!words || words.length === 0) return { seen: 0, mastered: 0, total: 0 };

    const masteryData = this._loadMastery(profile.id).words;
    let seenCount = 0;
    let masteredCount = 0;

    for (let i = 0; i < words.length; i++) {
      const m = masteryData[words[i].word_id];
      if (m) {
        if (this.MASTERY_ORDER.indexOf(m.status) >= this.MASTERY_ORDER.indexOf('seen')) {
          seenCount++;
        }
        if (m.status === 'mastered') {
          masteredCount++;
        }
      }
    }

    return {
      seen: seenCount,
      mastered: masteredCount,
      total: words.length
    };
  },

  getMasteredCount(profileId, wordIds) {
    const masteryData = this._loadMastery(profileId).words;
    return wordIds.filter(id => masteryData[id]?.status === 'mastered').length;
  },

  getSeenCount(profileId, wordIds) {
    const masteryData = this._loadMastery(profileId).words;
    return wordIds.filter(id => {
      const m = masteryData[id];
      return m && this.MASTERY_ORDER.indexOf(m.status) >= this.MASTERY_ORDER.indexOf('seen');
    }).length;
  },


  // ----------------------------------------------------------
  //  STREAKS
  // ----------------------------------------------------------

  getCurrentStreak(profileId) {
    const days = this._loadScores(profileId).days;
    let streak = 0;
    let cursor = new Date();

    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      const entry = days[key];
      if (entry) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  getLongestStreak(profileId) {
    const days = this._loadScores(profileId).days;
    const sorted = Object.keys(days).sort();
    let longest = 0, current = 0, prevDate = null;

    sorted.forEach(dateStr => {
      if (!days[dateStr]) return;

      if (prevDate) {
        const diff = (new Date(dateStr + 'T00:00:00') - new Date(prevDate + 'T00:00:00')) / 86400000;
        current = diff === 1 ? current + 1 : 1;
      } else {
        current = 1;
      }

      longest = Math.max(longest, current);
      prevDate = dateStr;
    });

    return longest;
  },

  getTotalStars(profileId) {
    const days = this._loadScores(profileId).days;
    return Object.values(days).reduce((sum, d) => 
      sum + (d.write_score || 0) + (d.study_score || 0), 0);
  },

  getBestDay(profileId) {
    const days = this._loadScores(profileId).days;
    let best = null;
    Object.entries(days).forEach(([date, entry]) => {
      const total = (entry.write_score || 0) + (entry.study_score || 0);
      if (!best || total > best.score) best = { date, score: total };
    });
    return best;
  },


  // ----------------------------------------------------------
  //  EFFORT ITEMS
  // ----------------------------------------------------------

  _loadItems(profileId) {
    try {
      return JSON.parse(localStorage.getItem(this._itemsKey(profileId))) || { earned: [], equipped: {} };
    } catch { return { earned: [], equipped: {} }; }
  },

  _saveItems(profileId, data) {
    try {
      localStorage.setItem(this._itemsKey(profileId), JSON.stringify(data));
    } catch (e) {
      console.error('profiles.js: failed to save items', e);
    }
    this._triggerSync('items', { profileId, itemData: data });
  },

// ── COIN ECONOMY ───────────────────────────────────────

  /**
   * Ensure profile has coin fields initialized (backward compat).
   * @private
   */
  _ensureCoinFields(profile) {
    if (profile.coins === undefined) profile.coins = 0;
    if (profile.coins_earned_total === undefined) profile.coins_earned_total = 0;
    if (!profile.coins_sources) profile.coins_sources = {};
  },

  /**
   * Award coins to a profile with daily cap enforcement.
   * Each source (e.g. 'game_sushi', 'badge_keep_going') can be awarded
   * at most once per day. Returns amount actually awarded (0 if capped).
   *
   * @param {string} profileId
   * @param {number} amount
   * @param {string} source - e.g. 'game_sushi', 'badge_keep_going', 'migration_bonus'
   * @returns {number} coins actually awarded (0 if capped for this source today)
   */
  addCoins(profileId, amount, source) {
    const data = this._load();
    const profile = data.profiles.find(function(p) { return p.id === profileId; });
    if (!profile) return 0;

    this._ensureCoinFields(profile);

    const today = this.today();

    // Daily cap: same source can only be awarded once per day
    if (profile.coins_sources[source] === today) return 0;

    profile.coins += amount;
    profile.coins_earned_total += amount;
    profile.coins_sources[source] = today;

    this._save(data);
    return amount;
  },

  /**
   * Spend coins from a profile. Returns true if successful, false if insufficient balance.
   * @param {string} profileId
   * @param {number} amount
   * @returns {boolean}
   */
  spendCoins(profileId, amount) {
    const data = this._load();
    const profile = data.profiles.find(function(p) { return p.id === profileId; });
    if (!profile) return false;

    this._ensureCoinFields(profile);

    if (profile.coins < amount) return false;

    profile.coins -= amount;
    this._save(data);
    return true;
  },

  /**
   * Get current coin balance for a profile.
   * @param {string} profileId
   * @returns {number}
   */
  getCoins(profileId) {
    const profile = this.getProfile(profileId);
    if (!profile) return 0;
    return profile.coins || 0;
  },

  /**
   * Get coin sources for a profile (for UI display of today's caps).
   * @param {string} profileId
   * @returns {object}
   */
  getCoinSources(profileId) {
    const profile = this.getProfile(profileId);
    if (!profile) return {};
    return profile.coins_sources || {};
  },

  /**
   * Get lifetime coins earned for a profile.
   * @param {string} profileId
   * @returns {number}
   */
  getCoinsEarnedTotal(profileId) {
    const profile = this.getProfile(profileId);
    if (!profile) return 0;
    return profile.coins_earned_total || 0;
  },

  /**
   * One-time migration: award 5 coins per previously earned item.
   * Runs once per profile (checks xhz_coin_migrated_{profileId} flag).
   * @param {string} profileId
   * @returns {{ bonusAwarded: number, itemCount: number }}
   */
  migrateCoinsForExistingItems(profileId) {
    var flagKey = 'xhz_coin_migrated_' + profileId;
    if (localStorage.getItem(flagKey)) {
      return { bonusAwarded: 0, itemCount: 0 };
    }

    var itemData = this._loadItems(profileId);
    var earnedItems = itemData && itemData.earned ? itemData.earned : [];
    if (!earnedItems.length) {
      localStorage.setItem(flagKey, '1');
      return { bonusAwarded: 0, itemCount: 0 };
    }

    var itemCount = earnedItems.length;
    var bonus = itemCount * 5;
    this.addCoins(profileId, bonus, 'migration_bonus');

    localStorage.setItem(flagKey, '1');
    console.log('profiles.js: migrated ' + itemCount + ' items → ' + bonus + ' coins for ' + profileId);
    return { bonusAwarded: bonus, itemCount: itemCount };
  },

  /**
   * Award 1 coin for completing a game session.
   * Daily-capped per game (game_matching, game_sushi) via addCoins source.
   * @param {string} gameId - 'matching' | 'sushi'
   * @returns {number} coins awarded (0 if already earned today)
   */
  awardGameCoin(gameId) {
    var profile = this.getActiveProfile();
    if (!profile) return 0;
    var result = this.addCoins(profile.id, 1, 'game_' + gameId);
    this.ensureTodayEntry(profile.id);
    return result;
  },

  /**
   * Award 1 coin for daily login. Everyone gets 1 coin just for visiting.
   * Daily-capped via addCoins source ('daily_login') — max 1 per day.
   * @returns {number} coins awarded (0 if already claimed today)
   */
  /**
   * Ensure today's score entry exists so the streak counter works.
   * Public helper used by arena, games, and login flow.
   */
  ensureTodayEntry(profileId) {
    var scoreData = this._loadScores(profileId);
    var day = this.today();
    if (!scoreData.days[day]) {
      scoreData.days[day] = {
        write_score: 0,
        study_score: 0,
        chars_practiced: [],
        cards_studied: [],
        badge: null,
        study_badge: null,
        write_attempts: {}
      };
      this._saveScores(profileId, scoreData);
    }
  },

  awardDailyLoginCoin() {
    var profile = this.getActiveProfile();
    if (!profile) return 0;
    var result = this.addCoins(profile.id, 1, 'daily_login');
    if (result > 0) {
      this.ensureTodayEntry(profile.id);
    }
    return result;
  },

  /**
   * Award 7 coins for reaching a 7-day streak milestone.
   * Awards once per 7-day cycle (source encodes the week number).
   * E.g. streak 7-13 → source 'streak_week_1', streak 14-20 → source 'streak_week_2'
   * @returns {number} coins awarded (0 if already claimed or streak < 7)
   */
  awardWeeklyStreakBonus() {
    var profile = this.getActiveProfile();
    if (!profile) return 0;
    var streak = this.getCurrentStreak(profile.id);
    if (streak < 7) return 0;
    var weekNumber = Math.floor(streak / 7);
    var source = 'streak_week_' + weekNumber;
    var data = this._load();
    var p = data.profiles.find(function(pr) { return pr.id === profile.id; });
    if (!p) return 0;
    this._ensureCoinFields(p);
    // Once-per-cycle: if source already exists, this cycle's bonus was claimed
    if (p.coins_sources[source]) return 0;
    p.coins += 7;
    p.coins_earned_total += 7;
    p.coins_sources[source] = this.today();
    this._save(data);
    return 7;
  },

  /**
   * Check if the weekly streak bonus has been claimed for the current streak cycle.
   * @returns {boolean}
   */
  hasClaimedWeeklyStreakBonus() {
    var profile = this.getActiveProfile();
    if (!profile) return false;
    var streak = this.getCurrentStreak(profile.id);
    if (streak < 7) return false;
    var weekNumber = Math.floor(streak / 7);
    var source = 'streak_week_' + weekNumber;
    return !!(profile.coins_sources && profile.coins_sources[source]);
  },

  equipItem(profileId, itemId, category) {
    const itemData = this._loadItems(profileId);
    if (!itemData.earned.includes(itemId)) return false;
    itemData.equipped[category] = itemId;
    this._saveItems(profileId, itemData);
    return true;
  },

  unequipItem(profileId, category) {
    const itemData = this._loadItems(profileId);
    itemData.equipped[category] = null;
    this._saveItems(profileId, itemData);
  },

  /**
   * Purchase an item from the shop using coins.
   * Returns { success, reason ('ok' | 'insufficient_coins' | 'already_owned' | 'item_not_found'), item, spent }
   */
  purchaseItem(profileId, itemId, allItems) {
    const profile = this.getProfile(profileId);
    if (!profile) return { success: false, reason: 'profile_not_found' };

    const item = allItems.find(function(it) { return it.id === itemId; });
    if (!item) return { success: false, reason: 'item_not_found' };

    const itemData = this._loadItems(profileId);
    if (itemData.earned.indexOf(itemId) !== -1) {
      return { success: false, reason: 'already_owned' };
    }

    if ((profile.coins || 0) < item.coin_cost) {
      return { success: false, reason: 'insufficient_coins' };
    }

    const spent = this.spendCoins(profileId, item.coin_cost);
    if (!spent) return { success: false, reason: 'insufficient_coins' };

    itemData.earned.push(itemId);
    this._saveItems(profileId, itemData);

    return { success: true, reason: 'ok', item: item, spent: item.coin_cost };
  },

  // ── EFFORT ITEMS (from rewards.json) ───────────────

  _effortItems: null,

  /**
   * Store the master list of all effort items (loaded from rewards.json).
   * Called by write.html and other pages during initialization.
   * @param {Array} items - Array of item objects from rewards.json
   */
  setEffortItems(items) {
    this._effortItems = items;
  },

  /**
   * Get the stored effort items list.
   * @returns {Array|null}
   */
  getEffortItems() {
    return this._effortItems;
  },

  getItems(profileId) {
    return this._loadItems(profileId);
  },


  // ----------------------------------------------------------
  //  COMPUTED STATS
  // ----------------------------------------------------------

  getProfileStats(profileId, courseWordMap, yearWordMap) {
    const totalStars = this.getTotalStars(profileId);
    const currentStreak = this.getCurrentStreak(profileId);
    const longestStreak = this.getLongestStreak(profileId);
    const bestDay = this.getBestDay(profileId);
    const allScores = this.getAllScores(profileId);
    const allMastery = this.getAllMastery(profileId);

    const courseSeenPct = {};
    if (courseWordMap) {
      Object.entries(courseWordMap).forEach(([courseId, wordIds]) => {
        courseSeenPct[courseId] = this.getCourseSeenPercent(profileId, wordIds);
      });
    }

    const yearMasteredPct = {};
    if (yearWordMap) {
      Object.entries(yearWordMap).forEach(([year, wordIds]) => {
        yearMasteredPct[year] = this.getYearMasteredPercent(profileId, wordIds);
      });
    }

    const masteryCount = { unseen: 0, seen: 0, practiced: 0, mastered: 0 };
    Object.values(allMastery).forEach(m => {
      if (masteryCount[m.status] !== undefined) masteryCount[m.status]++;
    });

    return {
      totalStars,
      currentStreak,
      longestStreak,
      bestDay,
      allScores,
      allMastery,
      courseSeenPct,
      yearMasteredPct,
      masteryCount,
    };
  },


  // ----------------------------------------------------------
  //  GUEST WARNING
  // ----------------------------------------------------------

  shouldWarnGuest() {
    const profile = this.getActiveProfile();
    if (!profile?.is_guest) return false;
    return !sessionStorage.getItem(this.WARNED_KEY);
  },

  markGuestWarned() {
    sessionStorage.setItem(this.WARNED_KEY, 'true');
  },


  // ----------------------------------------------------------
  //  NOTEBOOK
  // ----------------------------------------------------------

  _notebookKey(id) { return 'xhz_notebook_' + id; },

  _loadNotebook(profileId) {
    try {
      return JSON.parse(localStorage.getItem(this._notebookKey(profileId))) || { entries: {} };
    } catch { return { entries: {} }; }
  },

  _saveNotebook(profileId, data) {
    try {
      localStorage.setItem(this._notebookKey(profileId), JSON.stringify(data));
    } catch (e) {
      console.error('profiles.js: failed to save notebook', e);
    }
    this._triggerSync('notebook', { profileId, entries: data.entries });
  },

  /**
   * Add a word to the notebook (or update its note).
   * @param {object} wordData - { word_id, char, pinyin, meaning }
   * @param {string} [note] - Optional user note
   * @returns {object} updated entry
   */
  addNotebookEntry(wordData, note) {
    const profile = this.getActiveProfile();
    if (!profile) return null;

    const data = this._loadNotebook(profile.id);
    const wordId = wordData.word_id;

    if (data.entries[wordId]) {
      // Already exists — update note if provided
      if (note !== undefined) {
        data.entries[wordId].note = note;
      }
      // Update meaning_th if provided (for language toggle compatibility)
      if (wordData.meaning_th !== undefined) {
        data.entries[wordId].meaning_th = wordData.meaning_th;
      }
      data.entries[wordId].updated_at = this.today();
    } else {
      // New entry
      data.entries[wordId] = {
        word_id: wordId,
        char: wordData.char || '',
        pinyin: wordData.pinyin || '',
        meaning: wordData.meaning || '',
        meaning_th: wordData.meaning_th || '',
        note: note || '',
        added_at: this.today(),
        updated_at: this.today()
      };
    }

    this._saveNotebook(profile.id, data);
    return data.entries[wordId];
  },

  /**
   * Remove a word from the notebook.
   * @param {string} wordId
   * @returns {boolean} true if removed
   */
  removeNotebookEntry(wordId) {
    const profile = this.getActiveProfile();
    if (!profile) return false;

    const data = this._loadNotebook(profile.id);
    if (!data.entries[wordId]) return false;

    delete data.entries[wordId];
    this._saveNotebook(profile.id, data);
    return true;
  },

  /**
   * Update the note for a notebook entry.
   * @param {string} wordId
   * @param {string} note
   * @returns {object|null} updated entry or null
   */
  updateNotebookNote(wordId, note) {
    const profile = this.getActiveProfile();
    if (!profile) return null;

    const data = this._loadNotebook(profile.id);
    if (!data.entries[wordId]) return null;

    data.entries[wordId].note = note || '';
    data.entries[wordId].updated_at = this.today();
    this._saveNotebook(profile.id, data);
    return data.entries[wordId];
  },

  /**
   * Get all notebook entries for the active profile.
   * @param {string} [profileId]
   * @returns {object} entries keyed by word_id
   */
  getNotebook(profileId) {
    const pid = profileId || (this.getActiveProfile() && this.getActiveProfile().id);
    if (!pid) return {};
    return this._loadNotebook(pid).entries;
  },

  /**
   * Check if a word is in the notebook.
   * @param {string} wordId
   * @returns {boolean}
   */
  isInNotebook(wordId) {
    const profile = this.getActiveProfile();
    if (!profile) return false;
    const data = this._loadNotebook(profile.id);
    return !!data.entries[wordId];
  },


  // ----------------------------------------------------------
  //  SUPABASE AUTO-REPAIR
  // ----------------------------------------------------------

  /**
   * Repair ALL local profiles after Supabase sign-in.
   * Called from guest-banner checks on each page.
   *
   * Phase 1 (sync): Sets is_guest → false on all local profiles.
   * Phase 2 (async): Pulls nickname, avatar, color from Supabase
   *   profiles table and updates any local profiles that mismatch.
   *
   * @returns {Promise<number>} Number of profiles that were repaired.
   */
  async repairAllProfilesFromSupabase() {
    if (window.__supabaseIsAnon !== false) return 0;

    const data = this._load();
    let count = 0;

    // Phase 1: Repair is_guest synchronously (so guest banner hides immediately)
    data.profiles.forEach(p => {
      if (p.is_guest !== false) {
        p.is_guest = false;
        count++;
      }
    });

    // Phase 2: Sync nickname, avatar, color, and coins from Supabase (async)
    if (data.profiles.length > 0 && window.__supabase) {
      try {
        var ids = data.profiles.map(function(p) { return p.id; });
        var { data: remoteProfiles, error } = await window.__supabase
          .from('profiles')
          .select('id, nickname, avatar, color, coins, coins_earned_total, coins_sources')
          .in('id', ids);

        if (!error && remoteProfiles && remoteProfiles.length) {
          var remoteMap = {};
          remoteProfiles.forEach(function(rp) {
            remoteMap[rp.id] = rp;
          });

          data.profiles.forEach(function(p) {
            var rp = remoteMap[p.id];
            if (rp) {
              var changed = false;
              if (rp.nickname !== undefined && p.nickname !== rp.nickname) {
                p.nickname = rp.nickname;
                changed = true;
              }
              if (rp.avatar !== undefined && p.avatar !== rp.avatar) {
                p.avatar = rp.avatar;
                changed = true;
              }
              if (rp.color !== undefined && p.color !== rp.color) {
                p.color = rp.color;
                changed = true;
              }
              // Sync coins — take the higher balance
              if (!p.coins) p.coins = 0;
              if (!p.coins_earned_total) p.coins_earned_total = 0;
              if (!p.coins_sources) p.coins_sources = {};
              if ((rp.coins || 0) > p.coins) {
                p.coins = rp.coins;
                changed = true;
              }
              if ((rp.coins_earned_total || 0) > p.coins_earned_total) {
                p.coins_earned_total = rp.coins_earned_total;
                changed = true;
              }
              if (rp.coins_sources && typeof rp.coins_sources === 'object') {
                Object.keys(rp.coins_sources).forEach(function (src) {
                  if (!p.coins_sources[src] || rp.coins_sources[src] > p.coins_sources[src]) {
                    p.coins_sources[src] = rp.coins_sources[src];
                    changed = true;
                  }
                });
              }
              if (changed) count++;
            }
          });
        }
      } catch (e) {
        console.warn('profiles.js: repairAllProfilesFromSupabase metadata sync failed', e.message);
      }
    }

    if (count > 0) {
      this._save(data);
      console.log('profiles.js: repairAllProfilesFromSupabase fixed ' + count + ' profile(s)');
    }

    return count;
  },

};

// Expose to window so module-based code (e.g. React game) can access via window.XHZ
window.XHZ = XHZ;