//Copirights 2023 (c) @NCloud inc.
//All rights reserved.
docBlockS();
var currentAdParked_Linktree = 'https://greetmake.netlify.app';
var currentAdParked_Linktree1  = "https://wa.me/+94773030751?text=%F0%9F%91%8B%20Hey,%20I'm%20Interested%20To%20Buy%20Your%20Paintings.%20Show%20Me%20Some%20Photos.";
var currentAdParked_Linktree2  = 'https://www.daraz.lk/mobile-apps/?spm=a2a0e.home.header.dewallet.368e4625h8asaC';
const URLqueryString = window.location.search;
var urlParams = new URLSearchParams(URLqueryString);
var recvdFromW_nme = urlParams.get('from');
function checkFordoesListen(){
    if(!recvdFromW_nme){
        //doNothing
        
    }else{
    document.title += ' From ' + recvdFromW_nme;
    }
}
checkFordoesListen();


        $('.preLoaderAvrudu_Litha-cen').remove();

const TRACK_LIBRARY = [
    {
        title: 'ජන ගණ මන • වාද්‍ය වෘන්දය',
        creditLabel: 'Wikimedia Commons • Public domain',
        legalUrl: 'legal/music-and-media.html#jana-gana-mana',
        sources: [
            'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f3/Jana_Gana_Mana_%28instrumental%29_-_Indian_Armed_Forces_Orchestra.ogg/Jana_Gana_Mana_%28instrumental%29_-_Indian_Armed_Forces_Orchestra.ogg.mp3?download=',
            'https://upload.wikimedia.org/wikipedia/commons/f/f3/Jana_Gana_Mana_%28instrumental%29_-_Indian_Armed_Forces_Orchestra.ogg'
        ],
        fallback: '../media/track1.wav'
    },
    {
        title: 'කර්ණාටික බාංසුරි • Carnatic Flute',
        creditLabel: 'Wikimedia Commons • CC BY-SA 3.0',
        legalUrl: 'legal/music-and-media.html#carnatic-flute',
        sources: [
            'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0f/Carnatic_flute.ogg/Carnatic_flute.ogg.mp3?download=',
            'https://upload.wikimedia.org/wikipedia/commons/0/0f/Carnatic_flute.ogg'
        ],
        fallback: '../media/track2.wav'
    },
    {
        title: 'රාග තිලංග • Raga Tilanga',
        creditLabel: 'Wikimedia Commons • Public domain',
        legalUrl: 'legal/music-and-media.html#raga-tilanga',
        sources: [
            'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c1/Raga_Tilanga.ogg/Raga_Tilanga.ogg.mp3?download=',
            'https://upload.wikimedia.org/wikipedia/commons/c/c1/Raga_Tilanga.ogg'
        ],
        fallback: '../media/track3.wav'
    },
    {
        title: 'රාග භෛරව • Raga Bhairava',
        creditLabel: 'Wikimedia Commons • Public domain',
        legalUrl: 'legal/music-and-media.html#raga-bhairava',
        sources: [
            'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/73/Raga_Bhairava.ogg/Raga_Bhairava.ogg.mp3?download=',
            'https://upload.wikimedia.org/wikipedia/commons/7/73/Raga_Bhairava.ogg'
        ],
        fallback: '../media/track4.wav'
    },
    {
        title: 'භෛරවී • Meerut Raga Bhairavi',
        creditLabel: 'Wikimedia Commons • Public domain',
        legalUrl: 'legal/music-and-media.html#meerut-bhairavi',
        sources: [
            'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/df/Art_song_from_Meerut_Raga_Bhairavi_%281931%29.ogg/Art_song_from_Meerut_Raga_Bhairavi_%281931%29.ogg.mp3?download=',
            'https://upload.wikimedia.org/wikipedia/commons/d/df/Art_song_from_Meerut_Raga_Bhairavi_%281931%29.ogg'
        ],
        fallback: '../media/track5.wav'
    },
    {
        title: 'බාංසුරි • Sample 2',
        creditLabel: 'Wikimedia Commons • Public domain',
        legalUrl: 'legal/music-and-media.html#sample2-bansuri',
        sources: [
            'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1f/Sample2.ogg/Sample2.ogg.mp3?download=',
            'https://upload.wikimedia.org/wikipedia/commons/1/1f/Sample2.ogg'
        ],
        fallback: '../media/track6.wav'
    }
];

var currentTrackIndex = Math.floor(Math.random() * TRACK_LIBRARY.length);
var trackcounVar = currentTrackIndex + 1;
var currentTrack = TRACK_LIBRARY[currentTrackIndex];
var trackDta = {
    Wcolor: 'rgba(12, 12, 12, 0.918)',
    src: currentTrack.sources[0]
};

