var userData;
try { firebase.initializeApp({}); } catch (e) {}
var database = firebase.database();

var lithaLikeStorageKey = 'litha_user_likes_v2';
var iVal = '';
var imgVal = '';
var imgFileVal = null;
var pid;
var refId;
var enccodec;
var scrollUnloadBitRta = 0;
var postPublishInFlight = false;

function getSupabaseClient() {
    if (window.__lithaSupabaseClient) {
        return window.__lithaSupabaseClient;
    }
    var cfg = window.__LITHA_SUPABASE_CONFIG || {};
    if (window.supabase && window.supabase.createClient && cfg.url && cfg.anonKey) {
        window.__lithaSupabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
        return window.__lithaSupabaseClient;
    }
    return null;
}

async function uploadPostImageToSupabase(postId, file) {
    var client = getSupabaseClient();
    if (!client) {
        throw new Error('Supabase client not ready.');
    }
    if (!file) return '';

    var bucket = window.LITHA_SUPABASE_POST_BUCKET || 'litha-posts';
    var ext = (String(file.name || '').split('.').pop() || 'jpg').toLowerCase();
    var filePath = 'posts/' + String(postId || Date.now()) + '-' + Date.now() + '.' + ext;

    var uploadResponse = await client.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || undefined
        });

    if (uploadResponse.error) {
        throw uploadResponse.error;
    }

    var publicResult = client.storage.from(bucket).getPublicUrl(filePath);
    var imageUrl = (((publicResult || {}).data || {}).publicUrl) || '';
    if (!imageUrl) {
        throw new Error('Unable to get public URL for uploaded image.');
    }
    return imageUrl;
}

function getLikeStore() {
    try {
        return JSON.parse(localStorage.getItem(lithaLikeStorageKey) || '{}') || {};
    } catch (e) {
        return {};
    }
}

function setLikeStore(store) {
    try {
        localStorage.setItem(lithaLikeStorageKey, JSON.stringify(store || {}));
    } catch (e) {}
}

function getCurrentUserLikeMap() {
    var store = getLikeStore();
    var key = enccodec || 'guest';
    return store[key] || {};
}

function saveCurrentUserLikeMap(map) {
    var store = getLikeStore();
    var key = enccodec || 'guest';
    store[key] = map || {};
    setLikeStore(store);
}

function hasCurrentUserLiked(postId) {
    var map = getCurrentUserLikeMap();
    return !!map[String(postId || '')];
}

function markCurrentUserLiked(postId) {
    var map = getCurrentUserLikeMap();
    map[String(postId || '')] = true;
    saveCurrentUserLikeMap(map);
}

