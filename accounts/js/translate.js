(function () {
  var INCLUDED = 'en,si,es,zh-CN,ta,hi,cs,ja,ru,fr';
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'litha_lang';
  var COOKIE_KEY = 'googtrans';
  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
  }
  function createHolder() {
    if (!document.getElementById('google_translate_element')) {
      var div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.position = 'fixed';
      div.style.left = '-9999px';
      div.style.top = '-9999px';
      document.body.appendChild(div);
    }
  }
  function applyCombo(lang, tries) {
    tries = tries || 0;
    var combo = document.querySelector('.goog-te-combo');
    if (!combo) {
      if (tries < 30) setTimeout(function () { applyCombo(lang, tries + 1); }, 500);
      return;
    }
    if (combo.value !== lang) {
      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
    }
    var label = document.querySelector('[data-litha-lang-label]');
    if (label) label.textContent = label.getAttribute('data-lang-label-' + (lang || 'en')) || (lang || 'EN').toUpperCase();
  }
  function setLanguage(lang) {
    if (!lang) lang = DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    document.body && document.body.setAttribute('data-lang', lang);
    setCookie(COOKIE_KEY, '/en/' + lang, 30);
    applyCombo(lang);
    setTimeout(function(){ try { location.reload(); } catch (e) {} }, 700);
  }
  function getStoredLanguage() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }
  window.googleTranslateElementInit = function () {
    createHolder();
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        autoDisplay: false,
        includedLanguages: INCLUDED,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
      applyCombo(getStoredLanguage());
    }
  };
  window.LithaTranslate = {
    setLanguage: setLanguage,
    getLanguage: getStoredLanguage,
    refresh: function () { applyCombo(getStoredLanguage()); }
  };
  document.addEventListener('DOMContentLoaded', function () {
    createHolder();
    var style = document.createElement('style');
    style.textContent = '.goog-te-banner-frame.skiptranslate,.goog-logo-link,.goog-te-gadget span{display:none!important;} body{top:0!important;}';
    document.head.appendChild(style);
    var script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  });
})();
