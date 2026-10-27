/* Portfolio: vanilla JavaScript only. No external JS dependencies. */
(() => {
  'use strict';
  const doc = document;
  const SITE_ROOT = new URL('../../', document.currentScript?.src || location.href);
  const localURL = path => new URL(path.replace(/^\//,''), SITE_ROOT).href;
  const $ = (selector, root = doc) => root.querySelector(selector);
  const $$ = (selector, root = doc) => [...root.querySelectorAll(selector)];
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const config = Object.freeze({
    contactEmail: 'tahabarani.ir@gmail.com',
    githubUrl: 'https://github.com/amirbaraniz'
  });
  let toastTimer;
  function toast(message) {
    const box = $('#toast');
    if (!box) return;
    box.textContent = message;
    box.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('is-visible'), 3300);
  }
  function safeLocalGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function safeLocalSet(key, value) { try { localStorage.setItem(key, value); } catch { /* private modes */ } }
  function normalize(value) { return String(value || '').normalize('NFKC').replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک').trim().toLocaleLowerCase('fa'); }
  function clampText(value, length = 90) { return String(value).slice(0, length); }
  async function copyText(value) {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('fallback');
      await navigator.clipboard.writeText(value);
      toast('با موفقیت کپی شد.');
    } catch {
      // Not all browsers offer Clipboard API on non-HTTPS hosts.
      const el = doc.createElement('textarea');
      el.value = value; el.setAttribute('readonly', '');
      el.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      doc.body.appendChild(el); el.select();
      const ok = doc.execCommand('copy'); el.remove();
      toast(ok ? 'با موفقیت کپی شد.' : 'کپی خودکار ممکن نشد. لطفاً آدرس را دستی کپی کنید.');
    }
  }
  async function sharePage() {
    if (navigator.share) {
      try { await navigator.share({ title: doc.title, url: location.href }); return; }
      catch (err) { if (err.name === 'AbortError') return; }
    }
    await copyText(location.href);
  }
  // Mobile navigation: accessible controls, no scroll handler required.
  const navButton = $('[data-menu-toggle]');
  const mobileNav = $('#mobile-navigation');
  function closeMenu() {
    if (!navButton || !mobileNav) return;
    mobileNav.classList.remove('is-open'); mobileNav.inert = true;
    navButton.setAttribute('aria-expanded', 'false');
    navButton.setAttribute('aria-label', 'باز کردن منو');
    doc.body.classList.remove('menu-open');
  }
  if (navButton && mobileNav) {
    navButton.addEventListener('click', () => {
      const open = !mobileNav.classList.contains('is-open');
      mobileNav.classList.toggle('is-open', open);
      mobileNav.inert = !open;
      navButton.setAttribute('aria-expanded', String(open));
      navButton.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
      doc.body.classList.toggle('menu-open', open);
      if (open) $('a', mobileNav)?.focus();
    });
    $$('a', mobileNav).forEach(link => link.addEventListener('click', closeMenu));
    // Avoid keeping the overlay when switching to a large viewport.
    matchMedia('(min-width: 801px)').addEventListener?.('change', e => { if (e.matches) closeMenu(); });
  }
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNav?.classList.contains('is-open')) { closeMenu(); navButton?.focus(); }
  });
  // Clear fallback for CDN icon failures; text initial remains visible.
  $$('[data-icon-fallback]').forEach(img => {
    img.addEventListener('error', () => { img.hidden = true; }, { once: true });
    if (img.complete && img.naturalWidth === 0) img.hidden = true;
  });
  // Inline header search: expands in its original position; never opens a modal.
  const searchWrap = $('#header-search-wrap');
  const searchToggle = $('[data-open-search]');
  const searchClose = $('[data-close-search]');
  const globalSearch = $('#global-search');
  const searchResults = $('#search-results');
  let searchIndex = null;
  let loadingIndex = null;
  function clearResults(message) {
    if (!searchResults) return;
    searchResults.replaceChildren();
    const para = doc.createElement('p'); para.className = 'muted'; para.textContent = message;
    searchResults.append(para);
    searchResults.classList.add('has-results');
  }
  function renderResults(query) {
    if (!searchResults) return;
    const term = normalize(clampText(query, 100));
    if (!term) { searchResults.replaceChildren(); searchResults.classList.remove('has-results'); return; }
    if (!searchIndex) { clearResults('در حال آماده‌سازی جست‌وجو…'); return; }
    const items = searchIndex.filter(item => normalize(item.title+' '+item.description).includes(term)).slice(0,7);
    if (!items.length) { clearResults('نتیجه‌ای پیدا نشد. عبارت دیگری را امتحان کنید.'); return; }
    const fragment = doc.createDocumentFragment();
    for (const item of items) {
      const link = doc.createElement('a'); link.href = localURL(item.url); link.className = 'search-result';
      const title = doc.createElement('strong'); title.textContent = item.title;
      const caption = doc.createElement('small'); caption.textContent = item.kind + ' · ' + item.description;
      link.append(title,caption); fragment.append(link);
    }
    searchResults.replaceChildren(fragment);
    searchResults.classList.add('has-results');
  }
  function openSearch() {
    if (!searchWrap || !globalSearch) return;
    closeMenu();
    searchWrap.classList.add('is-open');
    $('#site-header')?.classList.add('is-search-open');
    searchToggle?.setAttribute('aria-expanded','true');
    searchToggle?.setAttribute('aria-label','جست‌وجو باز است');
    globalSearch.tabIndex = 0; if (searchClose) searchClose.tabIndex = 0;
    globalSearch.focus({preventScroll:true});
    if (!searchIndex && !loadingIndex) {
      loadingIndex = fetch(localURL('assets/js/search-index.json'),{cache:'force-cache'})
        .then(r => {if(!r.ok)throw Error('HTTP '+r.status);return r.json();})
        .then(data => { searchIndex = Array.isArray(data) ? data.filter(x => typeof x.title==='string' && typeof x.url==='string' && x.url.startsWith('/')) : []; renderResults(globalSearch.value); })
        .catch(() => {if(searchWrap.classList.contains('is-open'))clearResults('جست‌وجو در دسترس نیست؛ از بخش‌های اصلی سایت استفاده کنید.');})
        .finally(()=>{loadingIndex=null;});
    } else renderResults(globalSearch.value);
  }
  function closeSearch(refocus=true) {
    if(!searchWrap)return;
    searchWrap.classList.remove('is-open');
    $('#site-header')?.classList.remove('is-search-open');
    searchToggle?.setAttribute('aria-expanded','false');
    searchToggle?.setAttribute('aria-label','باز کردن جست‌وجو');
    if(globalSearch){globalSearch.tabIndex=-1;globalSearch.value='';}
    if(searchClose) searchClose.tabIndex=-1;
    searchResults?.replaceChildren(); searchResults?.classList.remove('has-results');
    if(refocus) searchToggle?.focus({preventScroll:true});
  }
  searchToggle?.addEventListener('click',()=> searchWrap.classList.contains('is-open') ? closeSearch() : openSearch());
  searchClose?.addEventListener('click',()=>closeSearch());
  globalSearch?.addEventListener('input',event=>renderResults(event.target.value));
  doc.addEventListener('keydown', event=>{
    if(event.key==='Escape'&&searchWrap?.classList.contains('is-open')){event.preventDefault();closeSearch();return;}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
      const tag=doc.activeElement?.tagName;
      if(!['INPUT','TEXTAREA'].includes(tag)) {event.preventDefault();openSearch();}
    }
  });
  doc.addEventListener('pointerdown',event=>{
    if(searchWrap?.classList.contains('is-open')&&!searchWrap.contains(event.target)) closeSearch(false);
  });
  // Fast client-side filters, preserving the selected filter in the URL.
  $$('[data-filter-section]').forEach(section => {
    const kind = section.dataset.kind;
    const items = kind === 'blog' ? $$('[data-post]', section) : $$('[data-project]', section);
    const query = $('#' + kind + '-query');
    const count = $('#' + kind + '-count');
    const empty = $('#' + kind + '-empty');
    const tabs = $$('[data-filter]', section);
    const allowed = new Set(tabs.map(x => x.dataset.filter));
    const params = new URLSearchParams(location.search);
    let filter = allowed.has(params.get('type')) ? params.get('type') : 'all';
    if (query) query.value = clampText(params.get('q') || '', 90);
    function update(push = false) {
      const q = normalize(query?.value);
      let visible = 0;
      for (const item of items) {
        const matchesFilter = filter === 'all' || (kind === 'blog' ? item.dataset.category === filter : item.dataset.topic === filter);
        const matchesText = !q || normalize(item.dataset.search).includes(q);
        item.hidden = !(matchesFilter && matchesText);
        if (!item.hidden) visible++;
      }
      tabs.forEach(button => { const on = button.dataset.filter === filter; button.classList.toggle('is-active', on); button.setAttribute('aria-pressed', String(on)); });
      if (count) count.textContent = `${visible.toLocaleString('fa-IR')} ${kind === 'blog' ? 'مقاله' : 'پروژه'}`;
      if (empty) empty.hidden = visible !== 0;
      if (push && history.replaceState) {
        const url = new URL(location.href);
        filter === 'all' ? url.searchParams.delete('type') : url.searchParams.set('type', filter);
        q ? url.searchParams.set('q', q) : url.searchParams.delete('q');
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    }
    tabs.forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; update(true); }));
    query?.addEventListener('input', () => update(true));
    $('[data-reset-filters]', section)?.addEventListener('click', () => { filter = 'all'; if (query) query.value = ''; update(true); });
    update(false);
  });
  // Clipboard and Web Share: actions delegated from existing semantic controls.
  doc.addEventListener('click', event => {
    const copyButton = event.target.closest?.('[data-copy]');
    if (copyButton) {
      const target = copyButton.dataset.copy;
      const value = target === 'url' ? location.href : (doc.getElementById(target)?.textContent || '');
      if (value) copyText(value);
    }
    if (event.target.closest?.('[data-share]')) sharePage();
    if (event.target.closest?.('[data-back-top]')) window.scrollTo({ top: 0, behavior: (prefersReduced.matches || doc.documentElement.dataset.reduceMotion === 'true') ? 'auto' : 'smooth' });
  });
  // Global movement preference, saved only in this browser.
  const motionToggle = $('[data-motion-toggle]');
  function applyMotion(setting) {
    doc.documentElement.dataset.reduceMotion = setting ? 'true' : 'false';
    if (motionToggle) { motionToggle.setAttribute('aria-pressed', String(setting)); motionToggle.textContent = setting ? ' فعال کردن حرکت' : ' کاهش حرکت'; }
  }
  applyMotion(safeLocalGet('portfolio.reduceMotion') === 'yes');
  motionToggle?.addEventListener('click', () => {
    const next = doc.documentElement.dataset.reduceMotion !== 'true';
    safeLocalSet('portfolio.reduceMotion', next ? 'yes' : 'no'); applyMotion(next);
    toast(next ? 'انیمیشن‌های تزئینی کاهش یافتند.' : 'حرکت‌های معمول فعال شدند.');
  });
  // Native mail client: never claim confirmed delivery without delivery confirmation.
  const contactForm = $('#contact-form');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    const inputs = [$('#sender-name'), $('#sender-email'), $('#sender-message')];
    let valid = true;
    for (const input of inputs) {
      if (!input) continue;
      const ok = input.checkValidity();
      input.classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      const error = $(`[data-error-for="${input.id}"]`);
      if (error) error.textContent = ok ? '' : input.validity.valueMissing ? 'این قسمت ضروری است.' : input.validity.tooShort ? 'لطفاً متن بیشتری بنویسید.' : 'مقدار واردشده معتبر نیست.';
      if (!ok) valid = false;
    }
    const consent = $('#contact-ack');
    if (consent && !consent.checked) { valid = false; consent.focus(); toast('برای ادامه، گزینه آگاهی از ارسال ایمیل را فعال کن.'); }
    if (!valid) { inputs.find(input => !input?.checkValidity())?.focus(); return; }
    const name = $('#sender-name').value.trim();
    const sender = $('#sender-email').value.trim();
    const topic = $('#sender-subject').value;
    const content = $('#sender-message').value.trim();
    const subject = encodeURIComponent(`[وب‌سایت شخصی] ${topic}`);
    const body = encodeURIComponent(`نام: ${name}\nایمیل: ${sender}\nموضوع: ${topic}\n\n${content}`);
    const mailto = `mailto:${config.contactEmail}?subject=${subject}&body=${body}`;
    const status = $('#contact-status');
    if (status) { status.textContent = 'پیام آماده شد. ارسال را در برنامه ایمیل خود تکمیل کنید.'; status.classList.add('is-ready'); }
    toast('پیام آماده شد؛ ادامه ارسال در برنامه ایمیل شماست.');
    location.href = mailto;
  });
  // No content is hidden before JS runs. Reveal only decorative below-the-fold items.
  if ('IntersectionObserver' in window && !prefersReduced.matches && doc.documentElement.dataset.reduceMotion !== 'true') {
    const items = $$('[data-reveal]');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, { threshold: .06, rootMargin: '0px 0px 50px 0px' });
    items.forEach(node => observer.observe(node));
    // Once observer initialized, only cards below main heading get decorative reveal.
    if (items.length) doc.documentElement.classList.add('motion-ready');
  }
  // Optional offline support: install after the load event and idle period, not in critical path.
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      const register = () => navigator.serviceWorker.register(localURL('sw.js'), { scope: SITE_ROOT.pathname }).catch(() => {});
      if ('requestIdleCallback' in window) requestIdleCallback(register, { timeout: 2500 });
      else setTimeout(register, 1800);
    }, { once: true });
  }
})();