function applyLikeVisualState(el, liked) {
    var $el = $(el);
    var svg = $el.children('svg');
    if (!$el.length || !svg.length) return;

    if (liked) {
        svg.html('<path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>');
        $el.attr('data-liked', '1');
    } else {
        svg.html('<path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>');
        $el.attr('data-liked', '0');
    }
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function postVerifiedBadgeMarkup() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check-fill" viewBox="0 0 16 16">
  <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
</svg>`;
}

function buildPostHtml(postData, postId) {
    postData = postData || {};

    var authorProfile = postData.authorProfile || postData.profileP || 'assests/neketh-vectors/person-fill.svg';
    var authorName = postData.authorName ||
        (((postData.authorFirstName || '') + ' ' + (postData.authorLastName || '')).trim()) ||
        'User';

    var verified = Number(postData.authorVerified || postData.accountStatus || 0) === 1
        ? postVerifiedBadgeMarkup()
        : '';

    // Calculate 'X hours ago' label
    var createdText = '';
    var createdAt = postData.createdAt || postData.createdLabel || postData.createdAtLabel;
    if (createdAt) {
        var createdDate = new Date(createdAt);
        var now = new Date();
        var diffMs = now - createdDate;
        var diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs < 1) {
            createdText = 'Just now';
        } else if (diffHrs === 1) {
            createdText = '1 hour ago';
        } else {
            createdText = diffHrs + ' hours ago';
        }
    } else {
        createdText = '';
    }

    var phrase = escapeHtml(postData.phrase || postData.text || '');
    var image = postData.image || postData.img || '';
    var imageBlock = image
        ? `<div class="lithaQ-post-content lithaQ-post-syn-photo" style="background-image:url('${image}')"></div>`
        : '';

    var phraseBlock = phrase
        ? `<div class="lithaQ-box-parody"><span class="lithaQ-post-syn-phr">${phrase}</span></div>`
        : '';

    return `
    <div class="lihtaQ-post radixVR-data-div" data-post-id="${postId}" data-author-key="${escapeHtml(postData.authorKey || '')}" data-author-name="${escapeHtml(authorName)}" data-author-profile="${escapeHtml(authorProfile)}">
        <div class="lithaQ-post-header">
            <div class="lithaQ-post-header-left">
                <div class="lithaQ-post-syn-imgPro" style="background-image:url('${authorProfile}')"></div>
                <span class="lithaQ-post-syn-user">${escapeHtml(authorName)}</span>
            </div>
            <div class="lithaQ-post-header-cen">${verified}</div>
            <div class="lithaQ-post-header-right">
                <span class="lithaQ-post-syn-tme">${escapeHtml(createdText)}</span>
            </div>
        </div>
        <div class="divider-dction-mv"></div>
        ${imageBlock}
        <div class="lithaQ-post-end">
            <div class="lithaQ-box-parody" style="width:90%; font-size:95%; flex-direction: column; justify-content:center; align-items: flex-start;">
                <span class="lithaQ-post-syn-Lcout" id="${postId}" style="opacity:65%;">${Number(postData.likeCount || 0)} Likes</span>
            </div>
            ${phraseBlock}
            <div class="lithaQ-box-parody">
                <div class="iconTray-lithaQ-actions">
                    <div data-opt="likeRaiseCountvar" class="iconTray-lithaQ-actionsdiv" id="${postId}" data-liked="0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"></path>
                        </svg>
                    </div>
                    <div onclick="openShareVoid();">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function hydrateRenderedPosts() {
    $('.lithaQ-post-syn-photo').each(function () {
        var bg = $(this).css('background-image') || '';
        if (!bg || bg === 'none' || /url\(["']?\s*["']?\)/.test(bg)) {
            $(this).remove();
        }
    });

    $('.iconTray-lithaQ-actionsdiv').each(function () {
        applyLikeVisualState(this, hasCurrentUserLiked($(this).attr('id')));
    });
}

function renderLeaderboard(posts) {
    var scores = {};

    (posts || []).forEach(function (row) {
        var p = (row || {}).postdata_ || row || {};
        var key = p.authorKey || p.authorName || 'Unknown';

        if (!scores[key]) {
            scores[key] = {
                key: key,
                name: p.authorName || 'User',
                profile: p.authorProfile || '',
                verified: Number(p.authorVerified || 0),
                likes: 0
            };
        }

        scores[key].likes += Number(p.likeCount || 0);
    });

    var list = Object.keys(scores)
        .map(function (k) { return scores[k]; })
        .sort(function (a, b) { return b.likes - a.likes; })
        .slice(0, 10);

    var host = $('.magSpinner_role-inner');
    if (!host.length) return;

    if (!list.length) {
        host.html('<div class="leaderboard-list"><div class="leaderboard-item"><div class="leaderboard-meta"><div class="leaderboard-rank">•</div><div class="leaderboard-name">No top creators yet</div></div><div class="leaderboard-score">0 Likes</div></div></div>');
        return;
    }

    var html = '<div class="leaderboard-list">';
    list.forEach(function (item, idx) {
        html += `
        <div class="leaderboard-item">
            <div class="leaderboard-meta">
                <div class="leaderboard-rank">#${idx + 1}</div>
                <div class="leaderboard-avatar" style="background-image:url('${item.profile || 'assests/neketh-vectors/person-fill.svg'}')"></div>
                <div class="leaderboard-name">${escapeHtml(item.name)}${item.verified === 1 ? ' ' + postVerifiedBadgeMarkup() : ''}</div>
            </div>
            <div class="leaderboard-score">${item.likes} Likes</div>
        </div>`;
    });
    html += '</div>';

    host.html(html);
}

function triggerPostImagePicker() {
    var input = document.getElementById('lithaPostImageInput') || document.querySelector('.photoAddBtn_lithaQ_jhhdh_input');
    if (input) input.click();
}

function resetPostImagePreview() {
    var box = $('.pictureDes-lithaQ-previewDiv');
    box.addClass('is-empty').css({
        'background-image': 'none',
        'background-size': '',
        'background-position': '',
        'background-repeat': ''
    });

    var text = box.find('.pictureDes-lithaQ-previewText');
    if (text.length) {
        text.text('( Click To Attach Images and GIFs! )').show();
    }

    var input = document.getElementById('lithaPostImageInput');
    if (input) input.value = '';
    imgFileVal = null;
}

function showPostImagePreview(dataUrl, fileName) {
    var box = $('.pictureDes-lithaQ-previewDiv');
    box.removeClass('is-empty').css({
        'background-image': 'url(' + dataUrl + ')',
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat'
    });

    var text = box.find('.pictureDes-lithaQ-previewText');
    if (text.length) {
        text.text(fileName ? ('Selected: ' + fileName) : 'Image selected').show();
    }
}

function bindPostComposerEvents() {
    $(document)
        .off('input.lithaPostText change.lithaPostText', '.lithaQ-profile-input-post_')
        .on('input.lithaPostText change.lithaPostText', '.lithaQ-profile-input-post_', function () {
            iVal = $(this).val();
        });

    $(document)
        .off('change.lithaAttachFile', '#lithaPostImageInput, .photoAddBtn_lithaQ_jhhdh_input')
        .on('change.lithaAttachFile', '#lithaPostImageInput, .photoAddBtn_lithaQ_jhhdh_input', function (event) {
            var file = event.target.files && event.target.files[0];
            if (!file) return;

            if (!/^image\//i.test(file.type)) {
                alert('Please select an image file.');
                return;
            }

            var reader = new FileReader();
            reader.onload = function (ev) {
                imgVal = ev.target.result;
                imgFileVal = file;
                showPostImagePreview(imgVal, file.name || 'Image');
            };
            reader.readAsDataURL(file);
        });
}

bindPostComposerEvents();
resetPostImagePreview();

function lithaPop_cont_signIn() {
    $('.CreateAccountContext_Btn').off('click.lithaAuth').on('click.lithaAuth', function () {
        var maxrand = Math.floor(Math.random() * 890 * 859) + 'ES';
        localStorage.setItem('apiAccess', maxrand);

        try {
            document.cookie = 'litha_apiAccess=' + encodeURIComponent(maxrand) + '; path=/; max-age=' + (60 * 60 * 24 * 30);
        } catch (e) {}

        setTimeout(function () {
            window.location.href = ((window.LITHA_ACCOUNTS_URL) || '../accounts/index.html') + '?refK=' + encodeURIComponent(maxrand) + '&redrct=signInwindow';
        }, 1000);
    });
}

lithaPop_cont_signIn();

window.onload = function (e, l) {
    retirivePostsFromFirebase();

    function clearAuthSession() {
        enccodec = '';
        try { localStorage.removeItem('userStatus'); } catch (err) {}
        try { localStorage.removeItem('lithaUserKey'); } catch (err) {}
        try { document.cookie = 'litha_userStatus=; path=/; max-age=0'; } catch (err) {}
        try { document.cookie = 'litha_userKey=; path=/; max-age=0'; } catch (err) {}
    }

    if (!urlParams.get('referenc')) {
        if (localStorage.getItem('apiAccess') || document.cookie.indexOf('litha_apiAccess=') !== -1) {
            l = localStorage.getItem('apiAccess') || decodeURIComponent((document.cookie.match(/(?:^|; )litha_apiAccess=([^;]*)/) || [])[1] || '');
            e = urlParams.get('referenc') || localStorage.getItem('userStatus') || decodeURIComponent((document.cookie.match(/(?:^|; )litha_userStatus=([^;]*)/) || [])[1] || '');

            try {
                enccodec = CryptoJS.AES.decrypt(e, (l || '')).toString(CryptoJS.enc.Utf8);
            } catch (err) {
                enccodec = '';
            }

            if (enccodec) {
                userProfileActive();
            } else if (e) {
                clearAuthSession();
            }
        }
    } else {
        e = urlParams.get('referenc');
        l = urlParams.get('apiAccess') || localStorage.getItem('apiAccess');

        try {
            enccodec = CryptoJS.AES.decrypt(e, (l || '')).toString(CryptoJS.enc.Utf8);
        } catch (err) {
            enccodec = '';
        }

        localStorage.setItem('userStatus', e);

        try {
            document.cookie = 'litha_userStatus=' + encodeURIComponent(e) + '; path=/; max-age=' + (60 * 60 * 24 * 30);
        } catch (err) {}

        try {
            document.cookie = 'litha_apiAccess=' + encodeURIComponent(l || '') + '; path=/; max-age=' + (60 * 60 * 24 * 30);
        } catch (err) {}

        if (enccodec) {
            userProfileActive();
        } else {
            clearAuthSession();
        }
    }
};

function retrievePostLikeCount() {
    $('.lithaQ-post-syn-Lcout').each(function () {
        var postId = $(this).attr('id');
        var postIdentity = $(this);

        database.ref('/posts/' + postId).once('value', function (snapshot) {
            var postRow = snapshot.val() || {};
            var postData = postRow.postdata_ || postRow;
            var likeCount = Number(postData.likeCount || 0);
            postIdentity.text(likeCount + ' Likes');
        });
    });

    $(document).off('click.lithaLike', '.iconTray-lithaQ-actionsdiv').on('click.lithaLike', '.iconTray-lithaQ-actionsdiv', function () {
        var nowusn = $(this);
        var pids = nowusn.attr('id');

        if (!enccodec) {
            lithaPop_cont_signIn();
            $('.CreateAccountContext_Btn').eq(0).trigger('click');
            return;
        }

        if (hasCurrentUserLiked(pids)) {
            applyLikeVisualState(nowusn, true);
            return;
        }

        database.ref('/posts/' + pids + '/postdata_/likeCount').transaction(function (currentValue) {
            return Number(currentValue || 0) + 1;
        }, function (error, committed, snapshot) {
            if (error || !committed) return;

            markCurrentUserLiked(pids);
            applyLikeVisualState(nowusn, true);

            var count = Number(snapshot && snapshot.val ? snapshot.val() : 0);
            $('.lithaQ-post-syn-Lcout').filter(function () {
                return $(this).attr('id') === pids;
            }).text(count + ' Likes');
        });
    });

    hydrateRenderedPosts();
}

function userProfileActive() {
    var databaseRef = firebase.database().ref('/');

    databaseRef.orderByKey().equalTo(enccodec).once("value").then(snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                userData = childSnapshot.val();
            });

            try {
                localStorage.setItem('lithaUserKey', userData.userData.userKeyId || '');
                document.cookie = 'litha_userKey=' + encodeURIComponent(userData.userData.userKeyId || '') + '; path=/; max-age=' + (60 * 60 * 24 * 30);
            } catch (err) {}

            if (!$('.flotingDiv-profile-previewBtnrole').length) {
                $('body').append(`<div onclick="scrollIntoViewNha(des='.lithaQ-social-cen')" class="flotingDiv-profile-previewBtnrole profilepopperDiv-role-floating" role="button" title="You"></div>`);
            }

            $('.flotingDiv-profile-previewBtnrole').css({
                'background-image': 'url(' + userData.userData.profileP + ')'
            });

            $('.profilePreview-dic-img-stlayer').attr('src', userData.userData.profileP);
            $('.AccountContext_NCloudSyndication_ span').html((userData.userData.Fname || 'User') + '..');

            if (userData.userData.accountStatus == 1) {
                $('.AccountContext_NCloudSyndication_ .accountNVerified_badge').remove();
                $('.AccountContext_NCloudSyndication_').append(`<img data-inlinecss="yes" title="Verified Account" src="assests/img/patchverified.png" style="width:1.5rem;" class="accountNVerified_badge" alt="Verified" draggable="false" loading="lazy" onerror="this.src='assests/img/patch_verfied.png'">`);
            }
        } else {
            console.log('No active account session found.');
        }
    });
}

