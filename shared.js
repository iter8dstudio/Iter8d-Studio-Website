/* iter8d Studio — shared.js */

// ── NAV SCROLL ──────────────────────────────────────
var navbar = document.getElementById('navbar');
var isHeroDark = false;

if (navbar) {
  // Detect if this page has a dark hero
  var darkHero = document.querySelector(
    '.page-hero, .about-hero, .services-hero, .work-hero, .blog-hero, .contact-hero, .process-hero'
  );
  if (darkHero) {
    navbar.classList.add('hero-dark');
    isHeroDark = true;
  }

  window.addEventListener('scroll', function() {
    var scrolled = window.scrollY > 60;
    navbar.classList.toggle('scrolled', scrolled);
  });
}

// ── SCROLL REVEAL ────────────────────────────────────
var reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  var ro = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        ro.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(function(el) { ro.observe(el); });
}

// ── HAMBURGER / MOBILE NAV ───────────────────────────
var hbg   = document.getElementById('hamburger');
var nmenu = document.getElementById('nav-menu');
if (hbg && nmenu) {
  hbg.addEventListener('click', function() {
    var isOpen = nmenu.classList.toggle('open');
    hbg.classList.toggle('active', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
  });
  nmenu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      nmenu.classList.remove('open');
      hbg.classList.remove('active');
      document.body.classList.remove('nav-open');
    });
  });
}

// ── ACTIVE NAV LINK ──────────────────────────────────
(function() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if (!page) page = 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    var href = link.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ── PROJECT MODAL ────────────────────────────────────
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
if (overlay)  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

// ── FORM SUBMIT (Formspree + mailto fallback) ────────
if (mform && sbtn) {
  mform.addEventListener('submit', function(e) {
    e.preventDefault();
    sbtn.textContent = 'Sending...';
    sbtn.disabled = true;
    var data = new FormData(mform);
    fetch(mform.action, {
      method: 'POST', body: data, headers: { 'Accept': 'application/json' }
    }).then(function(r) {
      if (r.ok) {
        sbtn.textContent = 'Sent! We will be in touch within 24 hours.';
        sbtn.style.background = '#2a7a3a';
        mform.reset();
      } else { throw new Error('server'); }
    }).catch(function() {
      var n  = data.get('name')    || '';
      var em = data.get('email')   || '';
      var sv = data.get('service') || '';
      var mg = data.get('message') || '';
      var body = encodeURIComponent('Name: ' + n + '\nEmail: ' + em + '\nService: ' + sv + '\n\nMessage:\n' + mg);
      window.location.href = 'mailto:studio@iter8dstudio.com?subject=New Project Enquiry from ' + encodeURIComponent(n) + '&body=' + body;
      sbtn.textContent = 'Send to iter8d Studio \u2192';
      sbtn.disabled = false;
    });
  });
}

// ── SERVICES ACCORDION ───────────────────────────────
document.querySelectorAll('.svc-header').forEach(function(header) {
  header.addEventListener('click', function() {
    var item = this.closest('.svc-item');
    var isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.svc-item').forEach(function(el) { el.classList.remove('open'); });
    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});

// ── WORK FILTERS ─────────────────────────────────────
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
          if (cardCat.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        }
      });
    });
  });
}
