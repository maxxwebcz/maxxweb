// Vysouvací menu z pravého kraje (hlavní stránka i podstránky). Vloží tlačítko „Menu“ do horní lišty.
(function () {
  const SECTIONS = [
    { title: 'maxxweb', links: [
      ['/', 'Úvod'],
      ['/#cenik', 'Ceník'],
      ['/#portfolio', 'Naše práce'],
      ['/#kontakt', 'Kontakt'],
    ] },
    { title: 'Služby', links: [
      ['/tvorba-webovych-stranek.html', 'Tvorba webových stránek'],
      ['/web-pro-zivnostniky.html', 'Web pro živnostníky'],
      ['/web-pro-kadernictvi-a-barbery.html', 'Web pro kadeřnictví a barbery'],
      ['/web-pro-remeslniky.html', 'Web pro řemeslníky'],
    ] },
    { title: 'Ceny a otázky', links: [
      ['/kolik-stoji-web.html', 'Kolik stojí web'],
      ['/tvorba-webovych-stranek.html#faq', 'Časté otázky'],
    ] },
    { title: 'Reference', links: [
      ['/reference/ever-clean-car.html', 'Ever Clean Car'],
      ['/reference/destiny-barber.html', 'Destiny Barber'],
    ] },
  ];

  const css = `
  .mx-menu-btn{display:inline-flex;align-items:center;gap:8px;background:transparent;border:1px solid rgba(255,255,255,.18);color:#F9F9F7;font:600 14px 'DM Sans',system-ui,sans-serif;padding:9px 14px;border-radius:100px;cursor:pointer;margin-left:16px;flex-shrink:0}
  .mx-menu-btn:hover{border-color:rgba(255,255,255,.45)}
  .mx-menu-btn:focus-visible,.mx-drawer a:focus-visible,.mx-close:focus-visible{outline:2px solid #E83A3A;outline-offset:2px}
  .mx-burger{width:16px;height:10px;position:relative;display:inline-block}
  .mx-burger::before,.mx-burger::after,.mx-burger span{content:'';position:absolute;left:0;right:0;height:2px;background:currentColor;border-radius:2px}
  .mx-burger::before{top:0}.mx-burger span{top:4px}.mx-burger::after{top:8px}
  .mx-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;opacity:0;pointer-events:none;transition:opacity .25s}
  .mx-drawer{position:fixed;top:0;right:0;bottom:0;width:min(360px,88vw);background:#111;color:#F9F9F7;z-index:2001;transform:translateX(100%);transition:transform .3s cubic-bezier(.23,1,.32,1);display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.08);font-family:'DM Sans',system-ui,sans-serif;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) 0}
  .mx-open .mx-backdrop{opacity:1;pointer-events:auto}
  .mx-open .mx-drawer{transform:none}
  .mx-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)}
  .mx-head img{height:24px;width:auto}
  .mx-close{background:transparent;border:0;color:#F9F9F7;font-size:28px;line-height:1;cursor:pointer;padding:4px 8px}
  .mx-body{overflow-y:auto;padding:8px 24px 24px;flex:1}
  .mx-sec{padding:16px 0;border-bottom:1px solid rgba(255,255,255,.06)}
  .mx-sec h4{margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#E83A3A}
  .mx-sec a{display:block;padding:7px 0;color:rgba(249,249,247,.82);text-decoration:none;font-size:16px}
  .mx-sec a:hover{color:#fff}
  .mx-sec a[aria-current="page"]{color:#fff;font-weight:600}
  .mx-foot{padding:20px 24px;border-top:1px solid rgba(255,255,255,.08);display:grid;gap:10px}
  .mx-cta{display:block;text-align:center;background:#E83A3A;color:#fff;text-decoration:none;font-weight:600;padding:14px;border-radius:100px}
  .mx-phone{text-align:center;color:rgba(249,249,247,.6);font-size:14px;text-decoration:none}
  body.mx-lock{overflow:hidden}
  nav#mainNav .nav-links,header.nav .nav-links{margin-left:auto}
  @media (max-width:900px){.mx-menu-btn{margin-left:10px;padding:8px 12px}}
  @media (max-width:640px){header.nav .nav-links{display:none}}
  @media (prefers-reduced-motion:reduce){.mx-drawer,.mx-backdrop{transition:none}}`;

  function init() {
    const bar = document.querySelector('nav#mainNav') || document.querySelector('header.nav .container');
    if (!bar || document.querySelector('.mx-menu-btn')) return;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mx-menu-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mxDrawer');
    btn.innerHTML = '<span class="mx-burger" aria-hidden="true"><span></span></span><span>Menu</span>';
    bar.appendChild(btn);

    const here = location.pathname;
    const sections = SECTIONS.map(s => `<div class="mx-sec"><h4>${s.title}</h4>${
      s.links.map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ''}>${label}</a>`).join('')
    }</div>`).join('');

    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="mx-backdrop" data-mx-close></div>
      <aside class="mx-drawer" id="mxDrawer" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
        <div class="mx-head"><a href="/"><img src="/logo.png" alt="maxxweb"></a><button type="button" class="mx-close" data-mx-close aria-label="Zavřít menu">×</button></div>
        <div class="mx-body" role="navigation" aria-label="Stránky webu">${sections}</div>
        <div class="mx-foot"><a class="mx-cta" href="/#kontakt">Chci web za týden</a><a class="mx-phone" href="tel:+420604419420">+420 604 419 420 · office@maxxweb.cz</a></div>
      </aside>`;
    document.body.appendChild(wrap);
    const drawer = wrap.querySelector('.mx-drawer');

    const open = () => {
      document.documentElement.classList.add('mx-open');
      document.body.classList.add('mx-lock');
      btn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      drawer.querySelector('.mx-close').focus();
    };
    const close = () => {
      document.documentElement.classList.remove('mx-open');
      document.body.classList.remove('mx-lock');
      btn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      btn.focus();
    };
    btn.addEventListener('click', open);
    wrap.addEventListener('click', e => {
      if (e.target.closest('[data-mx-close]')) return close();
      if (e.target.closest('.mx-drawer a')) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.documentElement.classList.contains('mx-open')) close(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
