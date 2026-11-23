/* CG Akademi ortak küçük betik: tema, geri sayım, haftanın konusu, bölüm listeleri, filtre, mağaza, örnek soru, net hesaplama */

/* Tema: varsayılan açık kitap teması; koyu tema yalnız kullanıcı seçerse */
(function () {
  'use strict';
  var KEY = 'cg-tema', root = document.documentElement;
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* gizli mod vb. */ } }
  function initial() {
    var s = stored();
    return s === 'dark' ? 'dark' : 'light';
  }
  function apply(t) {
    root.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#17110C' : '#F7F3EB');
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', t === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç');
      btn.title = btn.getAttribute('aria-label');
    }
  }
  apply(initial());
  function mount() {
    var nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('.theme-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.innerHTML = '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      save(next); apply(next);
    });
    var end = document.createElement('div');
    end.className = 'nav-end';
    var cta = nav.querySelector('.nav-cta'), mnav = nav.querySelector('.mnav');
    nav.appendChild(end);
    if (cta) end.appendChild(cta);
    end.appendChild(btn);
    if (mnav) end.appendChild(mnav);
    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

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

  /* Canlı sınav geri sayımı: <div data-exam-cd="2027-07-18T00:00:00+03:00"> içinde [data-u=d|h|m|s] */
  function examCountdowns() {
    var boxes = document.querySelectorAll('[data-exam-cd]');
    if (!boxes.length) return;
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var now = Date.now();
      for (var i = 0; i < boxes.length; i++) {
        var end = Date.parse(boxes[i].getAttribute('data-exam-cd'));
        if (isNaN(end)) continue;
        var ms = Math.max(0, end - now), s = Math.floor(ms / 1000);
        var v = { d: Math.floor(s / 86400), h: pad(Math.floor(s % 86400 / 3600)), m: pad(Math.floor(s % 3600 / 60)), s: pad(s % 60) };
        var us = boxes[i].querySelectorAll('[data-u]');
        for (var j = 0; j < us.length; j++) us[j].textContent = String(v[us[j].getAttribute('data-u')]);
        var done = boxes[i].querySelector('[data-cd-done]');
        if (done) done.hidden = ms > 0;
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  /* Telefon önizlemesi: sekmeler ve günlük hedef listesi (cihazda saklanır) */
  function phone() {
    document.querySelectorAll('[data-phone]').forEach(function (ph) {
      var tabs = ph.querySelectorAll('[role=tab]');
      function select(tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          var p = document.getElementById(t.getAttribute('aria-controls'));
          if (p) p.hidden = !on;
        });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var k = e.key, n = null;
          if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
          if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
          if (n) { e.preventDefault(); select(n); n.focus(); }
        });
      });
      var day = new Date().toISOString().slice(0, 10);
      ph.querySelectorAll('[data-goals]').forEach(function (g) {
        var key = 'cg-hedef-' + g.getAttribute('data-goals') + '-' + day;
        var boxes = g.querySelectorAll('input[type=checkbox]');
        var state = [];
        try { state = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { state = []; }
        function upd() {
          var done = 0, arr = [];
          boxes.forEach(function (b, i) { if (b.checked) { done++; arr.push(i); } });
          var c = g.querySelector('[data-goal-count]');
          if (c) c.textContent = done + '/' + boxes.length;
          var bar = g.querySelector('[data-goal-bar]');
          if (bar) bar.style.width = Math.round(done / boxes.length * 100) + '%';
          try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
        }
        boxes.forEach(function (b, i) { if (state.indexOf(i) > -1) b.checked = true; b.addEventListener('change', upd); });
        upd();
      });
    });
  }

  /* Hızlı net hesaplama: DGS ve TYT (4 yanlış 1 doğruyu götürür) */
  var NET_SETS = {
    dgs: { title: 'DGS', parts: [['Sayısal', 50, 'Matematik, geometri, sayısal mantık'], ['Sözel', 50, 'Türkçe, sözel mantık']] },
    tyt: { title: 'TYT', parts: [['Türkçe', 40, ''], ['Sosyal Bilimler', 20, ''], ['Temel Matematik', 40, ''], ['Fen Bilimleri', 20, '']] }
  };
  function fmt(n) { return (Math.round(n * 100) / 100).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
  function netcalc() {
    document.querySelectorAll('[data-netcalc]').forEach(function (box) {
      var rows = box.querySelector('[data-nc-rows]'), total = box.querySelector('[data-nc-total]'), totalQ = box.querySelector('[data-nc-max]');
      var tabs = box.querySelectorAll('[data-nc-tab]'), uid = 0;
      function build(kind) {
        var set = NET_SETS[kind];
        rows.innerHTML = set.parts.map(function (p) {
          var id = 'nc' + (++uid);
          return '<div class="nc-row" data-max="' + p[1] + '"><div class="lab">' + esc(p[0]) + '<small>' + p[1] + ' soru' + (p[2] ? ' · ' + esc(p[2]) : '') + '</small></div>' +
            '<div><label for="' + id + 'd">Doğru</label><input id="' + id + 'd" type="number" inputmode="numeric" min="0" max="' + p[1] + '" step="1" placeholder="0" data-k="d"></div>' +
            '<div><label for="' + id + 'y">Yanlış</label><input id="' + id + 'y" type="number" inputmode="numeric" min="0" max="' + p[1] + '" step="1" placeholder="0" data-k="y"></div>' +
            '<div class="net" aria-live="polite"><b data-net>0</b><span>net</span></div><p class="nc-err" role="alert" hidden></p></div>';
        }).join('');
        if (totalQ) totalQ.textContent = String(set.parts.reduce(function (a, p) { return a + p[1]; }, 0));
        calc();
      }
      function calc() {
        var sum = 0;
        rows.querySelectorAll('.nc-row').forEach(function (r) {
          var max = +r.getAttribute('data-max');
          var di = r.querySelector('[data-k=d]'), yi = r.querySelector('[data-k=y]'), err = r.querySelector('.nc-err');
          var d = di.value === '' ? 0 : Number(di.value), y = yi.value === '' ? 0 : Number(yi.value), msg = '';
          if (!isFinite(d) || !isFinite(y) || d < 0 || y < 0 || d % 1 || y % 1) msg = 'Doğru ve yanlış sayısı 0 ya da pozitif tam sayı olmalı.';
          else if (d + y > max) msg = 'Doğru + yanlış en fazla ' + max + ' olabilir (şu an ' + (d + y) + ').';
          di.setAttribute('aria-invalid', msg ? 'true' : 'false');
          yi.setAttribute('aria-invalid', msg ? 'true' : 'false');
          err.hidden = !msg; err.textContent = msg;
          var net = msg ? 0 : d - y / 4;
          r.querySelector('[data-net]').textContent = msg ? '–' : fmt(net);
          sum += net;
        });
        total.textContent = fmt(sum);
      }
      rows.addEventListener('input', calc);
      tabs.forEach(function (t) {
        t.addEventListener('click', function () {
          tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
          build(t.getAttribute('data-nc-tab'));
        });
      });
      var first = box.querySelector('[data-nc-tab][aria-selected=true]') || tabs[0];
      build(first ? first.getAttribute('data-nc-tab') : 'dgs');
    });
  }

  /* Kitap defteri: sekmeler, işaretlenebilir günlük görevler (cihazda saklanır), ilerleme halkası */
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function notebook() {
    document.querySelectorAll('[data-notebook]').forEach(function (nb) {
      var tabs = nb.querySelectorAll('[role=tab]'), lists = nb.querySelectorAll('[data-nb-list]');
      var title = nb.querySelector('[data-nb-title]'), sum = nb.querySelector('[data-nb-summary]');
      var ring = nb.querySelector('[data-nb-ring]'), pct = nb.querySelector('[data-nb-pct]');
      var C = 150.8, day = today(), tabKey = 'cg-defter-sekme-' + (nb.getAttribute('data-notebook') || 'ana');
      function stats(list) {
        var boxes = list.querySelectorAll('input[type=checkbox]'), done = 0;
        boxes.forEach(function (b) { if (b.checked) done++; });
        var p = boxes.length ? Math.round(done / boxes.length * 100) : 0;
        if (sum) sum.textContent = done + ' / ' + boxes.length + ' görev tamamlandı';
        if (pct) pct.textContent = '%' + p;
        if (ring) ring.style.strokeDashoffset = String(C - C * p / 100);
      }
      lists.forEach(function (list) {
        var key = 'cg-defter-' + list.getAttribute('data-nb-list') + '-' + day, state = [];
        try { state = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { state = []; }
        var boxes = list.querySelectorAll('input[type=checkbox]');
        boxes.forEach(function (b, i) {
          var item = b.closest('.notebook-item');
          if (state.indexOf(i) > -1) { b.checked = true; if (item) item.classList.add('done'); }
          b.addEventListener('change', function () {
            if (item) item.classList.toggle('done', b.checked);
            var arr = []; boxes.forEach(function (x, j) { if (x.checked) arr.push(j); });
            try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
            stats(list);
          });
        });
      });
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          var l = document.getElementById(t.getAttribute('aria-controls'));
          if (l) { l.hidden = !on; if (on) { if (title) title.textContent = l.getAttribute('data-title') || ''; stats(l); } }
        });
        if (focus) tab.focus();
        try { localStorage.setItem(tabKey, tab.id); } catch (e) {}
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
          if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
          if (n) { e.preventDefault(); select(n, true); }
        });
      });
      var first = null;
      try { var sid = localStorage.getItem(tabKey); if (sid) first = nb.querySelector('#' + sid); } catch (e) {}
      if (tabs.length) select(first || nb.querySelector('[role=tab][aria-selected=true]') || tabs[0]);
      else if (lists.length) stats(lists[0]);
    });
  }

  /* Pomodoro etüt sayacı (yalnız bu sayfadaki defter aracı) */
  function pomodoro() {
    document.querySelectorAll('[data-pomo]').forEach(function (box) {
      var disp = box.querySelector('[data-pomo-time]'), tg = box.querySelector('[data-pomo-toggle]'), rs = box.querySelector('[data-pomo-reset]');
      var st = box.querySelector('[data-pomo-status]');
      var total = (+box.getAttribute('data-pomo') || 25) * 60, left = total, end = 0, iv = null;
      function two(n) { return n < 10 ? '0' + n : String(n); }
      function render() { disp.textContent = two(Math.floor(left / 60)) + ':' + two(left % 60); }
      function stop() { clearInterval(iv); iv = null; }
      function tick() {
        left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        render();
        if (left === 0) { stop(); tg.textContent = 'Bitti'; tg.setAttribute('aria-pressed', 'false'); if (st) st.textContent = 'Etüt bitti. Kısa bir mola ver.'; }
      }
      tg.addEventListener('click', function () {
        if (iv) { stop(); left = Math.max(0, Math.ceil((end - Date.now()) / 1000)); render(); tg.textContent = 'Devam'; tg.setAttribute('aria-pressed', 'false'); if (st) st.textContent = 'Sayaç duraklatıldı.'; return; }
        if (left === 0) left = total;
        end = Date.now() + left * 1000; iv = setInterval(tick, 250);
        tg.textContent = 'Duraklat'; tg.setAttribute('aria-pressed', 'true'); if (st) st.textContent = 'Etüt başladı.';
      });
      rs.addEventListener('click', function () { stop(); left = total; render(); tg.textContent = 'Başlat'; tg.setAttribute('aria-pressed', 'false'); if (st) st.textContent = 'Sayaç sıfırlandı.'; });
      render();
    });
  }

  /* Net defteri: kaydırıcı + sayı girişi, koyu özet kutu. 4 yanlış 1 doğruyu götürür. */
  var LEDGER = {
    dgs: { sub: 'DGS · 100 soru üzerinden', parts: [['Sayısal Bölüm', 50, 'Matematik, geometri, sayısal mantık'], ['Sözel Bölüm', 50, 'Türkçe, sözel mantık']] },
    tyt: { sub: 'TYT · 120 soru üzerinden', parts: [['Türkçe', 40, ''], ['Sosyal Bilimler', 20, ''], ['Temel Matematik', 40, ''], ['Fen Bilimleri', 20, '']] }
  };
  function f2(n) { return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function ledger() {
    document.querySelectorAll('[data-ledger]').forEach(function (box) {
      var rows = box.querySelector('[data-lg-rows]'), tabs = box.querySelectorAll('[data-lg-tab]');
      var out = { net: box.querySelector('[data-lg-net]'), d: box.querySelector('[data-lg-d]'), y: box.querySelector('[data-lg-y]'), b: box.querySelector('[data-lg-b]'), sub: box.querySelector('[data-lg-sub]') };
      var state = {}, kind = 'dgs', uid = 0;
      Object.keys(LEDGER).forEach(function (k) { state[k] = LEDGER[k].parts.map(function () { return { d: 0, y: 0 }; }); });
      function totals() {
        var set = LEDGER[kind], D = 0, Y = 0, M = 0;
        set.parts.forEach(function (p, i) { D += state[kind][i].d; Y += state[kind][i].y; M += p[1]; });
        out.net.textContent = f2(D - Y / 4); out.d.textContent = D; out.y.textContent = Y; out.b.textContent = M - D - Y;
      }
      function build() {
        var set = LEDGER[kind];
        if (out.sub) out.sub.textContent = set.sub + ' · 4 yanlış 1 doğruyu götürür';
        rows.innerHTML = set.parts.map(function (p, i) {
          var v = state[kind][i], id = 'lg' + (++uid);
          function ctl(k, lab) {
            return '<div class="input-group"><label for="' + id + k + 'n"><span>' + lab + '</span><span>En çok ' + p[1] + '</span></label><div class="input-controls">' +
              '<input type="range" min="0" max="' + p[1] + '" step="1" value="' + v[k] + '" data-i="' + i + '" data-k="' + k + '" aria-label="' + esc(p[0]) + ' ' + lab.toLowerCase() + ' kaydırıcısı">' +
              '<input id="' + id + k + 'n" type="number" inputmode="numeric" min="0" max="' + p[1] + '" step="1" value="' + v[k] + '" data-i="' + i + '" data-k="' + k + '"></div></div>';
          }
          return '<div class="calc-row" data-row="' + i + '"><div class="calc-row-top"><strong>' + esc(p[0]) + ' <small>(' + p[1] + ' soru' + (p[2] ? ' · ' + esc(p[2]) : '') + ')</small></strong><span class="calc-net-pill" data-row-net>' + f2(v.d - v.y / 4) + ' net</span></div>' +
            '<div class="slider-grid">' + ctl('d', 'Doğru') + ctl('y', 'Yanlış') + '</div></div>';
        }).join('');
        totals();
      }
      function update(el, commit) {
        var i = +el.getAttribute('data-i'), k = el.getAttribute('data-k'), max = LEDGER[kind].parts[i][1];
        if (el.value === '' && !commit) return;
        var v = parseInt(el.value, 10); if (isNaN(v) || v < 0) v = 0; if (v > max) v = max;
        var s = state[kind][i]; s[k] = v;
        var o = k === 'd' ? 'y' : 'd'; if (s.d + s.y > max) s[o] = max - v;
        var row = rows.querySelector('[data-row="' + i + '"]');
        row.querySelectorAll('input').forEach(function (inp) { if (inp !== el || commit || inp.type === 'range') inp.value = s[inp.getAttribute('data-k')]; });
        row.querySelector('[data-row-net]').textContent = f2(s.d - s.y / 4) + ' net';
        totals();
      }
      rows.addEventListener('input', function (e) { if (e.target.matches('input')) update(e.target, e.target.type === 'range'); });
      rows.addEventListener('change', function (e) { if (e.target.matches('input')) update(e.target, true); });
      tabs.forEach(function (t) {
        t.addEventListener('click', function () {
          tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
          kind = t.getAttribute('data-lg-tab'); build();
        });
      });
      build();
    });
  }

  function init() {
    countdown(); thisWeek(); areas(); filters(); shop(); quiz(); examCountdowns(); phone(); netcalc(); notebook(); pomodoro(); ledger();
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = String(new Date().getFullYear());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* Üst duyuru şeridi: ücretsiz örnek paket + Tam Paket */
(function(){try{if(/^\/(paket|ekys|cikmis-sorular)\//.test(location.pathname))return;var b=document.createElement('div');b.className='promo-bar';b.innerHTML='🎁 <a href="/cikmis-sorular/">EKYS çıkmış soruların tamamı (245 soru) artık ücretsiz: çöz ya da PDF indir</a>';document.body.insertBefore(b,document.body.firstChild);}catch(e){}})();

/* Sınav seçimi: tıklananı hatırla */
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-sinav]");if(!a)return;try{localStorage.setItem("cg-sinav",a.getAttribute("data-sinav"))}catch(_){}});

/* Hesap: Giriş yap / İlerlemem düğmesi; Firebase yalnızca gerektiğinde yüklenir */
(function () {
  function yukle() { return import('/assets/hesap.js'); }
  function mount() {
    var end = document.querySelector('.nav-end') || document.querySelector('.nav');
    if (!end || end.querySelector('.hesap-btn')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'hesap-btn';
    var girisli = false;
    try { girisli = localStorage.getItem('cg-giris') === '1'; } catch (e) {}
    b.innerHTML = '<svg class="hb-ikon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg><span class="hb-ad">' + (girisli ? 'İlerlemem' : 'Giriş yap') + '</span>'; b.setAttribute('aria-label', girisli ? 'İlerlemem' : 'Giriş yap');
    b.addEventListener('click', function () {
      if (girisli) { location.href = '/ilerleme/'; return; }
      yukle().then(function (m) { m.girisAc(); });
    });
    var tema = end.querySelector('.theme-toggle');
    end.insertBefore(b, tema || null);
    if (girisli || document.querySelector('[data-hesap-sayfa]')) yukle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(mount, 0); }); else setTimeout(mount, 0);
})();
