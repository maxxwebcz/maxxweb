// Cookies + Google Analytics pro podstránky (stejný klíč souhlasu jako index.html)
(function () {
  const GA_ID = 'G-SLQH3X7CYR';
  const banner = document.getElementById('cookieBanner');
  const read = () => { try { return localStorage.getItem('cookie_consent'); } catch (e) { return null; } };
  const save = v => { try { localStorage.setItem('cookie_consent', v); } catch (e) {} };

  function loadAnalytics() {
    const s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    s.async = true;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  const consent = read();
  if (consent === 'accepted') loadAnalytics();
  if (!consent && banner) banner.hidden = false;

  banner && banner.addEventListener('click', e => {
    const b = e.target.closest('button[data-consent]');
    if (!b) return;
    save(b.dataset.consent);
    banner.hidden = true;
    if (b.dataset.consent === 'accepted') loadAnalytics();
  });
})();