async function fetchUserRecordByKey(userKey) {
    if (!userKey) return null;
    try {
        var snapshot = await firebase.database().ref('/').orderByKey().equalTo(userKey).once('value');
        var resolved = null;
        if (snapshot && snapshot.exists()) {
            snapshot.forEach(function (childSnapshot) {
                var row = childSnapshot.val() || {};
                resolved = row.userData || null;
            });
        }
        return resolved;
    } catch (err) {
        return null;
    }
}

async function hydratePostAuthorMeta(payload) {
    payload = payload || {};
    if ((payload.authorName && payload.authorProfile) || !payload.authorKey) {
        return payload;
    }

    var userRow = await fetchUserRecordByKey(payload.authorKey);
    if (!userRow) return payload;

    payload.authorFirstName = payload.authorFirstName || userRow.Fname || '';
    payload.authorLastName = payload.authorLastName || userRow.Lname || '';
    payload.authorName = payload.authorName || ((userRow.Fname || '') + ' ' + (userRow.Lname || '')).trim() || 'User';
    payload.authorProfile = payload.authorProfile || userRow.profileP || 'assests/neketh-vectors/person-fill.svg';
    payload.authorVerified = Number(payload.authorVerified || userRow.accountStatus || 0);
    return payload;
}

function scrollIntoViewNha(des) {
    document.querySelector(des).scrollIntoView();
}

