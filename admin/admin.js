(function(){
  'use strict';

  // Fallbacks matching what's currently hardcoded on the public site, so the
  // admin form starts from real content even before the first save.
  var DEFAULTS = {
    bio_photo_url: '/Images/Clare-headshot.webp',
    bio_text: [
      'Hello! I’m so glad you’re here.',
      'I’m a Mental Health Counselor and Art Therapist with a private practice in Bellingham, Washington.',
      'I feel privileged to say I have found my dream job, even though it was on accident.',
      'In 2017 during a thru-hike of the PCT, a fellow hiker told me about Art Therapy. As a lifelong artist going through an existential crisis (hence hiking the PCT) I got excited about pursuing a career in Art Therapy. The following fall, I was accepted to Antioch University in Seattle, where I learned that I was in fact training to become a Licensed Mental Health Counselor in addition to an Art Therapist. I loved it immediately, and it made sense. Something clicked.',
      'I love getting to know people and their stories, and find immense joy in seeing people uncover their true selves through our work together. I am a lover of learning, and am always taking classes or trainings, reading, and trying new things in the therapy field.',
      'In addition to being a therapist, I am also a mother, artist, mountain biker, flower gazer, and nature lover. Originally from the Midwest, I made my way to Washington by way of Colorado 9 years ago.'
    ].join('\n\n'),
    philosophy_text: [
      'We all deserve to feel at home and safe in our bodies and minds, and it’s my passion to help others find this place. I believe it’s the relationship between my clients and I that is most effective for healing, so it’s important that we’re a good fit. I welcome clients from all backgrounds and am passionate about creating a safe, non-judgemental environment where you feel supported and accepted as you are.',
      'I am a strong believer that large-scale societal forces that surround us, including oppression, affect us greatly; I view clients as individuals while recognizing the larger systems we are all a part of.',
      'I look forward to joining you on your journey!'
    ].join('\n\n'),
    pricing_text: 'Appointments are 55 minutes at the rate of $160 per session. I accept United Healthcare and Premera Blue Cross insurances. For all other insurances, I can provide you with an invoice to submit for reimbursement.',
    contact_phone: '(360) 218-7190',
    contact_sms: '(360) 218-7190',
    contact_email: 'clare@creativeinstinctscounseling.com'
  };

  var MAX_PHOTO_DIMENSION = 1200;
  var PHOTO_JPEG_QUALITY = 0.85;

  var els = {
    banner: document.getElementById('notConfiguredBanner'),
    loginView: document.getElementById('loginView'),
    dashboardView: document.getElementById('dashboardView'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginMessage: document.getElementById('loginMessage'),
    forgotPasswordBtn: document.getElementById('forgotPasswordBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    contentForm: document.getElementById('contentForm'),
    bioPhotoPreview: document.getElementById('bioPhotoPreview'),
    bioPhotoInput: document.getElementById('bioPhotoInput'),
    bioPhotoMessage: document.getElementById('bioPhotoMessage'),
    bioTextInput: document.getElementById('bioTextInput'),
    philosophyTextInput: document.getElementById('philosophyTextInput'),
    pricingTextInput: document.getElementById('pricingTextInput'),
    contactPhoneInput: document.getElementById('contactPhoneInput'),
    contactSmsInput: document.getElementById('contactSmsInput'),
    contactEmailInput: document.getElementById('contactEmailInput'),
    saveMessage: document.getElementById('saveMessage')
  };

  var currentPhotoUrl = DEFAULTS.bio_photo_url;

  function isConfigured(){
    return typeof window.SUPABASE_URL === 'string' &&
      typeof window.SUPABASE_ANON_KEY === 'string' &&
      window.SUPABASE_URL.indexOf('YOUR_SUPABASE') === -1 &&
      window.SUPABASE_ANON_KEY.indexOf('YOUR_SUPABASE') === -1 &&
      typeof window.supabase !== 'undefined';
  }

  function setMessage(el, text, state){
    el.textContent = text || '';
    if (state) el.setAttribute('data-state', state);
    else el.removeAttribute('data-state');
  }

  function showLogin(){
    els.loginView.hidden = false;
    els.dashboardView.hidden = true;
  }

  function showDashboard(){
    els.loginView.hidden = true;
    els.dashboardView.hidden = false;
  }

  if (!isConfigured()){
    els.banner.hidden = false;
    els.loginForm.querySelector('button[type="submit"]').disabled = true;
    setMessage(els.loginMessage, 'Supabase is not configured yet.', 'error');
    return;
  }

  var client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  function fillForm(row){
    row = row || {};
    currentPhotoUrl = row.bio_photo_url || DEFAULTS.bio_photo_url;
    els.bioPhotoPreview.src = currentPhotoUrl;
    els.bioTextInput.value = row.bio_text || DEFAULTS.bio_text;
    els.philosophyTextInput.value = row.philosophy_text || DEFAULTS.philosophy_text;
    els.pricingTextInput.value = row.pricing_text || DEFAULTS.pricing_text;
    els.contactPhoneInput.value = row.contact_phone || DEFAULTS.contact_phone;
    els.contactSmsInput.value = row.contact_sms || DEFAULTS.contact_sms;
    els.contactEmailInput.value = row.contact_email || DEFAULTS.contact_email;
  }

  function loadContent(){
    return client.from('site_content').select('*').eq('id', 1).single().then(function(result){
      if (result.error){
        fillForm(null);
        return;
      }
      fillForm(result.data);
    });
  }

  // --- Bio photo preview + client-side compression ---

  var ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png'];

  els.bioPhotoInput.addEventListener('change', function(){
    var file = els.bioPhotoInput.files[0];
    if (!file) return;

    setMessage(els.bioPhotoMessage, '');

    if (ALLOWED_PHOTO_TYPES.indexOf(file.type) === -1){
      setMessage(els.bioPhotoMessage, 'That file looks like ' + (file.type || 'an unsupported format') + '. Please upload a JPEG or PNG — iPhones save photos as HEIC by default, which isn’t supported here.', 'error');
      els.bioPhotoInput.value = '';
      return;
    }

    var reader = new FileReader();
    reader.onload = function(e){ els.bioPhotoPreview.src = e.target.result; };
    reader.readAsDataURL(file);
  });

  function compressImage(file){
    return new Promise(function(resolve, reject){
      var img = new Image();
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function(e){
        img.onerror = reject;
        img.onload = function(){
          var scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(img.width, img.height));
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(function(blob){
            if (!blob) return reject(new Error('Could not process image.'));
            resolve(blob);
          }, 'image/jpeg', PHOTO_JPEG_QUALITY);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function extractStoragePath(url){
    var marker = '/bio-photos/';
    var idx = String(url || '').indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  }

  function uploadPhotoIfNeeded(){
    var file = els.bioPhotoInput.files[0];
    if (!file) return Promise.resolve({ url: currentPhotoUrl, changed: false });

    if (ALLOWED_PHOTO_TYPES.indexOf(file.type) === -1){
      return Promise.reject(new Error('Please upload a JPEG or PNG (not HEIC) for the bio photo.'));
    }

    var previousPath = extractStoragePath(currentPhotoUrl);

    return compressImage(file).then(function(blob){
      var path = 'bio-photo-' + Date.now() + '.jpg';
      return client.storage.from('bio-photos').upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true
      }).then(function(result){
        if (result.error) throw result.error;
        var publicUrl = client.storage.from('bio-photos').getPublicUrl(path).data.publicUrl;
        // Remove the photo being replaced so Storage doesn't accumulate
        // unused files. Best-effort: a failure here shouldn't undo the save.
        if (previousPath){
          client.storage.from('bio-photos').remove([previousPath]).catch(function(err){
            console.warn('Could not remove previous bio photo: ' + err.message);
          });
        }
        return { url: publicUrl, changed: true };
      });
    });
  }

  // --- Auth ---

  els.loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    setMessage(els.loginMessage, 'Logging in…');
    client.auth.signInWithPassword({
      email: els.loginEmail.value.trim(),
      password: els.loginPassword.value
    }).then(function(result){
      if (result.error){
        setMessage(els.loginMessage, result.error.message, 'error');
        return;
      }
      setMessage(els.loginMessage, '');
      showDashboard();
      loadContent();
    });
  });

  els.logoutBtn.addEventListener('click', function(){
    client.auth.signOut().then(function(){
      els.contentForm.reset();
      showLogin();
    });
  });

  els.forgotPasswordBtn.addEventListener('click', function(){
    var email = window.prompt('Enter your admin email to receive a password reset link:', els.loginEmail.value.trim());
    if (!email) return;
    client.auth.resetPasswordForEmail(email, { redirectTo: window.location.href }).then(function(result){
      if (result.error){
        setMessage(els.loginMessage, result.error.message, 'error');
        return;
      }
      setMessage(els.loginMessage, 'Check your email for a reset link.', 'success');
    });
  });

  client.auth.onAuthStateChange(function(event, session){
    if (event === 'PASSWORD_RECOVERY'){
      var newPassword = window.prompt('Enter a new password:');
      if (!newPassword) return;
      client.auth.updateUser({ password: newPassword }).then(function(result){
        if (result.error){
          window.alert('Could not update password: ' + result.error.message);
          return;
        }
        window.alert('Password updated. You are now logged in.');
        showDashboard();
        loadContent();
      });
    }
  });

  // --- Save ---

  els.contentForm.addEventListener('submit', function(e){
    e.preventDefault();
    var saveBtn = els.contentForm.querySelector('button[type="submit"]');
    saveBtn.disabled = true;
    setMessage(els.saveMessage, 'Saving…');

    var photoResult;

    uploadPhotoIfNeeded().then(function(result){
      photoResult = result;
      return client.from('site_content').upsert({
        id: 1,
        bio_photo_url: photoResult.url,
        bio_text: els.bioTextInput.value.trim(),
        philosophy_text: els.philosophyTextInput.value.trim(),
        pricing_text: els.pricingTextInput.value.trim(),
        contact_phone: els.contactPhoneInput.value.trim(),
        contact_sms: els.contactSmsInput.value.trim(),
        contact_email: els.contactEmailInput.value.trim(),
        updated_at: new Date().toISOString()
      });
    }).then(function(result){
      if (result.error) throw result.error;
      currentPhotoUrl = photoResult.url;
      els.bioPhotoInput.value = '';
      setMessage(els.saveMessage, 'Saved! Changes are live on the site.', 'success');
    }).catch(function(err){
      setMessage(els.saveMessage, err.message || 'Something went wrong saving.', 'error');
    }).finally(function(){
      saveBtn.disabled = false;
    });
  });

  // --- Init: resume session if already logged in ---

  client.auth.getSession().then(function(result){
    if (result.data && result.data.session){
      showDashboard();
      loadContent();
    } else {
      showLogin();
    }
  });
})();
