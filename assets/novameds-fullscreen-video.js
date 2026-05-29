(function () {
  'use strict';

  var section = document.querySelector('[data-nm-fsvideo]');
  if (!section) return;

  var video = section.querySelector('.nm-fsvideo__video');
  var iframe = section.querySelector('[data-nm-fsvideo-yt]');
  var btn = section.querySelector('[data-nm-fsvideo-sound]');
  var shouldAutoplay = section.getAttribute('data-autoplay') !== 'false';

  function ensureVideoPlays() {
    if (!video || !shouldAutoplay) return;
    video.muted = true;
    video.setAttribute('playsinline', '');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (video) {
    if (video.readyState >= 2) {
      ensureVideoPlays();
    } else {
      video.addEventListener('loadeddata', ensureVideoPlays, { once: true });
      video.addEventListener('canplay', ensureVideoPlays, { once: true });
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) ensureVideoPlays();
    });
  }

  if (!btn || section.getAttribute('data-enable-sound') === 'false') return;

  var iconOff = btn.querySelector('.nm-fsvideo__sound-icon--off');
  var iconOn = btn.querySelector('.nm-fsvideo__sound-icon--on');
  var isOn = false;

  function setUi(on) {
    isOn = on;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    if (iconOff) iconOff.hidden = on;
    if (iconOn) iconOn.hidden = !on;
  }

  function unmuteHtmlVideo() {
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    ensureVideoPlays();
  }

  function muteHtmlVideo() {
    if (!video) return;
    video.muted = true;
  }

  function sendYtCommand(func, args) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: func, args: args || [] }),
      '*'
    );
  }

  if (iframe) {
    iframe.addEventListener('load', function () {
      sendYtCommand('listening');
    });
  }

  function unmuteYouTube() {
    sendYtCommand('unMute');
    sendYtCommand('setVolume', [100]);
  }

  function muteYouTube() {
    sendYtCommand('mute');
  }

  btn.addEventListener('click', function () {
    if (isOn) {
      if (video) muteHtmlVideo();
      if (iframe) muteYouTube();
      setUi(false);
      return;
    }

    if (video) unmuteHtmlVideo();
    if (iframe) unmuteYouTube();
    setUi(true);
  });
})();
