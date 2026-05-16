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
    if (!sync || !sync.ready) return;

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
    return this._load().profiles;
  },

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
    };
    data.profiles.push(profile);
    this._save(data);
    return profile;
  },

  updateProfile(id, changes) {
    const data = this._load();
    const i = data.profiles.findIndex(p => p.id === id);
    if (i === -1) return false;
    ['nickname', 'avatar', 'color', 'equipped_items'].forEach(field => {
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

  isDuplicate(nickname, avatar) {
    return this.getAllProfiles().some(
      p => p.nickname.toLowerCase() === nickname.trim().toLowerCase() && p.avatar === avatar
    );
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
    entry.badge = this.getBadgeTier(totalScore);
    entry.study_badge = this.getStudyBadgeTier(entry.study_score);

    this._saveScores(profile.id, scoreData);

    // Check effort item unlocks
    const totalStars = this.getTotalStars(profile.id);
    const newItemUnlocked = this._checkEffortItemUnlock(profile.id, totalStars);

    return {
      entry,
      totalScore,
      pointsAwarded,
      pointsBlocked,
      newBadgeUnlocked: entry.badge !== prevBadge && entry.badge !== null,
      newStudyUnlocked: entry.study_badge !== prevStudyBadge && entry.study_badge !== null,
      badgeInfo: this.getBadgeInfo(entry.badge),
      studyBadgeInfo: this.getBadgeInfo(entry.study_badge, 'study'),
      newItemUnlocked,
    };
  },

  /**
   * Check if write stars can be awarded for a word
   * 
   * Rule 1: Max 3 times per day per word
   * Rule 2: No stars if write_cleared === true
   * 
   * @private
   */
  _canAwardWriteStars(profileId, wordId, todayEntry) {
    // Rule 2: Check if word is already write_cleared
    const mastery = this.getWordMasteryForProfile(profileId, wordId);
    if (mastery && mastery.write_cleared) {
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

    // Check write_cleared
    const mastery = this.getWordMastery(wordId);
    if (mastery && mastery.write_cleared) {
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

  _updateWordMastery(wordId, changes) {
    const profile = this.getActiveProfile();
    if (!profile) return { statusChanged: false, becameMastered: false };

    const data = this._loadMastery(profile.id);

    if (!data.words[wordId]) {
      data.words[wordId] = {
        word_id: wordId,
        status: 'unseen',
        write_cleared: false,
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
    if (changes.write_cleared === true) entry.write_cleared = true;
    if (changes.quiz_cleared === true) entry.quiz_cleared = true;

    // Check mastery conditions
    const nowMastered = entry.write_cleared && entry.quiz_cleared;
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
      if (entry && (entry.write_score + entry.study_score) > 0) {
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
      const entry = days[dateStr];
      if ((entry.write_score || 0) + (entry.study_score || 0) === 0) return;

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

_checkEffortItemUnlock(profileId, totalStars) {
    // effortItems must be pre-loaded via setEffortItems()
    if (!this._effortItems || !this._effortItems.length) return null;
    const itemData = this._loadItems(profileId);

    const newItems = this._effortItems
        .filter(item => totalStars >= item.min_stars && !itemData.earned.includes(item.id))
        .sort((a, b) => a.min_stars - b.min_stars);

    if (newItems.length) {
        newItems.forEach(item => itemData.earned.push(item.id));
        this._saveItems(profileId, itemData);
    }

    return newItems.length ? newItems[newItems.length - 1] : null;
},

// Call this once after rewards.json loads on any page
setEffortItems(effortItems) {
    this._effortItems = effortItems || [];
},

checkEffortItems(profileId, effortItems) {
    if (effortItems) this.setEffortItems(effortItems);
    if (!this._effortItems?.length) return null;
    const totalStars = this.getTotalStars(profileId);
    const itemData   = this._loadItems(profileId);

    const newItems = this._effortItems
        .filter(item => totalStars >= item.min_stars && !itemData.earned.includes(item.id))
        .sort((a, b) => a.min_stars - b.min_stars);

    if (newItems.length) {
        newItems.forEach(item => itemData.earned.push(item.id));
        this._saveItems(profileId, itemData);
    }

    return newItems.length ? newItems[newItems.length - 1] : null;
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

};