function setPlayerMeta(track){
    currentTrack = track;
    trackDta.src = track.sources[0];
    $('.avruduPlayerS-title').text(track.title);
    $('.avruduPlayer-tags_info').html('<span class="avruduPlayer-tags_info-headline">Legal: </span><a class="avruduPlayer-legal-link" href="' + track.legalUrl + '">Media credits & rights</a><span class="avruduPlayer-credit-inline"> • ' + track.creditLabel + '</span>');
}

function loadTrackItem(track){
    setPlayerMeta(track);
    var candidates = [];
    if (Array.isArray(track.sources)) {
        candidates = candidates.concat(track.sources);
    }
    if (track.fallback) {
        candidates.push(track.fallback);
    }
    var idx = 0;
    function tryNext(){
        if (idx >= candidates.length) {
            return;
        }
        var src = candidates[idx++];
        var probe = new Audio();
        probe.preload = 'metadata';
        probe.crossOrigin = 'anonymous';
        probe.addEventListener('canplaythrough', function(){
            try {
                wavesurfer.load(src);
            } catch (err) {
                tryNext();
            }
        }, { once:true });
        probe.addEventListener('error', function(){ tryNext(); }, { once:true });
        probe.src = src;
        probe.load();
    }
    tryNext();
}

var wavesurfer = WaveSurfer.create({
    container: '.media-prog',
    waveColor: trackDta.Wcolor,
    progressColor: trackDta.Wcolor,
    responsive:true,
    hideScrollbar: true,
    height:70,
    barGap:4,
    barHeight: .5,
    barMinHeight: .1,
    barRadius: 6,
    barWidth: 10,
    cursorWidth:2
  
  });

$(window).on('load',function(){
    requestAndShowPermission()
    function widthSetHeiht_01(i){
       i =  $('.now-happening-div').height();
    }
    widthSetHeiht_01();
    var loggedSet = sessionStorage.getItem('logged');
    if(!loggedSet){
        //do nothing
    }else{
        $('.bannerImag-main').remove();
    }
    loadTrackItem(currentTrack);
    
    $('.preLoaderAvrudu_Litha-cen').css({
        'opacity':'0%'
    });
    docUnlockS();
    this.setTimeout(nextStp, 300);
    function nextStp(){
        $('.preLoaderAvrudu_Litha-cen').remove();
    }

});
function requestAndShowPermission() {
    Notification.requestPermission(function (permission) {
        if (permission === "granted") {
            
        }
    });
}

var NowNekethaHappening = '🌞';
if(NowNekethaHappening == '🌞'){
   var  nextTextNekethaHappening  = " ආයුබෝවන්";
   var nextTextNekethaHappeningBody = 'ඔබට අවශ්‍ය පණිවිඩ අපි මෙසේ බෙදා දෙන්නෙමු';
}
function closebannerP(){
    $('.bannerImag-main').css({
        'opacity':'0%'
    });
    setTimeout(nextStp, 300);
    function nextStp(){
        $('.bannerImag-main').remove();
    }
    sessionStorage.setItem('logged', 1);
    
}
function closePopupF(){
    $('.lithaContent-Pop-up-cen').css({
        'opacity':'0%'
    });
    setTimeout(nextStp, 300);
    function nextStp(){
        $('.lithaContent-Pop-up-cen').css({
            'visibility':'hidden'
        });
    }
    docUnlockS();
    $('.header').css({
            
            
        '-webkit-backdrop-filter':'blur(6px)',
       'backdrop-filter':'blur(6px)',
       'background-image':'linear-gradient(65deg,rgba(255, 94, 0, 0.562),rgba(247, 243, 0, 0.596))',
       'width':'95%',
       'border-radius':'0 0 1rem 1rem'
   
          });
}
var playStatus = 0;
function avruduplayer_play(){
    if(playStatus == 0){
        playStatus =1;
         
        if(wavesurfer.isPlaying() == false){
        document.querySelector('.avruduPlayer-plybtn').innerHTML = ' <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>';
            wavesurfer.play();
             document.querySelector('.avruduPlayer-plybtn').innerHTML = '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5zm3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5z"/>';
        }else{
            document.querySelector('.avruduPlayer-plybtn').innerHTML = '  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>';
        
        }
       

      
    }else{
        playStatus=0;
        wavesurfer.pause();
        document.querySelector('.avruduPlayer-plybtn').innerHTML = ' <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>';
    }
    
}

function listenTrackEnd(){
   
    wavesurfer.on('finish', function(){
        document.querySelector('.avruduPlayer-plybtn').innerHTML = ' <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>';
        
});

}
listenTrackEnd();

