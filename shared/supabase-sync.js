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

    async init() {
      await window.__supabaseReady;
      if (!window.__supabase) {
        console.log('📡 Supabase sync: offline mode');
        return;
      }
      this.ready = true;
      console.log('📡 Supabase sync: ready');

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
          items: await this.pullItems(profileId)
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
    }
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { SYNC.init(); });
  } else {
    SYNC.init();
  }
})();
