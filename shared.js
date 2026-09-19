// iter8d Studio — shared.js

// ── NAV SCROLL ──────────────────────────────────────────────────────────────
var navbar = document.getElementById('navbar');
if (navbar) {
  var darkHero = document.querySelector('.page-hero, .about-hero, .services-hero, .work-hero, .blog-hero, .contact-hero, .process-hero');
  if (darkHero) navbar.classList.add('hero-dark');
  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── SCROLL REVEAL ────────────────────────────────────────────────────────────
var reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  var ro = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(function(el) { ro.observe(el); });
}

// ── HAMBURGER ────────────────────────────────────────────────────────────────
var hbg   = document.getElementById('hamburger');
var nmenu = document.getElementById('nav-menu');
if (hbg && nmenu) {
  hbg.addEventListener('click', function() {
    var isOpen = nmenu.classList.toggle('open');
    hbg.classList.toggle('active', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
  });
  nmenu.querySelectorAll('a').forEach(function(l) {
    l.addEventListener('click', function() {
      nmenu.classList.remove('open');
      hbg.classList.remove('active');
      document.body.classList.remove('nav-open');
    });
  });
}

// ── ACTIVE NAV LINK ──────────────────────────────────────────────────────────
(function() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    var href = link.getAttribute('href') || '';
    if (href === page || href + '.html' === page || (page === '' && href === 'index')) {
      link.classList.add('active');
    }
  });
})();

// ── MODAL ────────────────────────────────────────────────────────────────────
var overlay  = document.getElementById('projectModal');
var closeBtn = document.getElementById('modalClose');
var mform    = document.getElementById('projectForm');
var sbtn     = document.getElementById('projectSubmitBtn');

function openModal() {
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  // Reset modal back to form after closing
  setTimeout(function() {
    var successScreen = document.getElementById('modalSuccess');
    if (successScreen) successScreen.style.display = 'none';
    if (mform) mform.style.display = '';
    if (sbtn) {
      sbtn.textContent = 'Send to iter8d Studio \u2192';
      sbtn.style.background = '';
      sbtn.disabled = false;
    }
  }, 400);
}

document.querySelectorAll('[data-modal="project"]').forEach(function(btn) {
  btn.addEventListener('click', function(e) { e.preventDefault(); openModal(); });
});
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (overlay) overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

// ── INJECT SUCCESS SCREEN INTO MODAL ─────────────────────────────────────────
(function() {
  var box = document.querySelector('.modal-box');
  if (!box) return;

  var successDiv = document.createElement('div');
  successDiv.id = 'modalSuccess';
  successDiv.style.cssText = [
    'display:none',
    'flex-direction:column',
    'align-items:center',
    'justify-content:center',
    'text-align:center',
    'padding:40px 20px',
    'min-height:320px'
  ].join(';');

  successDiv.innerHTML = [
    '<div style="width:72px;height:72px;border-radius:50%;background:#E8F5E9;display:flex;align-items:center;justify-content:center;margin:0 auto 28px;">',
      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none">',
        '<path d="M7 18l8 8L29 10" stroke="#2a7a3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
      '</svg>',
    '</div>',
    '<h2 style="font-family:Space Grotesk,sans-serif;font-size:26px;font-weight:700;color:#1A1A1A;letter-spacing:-0.02em;margin-bottom:12px;">',
      'Message sent!',
    '</h2>',
    '<p style="font-size:16px;color:#666;line-height:1.65;max-width:340px;margin:0 auto 8px;">',
      'We have received your enquiry. Redirecting you to book a discovery call\u2026',
    '</p>',
    '<p style="font-size:13px;color:#AAAAAA;margin-bottom:32px;">',
      'You will be redirected in <span id="countdownNum">3</span> seconds',
    '</p>',
    '<div style="width:100%;height:3px;background:#F0F0EE;border-radius:2px;overflow:hidden;">',
      '<div id="progressBar" style="height:100%;width:0%;background:#E8650A;border-radius:2px;transition:width 3s linear;"></div>',
    '</div>'
  ].join('');

  box.appendChild(successDiv);
})();

// ── FORM SUBMIT — Web3Forms + Success Screen + Calendly ───────────────────────
if (mform && sbtn) {
  mform.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validation
    var nameField  = mform.querySelector('[name="name"]');
    var emailField = mform.querySelector('[name="email"]');
    if (!nameField || !nameField.value.trim()) { alert('Please enter your name.'); return; }
    if (!emailField || !emailField.value.trim()) { alert('Please enter your email address.'); return; }

    sbtn.textContent = 'Sending\u2026';
    sbtn.disabled = true;

    var formData = new FormData(mform);
    if (!formData.get('access_key')) {
      formData.append('access_key', '50ec8fa5-96dc-41de-9fde-a5222ad75546');
    }
    formData.set('subject', 'New Project Enquiry \u2014 iter8d Studio');
    formData.set('from_name', 'iter8d Studio Website');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success) {

        // Hide form, show success screen
        mform.style.display = 'none';
        var successScreen = document.getElementById('modalSuccess');
        if (successScreen) {
          successScreen.style.display = 'flex';
          // Start progress bar
          setTimeout(function() {
            var bar = document.getElementById('progressBar');
            if (bar) bar.style.width = '100%';
          }, 50);
          // Countdown
          var count = 3;
          var countEl = document.getElementById('countdownNum');
          var timer = setInterval(function() {
            count--;
            if (countEl) countEl.textContent = count;
            if (count <= 0) {
              clearInterval(timer);
              closeModal();
              mform.reset();
              window.location.href = 'https://calendly.com/iter8dstudio/30min';
            }
          }, 1000);
        }

      } else {
        // Error
        sbtn.textContent = 'Failed \u2014 please email us directly.';
        sbtn.style.background = '#c0392b';
        sbtn.disabled = false;
      }
    })
    .catch(function() {
      sbtn.textContent = 'Network error \u2014 please email us directly.';
      sbtn.style.background = '#c0392b';
      sbtn.disabled = false;
    });
  });
}

// ── SERVICES ACCORDION ────────────────────────────────────────────────────────
document.querySelectorAll('.svc-header').forEach(function(header) {
  header.addEventListener('click', function() {
    var item = this.closest('.svc-item');
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.svc-item').forEach(function(el) { el.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  });
});

// ── WORK FILTERS ──────────────────────────────────────────────────────────────
var filterBtns = document.querySelectorAll('.filter-btn');
if (filterBtns.length) {
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var filter = this.textContent.trim();
      document.querySelectorAll('.wk-card').forEach(function(card) {
        if (filter === 'All') {
          card.classList.remove('hidden');
        } else {
          var cat = card.querySelector('.fw-cat, .wk-cat');
          var cardCat = cat ? cat.textContent.trim() : '';
          card.classList.toggle('hidden', cardCat.toLowerCase().indexOf(filter.toLowerCase()) < 0);
        }
      });
    });
  });
}