function avruduplayer_next(){
    playStatus = 0;
    wavesurfer.pause();
    wavesurfer.setCurrentTime(0);
    document.querySelector('.avruduPlayer-plybtn').innerHTML = ' <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>';
    currentTrackIndex = (currentTrackIndex + 1) % TRACK_LIBRARY.length;
    trackcounVar = currentTrackIndex + 1;
    loadTrackItem(TRACK_LIBRARY[currentTrackIndex]);
}

function setPropertyRoot(defBannerimg){
    var f = calcRand();
    function calcRand(min=1, max=2, hg){
       hg=  Math.floor(Math.random() * (max - min + 1)) + min;
       return hg;

    }
    $(`body`).get(0).style.setProperty('--defBannerimg', 'url(assests/img/banner'+f+'.png)');
    $(`body`).get(0).style.setProperty('--defBannerimg_', 'url(assests/img/banner'+f+'_.png)');
}
setPropertyRoot();
var headerHeight = $('.header').height();

$(window).scroll(function() {

   if(window.scrollY === 0){
    $('.header').css({
        'position': '',
        'top': '',
        '-webkit-backdrop-filter':'',
        'backdrop-filter':'',
        'background-image':'',
        'width':'100%'   ,
        'border-radius':'0'

       });
       $('.allCont').css({
        'margin-top':''
    });
    
    
   }else{
    $('.header').css({
        'position': 'fixed',
        'top': '0',
        '-webkit-backdrop-filter':'blur(6px)',
        'backdrop-filter':'blur(6px)',
        'background-image':'linear-gradient(65deg,rgba(255, 94, 0, 0.562),rgba(247, 243, 0, 0.596))',
        'width':'95%',
        'border-radius':'0 0 1rem 1rem'
       });
       $('.allCont').css({
        'margin-top':headerHeight
    });
   }



 });

//Mission
var lithaN= {
    nawasanda:{
        event:"නව සඳ බැලීම",
        year:"2026",
        month:"අප්‍රේල්",
        date:"11",
        dtt:"සෙනසුරාදා",
        img:"assests/neketh-vectors/nawasanda.png",
        occ:'4/11/2026',
        time_h:'00',
        time_m:'00',
        afterK:'අප්‍රේල් මස 11 වැනි සෙනසුරාදා දින නව සඳ බලනු මැනවි.'
    },
    snanaya:{
        event:"පරණ අවුරුද්ද සඳහා ස්නානය",
        year:"2026",
        month:"අප්‍රේල්",
        date:"13",
        dtt:"සඳුදා",
        time_h:'07',
        time_m:'00',
        afterK:"අප්‍රේල් මස 13 වැනි සඳුදා දින පරණ අවුරුද්ද සඳහා ස්නානය කොට අලුත් අවුරුද්ද සඳහා සූදානම් වීම මැනවි.",
        img:"assests/neketh-vectors/snanaya.png",
        occ:'4/13/2026'
    },
    udawa:{
        event:"අලුත් අවුරුදු උදාව",
        year:"2026",
        month:"අප්‍රේල්",
        date:"14",
        dtt:"අඟහරුවාදා",
        time_h:"09",
        time_m:"32",
        time_z:"පූර්ව භාග",
        afterK:"අප්‍රේල් මස 14 වැනි අඟහරුවාදා දින පෙ.ව. 9.32 ට සිංහල හා දෙමළ අලුත් අවුරුද්ද උදාවේ.",
        img:"./assests/neketh-vectors/udawa.png",
        occ:'4/14/2026'
    },
    nona:{
        event:"පුණ්‍ය කාලය",
        year:"2026",
        month:"අප්‍රේල්",
        date:"14",
        dtt:"අඟහරුවාදා",
        time_h:"03",
        time_m:"08",
        time_z:"පූර්ව භාග",
        afterK:"අප්‍රේල් මස 14 වැනි අඟහරුවාදා දින පෙ.ව. 3.08 සිට ප.ව. 3.56 දක්වා පුණ්‍ය කාලය බැවින් ආගමික වතාවත් වල යෙදීම මැනවි.",
        img:"assests/neketh-vectors/nonagathaya.png",
        occ:'4/14/2026'
    },
    mealP:{
        event:"ආහාර පිසීම",
        year:"2026",
        month:"අප්‍රේල්",
        date:"14",
        dtt:"අඟහරුවාදා",
        time_h:"10",
        time_m:"51",
        time_z:"පූර්ව භාග",
        afterK:"අප්‍රේල් මස 14 වැනි අඟහරුවාදා දින පෙ.ව. 10.51 ට ආහාර පිසීම මැනවි.",
        img:"assests/neketh-vectors/mealM.png",
        occ:'4/14/2026'
    },
    wadaA:{
        event:"වැඩ ඇල්ලීම ගනුදෙනු කිරීම හා ආහාර අනුභවය",
        year:"2026",
        month:"අප්‍රේල්",
        date:"14",
        dtt:"අඟහරුවාදා",
        time_h:"12",
        time_m:"06",
        time_z:"මධ්‍යහ්න",
        afterK:"අප්‍රේල් මස 14 වැනි අඟහරුවාදා දින දහවල් 12.06 ට වැඩ ඇල්ලීම, ගනුදෙනු කිරීම හා ආහාර අනුභවය මැනවි.",
        img:"assests/neketh-vectors/aharaA.png",
        occ:'4/14/2026'
    },
    OilG:{
        event:"හිසතෙල් ගෑම",
        year:"2026",
        month:"අප්‍රේල්",
        date:"15",
        dtt:"බදාදා",
        time_h:"06",
        time_m:"55",
        time_z:"පූර්ව භාග",
        afterK:"අප්‍රේල් මස 15 වැනි බදාදා දින පෙ.ව. 6.55 ට හිසතෙල් ගෑම මැනවි.",
        img:"assests/neketh-vectors/hisathel.png",
        occ:'4/15/2026'
    },
    GFWork:{
        event:"රැකී රක්ෂා සඳහා පිටත්ව යාම",
        year:"2026",
        month:"අප්‍රේල්",
        date:"20",
        dtt:"සඳුදා",
        time_h:"06",
        time_m:"27",
        time_z:"පූර්ව භාග",
        afterK:"අප්‍රේල් මස 20 වැනි සඳුදා දින පෙ.ව. 6.27 ට දකුණු දිශාව බලා හෝ පෙ.ව. 6.50 ට නැගෙනහිර දිශාව බලා රැකී රක්ෂා සඳහා පිටත්ව යාම මැනවි.",
        img:"assests/neketh-vectors/wadaA.png",
        occ:'4/20/2026'
    }
}

