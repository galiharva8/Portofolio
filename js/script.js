(function () {
  'use strict';

  const projects = PORTFOLIO.projects;
  const featuredIds = PORTFOLIO.featuredIds;

  /* ——— Theme ——— */
  const THEME_KEY = 'galih-portfolio-theme';
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode');
    }
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  /* ——— Nav ——— */
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');
  const navLinks = document.querySelectorAll('.nav__link');

  function closeNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navMenu.classList.toggle('is-open', !open);
      document.body.classList.toggle('nav-open', !open);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }, { passive: true });

  /* ——— Footer year ——— */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ——— Social placeholders ——— */
  document.querySelectorAll('[data-social]').forEach((el) => {
    if (el.getAttribute('href') === '#') {
      el.addEventListener('click', (e) => e.preventDefault());
    }
  });

  /* ——— Reveal on scroll ——— */
  function registerRevealElements(elements) {
    const list = elements instanceof NodeList ? [...elements] : elements;
    if (!list.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      list.forEach((el) => io.observe(el));
    } else {
      list.forEach((el) => el.classList.add('is-visible'));
    }
  }

  registerRevealElements(document.querySelectorAll('.reveal'));

  /* ——— Awards ——— */
  const awardsGrid = document.getElementById('awards-grid');
  if (awardsGrid) {
    awardsGrid.innerHTML = PORTFOLIO.awards
      .map((award) => {
        const image = award.image || award.gallery?.[0];

        return `
          <article class="edu-card award-card reveal">
            <button class="award-card__trigger" type="button" data-award-id="${escapeHtml(award.id)}" aria-label="View award details: ${escapeHtml(award.title)}">
              ${image ? `<img class="award-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(award.title)}" loading="lazy">` : ''}
              <span class="edu-card__year">${escapeHtml(award.date)} · ${escapeHtml(award.category)}</span>
              <span class="edu-card__title">${escapeHtml(award.title)}</span>
              <span class="edu-card__place">${escapeHtml(award.description)}</span>
              <span class="project-card__link">View Details</span>
            </button>
          </article>
        `;
      })
      .join('');

    registerRevealElements(awardsGrid.querySelectorAll('.reveal'));
    awardsGrid.querySelectorAll('[data-award-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const award = PORTFOLIO.awards.find((item) => item.id === button.dataset.awardId);
        if (award) openAwardModal(award);
      });
    });
  }

  /* ——— Project cards ——— */
  let cardVideoObserver = null;
  let projectModalOpen = false;

  function projectCardHTML(project, options = {}) {
    const sub = project.subcategory ? `<span class="card__sub">${escapeHtml(project.subcategory)}</span>` : '';
    const btnLabel = project.category === 'video' ? 'View Video' : 'View Project';
    const autoplayPreview = project.cardPreview
      ? `<video class="project-card__video" data-src="${escapeHtml(project.cardPreview)}" autoplay muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>`
      : '';
    const media = `
      <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} preview" loading="lazy" width="600" height="400">
      ${autoplayPreview}`;
    return `
      <article class="project-card ${options.featured ? 'project-card--featured' : ''}" data-id="${escapeHtml(project.id)}" data-category="${escapeHtml(project.category)}">
        <button type="button" class="project-card__trigger" aria-label="Open ${escapeHtml(project.title)}">
          <div class="project-card__media${autoplayPreview ? ' project-card__media--video' : ''}">
            ${media}
            <span class="project-card__badge">${escapeHtml(project.categoryLabel)}</span>
          </div>
          <div class="project-card__body">
            ${sub}
            <h3 class="project-card__title">${escapeHtml(project.title)}</h3>
            <p class="project-card__tools">${escapeHtml(project.tools.join(' · '))}</p>
            <span class="project-card__link">${btnLabel}</span>
          </div>
        </button>
      </article>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getProjectById(id) {
    return projects.find((p) => p.id === id);
  }

  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid) {
    const featured = featuredIds
      .map((id) => getProjectById(id))
      .filter(Boolean);
    featuredGrid.innerHTML = featured.map((p) => projectCardHTML(p, { featured: true })).join('');
    bindProjectCards(featuredGrid);
  }

  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    projectsGrid.innerHTML = projects.map((p) => projectCardHTML(p)).join('');
    bindProjectCards(projectsGrid);
  }

  function bindProjectCards(container) {
    const videoFrames = container.querySelectorAll('.project-card__video');
    if (videoFrames.length && 'IntersectionObserver' in window) {
      if (!cardVideoObserver) {
        cardVideoObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const media = entry.target;
            if (entry.isIntersecting && !projectModalOpen) {
              const frame = media.querySelector('.project-card__video');
              if (!frame) return;

              if (frame instanceof HTMLVideoElement) {
                if (!frame.src) {
                  frame.src = frame.dataset.src;
                  frame.load();
                }
                const playAttempt = frame.play();
                if (playAttempt && typeof playAttempt.catch === 'function') playAttempt.catch(() => {});
              } else if (!frame.hasAttribute('src')) {
                const videoId = frame.dataset.videoId;
                frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0`;
              }
              media.classList.add('is-playing');
            } else {
              stopCardVideo(media);
            }
          });
        }, { threshold: 0.35 });
      }
      videoFrames.forEach((frame) => cardVideoObserver.observe(frame.parentElement));
    }

    container.querySelectorAll('.project-card__trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.project-card');
        const id = card?.getAttribute('data-id');
        if (id) openProjectModal(id);
      });
    });
  }

  /* ——— Filter ——— */
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.getAttribute('data-filter');
      filterProjects(filter);
    });
  });

  function filterProjects(filter) {
    if (!projectsGrid) return;
    stopCardVideos();
    projectsGrid.classList.toggle('projects-grid--photo', filter === 'photography');
    const cards = projectsGrid.querySelectorAll('.project-card');
    cards.forEach((card) => {
      const cat = card.getAttribute('data-category');
      const show = filter === 'all' || cat === filter;
      card.classList.toggle('is-hidden', !show);
    });
  }

  /* ——— Modal ——— */
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  let lastFocus = null;
  let modalVideoObserver = null;

  function setModalVideoPlayback(frame, isVisible) {
    if (frame instanceof HTMLVideoElement) {
      if (isVisible) {
        if (!frame.src) {
          frame.src = frame.dataset.src;
          frame.load();
        }
        const playAttempt = frame.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(() => {
            const hint = modalBody?.querySelector('.modal__hint');
            if (hint) hint.textContent = 'Autoplay is blocked by the browser. Press the play button on the video to start it.';
          });
        }
      } else {
        frame.pause();
      }
      return;
    }

    if (isVisible) {
      if (!frame.hasAttribute('src')) {
        frame.src = frame.dataset.embedUrl;
      } else {
        frame.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":[]}', 'https://www.youtube-nocookie.com');
      }
    } else if (frame.hasAttribute('src')) {
      frame.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":[]}', 'https://www.youtube-nocookie.com');
    }
  }

  function observeModalVideo(frame) {
    if ('IntersectionObserver' in window) {
      if (!modalVideoObserver) {
        modalVideoObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            setModalVideoPlayback(entry.target, entry.isIntersecting);
          });
        }, { threshold: 0.35 });
      }
      modalVideoObserver.observe(frame);
    } else {
      setModalVideoPlayback(frame, true);
    }
  }

  function stopModalVideo() {
    modalVideoObserver?.disconnect();
    modalVideoObserver = null;
    modalBody?.querySelectorAll('.modal__embed iframe, .modal__video-preview video').forEach((player) => {
      if (player instanceof HTMLVideoElement) {
        player.pause();
        player.removeAttribute('src');
        player.load();
      } else {
        player.src = 'about:blank';
        player.removeAttribute('src');
        player.remove();
      }
    });
  }

  function stopCardVideos() {
    document.querySelectorAll('.project-card__video').forEach((frame) => {
      stopCardVideo(frame.parentElement);
    });
  }

  function stopCardVideo(media) {
    const frame = media.querySelector('.project-card__video');
    if (!frame) return;
    if (frame instanceof HTMLVideoElement) {
      frame.pause();
      frame.removeAttribute('src');
      frame.load();
    } else {
      frame.src = 'about:blank';
    }
    frame.removeAttribute('src');
    media.classList.remove('is-playing');
  }

  function getYouTubeVideoId(url) {
    if (!url) return '';

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return '';
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(hostname)) {
      return '';
    }

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const videoId = hostname === 'youtu.be'
      ? pathParts[0]
      : parsedUrl.searchParams.get('v') || (['shorts', 'embed'].includes(pathParts[0]) ? pathParts[1] : '');

    return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : '';
  }

  function getYouTubeEmbedUrl(videoId) {
    const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    embedUrl.search = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      playsinline: '1',
      loop: '1',
      playlist: videoId,
      enablejsapi: '1',
      rel: '0'
    }).toString();
    if (['http:', 'https:'].includes(window.location.protocol)) {
      embedUrl.searchParams.set('origin', window.location.origin);
    }
    return embedUrl.toString();
  }

  function openProjectModal(id) {
    const project = getProjectById(id);
    if (!project || !modal || !modalBody) return;

    projectModalOpen = true;
    stopCardVideos();
    stopModalVideo();
    const isVideo = project.category === 'video';
    const isPhoto = project.category === 'photography';
    const youtubeUrl = project.youtubeUrl || (getYouTubeVideoId(project.externalLink) ? project.externalLink : '');
    const youtubeVideoId = isVideo
      ? getYouTubeVideoId(youtubeUrl)
      : '';

    let mediaBlock = '';
    if (isVideo) {
      if (youtubeVideoId) {
        mediaBlock = `
          <div class="modal__video-preview">
            <div class="modal__video-frame modal__embed">
              <iframe
                data-youtube-player
                data-embed-src="${escapeHtml(getYouTubeEmbedUrl(youtubeVideoId))}"
                title="${escapeHtml(project.title)} video preview"
                referrerpolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen></iframe>
            </div>
            <p class="modal__hint">If the player shows “Video unavailable” or an embedding error, the video cannot play in the modal. Use the Watch Full Video on YouTube button below. Autoplay may also be blocked by the browser.</p>
          </div>`;
      } else if (project.videoPreview) {
        mediaBlock = `
          <div class="modal__video-preview">
            <div class="modal__video-frame">
              <video data-src="${escapeHtml(project.videoPreview)}" muted loop controls playsinline preload="none" aria-label="${escapeHtml(project.title)}"></video>
            </div>
          </div>`;
      } else {
        mediaBlock = `
          <div class="modal__video-preview">
            <div class="modal__video-frame modal__video-placeholder">
              <p>${youtubeUrl ? 'Invalid or unsupported YouTube URL. Check the link in js/data.js.' : 'No video preview is available for this project yet.'}</p>
            </div>
          </div>`;
      }
    } else if (project.gallery && project.gallery.length) {
      const photoClass = isPhoto ? ' modal__gallery--photo' : '';
      mediaBlock = `<div class="modal__gallery${photoClass}">${project.gallery
        .map(
          (src, i) =>
            `<button type="button" class="modal__gallery-item" data-lightbox-from-modal="${escapeHtml(project.id)}" data-index="${i}">
              <img src="${escapeHtml(src)}" alt="${escapeHtml(project.title)} ${i + 1}" loading="lazy">
            </button>`
        )
        .join('')}</div>`;
    }

    const extLink =
      project.externalLink &&
      `<p><a class="btn btn--outline" href="${escapeHtml(project.externalLink)}" target="_blank" rel="noopener noreferrer">External Link</a></p>`;

    const videoExt = isVideo && youtubeVideoId
      ? `<p><a class="btn btn--outline modal__video-open" href="https://www.youtube.com/watch?v=${youtubeVideoId}" target="_blank" rel="noopener noreferrer">Watch Full Video on YouTube</a></p>`
      : isVideo && project.externalLink && !project.videoPreview && !youtubeUrl
        ? `<p><a class="btn btn--primary" href="${escapeHtml(project.externalLink)}" target="_blank" rel="noopener noreferrer">Open Video</a></p>`
        : '';

    modalBody.innerHTML = `
      <header class="modal__header">
        <span class="modal__category">${escapeHtml(project.categoryLabel)}${project.subcategory ? ' · ' + escapeHtml(project.subcategory) : ''}</span>
        <h2 class="modal__title" id="modal-title">${escapeHtml(project.title)}</h2>
        <p class="modal__meta"><span>Year</span> ${escapeHtml(project.year)} · <span>Tools</span> ${escapeHtml(project.tools.join(', '))}</p>
      </header>
      <div class="modal__content">
        <section>
          <h3>Description</h3>
          <p>${escapeHtml(project.description)}</p>
        </section>
        <section>
          <h3>My Role</h3>
          <p>${escapeHtml(project.role)}</p>
        </section>
        <section>
          <h3>Process</h3>
          <p>${escapeHtml(project.process)}</p>
        </section>
        <section>
          <h3>Final Result</h3>
          ${mediaBlock}
          ${videoExt || ''}
          ${!isVideo ? extLink || '' : !project.externalLink ? extLink || '' : ''}
        </section>
      </div>
    `;

    modalBody.querySelectorAll('[data-lightbox-from-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        openLightbox(project.gallery, idx, project.title);
      });
    });

    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.modal__close')?.focus();

    modalBody.querySelectorAll('[data-youtube-player]').forEach((frame) => {
      frame.src = frame.dataset.embedSrc;
      observeModalVideo(frame);
    });

    const previewVideo = modalBody.querySelector('.modal__video-preview video');
    if (previewVideo) {
      observeModalVideo(previewVideo);
    }
  }

  function openAwardModal(award) {
    if (!modal || !modalBody) return;

    projectModalOpen = true;
    stopCardVideos();
    stopModalVideo();
    const photos = award.gallery?.length ? award.gallery : (award.image ? [award.image] : []);
    const videoPoster = award.image || photos[0] || '';
    const photoGallery = photos.length
      ? `<div class="award-modal__gallery">${photos
          .map(
            (src, index) =>
              `<button type="button" class="award-modal__photo" data-award-lightbox-index="${index}">
                <img src="${escapeHtml(src)}" alt="${escapeHtml(award.title)} ${index + 1}" loading="lazy">
              </button>`
          )
          .join('')}</div>`
      : '';
    const video = award.videoPreview
      ? `<div class="modal__video-preview">
          <div class="modal__video-frame">
            <video data-src="${escapeHtml(award.videoPreview)}" ${videoPoster ? `poster="${escapeHtml(videoPoster)}"` : ''} muted loop controls playsinline preload="none" aria-label="${escapeHtml(award.title)}"></video>
          </div>
        </div>`
      : '';

    modalBody.innerHTML = `
      <header class="modal__header">
        <span class="modal__category">${escapeHtml(award.category)}</span>
        <h2 class="modal__title" id="modal-title">${escapeHtml(award.title)}</h2>
        <p class="modal__meta"><span>Date</span> ${escapeHtml(award.date)} · <span>Category</span> ${escapeHtml(award.category)}</p>
      </header>
      <div class="modal__content">
        <section>
          <h3>Description</h3>
          <p>${escapeHtml(award.description)}</p>
        </section>
        <section>
          <h3>Final Result</h3>
          ${photoGallery}
          ${video}
        </section>
      </div>
    `;

    modalBody.querySelectorAll('[data-award-lightbox-index]').forEach((button) => {
      button.addEventListener('click', () => {
        openLightbox(photos, Number(button.dataset.awardLightboxIndex), award.title);
      });
    });

    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.modal__close')?.focus();

    const previewVideo = modalBody.querySelector('.modal__video-preview video');
    if (previewVideo) observeModalVideo(previewVideo);
  }

  function closeModal() {
    if (!modal) return;
    stopModalVideo();
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    projectModalOpen = false;
    document.querySelectorAll('.project-card__media--video').forEach((media) => {
      if (cardVideoObserver) {
        cardVideoObserver.unobserve(media);
        cardVideoObserver.observe(media);
      }
    });
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  modal?.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && !lightbox.hidden) closeLightbox();
      else if (modal && !modal.hidden) closeModal();
    }
  });

  /* ——— Lightbox (photography) ——— */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  let lightboxItems = [];
  let lightboxIndex = 0;

  function openLightbox(sources, index, title) {
    if (!lightbox || !lightboxImg) return;
    lightboxItems = sources;
    lightboxIndex = index;
    showLightboxImage(title);
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }

  function showLightboxImage(title) {
    const src = lightboxItems[lightboxIndex];
    lightboxImg.src = src;
    lightboxImg.alt = `${title} — image ${lightboxIndex + 1}`;
    if (lightboxCaption) {
      lightboxCaption.textContent = `${title} (${lightboxIndex + 1}/${lightboxItems.length})`;
    }
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.classList.remove('lightbox-open');
  }

  function lightboxStep(delta) {
    if (!lightboxItems.length) return;
    lightboxIndex = (lightboxIndex + delta + lightboxItems.length) % lightboxItems.length;
    const title = lightboxCaption?.textContent?.split(' (')[0] || 'Photo';
    showLightboxImage(title);
  }

  document.querySelector('[data-close-lightbox]')?.addEventListener('click', closeLightbox);
  document.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => lightboxStep(-1));
  document.querySelector('[data-lightbox-next]')?.addEventListener('click', () => lightboxStep(1));

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ——— Certificates ——— */
  const certGrid = document.getElementById('certificates-grid');
  if (certGrid) {
    certGrid.innerHTML = PORTFOLIO.certificates
      .map(
        (c) => `
      <article class="cert-card reveal">
        <div class="cert-card__preview">
          <img src="${escapeHtml(c.preview)}" alt="${escapeHtml(c.title)} preview" loading="lazy" width="280" height="180">
        </div>
        <div class="cert-card__body">
          <h3 class="cert-card__title">${escapeHtml(c.title)}</h3>
          <p class="cert-card__org">${escapeHtml(c.organizer)}</p>
          <p class="cert-card__year">${escapeHtml(c.year)}</p>
          <a class="btn btn--outline btn--sm" href="${escapeHtml(c.pdfUrl)}" target="_blank" rel="noopener noreferrer">View Certificate</a>
        </div>
      </article>
    `
      )
      .join('');

    registerRevealElements(certGrid.querySelectorAll('.reveal'));
  }
})();