async function postCurrent() {
    var textValue = String($('.lithaQ-profile-input-post_').val() || '').trim();
    iVal = textValue;

    if (!enccodec) {
        lithaPop_cont_signIn();
        $('.CreateAccountContext_Btn').eq(0).trigger('click');
        return;
    }

    if (!textValue && !imgVal) {
        $('.lithaQ-profile-input-post_').attr('placeholder', 'Please type something or attach an image..');
        return;
    }
    if (postPublishInFlight) {
        return;
    }
    postPublishInFlight = true;

    pid = Math.floor(Math.random() * 889 * 774) + 'PID';

    if ((!userData || !userData.userData) && enccodec) {
        var fetchedUserData = await fetchUserRecordByKey(enccodec);
        if (fetchedUserData) {
            userData = { userData: fetchedUserData };
        }
    }

    function checkFcurrentTime_datePost() {
        // Return ISO string for accurate time difference calculation
        return new Date().toISOString();
    }

    var imageUrl = imgVal || '';
    if (imgFileVal) {
        try {
            imageUrl = await uploadPostImageToSupabase(pid, imgFileVal);
        } catch (uploadError) {
            var uploadMessage = String((uploadError && uploadError.message) || uploadError || '');
            if (/bucket not found/i.test(uploadMessage)) {
                imageUrl = imgVal || '';
                alert('Supabase bucket not found. Publishing with inline image data for now.');
            } else {
                postPublishInFlight = false;
                alert('Image upload failed. Please try again. ' + uploadMessage);
                return;
            }
        }
    }

    var payload = {
        id: pid,
        phrase: textValue,
        image: imageUrl,
        likeCount: 0,
        authorKey: (userData && userData.userData && userData.userData.userKeyId) || enccodec || '',
        authorName: ((userData && userData.userData ? (userData.userData.Fname || '') + ' ' + (userData.userData.Lname || '') : 'User')).trim(),
        authorFirstName: (userData && userData.userData && userData.userData.Fname) || '',
        authorLastName: (userData && userData.userData && userData.userData.Lname) || '',
        authorProfile: (userData && userData.userData && userData.userData.profileP) || 'assests/neketh-vectors/person-fill.svg',
        authorVerified: Number((userData && userData.userData && userData.userData.accountStatus) || 0),
        createdAt: new Date().toISOString(),
        createdLabel: checkFcurrentTime_datePost()
    };

    payload.data = buildPostHtml(payload, pid);
    try {
        await database.ref('/posts/' + pid).set({ postdata_: payload });
    } catch (postError) {
        postPublishInFlight = false;
        alert('Post publish failed. ' + String(window.__LITHA_DB_LAST_ERROR || (postError && postError.message) || postError || 'Please retry.'));
        return;
    }

    var postTarget = $('.lithaQ-social-cen .lithaQ-box-parody').eq(0);
    postTarget.find('.loadingDiv-postsLoAD_preload-seek, .loadingDiv-postsLoadignAdd_preload-seek, .emptyState-posts').remove();
    postTarget.prepend(payload.data);

    retrievePostLikeCount();
    renderLeaderboard([{ postdata_: payload }]);

    $('.lithaQ-profile-input-post_').val('').attr('placeholder', "What's Happening Now!?");
    imgVal = '';
    iVal = '';
    resetPostImagePreview();
    postPublishInFlight = false;
}