var word = '.lithaContent-';

    $(word+'h31').text(lithaN.nawasanda.event) ;
    $(word+'h32').text(lithaN.snanaya.event) ;
    $(word+'h33').text(lithaN.udawa.event) ;
    $(word+'h34').text(lithaN.nona.event) ;
    $(word+'h35').text(lithaN.mealP.event) ;
    $(word+'h36').text(lithaN.wadaA.event) ;
    $(word+'h37').text(lithaN.OilG.event) ;
    $(word+'h38').text(lithaN.GFWork.event) ;
    
    $(word+'date1').text(lithaN.nawasanda.dtt) ;
    $(word+'date2').text(lithaN.snanaya.dtt) ;
    $(word+'date3').text(lithaN.udawa.dtt) ;
    $(word+'date4').text(lithaN.nona.dtt) ;
    $(word+'date5').text(lithaN.mealP.dtt) ;
    $(word+'date6').text(lithaN.wadaA.dtt) ;
    $(word+'date7').text(lithaN.OilG.dtt) ;
    $(word+'date8').text(lithaN.GFWork.dtt) ;

    $(word+'timerange1').text(nontxtL) ;
    $(word+'timerange2').text(nontxtL) ;
    $(word+'timerange3').text(lithaN.udawa.time_z +' '+ lithaN.udawa.time_h +':'+ lithaN.udawa.time_m) ;
    $(word+'timerange4').text(lithaN.nona.time_z +' '+ lithaN.nona.time_h +':'+  lithaN.nona.time_m );
    $(word+'timerange5').text(lithaN.mealP.time_z +' '+ lithaN.mealP.time_h +':'+ lithaN.mealP.time_m) ;
    $(word+'timerange6').text(lithaN.wadaA.time_z +' '+ lithaN.wadaA.time_h +':'+ lithaN.wadaA.time_m) ;
    $(word+'timerange7').text(lithaN.OilG.time_z +' '+ lithaN.OilG.time_h  +':'+  lithaN.OilG.time_m);
    $(word+'timerange8').text(lithaN.GFWork.time_z +' '+lithaN.GFWork.time_h +':'+ lithaN.GFWork.time_m) ;



var nontxtL = 'දවස පුරා'

document.querySelector('body').onselectstart = function (){
    return false; 
   }
   var lithaPopStatus= 0;
