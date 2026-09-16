/**
 * Sycamore Grounds Coffee House - Interactive App Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initStoreStatus();
  initMobileDrawer();
  initHeaderScroll();
  initMenuFilterAndSearch();
  initCateringCalculator();
  initModalViewer();
  initForms();
});

/* ==========================================================================
   1. STORE STATUS CALCULATOR (LIVE HOURS CHECK)
   ========================================================================== */
function initStoreStatus() {
  const statusBadges = document.querySelectorAll('.live-status-badge');
  if (!statusBadges.length) return;

  function checkStatus() {
    const now = new Date();
    const day = now.getDay(); // 0: Sunday, 1: Mon, ..., 6: Sat
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Monday-Friday: 6:00 AM (360 min) to 7:30 PM (1170 min)
    // Saturday-Sunday: 7:00 AM (420 min) to 7:30 PM (1170 min)
    const isWeekend = (day === 0 || day === 6);
    const openTimeInMinutes = isWeekend ? 420 : 360;
    const closeTimeInMinutes = 1170;

    const isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;

    statusBadges.forEach(badge => {
      if (isOpen) {
        badge.innerHTML = `
          <span class="status-dot"></span>
          <span>Open Now • Closes 7:30 PM</span>
        `;
        badge.style.color = '#34d399';
      } else {
        const nextOpenTime = isWeekend ? '7:00 AM' : '6:00 AM';
        badge.innerHTML = `
          <span class="status-dot" style="background: #f87171; box-shadow: 0 0 8px #f87171;"></span>
          <span>Closed Now • Opens ${nextOpenTime}</span>
        `;
        badge.style.color = '#fca5a5';
      }
    });
  }

  checkStatus();
  setInterval(checkStatus, 60000); // refresh every minute
}

/* ==========================================================================
   2. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle-btn');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close-btn');
  const drawerLinks = document.querySelectorAll('.drawer-link, .drawer-actions a');

  if (!toggleBtn || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
    toggleBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    toggleBtn.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  overlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   3. STICKY HEADER SCROLL EFFECT
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   4. INTERACTIVE MENU FILTER & SEARCH
   ========================================================================== */
function initMenuFilterAndSearch() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const searchInput = document.querySelector('.menu-search-input');
  const menuItems = document.querySelectorAll('.menu-item-card');
  const noResultsMsg = document.querySelector('.menu-no-results');

  if (!menuItems.length) return;

  let currentCategory = 'all';
  let currentSearchQuery = '';

  // Check URL query parameter for category (e.g. menu.html?cat=hot)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
      const targetBtn = Array.from(tabBtns).find(b => b.getAttribute('data-filter') === catParam);
      if (targetBtn) {
        tabBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        currentCategory = catParam;
      }
    }
  } catch (err) {
    // URLSearchParams fallback
  }

  function filterItems() {
    let visibleCount = 0;

    menuItems.forEach(card => {
      const cardCategories = (card.getAttribute('data-category') || '').split(' ');
      const title = (card.querySelector('.item-title')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.item-desc')?.textContent || '').toLowerCase();
      const tags = (card.querySelector('.item-tag')?.textContent || '').toLowerCase();

      const matchesCategory = currentCategory === 'all' || cardCategories.includes(currentCategory);
      const matchesSearch = !currentSearchQuery ||
        title.includes(currentSearchQuery) ||
        desc.includes(currentSearchQuery) ||
        tags.includes(currentSearchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      filterItems();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      filterItems();
    });
  }

  const resetSearchBtn = document.querySelector('.reset-search-btn');
  if (resetSearchBtn && searchInput) {
    resetSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      currentCategory = 'all';
      tabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'all'));
      filterItems();
    });
  }

  // If a category was pre-selected via URL, filter immediately
  if (currentCategory !== 'all') {
    filterItems();
  }
}

/* ==========================================================================
   5. CATERING COST CALCULATOR
   ========================================================================== */
function initCateringCalculator() {
  const calcForm = document.querySelector('#catering-calculator-form');
  if (!calcForm) return;

  const checkboxes = calcForm.querySelectorAll('input[type="checkbox"]');
  const totalDisplay = document.querySelector('#calc-running-total');
  const itemsCountDisplay = document.querySelector('#calc-items-count');
  const copyOrderBtn = document.querySelector('#copy-order-btn');

  function calculateTotal() {
    let total = 0;
    let count = 0;
    const selectedItems = [];

    checkboxes.forEach(cb => {
      if (cb.checked) {
        const price = parseFloat(cb.getAttribute('data-price')) || 0;
        const name = cb.getAttribute('data-name') || cb.name;
        total += price;
        count++;
        selectedItems.push(`${name} ($${price.toFixed(2)})`);
      }
    });

    if (totalDisplay) {
      totalDisplay.textContent = `$${total.toFixed(2)}`;
    }
    if (itemsCountDisplay) {
      itemsCountDisplay.textContent = `${count} ${count === 1 ? 'item' : 'items'} selected`;
    }

    return { total, count, selectedItems };
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', calculateTotal);
  });

  if (copyOrderBtn) {
    copyOrderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const { total, count, selectedItems } = calculateTotal();
      if (count === 0) {
        showToast('Please select at least one catering item first!');
        return;
      }

      const summaryText = `Sycamore Grounds Catering Request:\n\n` +
        selectedItems.join('\n') +
        `\n\nEstimated Total: $${total.toFixed(2)}\n\nPlease specify delivery/pickup location and date (48-hr notice preferred).`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(summaryText).then(() => {
          showToast('Order summary copied to clipboard! Opening Catering Form...');
          setTimeout(() => {
            window.open('https://forms.gle/D98VTQpNzoLvMCvq7', '_blank');
          }, 1200);
        }).catch(() => {
          window.open('https://forms.gle/D98VTQpNzoLvMCvq7', '_blank');
        });
      } else {
        window.open('https://forms.gle/D98VTQpNzoLvMCvq7', '_blank');
      }
    });
  }

  calculateTotal();
}

/* ==========================================================================
   6. MODAL IMAGE VIEWER
   ========================================================================== */
function initModalViewer() {
  const modal = document.querySelector('#image-preview-modal');
  const modalImg = document.querySelector('#modal-preview-img');
  const closeBtn = document.querySelector('.modal-close-btn');
  const triggerBtns = document.querySelectorAll('[data-view-image]');

  if (!modal || !modalImg) return;

  function openModal(src, alt) {
    modalImg.src = src;
    modalImg.alt = alt || 'Menu Preview';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const src = btn.getAttribute('data-view-image');
      const alt = btn.getAttribute('data-image-alt');
      if (src) openModal(src, alt);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* ==========================================================================
   7. FORM HANDLING & TOAST NOTIFICATION
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function initForms() {
  // Contact Form
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('[name="name"]')?.value;
      showToast(`Thank you, ${name || 'friend'}! Your message has been received. We will get back to you within 1-2 business days.`);
      contactForm.reset();
    });
  }

  // Newsletter Form
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        showToast(`Thank you for subscribing with ${emailInput.value}! Stay tuned for seasonal specials.`);
        form.reset();
      }
    });
  });
}