function retirivePostsFromFirebase() {
    var databaseRef = firebase.database().ref('/posts');
    var postRoot = $('.lithaQ-social-cen .lithaQ-box-parody').eq(0);

    postRoot.find('.loadingDiv-postsLoAD_preload-seek, .loadingDiv-postsLoadignAdd_preload-seek').remove();
    postRoot.append('<div class="loadingDiv-postsLoAD_preload-seek"></div>');

    databaseRef.once('value').then(async function (snapshot) {
        var dataArray = [];

        snapshot.forEach(function (childSnapshot) {
            var row = childSnapshot.val() || {};
            var payload = row.postdata_ || row;
            if (!payload.id) payload.id = childSnapshot.key;
            dataArray.push({ key: childSnapshot.key, postdata_: payload });
        });

        dataArray.sort(function (a, b) {
            return String((b.postdata_ || {}).createdAt || '').localeCompare(String((a.postdata_ || {}).createdAt || ''));
        });

        var selectedObjects = dataArray.slice(0, Math.min(5, dataArray.length));
        await Promise.all(selectedObjects.map(async function (selectedObject) {
            var payload = selectedObject.postdata_ || {};
            await hydratePostAuthorMeta(payload);
            selectedObject.postdata_ = payload;
        }));

        postRoot.find('.loadingDiv-postsLoAD_preload-seek, .loadingDiv-postsLoadignAdd_preload-seek, .emptyState-posts').remove();

        if (!selectedObjects.length) {
            postRoot.append('<div class="emptyState-posts" style="margin:1rem auto;opacity:.7;">No posts yet.</div>');
        }

        selectedObjects.forEach(function (selectedObject) {
            var payload = selectedObject.postdata_ || {};
            var html = payload.data || buildPostHtml(payload, payload.id || selectedObject.key);
            postRoot.append(html);
        });

        retrievePostLikeCount();
        hydrateRenderedPosts();
        renderLeaderboard(dataArray);
        postRoot.append('<div class="loadingDiv-postsLoadignAdd_preload-seek" onclick="retirivePostsFromFirebase();">Load More</div>');
    }).catch(function (error) {
        console.log('error', error);
        postRoot.find('.loadingDiv-postsLoAD_preload-seek').remove();
        postRoot.append('<div class="emptyState-posts" style="margin:1rem auto;opacity:.7;">Unable to load posts right now.</div>');
    });

    scrollUnloadBitRta = 1;
}