function lithaPopVisible(){
    if(lithaPopStatus == 0){
        $('.lithaContent-Pop-up-cen').css({
            'visibility':'visible',
            'opacity':'100%'
         });
         lithaPopStatus=1;
         docBlockS();
         $('.header').css({
            
            
            'backdrop-filter':'',
            'background-image':'',
            'width':'100%'   ,
            'border-radius':'0'
    
           });
         
         
    }else{
        $('.lithaContent-Pop-up-cen').css({
       
       'opacity':'0%'
    }); 
    setTimeout(nextStp, 300);
    function nextStp(){
        $('.lithaContent-Pop-up-cen').css({
            'visibility':'hidden'
        });
        lithaPopStatus=0;
        docUnlockS();
        $('.header').css({
            
            
         '-webkit-backdrop-filter':'blur(6px)',
        'backdrop-filter':'blur(6px)',
        'background-image':'linear-gradient(65deg,rgba(255, 94, 0, 0.562),rgba(247, 243, 0, 0.596))',
        'width':'95%',
        'border-radius':'0 0 1rem 1rem'
    
           });
        
    }
}}
$('.lithaContent-box').on('click', function(){
    lithaPopVisible();
    AdygfSyndicate_OnPageload();
    var elmIdBox =  this.id;
    var eventValue = lithaN[elmIdBox].event;
    var pContentValue = lithaN[elmIdBox].afterK;
    var headLnpContentValue = lithaN[elmIdBox].year +' '+ lithaN[elmIdBox].month + ' මස ' + lithaN[elmIdBox].date+' වැනි ' +lithaN[elmIdBox].dtt;
    var displayImg = lithaN[elmIdBox].img;
    $('.lithaContainer-HeadText-pop').text(eventValue);
    $('.lithaContent-more-pop-p').text(pContentValue);
    $('.lithaContent-more-pop-h3-headline').text(headLnpContentValue);
    $('.bannerImg-popBox').attr('src', displayImg);
});
function docBlockS(){
    $('body').css({
        'overflow-y':'scroll',

    });
}
function docUnlockS(){
     $('body').css({
        'overflow-y':'scroll',

    });
}
function randomSVal_gen(min = 1, max = 9) {
    let difference = max - min;

        let rand = Math.random();
    rand = Math.floor( rand * difference);
    rand = rand + min;

    return rand;
    
}
if(trackcounVar == 1){
    $('.avruduPlayerS-title').text('අවුරුද්ද ඇවිල්ලා..')
}else if(trackcounVar ==2){
    $('.avruduPlayerS-title').text('සිරිලක පිරි අවුරුදු සිරි මෙි..')
}else if(trackcounVar ==3){
    $('.avruduPlayerS-title').text('සුභ සිහිනේ යාවී..')
}else if(trackcounVar ==4){
    $('.avruduPlayerS-title').text('මධුර වසන්තේ...')
}else if(trackcounVar ==5){
    $('.avruduPlayerS-title').text('අවුරුදු සංගීතය')
}else if(trackcounVar ==6){
    $('.avruduPlayerS-title').text('බැද්ද පුරා සුදු රෙද්ද...')
}else if(trackcounVar ==7){
    $('.avruduPlayerS-title').text('එරබදු මල් පිපිලා...')
}else if(trackcounVar ==8){
    $('.avruduPlayerS-title').text('දෙව් පුර ඇතෙකි...')
}
//<a href="whatsapp://send?litha.pages.dev%20•%20අවුරුදු%20නැකත්%20ලිත%202023">
//<a href="sms://+14035550185?body=I%27m%20interested%20in%20your%20product.%20Please%20contact%20me.">Send a SMS message</a>
//https://twitter.com/intent/tweet?url=http%3A%2F%2Fcss-tricks.com%2F&text=Tips%2C+Tricks%2C+and+Techniques+on+using+Cascading+Style+Sheets.&hashtags=css,html
var shareVoidOpenStatus = 0
function openShareVoid(){
    if(shareVoidOpenStatus==0){
        shareVoidOpenStatus=1;
        docBlockS();
        $('.shareVoid-container-cen').css({
            'opacity':'100%',
            'visibility':'visible'
        });
        $('.header').css({
            
            
            'backdrop-filter':'',
            'background-image':'',
            'width':'100%'   ,
            'border-radius':'0'
    
           });

        $('.shareBtn-header svg').html('<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>');
        $('.shareBtn-header h3').text('Close');
       
    }else{
        shareVoidOpenStatus=0
        $('.shareVoid-container-cen').css({
            'opacity':'0%'
        });
        setTimeout(nextStp, 300);
        function nextStp(){
            $('.shareVoid-container-cen').css({
                'visibility':'hidden'
            });
            $('.header').css({
            
            
                '-webkit-backdrop-filter':'blur(6px)',
               'backdrop-filter':'blur(6px)',
               'background-image':'linear-gradient(65deg,rgba(255, 94, 0, 0.562),rgba(247, 243, 0, 0.596))',
               'width':'95%',
               'border-radius':'0 0 1rem 1rem'
           
                  });
        $('.shareBtn-header svg').html('<path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>');
        $('.shareBtn-header h3').text('Share');
        docUnlockS();
    }
}}
var urlSearchNameValue  = 'SomeOne';
$('.shareWyN-input').on('click', function(){
    $('.shareWyN-div-right').css({
            'opacity':'100%'
           });
    $('.shareWyN-input').css({
     'text-align':'left'
    });
    
});
function sendUrlSearchParam_Name(){
    if(!document.querySelector('.shareWyN-input').value){
        //do nothing
    }else{
       urlSearchNameValue=  document.querySelector('.shareWyN-input').value;
       $('.shareWyN-div-right').css({
        'opacity':'50%'
       })
       $('.shareWyN-input').css({
        'text-align':'center'
       });


    }
    if(document.querySelector('.shareWyN-input').value.length > 14){
        window.close();
    }
}
function twitterShareVoid(){
    window.open('https://twitter.com/intent/tweet?url=..%2FLitha2024-main%2Findex.html&text=ලිත+2026+•+Now+On+Web!+Share+Now.&hashtags=avrudu,SriLanka');

}
function smsShareVoid(){
    window.open('sms://+94760304894?body=../Litha2024-main/index.html');
}
function waShareVoid(){
    window.open('https://wa.me/?text=../Litha2024-main/index.html');
}
function fbShareVoid(){
    window.open('https://www.facebook.com/sharer/sharer.php?u=../Litha2024-main/index.html');
}
var shareVoidStatusclz = 0
function shareVoidClz(){
    if(shareVoidStatusclz==0){
        shareVoidStatusclz=1;
        docUnlockS();
        $('.shareVoid-container-cen').css({
            'opacity':'0%'
        });
        $('.header').css({
            
            
            '-webkit-backdrop-filter':'blur(6px)',
           'backdrop-filter':'blur(6px)',
           'background-image':'linear-gradient(65deg,rgba(255, 94, 0, 0.562),rgba(247, 243, 0, 0.596))',
           'width':'95%',
           'border-radius':'0 0 1rem 1rem'
       
              });
        setTimeout(nextStp, 300);
        function nextStp(){
            $('.shareVoid-container-cen').css({
                'visibility':'hidden'
            });
    }}else{
        shareVoidStatusclz=0;
        $('.header').css({
            
            
            'backdrop-filter':'',
            'background-image':'',
            'width':'100%'   ,
            'border-radius':'0'
    
           });
        $('.shareVoid-container-cen').css({
            'opacity':'100%',
            'visibility':'visible'
        });
        docBlockS();
    }
}
var placeVarTo
var values;
setInterval(function() {
const date1 = new Date(lithaN.nawasanda.occ);
const date2 = new Date(lithaN.snanaya.occ);
const date3 = new Date(lithaN.udawa.occ);
const date4 = new Date(lithaN.nona.occ);
const date5 = new Date(lithaN.mealP.occ);
const date6 = new Date(lithaN.wadaA.occ);
const date7 = new Date(lithaN.OilG.occ);
const date8 = new Date(lithaN.GFWork.occ);
const today = new Date();
date1.setHours(lithaN.GFWork.time_h);
date1.setMinutes(lithaN.GFWork.time_m);
date2.setHours(lithaN.snanaya.time_h);
date2.setMinutes(lithaN.snanaya.time_m);
date3.setHours(lithaN.udawa.time_h);
date3.setMinutes(lithaN.udawa.time_m);
date4.setHours(lithaN.nona.time_h);
date4.setMinutes(lithaN.nona.time_m);
date5.setHours(lithaN.mealP.time_h);
date5.setMinutes(lithaN.mealP.time_m);
date6.setHours(lithaN.wadaA.time_h);
date6.setMinutes(lithaN.wadaA.time_m);
date7.setHours(lithaN.OilG.time_h);
date7.setMinutes(lithaN.OilG.time_m);
date8.setHours(lithaN.GFWork.time_h);
date8.setMinutes(lithaN.GFWork.time_m);
values ={
    nawasanda : Math.abs(date1 - today),
    snanaya : Math.abs(date2 - today),
    udawa : Math.abs(date3 - today),
    nona : Math.abs(date4 - today),
    mealP : Math.abs(date5 - today),
    wadaA : Math.abs(date6 - today),
    OilG : Math.abs(date7 - today),
    GFWork : Math.abs(date8 - today)
}

placeVarTo = Object.keys(values).sort(function(date1,date2){return values[date1]-values[date2]})[0];
var valueToVar= Math.min(values.nawasanda,values.snanaya, values.udawa, values.nona, values.mealP, values.wadaA,values.OilG, values.GFWork )
valueToVarHappening = valueToVar;
placeToVarNow_Happening = placeVarTo; 

/*const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
const diffHrs = Math.ceil(diffTime / (1000 * 60 * 60 ));
const diffMins = Math.ceil(diffTime / (1000 *60));
const diffSecs = Math.ceil(diffTime *1000);
console.log(diffTime + " milliseconds " + diffSecs+ ' seconds '+ diffMins+ ' minitues '+ diffHrs + 'hrs '+ diffDays+ ' days');*/

if(placeToVarNow_Happening == 'nawasanda'){
    $('.now-happening-div-title-h3').text(lithaN.nawasanda.event);
    $('.now-happening-div-details-p').text(lithaN.nawasanda.year + ' '+ lithaN.nawasanda.month+ ' මස '+ lithaN.nawasanda.date+ ' වන '+ lithaN.nawasanda.dtt + ' '+ lithaN.nawasanda.afterK);
    $('.now-happening-div-title-img').css({
        'background-image':'url('+lithaN.nawasanda.img+')'
    });
    NowNekethaHappening = lithaN.nawasanda.event
    
}
if(placeToVarNow_Happening == 'snanaya'){
    $('.now-happening-div-title-h3').text(lithaN.snanaya.event);
    $('.now-happening-div-details-p').text(lithaN.snanaya.year + ' '+ lithaN.snanaya.month+ ' මස '+ lithaN.snanaya.date+ ' වන '+ lithaN.snanaya.dtt + ' '+ lithaN.snanaya.afterK);
    $('.now-happening-div-title-img').css({
        'background-image':'url('+lithaN.snanaya.img+')'
    });
    NowNekethaHappening = lithaN.snanaya.event
}
if(placeToVarNow_Happening == 'udawa'){
    $('.now-happening-div-title-h3').text(lithaN.udawa.event);
    $('.now-happening-div-details-p').text(lithaN.udawa.year + ' '+ lithaN.udawa.month+ ' මස '+ lithaN.udawa.date+ ' වන '+ lithaN.udawa.dtt + ' '+ lithaN.udawa.afterK);
    $('.now-happening-div-title-img').css({
        'background-image':'url('+lithaN.udawa.img+')'
    });
    NowNekethaHappening = lithaN.udawa.event
}
if(placeToVarNow_Happening == 'nona'){
    $('.now-happening-div-title-h3').text(lithaN.nona.event);
    $('.now-happening-div-details-p').text(lithaN.nona.year + ' '+ lithaN.nona.month+ ' මස '+ lithaN.nona.date+ ' වන '+ lithaN.nona.dtt + ' '+ lithaN.nona.afterK);
    $('.now-happening-div-title-img').css({
        'background-image':'url('+lithaN.nona.img+')'
    });
    NowNekethaHappening = lithaN.nona.event
}
if(placeToVarNow_Happening == 'mealP'){
    $('.now-happening-div-title-h3').text(lithaN.mealP.event);
    $('.now-happening-div-details-p').text(lithaN.mealP.year + ' '+ lithaN.mealP.month+ ' මස '+ lithaN.mealP.date+ ' වන '+ lithaN.mealP.dtt + ' '+ lithaN.mealP.afterK);
    $('.now-happening-div-title-img').css({
        'background-image':'url('+lithaN.mealP.img+')'
    });
    NowNekethaHappening = lithaN.mealP.event
}
if(placeToVarNow_Happening == 'wadaA'){
    $('.now-happening-div-title-h3').text(lithaN.wadaA.event);
    $('.now-happening-div-details-p').text(lithaN.wadaA.year + ' '+ lithaN.wadaA.month+ ' මස '+ lithaN.wadaA.date+ ' වන '+ lithaN.wadaA.dtt + ' '+ lithaN.wadaA.afterK);
    $('.now-happening-div-title-img').css({
        'background-image':'url('+lithaN.wadaA.img+')'
    });
    NowNekethaHappening = lithaN.wadaA.event
}
if(placeToVarNow_Happening == 'OilG'){
    $('.now-happening-div-title-h3').text(lithaN.OilG.event);
    $('.now-happening-div-details-p').text(lithaN.OilG.date + ' '+ lithaN.OilG.month+ ' මස '+ lithaN.OilG.date+ ' වන '+ lithaN.OilG.dtt + ' '+ lithaN.OilG.afterK);
    $('.now-happening-div-title-img').css({
        'background-image':'url('+lithaN.OilG.img+')'
    });
    NowNekethaHappening = lithaN.OilG.event
}
if(placeToVarNow_Happening == 'GFWork'){
    $('.now-happening-div-title-h3').text(lithaN.GFWork.event);
    $('.now-happening-div-details-p').text(lithaN.GFWork.date + ' '+ lithaN.GFWork.month+ ' මස '+ lithaN.GFWork.date+ ' වන '+ lithaN.GFWork.dtt + ' '+ lithaN.GFWork.afterK);
    $('.now-happening-div-title-img').css({
        'background-image':'url('+lithaN.GFWork.img+')'
    });
    NowNekethaHappening = lithaN.GFWork.event
}
var dys = Math.floor(valueToVarHappening / 86400000); 
var hrs = Math.floor(valueToVarHappening % 86400000 / 3600000);
var mins = Math.floor(valueToVarHappening % 3600000 / 60000) ;
var secs = Math.floor(valueToVarHappening % 60000 / 1000);
$('.nowKeeping-timer-day span').text(dys);
$('.nowKeeping-timer-hr span').text(hrs);
$('.nowKeeping-timer-min span').text(mins);
$('.nowKeeping-timer-sec span').text(secs);
}, 1000)
var placeToVarNow_Happening;
var valueToVarHappening;

