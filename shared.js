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
}

document.querySelectorAll('[data-modal="project"]').forEach(function(btn) {
  btn.addEventListener('click', function(e) { e.preventDefault(); openModal(); });
});
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (overlay) overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

// ── FORM SUBMIT — Web3Forms + Calendly redirect ───────────────────────────────
if (mform && sbtn) {
  mform.addEventListener('submit', function(e) {
    e.preventDefault();

    // Basic validation
    var name  = mform.querySelector('[name="name"]');
    var email = mform.querySelector('[name="email"]');
    if (!name || !name.value.trim()) { alert('Please enter your name.'); return; }
    if (!email || !email.value.trim()) { alert('Please enter your email.'); return; }

    sbtn.textContent = 'Sending...';
    sbtn.disabled = true;

    var formData = new FormData(mform);

    // Ensure access key is included
    if (!formData.get('access_key')) {
      formData.append('access_key', '50ec8fa5-96dc-41de-9fde-a5222ad75546');
    }
    formData.set('subject', 'New Project Enquiry — iter8d Studio');
    formData.set('from_name', 'iter8d Studio Website');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if (data.success) {
        // Success state
        sbtn.textContent = '✓ Sent! Taking you to book a call...';
        sbtn.style.background = '#2a7a3a';
        mform.reset();

        // Close modal and redirect to Calendly after 2 seconds
        setTimeout(function() {
          closeModal();
          window.location.href = 'https://calendly.com/iter8dstudio/30min';
        }, 2000);

      } else {
        // Web3Forms returned an error
        console.error('Web3Forms error:', data);
        sbtn.textContent = 'Failed. Try emailing us directly.';
        sbtn.style.background = '#c0392b';
        sbtn.disabled = false;
        // Fallback — open mailto
        var n  = formData.get('name') || '';
        var em = formData.get('email') || '';
        var sv = formData.get('service') || '';
        var mg = formData.get('message') || '';
        window.location.href = 'mailto:studio@iter8dstudio.com?subject=New Project Enquiry from '
          + encodeURIComponent(n) + '&body='
          + encodeURIComponent('Name: ' + n + '\nEmail: ' + em + '\nService: ' + sv + '\n\nMessage:\n' + mg);
      }
    })
    .catch(function(err) {
      console.error('Network error:', err);
      sbtn.textContent = 'Network error. Please email us directly.';
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
