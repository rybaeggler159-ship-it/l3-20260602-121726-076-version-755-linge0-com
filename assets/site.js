
(function(){
  function qs(s,root){return (root||document).querySelector(s)}
  function qsa(s,root){return Array.prototype.slice.call((root||document).querySelectorAll(s))}
  function norm(s){return String(s||'').toLowerCase().trim()}
  document.addEventListener('DOMContentLoaded', function(){
    var toggle = qs('[data-menu-toggle]');
    var mobile = qs('[data-mobile-nav]');
    if(toggle && mobile){toggle.addEventListener('click', function(){mobile.classList.toggle('open')})}

    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dots button');
    if(slides.length){
      var index = 0;
      function show(i){
        index = (i + slides.length) % slides.length;
        slides.forEach(function(s,n){s.classList.toggle('active', n === index)});
        dots.forEach(function(d,n){d.classList.toggle('active', n === index)});
      }
      dots.forEach(function(d,n){d.addEventListener('click', function(){show(n)})});
      setInterval(function(){show(index+1)}, 5200);
      show(0);
    }

    var filterInput = qs('[data-filter-search]');
    var catSelect = qs('[data-filter-category]');
    var yearSelect = qs('[data-filter-year]');
    var empty = qs('[data-empty-state]');
    function applyFilter(){
      var q = norm(filterInput && filterInput.value);
      var cat = catSelect && catSelect.value;
      var year = yearSelect && yearSelect.value;
      var visible = 0;
      qsa('.movie-card').forEach(function(card){
        var hay = norm(card.getAttribute('data-search'));
        var ok = (!q || hay.indexOf(q) !== -1) && (!cat || card.getAttribute('data-category') === cat) && (!year || card.getAttribute('data-year') === year);
        card.classList.toggle('hidden-by-filter', !ok);
        if(ok) visible++;
      });
      if(empty){empty.classList.toggle('show', visible === 0)}
    }
    [filterInput,catSelect,yearSelect].forEach(function(el){ if(el){el.addEventListener('input', applyFilter); el.addEventListener('change', applyFilter)} });
    var params = new URLSearchParams(location.search);
    var qParam = params.get('q');
    if(qParam && filterInput){filterInput.value = qParam; applyFilter()} else { applyFilter(); }

    qsa('.player-box').forEach(function(box){
      var video = qs('video', box);
      var btn = qs('[data-play-button]', box);
      if(!video) return;
      var src = video.getAttribute('data-src');
      var hlsInstance = null;
      function load(){
        if(video.dataset.loaded === '1') return;
        video.dataset.loaded = '1';
        if(window.Hls && window.Hls.isSupported()){
          hlsInstance = new Hls({maxBufferLength:30, enableWorker:true});
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        }else if(video.canPlayType('application/vnd.apple.mpegurl')){
          video.src = src;
        }else{
          video.src = src;
        }
      }
      function start(){
        load();
        var p = video.play();
        if(p && typeof p.catch === 'function'){ p.catch(function(){ video.controls = true; }); }
      }
      if(btn){btn.addEventListener('click', start)}
      video.addEventListener('click', function(){ if(video.paused) start(); });
      video.addEventListener('play', function(){box.classList.add('is-playing')});
      video.addEventListener('pause', function(){ if(video.currentTime === 0){box.classList.remove('is-playing')} });
      window.addEventListener('beforeunload', function(){ if(hlsInstance){hlsInstance.destroy()} });
    });
  });
})();