setInterval(function(e){
    
    if(valueToVarHappening<10000){
 
        e = 1;
    
       
        
    
    }else if(valueToVarHappening>10000){
        if(e ==1){
            values[placeToVarNow_Happening] =0;
       lithaN[placeVarTo].occ = 0;
       e =0;
        }else{

        }
       
        
        
    }
    
},2000);
function adRedirect(){
    window.open(currentAdParked_Linktree);
}

function adRedirectFb(){
    window.open(currentAdParked_Linktree1);
}
function adRedirectdzAd(){
    window.open(currentAdParked_Linktree2);
}
function navBar_Onhover(){
    var valrefind;
    var valactualbase ={
        '-1':'cen-cenAnim-vctualheader_a 500ms 1',
        '0': 'cen-cenAnim-vctualheader_a 500ms 1',
        '+1':'cen-cenAnim-vctualheader_a 500ms  1'
    };
    $('.navBar-button').on('click mousedown touchstart', function(event){
        $('.navBar-button').removeClass('activeElemntNowGoinOn_hover-heared-top-buttonCaseHndler');
        valrefind = $(this).attr('data-colid');
        if(valrefind == '-1'){
            $(this).css({'animation':valactualbase["-1"]});
            $('.lithaContent-page-swap-div').css({
                'justify-content':'flex-start',
            })
            $('.lithaQ-box-parody').eq(0).css({
                'height':'80vh'
            })

        }else if(valrefind == '0'){
            $(this).css({'animation':valactualbase["0"]});
            $('.lithaContent-page-swap-div').css({
                'justify-content':'center',
            });
            $('.lithaQ-box-parody').eq(0).css({
                'height':'max-content'
            })

        }
        else{
            $(this).css({'animation':valactualbase["+1"]});
            $('.lithaContent-page-swap-div').css({
                'justify-content':'flex-end',
            });
            $('.lithaQ-box-parody').eq(0).css({
                'height':'max-content'
            })
        }
        
        $(this).addClass('activeElemntNowGoinOn_hover-heared-top-buttonCaseHndler');
    });
   
}
navBar_Onhover();
var IUufuv_at = 0;
function closeStickerAdOverlay(){ $('.lithaStickerAdOverlay').remove(); IUufuv_at = 0; sessionStorage.setItem('lithaStickerAdShown','1'); }
function stickerMakerL(){
    if (sessionStorage.getItem('lithaStickerAdShown') === '1') {
        if ($('.lithaStickerAdOverlay').length) { closeStickerAdOverlay(); }
        return;
    }
    if (IUufuv_at === 0){
        $('body').append(`<div class="lithaStickerAdOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;">
            <div style="width:min(92vw,720px);background:#fff;border-radius:1rem;overflow:hidden;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.35);">
                <button type="button" onclick="closeStickerAdOverlay()" style="position:absolute;top:.75rem;right:.75rem;z-index:2;border:0;background:#111;color:#fff;border-radius:999px;width:2rem;height:2rem;cursor:pointer;">×</button>
                <iframe src="../adsyndicationncloud.pages.dev/banner.gif" style="width:100%;height:70vh;border:0;display:block;" draggable="false"></iframe>
            </div>
        </div>`);
        IUufuv_at = 1;
    } else {
        closeStickerAdOverlay();
    }
}
var JFGUfFUFfifu = 0;
function AdygfSyndicate_OnPageload(y,u){
        
        if(JFGUfFUFfifu==1){
            $('.lithaContainer-pop-up-box-headlineAdSyn').remove();
            JFGUfFUFfifu =0;
        }else{
            $('.AdygfSyndicate_OnPageloadDiv-cen').append('<div class="lithaContainer-pop-up-box-headlineAdSyn adsByNCloud-div-visible-overlayB" role="button"></div>')
            JFGUfFUFfifu =1;
        }
    
    
    //prg/djd/*dd
}

if (window.LithaTranslate && window.LithaTranslate.refresh) { setTimeout(function(){ window.LithaTranslate.refresh(); }, 1200); }
