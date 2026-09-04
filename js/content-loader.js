(function(){
  'use strict';

  function isConfigured(){
    return typeof window.SUPABASE_URL === 'string' &&
      typeof window.SUPABASE_ANON_KEY === 'string' &&
      window.SUPABASE_URL.indexOf('YOUR_SUPABASE') === -1 &&
      window.SUPABASE_ANON_KEY.indexOf('YOUR_SUPABASE') === -1 &&
      typeof window.supabase !== 'undefined';
  }

  function toDialDigits(display){
    var digits = String(display || '').replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.charAt(0) === '1') return '+' + digits;
    return digits ? '+' + digits : '';
  }

  function applyBioPhoto(url){
    if (!url) return;
    var img = document.querySelector('[data-content="bio-photo"]');
    if (img) img.src = url;
  }

  function applyParagraphs(selector, text, specialClass, specialPosition){
    if (!text) return;
    var container = document.querySelector(selector);
    if (!container) return;
    var paragraphs = text.split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean);
    if (!paragraphs.length) return;
    container.innerHTML = '';
    paragraphs.forEach(function(p, i){
      var el = document.createElement('p');
      var isSpecial = specialPosition === 'first' ? i === 0 : i === paragraphs.length - 1;
      if (isSpecial) el.className = specialClass;
      el.textContent = p;
      container.appendChild(el);
    });
  }

  function applyPricingText(text){
    if (!text) return;
    var el = document.querySelector('[data-content="pricing-text"]');
    if (el) el.textContent = text;
  }

  function applyContact(type, value){
    if (!value) return;
    var links = document.querySelectorAll('[data-contact="' + type + '"]');
    links.forEach(function(a){
      if (type === 'email'){
        a.href = 'mailto:' + value;
        a.setAttribute('aria-label', 'Email ' + value);
        a.setAttribute('title', value);
        return;
      }
      var dial = toDialDigits(value);
      var label = (type === 'sms' ? 'Text ' : 'Call ') + value;
      a.href = (type === 'sms' ? 'sms:' : 'tel:') + dial;
      a.setAttribute('aria-label', label);
      a.setAttribute('title', label);
    });
  }

  function applyContent(row){
    if (!row) return;
    applyBioPhoto(row.bio_photo_url);
    applyParagraphs('[data-content="bio-text"]', row.bio_text, 'lead', 'first');
    applyParagraphs('[data-content="philosophy-text"]', row.philosophy_text, 'philosophy-close', 'last');
    applyPricingText(row.pricing_text);
    applyContact('phone', row.contact_phone);
    applyContact('sms', row.contact_sms);
    applyContact('email', row.contact_email);
  }

  if (!isConfigured()) return;

  try {
    var client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    client.from('site_content').select('*').eq('id', 1).single().then(function(result){
      if (result.error){
        console.warn('Site content: using default page content (' + result.error.message + ')');
        return;
      }
      applyContent(result.data);
    });
  } catch (err) {
    console.warn('Site content: using default page content (' + err.message + ')');
  }
})();
