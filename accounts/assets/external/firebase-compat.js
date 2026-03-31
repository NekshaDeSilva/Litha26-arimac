(function () {
  const SUPABASE_URL = 'https://evntwoblnshjwivcddsy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bnR3b2JsbnNoandpdmNkZHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTg3NzIsImV4cCI6MjA5MDQzNDc3Mn0.ziuRIAN7et50lwwoz-SIUPO0k2mkkvdRdYY_LavCd-s';
  const USERS_KEY = 'litha_local_users_v1';
  const POSTS_KEY = 'litha_local_posts_v1';

  function safeJsonParse(v, fallback) {
    try { return JSON.parse(v); } catch (_) { return fallback; }
  }
  function getLocalUsers() {
    return safeJsonParse(localStorage.getItem(USERS_KEY) || '{}', {});
  }
  function setLocalUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users || {}));
  }
  function getLocalPosts() {
    return safeJsonParse(localStorage.getItem(POSTS_KEY) || '{}', {});
  }
  function setLocalPosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts || {}));
  }
  function setLastError(err) {
    try { window.__LITHA_DB_LAST_ERROR = err ? String(err.message || err) : ''; } catch (_) {}
  }
  function getClient() {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase client library not loaded');
    }
    if (!window.__lithaSupabaseClient) {
      window.__lithaSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return window.__lithaSupabaseClient;
  }
  function makeSnapshotFromPairs(pairs) {
    const arr = (pairs || []).map(function (pair) { return pair.value; });
    return {
      exists: function () { return arr.length > 0; },
      val: function () {
        return arr.length === 0 ? null : (arr.length === 1 ? arr[0] : Object.fromEntries((pairs || []).map(function (p) { return [p.key, p.value]; })));
      },
      forEach: function (cb) {
        (pairs || []).forEach(function (pair) {
          cb({ key: pair.key, val: function () { return pair.value; } });
        });
      }
    };
  }
  function normalizePath(path) {
    if (!path || path === '/') return '/';
    return path.startsWith('/') ? path : '/' + path;
  }
  function mergePairs(primaryPairs, fallbackPairs) {
    const map = {};
    (fallbackPairs || []).forEach(function (p) { map[p.key] = p.value; });
    (primaryPairs || []).forEach(function (p) { map[p.key] = p.value; });
    return Object.keys(map).map(function (k) { return { key: k, value: map[k] }; });
  }
  async function tryRemoteQuery(exec, fallback) {
    try {
      const result = await exec(getClient());
      setLastError('');
      return result;
    } catch (err) {
      console.warn('Litha DB remote failed, using local fallback:', err);
      setLastError(err);
      return fallback();
    }
  }
  function localUserPairsByEmail(email) {
    const users = getLocalUsers();
    return Object.keys(users).filter(function (k) {
      const row = users[k] || {};
      const e = (((row.userData || {}).Email) || '').toLowerCase();
      return e === String(email || '').toLowerCase();
    }).map(function (k) { return { key: k, value: users[k] }; });
  }
  function localUserPairsByKey(key) {
    const users = getLocalUsers();
    return users[key] ? [{ key: key, value: users[key] }] : [];
  }
  function localPostPairs() {
    const posts = getLocalPosts();
    return Object.keys(posts).map(function (k) { return { key: k, value: { postdata_: posts[k] } }; });
  }
  function localPostPair(postId) {
    const posts = getLocalPosts();
    return posts[postId] ? [{ key: postId, value: { postdata_: posts[postId] } }] : [];
  }

  function Ref(path) {
    this.path = normalizePath(path);
    this._orderBy = null;
    this._equalTo = undefined;
  }
  Ref.prototype.orderByChild = function (path) { this._orderBy = { type: 'child', path: path }; return this; };
  Ref.prototype.orderByKey = function () { this._orderBy = { type: 'key' }; return this; };
  Ref.prototype.equalTo = function (value) { this._equalTo = value; return this; };
  Ref.prototype.once = function (_event, callback) {
    const self = this;
    const promise = (async function () {
      let snapshot;
      if (self.path === '/' && self._orderBy && self._orderBy.type === 'child' && self._orderBy.path === 'userData/Email') {
        const pairs = await tryRemoteQuery(async function (client) {
          const { data, error } = await client.rpc('ncloud_get_user_by_email', { login_email: self._equalTo });
          if (error) throw error;
          return mergePairs((data || []).map(function (row) { return { key: row.user_key_id, value: row.payload }; }), localUserPairsByEmail(self._equalTo));
        }, function () { return localUserPairsByEmail(self._equalTo); });
        snapshot = makeSnapshotFromPairs(pairs);
      } else if (self.path === '/' && self._orderBy && self._orderBy.type === 'key') {
        const pairs = await tryRemoteQuery(async function (client) {
          const { data, error } = await client.rpc('ncloud_get_user_by_key', { lookup_key: self._equalTo });
          if (error) throw error;
          return mergePairs((data || []).map(function (row) { return { key: row.user_key_id, value: row.payload }; }), localUserPairsByKey(self._equalTo));
        }, function () { return localUserPairsByKey(self._equalTo); });
        snapshot = makeSnapshotFromPairs(pairs);
      } else if (self.path === '/posts') {
        const pairs = await tryRemoteQuery(async function (client) {
          const { data, error } = await client.from('litha_posts').select('id, postdata_').order('created_at', { ascending: false });
          if (error) throw error;
          return mergePairs((data || []).map(function (row) { return { key: row.id, value: { postdata_: row.postdata_ } }; }), localPostPairs());
        }, function () { return localPostPairs(); });
        snapshot = makeSnapshotFromPairs(pairs);
      } else if (/^\/posts\/[^/]+$/.test(self.path)) {
        const postId = self.path.split('/')[2];
        const pairs = await tryRemoteQuery(async function (client) {
          const { data, error } = await client.from('litha_posts').select('id, postdata_').eq('id', postId).maybeSingle();
          if (error) throw error;
          return mergePairs(data ? [{ key: data.id, value: { postdata_: data.postdata_ } }] : [], localPostPair(postId));
        }, function () { return localPostPair(postId); });
        snapshot = makeSnapshotFromPairs(pairs);
      } else {
        snapshot = makeSnapshotFromPairs([]);
      }
      if (typeof callback === 'function') callback(snapshot);
      return snapshot;
    })();
    return promise;
  };
  Ref.prototype.set = async function (data) {
    if (/^\/posts\/[^/]+$/.test(this.path)) {
      const postId = this.path.split('/')[2];
      const posts = getLocalPosts();
      posts[postId] = data.postdata_ || {};
      setLocalPosts(posts);
      await tryRemoteQuery(async function (client) {
        const payload = { id: postId, postdata_: data.postdata_ || {} };
        const { error } = await client.from('litha_posts').upsert(payload, { onConflict: 'id' });
        if (error) throw error;
        return true;
      }, function () { return true; });
      return;
    }
    if (/^\/[^/]+$/.test(this.path) && this.path !== '/posts') {
      const userKey = this.path.split('/')[1];
      const users = getLocalUsers();
      users[userKey] = data;
      setLocalUsers(users);
      await tryRemoteQuery(async function (client) {
        const payload = { user_key_id: userKey, payload: data };
        const { error } = await client.from('ncloud_users').upsert(payload, { onConflict: 'user_key_id' });
        if (error) throw error;
        return true;
      }, function () { return true; });
      return;
    }
    throw new Error('Unsupported set path ' + this.path);
  };
  Ref.prototype.transaction = function (updater, completion) {
    const self = this;
    (async function () {
      try {
        if (!/^\/posts\/[^/]+\/postdata_\/likeCount$/.test(self.path)) throw new Error('Unsupported transaction path ' + self.path);
        const postId = self.path.split('/')[2];
        const posts = getLocalPosts();
        const currentLocal = posts[postId] ? Number(posts[postId].likeCount || 0) : 0;
        const desired = updater(currentLocal);
        if (desired === undefined || desired === null) {
          completion && completion(null, false, null);
          return;
        }
        if (!posts[postId]) posts[postId] = { id: postId };
        posts[postId].likeCount = desired;
        setLocalPosts(posts);
        const remoteResult = await tryRemoteQuery(async function (client) {
          const { data, error } = await client.rpc('increment_litha_post_like', { post_id: postId });
          if (error) throw error;
          posts[postId].likeCount = Number(data || desired);
          setLocalPosts(posts);
          return posts[postId].likeCount;
        }, function () { return desired; });
        completion && completion(null, true, { val: function () { return remoteResult; } });
      } catch (err) {
        completion && completion(err, false, null);
      }
    })();
  };
  window.firebase = {
    initializeApp: function () { return window.firebase; },
    database: function () { return { ref: function (path) { return new Ref(path); } }; }
  };
})();
