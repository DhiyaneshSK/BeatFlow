/**
 * BeatFlow Coordinator (Application Controller)
 * Orchestrates music catalog, search filters, audio playback controls, queue management,
 * drag-and-drop file uploads, shopping cart transactions, contract generation, and royalty splitting.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- APPLICATION STATE ---
  const state = {
    db: null,
    tracks: [],          // Raw catalog tracks loaded from IndexedDB
    filteredTracks: [],  // Currently filtered catalog tracks
    cart: [],            // Licensing cart array: [{ track, licenseType, price }]
    queue: [],           // Audio queue array: [track]
    currentTrackIndex: -1,
    isPlaying: false,
    isMuted: false,
    volume: 0.7,
    shuffle: false,
    repeat: false,       // false = no repeat, 'one' = repeat current, 'all' = repeat queue
    activeTrackBlobUrls: [], // Tracking URLs to revoke later
    uploadedAudioBlob: null,
    uploadedArtBlob: null,
    activeLicenseContracts: [] // Generated agreements for successful checkouts
  };

  // --- DOM ELEMENT CACHE ---
  const dom = {
    catalogGrid: document.getElementById('music-catalog-grid'),
    searchField: document.getElementById('search-input-field'),
    bpmMin: document.getElementById('bpm-min'),
    bpmMax: document.getElementById('bpm-max'),
    keySelect: document.getElementById('key-signature-select'),
    genreTagsContainer: document.getElementById('genre-tags-list'),
    
    // Player DOM
    audioNode: document.getElementById('main-audio-node'),
    playBtn: document.getElementById('play-btn'),
    playIcon: document.getElementById('play-icon-state'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    shuffleBtn: document.getElementById('shuffle-btn'),
    repeatBtn: document.getElementById('repeat-btn'),
    seekSlider: document.getElementById('seek-slider'),
    currentTimeLabel: document.getElementById('current-time-val'),
    durationTimeLabel: document.getElementById('duration-time-val'),
    volumeSlider: document.getElementById('volume-slider'),
    volumeBtn: document.getElementById('mute-btn'),
    volumeIcon: document.getElementById('volume-icon-state'),
    playerArt: document.getElementById('current-player-art'),
    playerTitle: document.getElementById('current-player-title'),
    playerArtist: document.getElementById('current-player-artist'),
    playerMeta: document.getElementById('current-player-meta'),
    
    // Drawers
    cartShelf: document.getElementById('cart-shelf'),
    cartShelfBody: document.getElementById('cart-shelf-body'),
    cartBadgeCount: document.getElementById('cart-badge-count'),
    openCartBtn: document.getElementById('open-cart-btn'),
    closeCartBtn: document.getElementById('close-cart-btn'),
    checkoutItemsCount: document.getElementById('checkout-items-count'),
    checkoutTotalPrice: document.getElementById('checkout-total-price'),
    buyerNameField: document.getElementById('buyer-name-field'),
    checkoutBtn: document.getElementById('checkout-btn'),
    
    queueShelf: document.getElementById('queue-shelf'),
    queueShelfBody: document.getElementById('queue-shelf-body'),
    openQueueBtn: document.getElementById('toggle-queue-btn'),
    closeQueueBtn: document.getElementById('close-queue-btn'),
    clearQueueBtn: document.getElementById('clear-queue-btn'),

    // Modals
    uploadModal: document.getElementById('upload-modal'),
    openUploadBtn: document.getElementById('open-upload-btn'),
    closeUploadModal: document.getElementById('close-upload-modal'),
    cancelUploadBtn: document.getElementById('cancel-upload-btn'),
    uploadForm: document.getElementById('track-upload-form'),
    audioDropZone: document.getElementById('audio-drop-zone'),
    artDropZone: document.getElementById('art-drop-zone'),
    audioFileInput: document.getElementById('audio-file-input'),
    artFileInput: document.getElementById('art-file-input'),
    audioFileStatus: document.getElementById('audio-file-status'),
    coverArtPreviewBox: document.getElementById('cover-art-preview-box'),
    coverArtPreviewImg: document.getElementById('cover-art-preview-img'),
    coverPreviewFilename: document.getElementById('cover-preview-filename'),

    contractModal: document.getElementById('contract-modal'),
    contractViewerBody: document.getElementById('contract-viewer-body'),
    confirmContractBtn: document.getElementById('confirm-contract-btn'),
    closeContractModal: document.getElementById('close-contract-modal'),

    // Splits
    simulatedSalePrice: document.getElementById('simulated-sale-price'),
    splitProducer: document.getElementById('split-producer'),
    splitVocalist: document.getElementById('split-vocalist'),
    splitWriter: document.getElementById('split-writer'),
    sliderProducer: document.getElementById('slider-producer'),
    sliderVocalist: document.getElementById('slider-vocalist'),
    sliderWriter: document.getElementById('slider-writer'),
    payoutProducer: document.getElementById('payout-producer'),
    payoutVocalist: document.getElementById('payout-vocalist'),
    payoutWriter: document.getElementById('payout-writer'),
    payoutTotalPercent: document.getElementById('payout-total-percent'),

    // Stats
    totalStreamLabel: document.getElementById('total-stream-val'),
    estRoyaltiesLabel: document.getElementById('est-royalties-val'),
    
    toastContainer: document.getElementById('toast-container')
  };

  // --- INITIALIZE VISUALIZER ---
  const visualizer = new BeatFlowVisualizer(document.getElementById('eq-canvas'));

  // --- DATABASE INITIALIZATION ---
  try {
    state.db = new BeatFlowDB();
    await state.db.init();
    await loadTracksFromDb();
  } catch (err) {
    showToast('Failed to load database. Local uploads may not persist.', 'error');
  }

  // --- UTILITY: RENDER COVERS & AUDIO SOURCE ---
  function getMediaUrl(media) {
    if (!media) return '';
    if (media instanceof Blob) {
      const url = URL.createObjectURL(media);
      state.activeTrackBlobUrls.push(url);
      return url;
    }
    // Programmatic picsum 404 fix: convert picsum id paths to seed paths for reliable rendering
    if (typeof media === 'string' && media.includes('picsum.photos/id/')) {
      const parts = media.split('/');
      const idIndex = parts.indexOf('id');
      if (idIndex !== -1 && parts[idIndex + 1]) {
        const id = parts[idIndex + 1];
        return `https://picsum.photos/seed/picsum-seed-${id}/300/300`;
      }
    }
    return media; // CDN URL or Base64
  }

  function cleanActiveBlobUrls() {
    state.activeTrackBlobUrls.forEach(url => URL.revokeObjectURL(url));
    state.activeTrackBlobUrls = [];
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${icon}" style="color: ${type === 'success' ? 'var(--accent-cyan)' : type === 'error' ? '#ef4444' : 'var(--accent-purple)'}"></i>
      <span>${message}</span>
    `;
    
    dom.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // --- DATABASE LOADER ---
  async function loadTracksFromDb() {
    if (!state.db) return;
    state.tracks = await state.db.getAllTracks();
    applyCatalogFilters();
    updateStreamStats();
  }

  function updateStreamStats() {
    let totalStreams = 0;
    state.tracks.forEach(track => {
      totalStreams += track.streams || 0;
    });
    dom.totalStreamLabel.textContent = totalStreams.toLocaleString();
    dom.estRoyaltiesLabel.textContent = '$' + (totalStreams * 0.004).toFixed(2);
  }

  // --- CATALOG RENDERING & FILTERING ---
  function applyCatalogFilters() {
    const query = dom.searchField.value.toLowerCase().trim();
    const minBpm = parseInt(dom.bpmMin.value) || 0;
    const maxBpm = parseInt(dom.bpmMax.value) || 999;
    const key = dom.keySelect.value;
    const activeGenreTag = document.querySelector('.genre-tag.active');
    const genre = activeGenreTag ? activeGenreTag.getAttribute('data-genre') : 'All';

    state.filteredTracks = state.tracks.filter(track => {
      const matchesSearch = track.title.toLowerCase().includes(query) || 
                            track.artist.toLowerCase().includes(query) ||
                            track.genre.toLowerCase().includes(query);
      const matchesBpm = track.BPM >= minBpm && track.BPM <= maxBpm;
      const matchesKey = key === 'All' || track.keySignature === key;
      const matchesGenre = genre === 'All' || track.genre === genre;

      return matchesSearch && matchesBpm && matchesKey && matchesGenre;
    });

    renderCatalog();
  }

  function renderCatalog() {
    dom.catalogGrid.innerHTML = '';
    
    if (state.filteredTracks.length === 0) {
      dom.catalogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <i data-lucide="music-2" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 12px;"></i>
          <p>No matching tracks found in the catalog.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    state.filteredTracks.forEach(track => {
      const card = document.createElement('article');
      card.className = 'track-card';
      card.setAttribute('data-id', track.id);

      const coverSrc = getMediaUrl(track.coverArt);

      card.innerHTML = `
        <div class="track-art-wrapper">
          <img src="${coverSrc}" alt="${track.title} Cover Art" class="track-art" loading="lazy">
          <div class="card-overlay">
            <button class="play-overlay-btn" data-action="play" aria-label="Play Track">
              <i data-lucide="play"></i>
            </button>
          </div>
        </div>
        
        <div class="track-info">
          <h3 class="track-title" title="${track.title}">${track.title}</h3>
          <span class="track-artist" title="${track.artist}">${track.artist}</span>
        </div>

        <div class="track-meta">
          <span><strong>BPM:</strong> ${track.BPM}</span>
          <span><strong>Key:</strong> ${track.keySignature}</span>
          <span><strong>Genre:</strong> ${track.genre}</span>
        </div>

        <div class="license-selector">
          <div class="price-options">
            <div class="price-option-row active" data-license="standard" data-price="${track.prices.standard}">
              <span class="license-name">Standard Rights</span>
              <span class="license-price">$${track.prices.standard.toFixed(2)}</span>
            </div>
            <div class="price-option-row" data-license="premium" data-price="${track.prices.premium}">
              <span class="license-name">Premium Lease</span>
              <span class="license-price">$${track.prices.premium.toFixed(2)}</span>
            </div>
            <div class="price-option-row" data-license="exclusive" data-price="${track.prices.exclusive}">
              <span class="license-name">Exclusive Buyout</span>
              <span class="license-price">$${track.prices.exclusive.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="card-action-bar">
          <button class="btn btn-license-cart" data-action="add-cart">
            <i data-lucide="shopping-cart"></i>
            <span>Add Cart</span>
          </button>
          <button class="btn" data-action="queue" title="Add to Queue" aria-label="Queue track">
            <i data-lucide="list-plus"></i>
          </button>
          <button class="btn" style="color: #ef4444;" data-action="delete" title="Delete Track" aria-label="Delete track">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;

      // Set pricing selection events
      const priceRows = card.querySelectorAll('.price-option-row');
      priceRows.forEach(row => {
        row.addEventListener('click', () => {
          priceRows.forEach(r => r.classList.remove('active'));
          row.classList.add('active');
        });
      });

      // Actions Handler
      card.addEventListener('click', async (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn) return;
        
        const action = targetBtn.getAttribute('data-action');
        if (action === 'play') {
          playCatalogTrack(track);
        } else if (action === 'queue') {
          addToQueue(track);
          showToast(`"${track.title}" added to queue.`);
        } else if (action === 'add-cart') {
          const selectedPriceRow = card.querySelector('.price-option-row.active');
          const licenseType = selectedPriceRow.getAttribute('data-license');
          const price = parseFloat(selectedPriceRow.getAttribute('data-price'));
          addToCart(track, licenseType, price);
        } else if (action === 'delete') {
          if (confirm(`Are you sure you want to delete "${track.title}"?`)) {
            await state.db.deleteTrack(track.id);
            showToast(`Deleted "${track.title}" successfully.`, 'success');
            await loadTracksFromDb();
          }
        }
      });

      dom.catalogGrid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // --- SEARCH AND FILTER INTERACTIVE EVENTS ---
  dom.searchField.addEventListener('input', applyCatalogFilters);
  dom.bpmMin.addEventListener('input', applyCatalogFilters);
  dom.bpmMax.addEventListener('input', applyCatalogFilters);
  dom.keySelect.addEventListener('change', applyCatalogFilters);

  dom.genreTagsContainer.addEventListener('click', (e) => {
    const clickedTag = e.target.closest('.genre-tag');
    if (!clickedTag) return;

    dom.genreTagsContainer.querySelectorAll('.genre-tag').forEach(tag => {
      tag.classList.remove('active');
    });
    clickedTag.classList.add('active');
    applyCatalogFilters();
  });

  // --- AUDIO CONTROLLER ENGINE ---

  function playCatalogTrack(track) {
    const trackIndex = state.tracks.findIndex(t => t.id === track.id);
    if (trackIndex !== -1) {
      // Find position inside the virtual queue or push into playlist queue
      state.currentTrackIndex = trackIndex;
      loadAndPlayTrack(track);
    }
  }

  async function loadAndPlayTrack(track) {
    if (!track) return;
    
    // Revoke previous URLs to clear memory
    cleanActiveBlobUrls();
    
    const srcUrl = getMediaUrl(track.audioSrc);
    const coverUrl = getMediaUrl(track.coverArt);

    dom.audioNode.src = srcUrl;
    dom.audioNode.load();
    
    // Update player interface
    dom.playerTitle.textContent = track.title;
    dom.playerArtist.textContent = track.artist;
    dom.playerArt.src = coverUrl;
    dom.playerMeta.style.display = 'block';
    dom.playerMeta.textContent = `${track.BPM} BPM • ${track.keySignature}`;
    
    // Connect visualizer
    visualizer.connect(dom.audioNode);

    try {
      await dom.audioNode.play();
      state.isPlaying = true;
      dom.playerArt.classList.add('playing');
      updatePlaybackButtons();
      
      // Increment streams in background
      if (state.db) {
        const newStreams = await state.db.incrementStreamCount(track.id);
        track.streams = newStreams;
        updateStreamStats();
      }
    } catch (e) {
      console.warn('Playback failed:', e);
      showToast('Playback blocked. Click Play to start.', 'info');
      state.isPlaying = false;
      dom.playerArt.classList.remove('playing');
      updatePlaybackButtons();
    }
  }

  function updatePlaybackButtons() {
    if (state.isPlaying) {
      dom.playBtn.innerHTML = '<i data-lucide="pause"></i>';
      dom.playBtn.title = 'Pause';
    } else {
      dom.playBtn.innerHTML = '<i data-lucide="play"></i>';
      dom.playBtn.title = 'Play';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function togglePlayState() {
    if (state.currentTrackIndex === -1 && state.tracks.length > 0) {
      // Start from first track if nothing is loaded
      state.currentTrackIndex = 0;
      loadAndPlayTrack(state.tracks[0]);
      return;
    }
    if (state.currentTrackIndex === -1) return;

    // Connect visualizer node
    visualizer.connect(dom.audioNode);

    if (state.isPlaying) {
      dom.audioNode.pause();
      state.isPlaying = false;
      dom.playerArt.classList.remove('playing');
      visualizer.stop();
    } else {
      dom.audioNode.play().then(() => {
        state.isPlaying = true;
        dom.playerArt.classList.add('playing');
        visualizer.resume();
      }).catch(err => console.error(err));
    }
    updatePlaybackButtons();
  }

  // --- PLAYBACK CONTROLS ---
  dom.playBtn.addEventListener('click', () => {
    togglePlayState();
  });

  dom.prevBtn.addEventListener('click', () => {
    if (state.tracks.length === 0) return;
    
    if (state.shuffle) {
      playRandomTrack();
      return;
    }

    state.currentTrackIndex--;
    if (state.currentTrackIndex < 0) {
      state.currentTrackIndex = state.tracks.length - 1;
    }
    loadAndPlayTrack(state.tracks[state.currentTrackIndex]);
  });

  dom.nextBtn.addEventListener('click', () => {
    handleTrackEnded();
  });

  function playRandomTrack() {
    const randomIndex = Math.floor(Math.random() * state.tracks.length);
    state.currentTrackIndex = randomIndex;
    loadAndPlayTrack(state.tracks[randomIndex]);
  }

  function handleTrackEnded() {
    if (state.repeat === 'one') {
      dom.audioNode.currentTime = 0;
      dom.audioNode.play();
      return;
    }

    // Play next from explicit queue if items exist
    if (state.queue.length > 0) {
      const nextQueueTrack = state.queue.shift();
      renderQueueDrawer();
      loadAndPlayTrack(nextQueueTrack);
      return;
    }

    if (state.shuffle) {
      playRandomTrack();
      return;
    }

    if (state.tracks.length === 0) return;

    state.currentTrackIndex++;
    if (state.currentTrackIndex >= state.tracks.length) {
      if (state.repeat === 'all') {
        state.currentTrackIndex = 0;
      } else {
        state.currentTrackIndex = -1;
        state.isPlaying = false;
        dom.playerArt.classList.remove('playing');
        updatePlaybackButtons();
        visualizer.stop();
        return;
      }
    }
    loadAndPlayTrack(state.tracks[state.currentTrackIndex]);
  }

  dom.audioNode.addEventListener('ended', handleTrackEnded);

  // --- TIME AND TIMELINE UPDATES ---
  function formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  dom.audioNode.addEventListener('timeupdate', () => {
    const current = dom.audioNode.currentTime;
    const duration = dom.audioNode.duration || 0;

    dom.currentTimeLabel.textContent = formatTime(current);
    
    if (duration > 0) {
      dom.durationTimeLabel.textContent = formatTime(duration);
      dom.seekSlider.value = (current / duration) * 100;
    } else {
      dom.seekSlider.value = 0;
    }
  });

  dom.seekSlider.addEventListener('input', () => {
    const duration = dom.audioNode.duration || 0;
    if (duration > 0) {
      dom.audioNode.currentTime = (dom.seekSlider.value / 100) * duration;
    }
  });

  // --- SHUFFLE / REPEAT ---
  dom.shuffleBtn.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    dom.shuffleBtn.classList.toggle('active', state.shuffle);
    showToast(state.shuffle ? 'Shuffle enabled' : 'Shuffle disabled');
  });

  dom.repeatBtn.addEventListener('click', () => {
    if (!state.repeat) {
      state.repeat = 'all';
      dom.repeatBtn.classList.add('active');
      dom.repeatBtn.title = 'Repeat All';
      dom.repeatBtn.innerHTML = '<i data-lucide="repeat"></i>';
      showToast('Repeat all queue tracks');
    } else if (state.repeat === 'all') {
      state.repeat = 'one';
      dom.repeatBtn.classList.add('active');
      dom.repeatBtn.title = 'Repeat One';
      dom.repeatBtn.innerHTML = '<i data-lucide="repeat-1"></i>';
      showToast('Repeat current track');
    } else {
      state.repeat = false;
      dom.repeatBtn.classList.remove('active');
      dom.repeatBtn.title = 'Repeat';
      dom.repeatBtn.innerHTML = '<i data-lucide="repeat"></i>';
      showToast('Repeat disabled');
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // --- VOLUME ENGINE ---
  dom.volumeSlider.addEventListener('input', () => {
    state.volume = parseFloat(dom.volumeSlider.value);
    dom.audioNode.volume = state.volume;
    state.isMuted = state.volume === 0;
    updateVolumeUI();
  });

  function toggleMuteState() {
    state.isMuted = !state.isMuted;
    dom.audioNode.muted = state.isMuted;
    updateVolumeUI();
    showToast(state.isMuted ? 'Muted' : 'Unmuted');
  }

  dom.volumeBtn.addEventListener('click', () => {
    toggleMuteState();
  });

  function updateVolumeUI() {
    if (state.isMuted) {
      dom.volumeBtn.innerHTML = '<i data-lucide="volume-x"></i>';
      dom.volumeSlider.value = 0;
    } else {
      dom.volumeSlider.value = state.volume;
      if (state.volume > 0.5) {
        dom.volumeBtn.innerHTML = '<i data-lucide="volume-2"></i>';
      } else if (state.volume > 0) {
        dom.volumeBtn.innerHTML = '<i data-lucide="volume-1"></i>';
      } else {
        dom.volumeBtn.innerHTML = '<i data-lucide="volume-x"></i>';
      }
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // --- PLAYBACK QUEUE WIDGET ---
  function addToQueue(track) {
    state.queue.push(track);
    renderQueueDrawer();
  }

  function removeFromQueue(index) {
    state.queue.splice(index, 1);
    renderQueueDrawer();
  }

  function renderQueueDrawer() {
    dom.queueShelfBody.innerHTML = '';
    
    if (state.queue.length === 0) {
      dom.queueShelfBody.innerHTML = `
        <div class="empty-shelf-state">
          <i data-lucide="music" class="empty-icon"></i>
          <p>Queue is empty.<br>Queue tracks using the playlist icon.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    state.queue.forEach((track, index) => {
      const item = document.createElement('div');
      item.className = 'shelf-list-item';
      
      const coverSrc = getMediaUrl(track.coverArt);

      item.innerHTML = `
        <img src="${coverSrc}" class="shelf-item-art" alt="">
        <div class="shelf-item-info">
          <span class="shelf-item-title">${track.title}</span>
          <span class="shelf-item-artist">${track.artist}</span>
        </div>
        <button class="shelf-remove-btn" data-index="${index}">
          <i data-lucide="trash-2"></i>
        </button>
      `;

      item.querySelector('.shelf-remove-btn').addEventListener('click', () => {
        removeFromQueue(index);
      });

      dom.queueShelfBody.appendChild(item);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  dom.clearQueueBtn.addEventListener('click', () => {
    state.queue = [];
    renderQueueDrawer();
    showToast('Queue cleared.');
  });

  // --- LICENSING CART & CHECKOUT TRANSACTION ---
  function addToCart(track, licenseType, price) {
    // Check duplicate
    const exists = state.cart.some(item => item.track.id === track.id && item.licenseType === licenseType);
    if (exists) {
      showToast(`"${track.title}" (${licenseType}) is already in your cart.`, 'info');
      return;
    }

    state.cart.push({ track, licenseType, price });
    updateCartUI();
    showToast(`Added "${track.title}" (${licenseType}) to cart.`, 'success');
  }

  function removeFromCart(index) {
    state.cart.splice(index, 1);
    updateCartUI();
  }

  function updateCartUI() {
    dom.cartBadgeCount.textContent = state.cart.length;
    dom.checkoutItemsCount.textContent = state.cart.length;
    
    let total = 0;
    state.cart.forEach(item => total += item.price);
    dom.checkoutTotalPrice.textContent = '$' + total.toFixed(2);

    renderCartDrawer();
  }

  function renderCartDrawer() {
    dom.cartShelfBody.innerHTML = '';
    
    if (state.cart.length === 0) {
      dom.cartShelfBody.innerHTML = `
        <div class="empty-shelf-state">
          <i data-lucide="shopping-cart" class="empty-icon"></i>
          <p>Cart is empty.<br>Select standard, premium or exclusive pricing options to purchase.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    state.cart.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'shelf-list-item';
      
      const coverSrc = getMediaUrl(item.track.coverArt);

      el.innerHTML = `
        <img src="${coverSrc}" class="shelf-item-art" alt="">
        <div class="shelf-item-info">
          <span class="shelf-item-title">${item.track.title}</span>
          <span class="shelf-item-artist">${item.track.artist}</span>
          <span class="shelf-item-license">${item.licenseType}</span>
        </div>
        <div class="shelf-item-price">$${item.price.toFixed(2)}</div>
        <button class="shelf-remove-btn" data-index="${index}" style="margin-left: 8px;">
          <i data-lucide="trash-2"></i>
        </button>
      `;

      el.querySelector('.shelf-remove-btn').addEventListener('click', () => {
        removeFromCart(index);
      });

      dom.cartShelfBody.appendChild(el);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // --- CHECKOUT AND DIGITALLY SIGNED CONTRACT GENERATOR ---
  dom.checkoutBtn.addEventListener('click', async () => {
    if (state.cart.length === 0) {
      showToast('Cart is empty.', 'info');
      return;
    }

    const buyerName = dom.buyerNameField.value.trim();
    if (!buyerName) {
      showToast('Please enter a Customer Name to sign contracts.', 'error');
      dom.buyerNameField.focus();
      return;
    }

    // Generate agreements
    state.activeLicenseContracts = state.cart.map(item => {
      let terms = '';
      if (item.licenseType === 'standard') {
        terms = 'Non-exclusive rights. Up to 10,000 streams allowed. 1 commercial project distribution limit. Artist retains master ownership. Credit must be given to producer.';
      } else if (item.licenseType === 'premium') {
        terms = 'Non-exclusive lease rights. Up to 500,000 streams allowed. Commercial radio broadcasting permitted. Synchronisation rights for YouTube/Vimeo video usage. Credit must be given to producer.';
      } else {
        terms = 'Exclusive ownership. Unlimited commercial streams, broadcasts, sales and performance rights. Master files ownership transferred. Artist retains mechanical writer credit shares. Original track deactivated from the marketplace.';
      }

      return {
        trackId: item.track.id,
        trackTitle: item.track.title,
        artist: item.track.artist,
        licenseType: item.licenseType,
        price: item.price,
        terms: terms
      };
    });

    // Calculate total
    let total = 0;
    state.cart.forEach(i => total += i.price);

    const sale = {
      customerName: buyerName,
      date: new Date().toISOString(),
      items: state.cart.map(item => ({
        trackId: item.track.id,
        title: item.track.title,
        licenseType: item.licenseType,
        price: item.price
      })),
      total: total,
      licenseContracts: state.activeLicenseContracts
    };

    try {
      if (state.db) {
        await state.db.addSale(sale);
      }
      
      // Load contract HTML in viewer modal
      renderContractsViewer(buyerName, state.activeLicenseContracts);
      
      // Clear Cart
      state.cart = [];
      dom.buyerNameField.value = '';
      updateCartUI();
      
      // Open Contract Modal
      dom.cartShelf.classList.remove('open');
      dom.contractModal.classList.add('open');
      showToast('Transaction approved! Agreements generated.', 'success');
      
    } catch (e) {
      showToast('Checkout transaction failed.', 'error');
      console.error(e);
    }
  });

  function renderContractsViewer(buyerName, contracts) {
    dom.contractViewerBody.innerHTML = '';
    
    contracts.forEach((contract, index) => {
      const agreementDiv = document.createElement('div');
      agreementDiv.style.marginBottom = '30px';
      
      agreementDiv.innerHTML = `
        <div class="contract-header">
          <h2>MASTER DIGITAL LICENSE AGREEMENT</h2>
          <p>Effective Date: ${new Date().toLocaleDateString()} | Contract Ref: BF-${Math.floor(Math.random() * 90000) + 10000}</p>
        </div>
        <div class="contract-body">
          <p>This document constitutes a binding digital agreement between the Licensor (independent artist of BeatFlow Marketplace) and the Licensee (<strong>${buyerName}</strong>).</p>
          
          <h3>1. Grant of License</h3>
          <p>For the musical track entitled <strong>"${contract.trackTitle}"</strong> composed by artist <strong>${contract.artist}</strong>, the Licensor hereby grants the Licensee a non-refundable, non-transferable, <strong>${contract.licenseType.toUpperCase()} RIGHTS LICENSE</strong> under the terms defined below.</p>
          
          <h3>2. Permitted Uses & Limitations</h3>
          <p>${contract.terms}</p>
          
          <h3>3. Royalty Splits & Publisher Credits</h3>
          <p>The Licensee agrees to credit all writers and producers on all distributions. Performance Rights Organization (PRO) registration rules apply. Mechanical splits remain governed by standard publishing laws.</p>
          
          <div class="contract-signatures">
            <div>
              <p>Licensor Signature:</p>
              <div class="signature-line">BeatFlow Electronic Agent</div>
            </div>
            <div>
              <p>Licensee Signature:</p>
              <div class="signature-line">${buyerName} (Digital Signature)</div>
            </div>
          </div>
        </div>
        ${index < contracts.length - 1 ? '<hr style="border: 0; border-top: 1px dashed #777; margin-top: 30px;">' : ''}
      `;
      
      dom.contractViewerBody.appendChild(agreementDiv);
    });
  }

  dom.confirmContractBtn.addEventListener('click', () => {
    dom.contractModal.classList.remove('open');
    showToast('Contracts signed and downloaded locally.', 'success');
  });

  // --- DRAG-AND-DROP SONG UPLOADER ENGINE ---
  
  // Prevent browser default drop zones
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, e => e.preventDefault(), false);
  });

  function setupDragZone(dropZone, fileInput, textEl, indicatorEl, type) {
    
    // Fallback click triggers browsing
    dropZone.addEventListener('click', () => fileInput.click());

    // Highlight drop zone
    dropZone.addEventListener('dragover', () => {
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      dropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processUploadedFile(files[0], fileInput, textEl, indicatorEl, type);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        processUploadedFile(fileInput.files[0], fileInput, textEl, indicatorEl, type);
      }
    });
  }

  function processUploadedFile(file, fileInput, textEl, indicatorEl, type) {
    if (type === 'audio') {
      if (!file.type.startsWith('audio/')) {
        showToast('Invalid file. Please drop an audio file.', 'error');
        return;
      }
      state.uploadedAudioBlob = file; // Stored directly as file blob
      indicatorEl.textContent = `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
      showToast('Audio file queued for upload.');
    } else if (type === 'art') {
      if (!file.type.startsWith('image/')) {
        showToast('Invalid file. Please drop an image file.', 'error');
        return;
      }
      state.uploadedArtBlob = file; // Stored directly as image file blob

      // Show art preview
      const reader = new FileReader();
      reader.onload = (e) => {
        dom.coverArtPreviewBox.style.display = 'flex';
        dom.coverArtPreviewImg.src = e.target.result;
        dom.coverPreviewFilename.textContent = file.name;
      };
      reader.readAsDataURL(file);
      showToast('Cover artwork loaded.');
    }
  }

  setupDragZone(dom.audioDropZone, dom.audioFileInput, dom.audioDropZone.querySelector('.drag-drop-text'), dom.audioFileStatus, 'audio');
  setupDragZone(dom.artDropZone, dom.artFileInput, dom.artDropZone.querySelector('.drag-drop-text'), null, 'art');

  // Submit Uploader Form
  dom.uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!state.uploadedAudioBlob) {
      showToast('Please select or drop an audio track.', 'error');
      return;
    }

    const title = document.getElementById('track-title-field').value.trim();
    const artist = document.getElementById('track-artist-field').value.trim();
    const genre = document.getElementById('track-genre-field').value;
    const bpm = parseInt(document.getElementById('track-bpm-field').value) || 90;
    const key = document.getElementById('track-key-field').value;
    const pStd = parseFloat(document.getElementById('price-standard-field').value) || 29.99;
    const pPrem = parseFloat(document.getElementById('price-premium-field').value) || 59.99;
    const pExcl = parseFloat(document.getElementById('price-exclusive-field').value) || 299.99;

    if (!title || !artist) {
      showToast('Title and Artist are required fields.', 'error');
      return;
    }

    // Default cover art SVG if empty
    let coverArt = state.uploadedArtBlob;
    if (!coverArt) {
      // Use standard default gradient colored placeholder base64
      coverArt = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'300' height%3D'300' viewBox%3D'0 0 300 300'%3E%3Cdefs%3E%3ClinearGradient id%3Dg x1%3D'0%25' y1%3D'0%25' x2%3D'100%25' y2%3D'100%25'%3E%3Cstop offset%3D'0%25' stop-color%3D'%237c3aed'%2F%3E%3Cstop offset%3D'100%25' stop-color%3D'%2300ffd2'%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect width%3D'100%25' height%3D'100%25' fill%3D'url(%23g)'%2F%3E%3C%2Fsvg%3E";
    }

    const newTrack = {
      id: 'user-' + Date.now(),
      title: title,
      artist: artist,
      genre: genre,
      BPM: bpm,
      keySignature: key,
      coverArt: coverArt,
      audioSrc: state.uploadedAudioBlob,
      prices: {
        standard: pStd,
        premium: pPrem,
        exclusive: pExcl
      },
      streams: 0
    };

    try {
      if (state.db) {
        await state.db.saveTrack(newTrack);
      }
      showToast(`Uploaded "${title}" to local store successfully.`, 'success');
      
      // Close and clear modal
      resetUploadModal();
      dom.uploadModal.classList.remove('open');
      
      // Reload marketplace
      await loadTracksFromDb();
    } catch (err) {
      showToast('Failed to save track in database.', 'error');
      console.error(err);
    }
  });

  function resetUploadModal() {
    dom.uploadForm.reset();
    state.uploadedAudioBlob = null;
    state.uploadedArtBlob = null;
    dom.audioFileStatus.textContent = '';
    dom.coverArtPreviewBox.style.display = 'none';
    dom.coverArtPreviewImg.src = '';
    dom.coverPreviewFilename.textContent = '';
  }

  // --- ROYALTY SPLITS CALCULATOR SYNC ---
  function syncRoyaltySplits(changedSource) {
    let prod = parseInt(dom.splitProducer.value) || 0;
    let voc = parseInt(dom.splitVocalist.value) || 0;
    let writ = parseInt(dom.splitWriter.value) || 0;

    if (changedSource === 'slider-producer') prod = parseInt(dom.sliderProducer.value);
    if (changedSource === 'slider-vocalist') voc = parseInt(dom.sliderVocalist.value);
    if (changedSource === 'slider-writer') writ = parseInt(dom.sliderWriter.value);

    // Write back input values
    dom.splitProducer.value = prod;
    dom.splitVocalist.value = voc;
    dom.splitWriter.value = writ;

    dom.sliderProducer.value = prod;
    dom.sliderVocalist.value = voc;
    dom.sliderWriter.value = writ;

    const total = prod + voc + writ;
    dom.payoutTotalPercent.textContent = total + '%';

    if (total !== 100) {
      dom.payoutTotalPercent.style.color = '#ef4444'; // red indicator
    } else {
      dom.payoutTotalPercent.style.color = 'var(--accent-cyan)'; // cyan indicator
    }

    const price = parseFloat(dom.simulatedSalePrice.value) || 0;
    dom.payoutProducer.textContent = '$' + ((price * prod) / 100).toFixed(2);
    dom.payoutVocalist.textContent = '$' + ((price * voc) / 100).toFixed(2);
    dom.payoutWriter.textContent = '$' + ((price * writ) / 100).toFixed(2);
  }

  // Hook split listeners
  ['Producer', 'Vocalist', 'Writer'].forEach(role => {
    const textInput = dom[`split${role}`];
    const slider = dom[`slider${role}`];

    textInput.addEventListener('input', () => syncRoyaltySplits(`split-${role.toLowerCase()}`));
    slider.addEventListener('input', () => syncRoyaltySplits(`slider-${role.toLowerCase()}`));
  });

  dom.simulatedSalePrice.addEventListener('input', () => syncRoyaltySplits('price'));

  // Initial calculator sync
  syncRoyaltySplits('init');


  // --- INTERFACE TRANSITIONS & DRAWER SLIDERS ---
  
  // Cart Drawer
  dom.openCartBtn.addEventListener('click', () => {
    dom.cartShelf.classList.toggle('open');
    dom.queueShelf.classList.remove('open');
    updateCartUI();
  });
  dom.closeCartBtn.addEventListener('click', () => dom.cartShelf.classList.remove('open'));

  // Queue Drawer
  dom.openQueueBtn.addEventListener('click', () => {
    dom.queueShelf.classList.toggle('open');
    dom.cartShelf.classList.remove('open');
    renderQueueDrawer();
  });
  dom.closeQueueBtn.addEventListener('click', () => dom.queueShelf.classList.remove('open'));

  // Upload Modal
  dom.openUploadBtn.addEventListener('click', () => dom.uploadModal.classList.add('open'));
  dom.closeUploadModal.addEventListener('click', () => {
    resetUploadModal();
    dom.uploadModal.classList.remove('open');
  });
  dom.cancelUploadBtn.addEventListener('click', () => {
    resetUploadModal();
    dom.uploadModal.classList.remove('open');
  });

  // Contracts modal
  dom.closeContractModal.addEventListener('click', () => dom.contractModal.classList.remove('open'));

  // Playback Error Listener
  dom.audioNode.addEventListener('error', (e) => {
    const track = state.tracks[state.currentTrackIndex];
    if (dom.audioNode.src) {
      console.error('Audio load error details:', dom.audioNode.error);
      showToast(`Playback Error: Could not stream "${track ? track.title : 'file'}"`, 'error');
    }
  });

  // Simulate Streams button listener
  dom.simulateStreamsBtn = document.getElementById('simulate-streams-btn');
  dom.simulateStreamsBtn.addEventListener('click', async () => {
    let activeTrack = state.tracks[state.currentTrackIndex];
    if (activeTrack) {
      activeTrack.streams = (activeTrack.streams || 0) + 50000;
      if (state.db) {
        await state.db.saveTrack(activeTrack);
      }
      showToast(`Simulated +50,000 plays on "${activeTrack.title}"!`, 'success');
    } else {
      // If no active track is playing, add 10,000 plays to ALL tracks
      for (const track of state.tracks) {
        track.streams = (track.streams || 0) + 10000;
        if (state.db) {
          await state.db.saveTrack(track);
        }
      }
      showToast('Simulated +10,000 streams across all tracks!', 'success');
    }
    updateStreamStats();
    applyCatalogFilters();
  });

  // --- KEYBOARD SHORTCUTS FOR ACCESSIBILITY / DAW UX ---
  document.addEventListener('keydown', (e) => {
    // If the user is actively typing in an input, textarea, or select dropdown, ignore shortcuts
    const activeEl = document.activeElement;
    if (activeEl && (
      activeEl.tagName === 'INPUT' || 
      activeEl.tagName === 'TEXTAREA' || 
      activeEl.tagName === 'SELECT' || 
      activeEl.isContentEditable
    )) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault(); // Prevent default browser scrolling
      togglePlayState();
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      toggleMuteState();
    } else if (e.code === 'Escape') {
      // Close all shelves and modals
      dom.cartShelf.classList.remove('open');
      dom.queueShelf.classList.remove('open');
      resetUploadModal();
      dom.uploadModal.classList.remove('open');
      dom.contractModal.classList.remove('open');
      showToast('Closed active panels.');
    }
  });

});