window.addEventListener('scroll', function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        $('.flotingDiv-profile-previewBtnrole').css({ 'opacity': '0%' });
    } else {
        $('.flotingDiv-profile-previewBtnrole').css({ 'opacity': '100%' });
    }
});

$('.socialBar-footer-lose-landing svg').on('click', function () {
    window.open($(this).attr('id'));
});

function advertiserIdRediect(adsyn) {
    if (adsyn == 919) {
        window.open('https://www.facebook.com/thechancesport');
    }
    if (adsyn == 6179) {
        window.open('https://chancesports.lk/');
    }
}

function adSyndicateTagFill(tme) {
    $('body').append(`
        <div class="adSyndicateDiv_mediaOgAd">
            <div class="AdygfSyndicate_OnPageloadDiv-video" onclick="advertiserIdRediect(adsyn = 919)">
                <video poster="./assests/adContent/cs/logo.png" src="../adsyndicationncloud.pages.dev/GBFimRnfifAMyzEDABX3Gbw7Vdh3bmdjAAAF.mp4" class="AdygfSyndicate_OnPageloadDiv-video65" autoplay="true"></video>
                <div class="advertiserImg_snapShot-firebaseSDK">
                    <div class="advertiserImg_snapShot-firebaseSD-innerdiv">
                        <img src="./assests/adContent/cs/logo.png" alt="advertiserLogo">
                        <span>The Chance Sports • Borella</span>
                    </div>
                    <div class="advertiserImg_snapShot-firebaseSD-innerdiv" style="width:max-content;justify-content:flex-end;padding:0 2.5%;">
                        <div class="timeOutCountDiv-TcttxXctdyckiju6rtcvd">3</div>
                        <span class="sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrFYTi">Visit</span>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('.AdygfSyndicate_OnPageloadDiv-video65').on('timeupdate', function () {
        var video = document.querySelector('.AdygfSyndicate_OnPageloadDiv-video65');
        if (!video) return;
        var dur = Math.floor(video.duration - video.currentTime);
        $('.timeOutCountDiv-TcttxXctdyckiju6rtcvd').html(dur);
    });

    $('.AdygfSyndicate_OnPageloadDiv-video65').on('ended', function () {
        $('.adSyndicateDiv_mediaOgAd').remove();
    });
}
