/* CG Akademi ortak küçük betik: geri sayım, haftanın konusu, bölüm listeleri, filtre, mağaza, örnek soru */
(function () {
  'use strict';
  var EXAM = '2027-02-21T10:00:00+03:00';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Geri sayım: data-countdown="days" | "full" */
  function countdown() {
    var end = new Date(EXAM).getTime();
    var els = document.querySelectorAll('[data-countdown]');
    if (!els.length) return;
    function tick() {
      var ms = Math.max(0, end - Date.now());
      var d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
      for (var i = 0; i < els.length; i++) {
        var mode = els[i].getAttribute('data-countdown');
        if (ms === 0) { els[i].textContent = mode === 'full' ? 'Sınav günü geldi' : '0'; continue; }
        els[i].textContent = mode === 'full' ? d + ' gün ' + h + ' saat' : String(d);
      }
    }
    tick();
    setInterval(tick, 60000);
  }

  /* Haftanın konusu: .weeks içindeki <i data-start data-end data-topic data-href> hücrelerinden */
  function thisWeek() {
    var strip = document.querySelector('[data-weeks]');
    if (!strip) return;
    var cells = strip.querySelectorAll('i');
    var now = Date.now(), cur = -1;
    for (var i = 0; i < cells.length; i++) {
      var s = new Date(cells[i].getAttribute('data-start') + 'T00:00:00+03:00').getTime();
      var e = new Date(cells[i].getAttribute('data-end') + 'T23:59:59+03:00').getTime();
      if (now > e) cells[i].classList.add('past');
      if (now >= s && now <= e) { cur = i; cells[i].classList.add('now'); }
    }
    var label = document.querySelector('[data-week-label]');
    var topic = document.querySelector('[data-week-topic]');
    if (!label || !topic) return;
    if (cur >= 0) {
      label.textContent = (cur + 1) + '. hafta / ' + cells.length + ' · ' + cells[cur].getAttribute('data-range');
      topic.textContent = cells[cur].getAttribute('data-topic');
    } else if (now < new Date(cells[0].getAttribute('data-start') + 'T00:00:00+03:00').getTime()) {
      label.textContent = 'Plan ' + cells[0].getAttribute('data-range').split('–')[0] + ' günü başlıyor';
      topic.textContent = cells[0].getAttribute('data-topic');
    } else {
      label.textContent = 'Plan tamamlandı';
      topic.textContent = 'Sınav haftası: dinlen, kısa tekrar yap';
    }
  }

  /* Alan sayfası bölüm listesi: <ol data-area="slug"> */
  function badge(b, alan) {
    if (b.yt) return '<a class="status live" href="https://www.youtube.com/watch?v=' + encodeURIComponent(b.yt) + '" target="_blank" rel="noopener">İzle</a>';
    if (b.durum === 'yayinda' && alan.liste_url) return '<span class="status live">Yayında</span>';
    return '<span class="status soon">Yakında</span>';
  }
  function renderArea(list, alan) {
    var html = '', grp = null, pl = ((alan.liste_url || '').match(/list=([\w-]+)/) || [])[1];
    alan.bolumler.forEach(function (b) {
      if (b.grup && b.grup !== grp) { grp = b.grup; html += '<li class="grp">' + esc(grp) + '</li>'; }
      var inner = '<span><span class="c">' + esc(b.kod) + '</span><span class="t">' + esc(b.baslik) + '</span></span>';
      if (b.yt) html += '<li><a class="ep" href="https://www.youtube.com/watch?v=' + encodeURIComponent(b.yt) + (pl ? '&list=' + pl : '') + '" target="_blank" rel="noopener"><img loading="lazy" src="https://i.ytimg.com/vi/' + encodeURIComponent(b.yt) + '/mqdefault.jpg" alt="">' + inner + '<span class="status live">▶ İzle</span></a></li>';
      else html += '<li><div class="ep"><div class="ph">Yakında</div>' + inner + '<span class="status soon">Yakında</span></div></li>';
    });
    list.innerHTML = html;
    var cnt = document.querySelector('[data-area-count]');
    if (cnt) cnt.textContent = String(alan.bolumler.length);
    var live = document.querySelector('[data-area-live]');
    if (live) live.textContent = String(alan.bolumler.filter(function (b) { return b.yt || b.durum === 'yayinda'; }).length);
  }
  function areas() {
    var list = document.querySelector('[data-area]');
    if (!list || !window.fetch) return;
    fetch('/data/ekys.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) return;
      var slug = list.getAttribute('data-area');
      var alan = (d.alanlar || []).filter(function (a) { return a.slug === slug; })[0];
      if (alan && alan.bolumler && alan.bolumler.length) renderArea(list, alan);
    }).catch(function () { /* statik liste kalır */ });
  }

  /* Kaynak filtresi */
  function filters() {
    var bar = document.querySelector('[data-filter-bar]');
    if (!bar) return;
    var items = document.querySelectorAll('[data-cat]');
    var empty = document.querySelector('[data-filter-empty]');
    bar.hidden = false;
    bar.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[data-filter]');
      if (!btn) return;
      var f = btn.getAttribute('data-filter'), shown = 0;
      bar.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      items.forEach(function (it) {
        var ok = f === 'tum' || (' ' + it.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* Mağaza: /data/magaza.json */
  function shop() {
    var grid = document.querySelector('[data-shop]');
    if (!grid || !window.fetch) return;
    var covers = { 'mevzuat': '', 'maarif-modeli': 'teal', 'tum': 'pale' };
    fetch('/data/magaza.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.urunler || !d.urunler.length) return;
      grid.innerHTML = d.urunler.map(function (u) {
        var onSale = u.durum === 'satista' && u.fiyat != null && u.shopier_url;
        var parts = String(u.ad).split(' ');
        var cls = covers[u.alan] != null ? covers[u.alan] : (u.alan === 'egitim-bilimleri' || u.alan === 'genel-kultur' ? 'teal' : '');
        var action = onSale
          ? '<span class="price">' + esc(u.fiyat) + ' TL</span><a class="btn primary sm" href="' + esc(u.shopier_url) + '" target="_blank" rel="noopener">Shopier ile güvenli satın al</a>'
          : '<span class="soon-note">Hazırlandığında burada duyurulacak</span>';
        return '<article class="product"><div class="cover ' + cls + '"><div class="covertext"><small>CG Akademi · ' + esc(u.bicim || 'PDF') + '</small>' + esc(parts.slice(0, 2).join(' ')) + '<br>' + esc(parts.slice(2).join(' ')) + '</div></div>' +
          '<div class="product-body"><span class="status ' + (onSale ? 'live' : 'soon') + '">' + (onSale ? 'Satışta' : 'Yakında') + '</span><h3>' + esc(u.ad) + '</h3><p>' + esc(u.aciklama) + '</p><div class="product-actions">' + action + '</div></div></article>';
      }).join('');
    }).catch(function () {});
  }

  /* Örnek soru */
  function quiz() {
    document.querySelectorAll('[data-quiz]').forEach(function (q) {
      var fb = q.querySelector('.feedback');
      var expl = q.getAttribute('data-explain');
      q.addEventListener('click', function (ev) {
        var b = ev.target.closest('.choice');
        if (!b) return;
        q.querySelectorAll('.choice').forEach(function (x) { x.classList.remove('correct', 'wrong'); x.removeAttribute('aria-pressed'); });
        var right = b.getAttribute('data-right') === 'true';
        b.classList.add(right ? 'correct' : 'wrong');
        b.setAttribute('aria-pressed', 'true');
        if (!right) q.querySelector('.choice[data-right="true"]').classList.add('correct');
        var letter = q.querySelector('.choice[data-right="true"]').textContent.trim().charAt(0);
        fb.innerHTML = (right ? '<b>Doğru.</b> ' : '<b>Doğru cevap ' + esc(letter) + '.</b> ') + esc(expl);
      });
    });
  }

  function init() {
    countdown(); thisWeek(); areas(); filters(); shop(); quiz();
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = String(new Date().getFullYear());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* Üst duyuru şeridi: ücretsiz örnek paket + Tam Paket */
(function(){try{if(/^\/(paket|ekys)\//.test(location.pathname))return;var b=document.createElement('div');b.className='promo-bar';b.innerHTML='🎁 <a href="/paket/">EKYS çıkmış sorulardan örnekler: ücretsiz PDF indir</a><span class="sep">·</span>📦 <a href="https://www.shopier.com/cgokulu/53098978" target="_blank" rel="noopener">Tam Paket (245 soru + 10 deneme) 599 TL</a>';document.body.insertBefore(b,document.body.firstChild);}catch(e){}})();
