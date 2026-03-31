
(function () {
  const SUPABASE_URL = 'https://evntwoblnshjwivcddsy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bnR3b2JsbnNoandpdmNkZHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTg3NzIsImV4cCI6MjA5MDQzNDc3Mn0.ziuRIAN7et50lwwoz-SIUPO0k2mkkvdRdYY_LavCd-s';
  function getClient() {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase client library not loaded');
    }
    if (!window.__lithaSupabaseClient) {
      window.__lithaSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return window.__lithaSupabaseClient;
  }
  function deepGet(obj, path) {
    return (path || '').split('/').reduce(function (acc, key) {
      if (!key) return acc;
      return acc && typeof acc === 'object' ? acc[key] : undefined;
    }, obj);
  }
  function makeSnapshotFromPairs(pairs) {
    const arr = (pairs || []).map(function (pair) { return pair.value; });
    return {
      exists: function () { return arr.length > 0; },
      val: function () { return arr.length === 0 ? null : (arr.length === 1 ? arr[0] : Object.fromEntries((pairs||[]).map(function(p){return [p.key, p.value];}))); },
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
      const client = getClient();
      let snapshot;
      if (self.path === '/' && self._orderBy && self._orderBy.type === 'child' && self._orderBy.path === 'userData/Email') {
        const { data, error } = await client.rpc('ncloud_get_user_by_email', { login_email: self._equalTo });
        if (error) throw error;
        const pairs = (data || []).map(function (row) { return { key: row.user_key_id, value: row.payload }; });
        snapshot = makeSnapshotFromPairs(pairs);
      } else if (self.path === '/' && self._orderBy && self._orderBy.type === 'key') {
        const { data, error } = await client.rpc('ncloud_get_user_by_key', { lookup_key: self._equalTo });
        if (error) throw error;
        const pairs = (data || []).map(function (row) { return { key: row.user_key_id, value: row.payload }; });
        snapshot = makeSnapshotFromPairs(pairs);
      } else if (self.path === '/posts') {
        const { data, error } = await client.from('litha_posts').select('id, postdata_').order('created_at', { ascending: false });
        if (error) throw error;
        snapshot = makeSnapshotFromPairs((data || []).map(function (row) { return { key: row.id, value: { postdata_: row.postdata_ } }; }));
      } else if (/^\/posts\/[^/]+$/.test(self.path)) {
        const postId = self.path.split('/')[2];
        const { data, error } = await client.from('litha_posts').select('id, postdata_').eq('id', postId).maybeSingle();
        if (error) throw error;
        snapshot = makeSnapshotFromPairs(data ? [{ key: data.id, value: { postdata_: data.postdata_ } }] : []);
      } else {
        snapshot = makeSnapshotFromPairs([]);
      }
      if (typeof callback === 'function') callback(snapshot);
      return snapshot;
    })();
    return promise;
  };
  Ref.prototype.set = async function (data) {
    const client = getClient();
    if (/^\/posts\/[^/]+$/.test(this.path)) {
      const postId = this.path.split('/')[2];
      const payload = { id: postId, postdata_: data.postdata_ || {} };
      const { error } = await client.from('litha_posts').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      return;
    }
    if (/^\/[^/]+$/.test(this.path) && this.path !== '/posts') {
      const userKey = this.path.split('/')[1];
      const payload = { user_key_id: userKey, payload: data };
      const { error } = await client.from('ncloud_users').upsert(payload, { onConflict: 'user_key_id' });
      if (error) throw error;
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
        const client = getClient();
        const { data: cur, error: curErr } = await client.from('litha_posts').select('postdata_').eq('id', postId).maybeSingle();
        if (curErr) throw curErr;
        const current = cur && cur.postdata_ ? Number(cur.postdata_.likeCount || 0) : 0;
        const desired = updater(current);
        if (desired === undefined || desired === null) {
          completion && completion(null, false, null);
          return;
        }
        const { data, error } = await client.rpc('increment_litha_post_like', { post_id: postId });
        if (error) throw error;
        completion && completion(null, true, { val: function(){ return data; } });
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
