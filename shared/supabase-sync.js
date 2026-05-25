// ============================================================
//  supabase-sync.js
//  Sync service: pushes local data to Supabase after writes,
//  and pulls remote data on page load.
//  Depends on: supabase-client.js (loaded first)
//  Depends on: profiles.js (loaded first)
// ============================================================

(function () {
  'use strict';

  var SYNC = window.__SUPABASE_SYNC = {
    ready: false,
    _pending: [],

    /**
     * Queue a sync operation for when the connection is ready.
     * Used by XHZ._triggerSync when sync hasn't initialized yet.
     */
    enqueue: function (action, payload) {
      this._pending.push({ action: action, payload: payload, ts: Date.now() });
    },

    /**
     * Flush all queued operations in dependency order:
     * 1. Profile operations first (so FK references exist)
     * 2. Scores
     * 3. Mastery
     * 4. Items
     */
    _flushPending: function () {
      if (!this._pending.length) return;
      var order = { all_profiles: 0, profile_delete: 0, scores: 1, mastery: 2, items: 3 };
      this._pending.sort(function (a, b) {
        return (order[a.action] || 99) - (order[b.action] || 99);
      });
      var pending = this._pending;
      this._pending = [];
      var self = this;
      pending.forEach(function (item) {
        self._processAction(item.action, item.payload);
      });
    },

    _processAction: function (action, payload) {
      switch (action) {
        case 'all_profiles':
          this.pushAllProfiles(payload);
          break;
        case 'profile_delete':
          this.deleteProfile(payload);
          break;
        case 'scores':
          this.pushAllScores(payload.profileId, payload.days);
          break;
        case 'mastery':
          this.pushMastery(payload.profileId, payload.words);
          break;
        case 'items':
          this.pushItems(payload.profileId, payload.itemData);
          break;
      case 'notebook':
          this.pushNotebook(payload.profileId, payload.entries);
          break;
      }
    },

    async init() {
      await window.__supabaseReady;
      if (!window.__supabase) {
        console.log('📡 Supabase sync: offline mode');
        return;
      }
      this.ready = true;
      console.log('📡 Supabase sync: ready');

      // Flush any writes that were queued while initializing
      this._flushPending();

      // On first init, merge remote data with local
      var activeId = XHZ.getActiveId();
      if (activeId) {
        this.fullSync(activeId).then(function (remote) {
          if (remote) SYNC._mergeRemote(activeId, remote);
        });
      }
    },

    // ---------- PROFILES ----------

    pushProfile: async function (profile) {
      if (!this.ready) return;
      try {
        var sb = window.__supabase;
        var { error } = await sb.from('profiles').upsert({
          id: profile.id,
          nickname: profile.nickname,
          avatar: profile.avatar,
          color: profile.color,
          is_guest: profile.is_guest !== false,
          equipped_items: profile.equipped_items || {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        if (error) console.warn('Supabase pushProfile:', error.message);
      } catch (e) {
        console.warn('Supabase pushProfile failed:', e.message);
      }
    },

    pushAllProfiles: async function (profiles) {
      if (!this.ready || !profiles || !profiles.length) return;
      try {
        var records = profiles.map(function (p) {
          return {
            id: p.id,
            nickname: p.nickname,
            avatar: p.avatar,
            color: p.color,
            is_guest: p.is_guest !== false,
            equipped_items: p.equipped_items || {},
            updated_at: new Date().toISOString()
          };
        });
        var sb = window.__supabase;
        var { error } = await sb.from('profiles').upsert(records, { onConflict: 'id' });
        if (error) console.warn('Supabase pushAllProfiles:', error.message);
      } catch (e) {
        console.warn('Supabase pushAllProfiles failed:', e.message);
      }
    },

    deleteProfile: async function (id) {
      if (!this.ready) return;
      try {
        var sb = window.__supabase;
        await sb.from('profiles').delete().eq('id', id);
        await sb.from('scores').delete().eq('profile_id', id);
        await sb.from('mastery').delete().eq('profile_id', id);
        await sb.from('items').delete().eq('profile_id', id);
        await sb.from('notebook').delete().eq('profile_id', id);
      } catch (e) {
        console.warn('Supabase deleteProfile failed:', e.message);
      }
    },

    pullProfiles: async function () {
      if (!this.ready) return [];
      try {
        var sb = window.__supabase;
        var { data, error } = await sb.from('profiles').select('*').order('created_at');
        if (error) { console.warn('Supabase pullProfiles:', error.message); return []; }
        return data || [];
      } catch (e) {
        console.warn('Supabase pullProfiles failed:', e.message);
        return [];
      }
    },

    // ---------- SCORES ----------

    pushScore: async function (profileId, date, entry) {
      if (!this.ready) return;
      try {
        var sb = window.__supabase;
        var { error } = await sb.from('scores').upsert({
          profile_id: profileId,
          date: date,
          write_score: entry.write_score || 0,
          study_score: entry.study_score || 0,
          chars_practiced: entry.chars_practiced || [],
          cards_studied: entry.cards_studied || [],
          badge: entry.badge || null,
          study_badge: entry.study_badge || null,
          write_attempts: entry.write_attempts || {}
        }, { onConflict: 'profile_id,date' });
        if (error) console.warn('Supabase pushScore:', error.message);
      } catch (e) {
        console.warn('Supabase pushScore failed:', e.message);
      }
    },

    pushAllScores: async function (profileId, days) {
      if (!this.ready || !days) return;
      var entries = Object.entries(days).filter(function (_ref) {
        var entry = _ref[1];
        return (entry.write_score || entry.study_score) > 0;
      });
      if (!entries.length) return;

      try {
        var records = entries.map(function (_ref2) {
          var date = _ref2[0], entry = _ref2[1];
          return {
            profile_id: profileId,
            date: date,
            write_score: entry.write_score || 0,
            study_score: entry.study_score || 0,
            chars_practiced: entry.chars_practiced || [],
            cards_studied: entry.cards_studied || [],
            badge: entry.badge || null,
            study_badge: entry.study_badge || null,
            write_attempts: entry.write_attempts || {}
          };
        });
        var sb = window.__supabase;
        var { error } = await sb.from('scores').upsert(records, { onConflict: 'profile_id,date' });
        if (error) console.warn('Supabase pushAllScores:', error.message);
      } catch (e) {
        console.warn('Supabase pushAllScores failed:', e.message);
      }
    },

    pullScores: async function (profileId) {
      if (!this.ready) return null;
      try {
        var sb = window.__supabase;
        var { data, error } = await sb.from('scores').select('*').eq('profile_id', profileId);
        if (error) { console.warn('Supabase pullScores:', error.message); return null; }
        if (!data || !data.length) return null;

        var days = {};
        data.forEach(function (row) {
          days[row.date] = {
            write_score: row.write_score || 0,
            study_score: row.study_score || 0,
            chars_practiced: row.chars_practiced || [],
            cards_studied: row.cards_studied || [],
            badge: row.badge || null,
            study_badge: row.study_badge || null,
            write_attempts: row.write_attempts || {}
          };
        });
        return { days: days };
      } catch (e) {
        console.warn('Supabase pullScores failed:', e.message);
        return null;
      }
    },

    // ---------- MASTERY ----------

    pushMastery: async function (profileId, masteryData) {
      if (!this.ready) return;
      var words = Object.values(masteryData);
      if (!words.length) return;

      try {
        var records = words.map(function (w) {
          return {
            profile_id: profileId,
            word_id: w.word_id,
            status: w.status || 'unseen',
            write_cleared: w.write_cleared || false,
            quiz_cleared: w.quiz_cleared || false,
            mastered_date: w.mastered_date || null
          };
        });
        var sb = window.__supabase;
        var { error } = await sb.from('mastery').upsert(records, { onConflict: 'profile_id,word_id' });
        if (error) console.warn('Supabase pushMastery:', error.message);
      } catch (e) {
        console.warn('Supabase pushMastery failed:', e.message);
      }
    },

    pullMastery: async function (profileId) {
      if (!this.ready) return null;
      try {
        var sb = window.__supabase;
        var { data, error } = await sb.from('mastery').select('*').eq('profile_id', profileId);
        if (error) { console.warn('Supabase pullMastery:', error.message); return null; }
        if (!data || !data.length) return null;

        var words = {};
        data.forEach(function (row) {
          words[row.word_id] = {
            word_id: row.word_id,
            status: row.status,
            write_cleared: row.write_cleared,
            quiz_cleared: row.quiz_cleared,
            mastered_date: row.mastered_date
          };
        });
        return { words: words };
      } catch (e) {
        console.warn('Supabase pullMastery failed:', e.message);
        return null;
      }
    },

    // ---------- ITEMS ----------

    pushItems: async function (profileId, itemData) {
      if (!this.ready) return;
      if (!itemData || !itemData.earned || !itemData.earned.length) return;

      try {
        var sb = window.__supabase;
        // Upsert the items record (one row per profile with all earned/equipped)
        var { error } = await sb.from('items').upsert({
          profile_id: profileId,
          earned: itemData.earned,
          equipped: itemData.equipped || {}
        }, { onConflict: 'profile_id' });
        if (error) console.warn('Supabase pushItems:', error.message);
      } catch (e) {
        console.warn('Supabase pushItems failed:', e.message);
      }
    },

    pullItems: async function (profileId) {
      if (!this.ready) return null;
      try {
        var sb = window.__supabase;
        var { data, error } = await sb.from('items').select('*').eq('profile_id', profileId);
        if (error) { console.warn('Supabase pullItems:', error.message); return null; }
        if (!data || !data.length) return null;

        var row = data[0];
        return {
          earned: row.earned || [],
          equipped: row.equipped || {}
        };
      } catch (e) {
        console.warn('Supabase pullItems failed:', e.message);
        return null;
      }
    },

    // ---------- FULL SYNC ----------

    fullSync: async function (profileId) {
      if (!this.ready) return null;
      try {
        var remote = {
          profiles: await this.pullProfiles(),
          scores: await this.pullScores(profileId),
          mastery: await this.pullMastery(profileId),
          items: await this.pullItems(profileId),
          notebook: await this.pullNotebook(profileId)
        };
        return remote;
      } catch (e) {
        console.warn('Supabase fullSync failed:', e.message);
        return null;
      }
    },

    // ---------- MERGE (remote takes priority) ----------

    _mergeRemote: function (profileId, remote) {
      if (!remote) return;

      // Merge profiles (local wins — local is source of truth for profile metadata)
      var localProfiles = XHZ.getAllProfiles();
      if (remote.profiles && remote.profiles.length > localProfiles.length) {
        // Remote has profiles we don't know about — add them
        var localIds = localProfiles.map(function (p) { return p.id; });
        remote.profiles.forEach(function (rp) {
          if (localIds.indexOf(rp.id) === -1) {
            // Import remote profile to local
            var data = XHZ._load();
            data.profiles.push({
              id: rp.id,
              nickname: rp.nickname,
              avatar: rp.avatar,
              color: rp.color,
              is_guest: rp.is_guest !== false,
              equipped_items: rp.equipped_items || {}
            });
            XHZ._save(data);
          }
        });
      }

      // Merge scores (keep both, union)
      if (remote.scores && remote.scores.days) {
        var localScores = XHZ._loadScores(profileId);
        var merged = false;
        Object.keys(remote.scores.days).forEach(function (date) {
          if (!localScores.days[date]) {
            localScores.days[date] = remote.scores.days[date];
            merged = true;
          }
        });
        if (merged) XHZ._saveScores(profileId, localScores);
      }

      // Merge mastery (remote upgrades only)
      if (remote.mastery && remote.mastery.words) {
        var localMastery = XHZ._loadMastery(profileId);
        var merged = false;
        Object.keys(remote.mastery.words).forEach(function (wordId) {
          var local = localMastery.words[wordId];
          var remoteW = remote.mastery.words[wordId];
          if (!local) {
            localMastery.words[wordId] = remoteW;
            merged = true;
          } else if (XHZ.MASTERY_ORDER.indexOf(remoteW.status) > XHZ.MASTERY_ORDER.indexOf(local.status)) {
            localMastery.words[wordId] = remoteW;
            merged = true;
          }
        });
        if (merged) XHZ._saveMastery(profileId, localMastery);
      }

      // Merge items (union of earned)
      if (remote.items) {
        var localItems = XHZ._loadItems(profileId);
        var merged = false;
        if (remote.items.earned && remote.items.earned.length) {
          remote.items.earned.forEach(function (itemId) {
            if (localItems.earned.indexOf(itemId) === -1) {
              localItems.earned.push(itemId);
              merged = true;
            }
          });
        }
        if (merged) XHZ._saveItems(profileId, localItems);
      }

      // Merge notebook (union)
      if (remote.notebook && remote.notebook.entries) {
        var localNotebook = XHZ._loadNotebook(profileId);
        var merged = false;
        Object.keys(remote.notebook.entries).forEach(function (wordId) {
          if (!localNotebook.entries[wordId]) {
            localNotebook.entries[wordId] = remote.notebook.entries[wordId];
            merged = true;
          }
        });
        if (merged) XHZ._saveNotebook(profileId, localNotebook);
      }
    },

    // ---------- NOTEBOOK ----------

    pushNotebook: async function (profileId, entries) {
      if (!this.ready) return;
      if (!entries || !Object.keys(entries).length) return;

      try {
        var sb = window.__supabase;
        var records = Object.values(entries).map(function (e) {
          return {
            profile_id: profileId,
            word_id: e.word_id,
            char: e.char || '',
            pinyin: e.pinyin || '',
            meaning: e.meaning || '',
            note: e.note || '',
            added_at: e.added_at || null,
            updated_at: e.updated_at || null
          };
        });
        var { error } = await sb.from('notebook').upsert(records, { onConflict: 'profile_id,word_id' });
        if (error) console.warn('Supabase pushNotebook:', error.message);
      } catch (e) {
        console.warn('Supabase pushNotebook failed:', e.message);
      }
    },

    pullNotebook: async function (profileId) {
      if (!this.ready) return null;
      try {
        var sb = window.__supabase;
        var { data, error } = await sb.from('notebook').select('*').eq('profile_id', profileId);
        if (error) { console.warn('Supabase pullNotebook:', error.message); return null; }
        if (!data || !data.length) return null;

        var entries = {};
        data.forEach(function (row) {
          entries[row.word_id] = {
            word_id: row.word_id,
            char: row.char,
            pinyin: row.pinyin,
            meaning: row.meaning,
            note: row.note,
            added_at: row.added_at,
            updated_at: row.updated_at
          };
        });
        return { entries: entries };
      } catch (e) {
        console.warn('Supabase pullNotebook failed:', e.message);
        return null;
      }
    },

    // ---------- PUSH ALL ----------

    /**
     * Push ALL local data for a profile to Supabase.
     * Called after sign-in to ensure the server has the latest local data.
     */
    pushAll: async function (profileId) {
      if (!this.ready || !profileId) return;
      if (!window.XHZ) return;

      try {
        // Push all profiles
        var profiles = window.XHZ.getAllProfiles();
        if (profiles && profiles.length) {
          await this.pushAllProfiles(profiles);
        }

        // Push scores for this profile
        var scoreData = window.XHZ._loadScores(profileId);
        if (scoreData && scoreData.days) {
          await this.pushAllScores(profileId, scoreData.days);
        }

        // Push mastery for this profile
        var masteryData = window.XHZ._loadMastery(profileId);
        if (masteryData && masteryData.words) {
          await this.pushMastery(profileId, masteryData.words);
        }

        // Push items for this profile
        var itemData = window.XHZ._loadItems(profileId);
        if (itemData) {
          await this.pushItems(profileId, itemData);
        }

        // Push notebook for this profile
        var notebookData = window.XHZ._loadNotebook(profileId);
        if (notebookData && notebookData.entries) {
          await this.pushNotebook(profileId, notebookData.entries);
        }

        console.log('📡 Supabase sync: pushAll complete for profile ' + profileId);
      } catch (e) {
        console.warn('Supabase pushAll failed:', e.message);
      }
    }
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { SYNC.init(); });
  } else {
    SYNC.init();
  }
})();
