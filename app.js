/**
 * Polaroid Studio Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const navCaptureBtn = document.getElementById('nav-capture-btn');
  const navMuralBtn = document.getElementById('nav-mural-btn');
  const sectionCapture = document.getElementById('section-capture');
  const sectionMural = document.getElementById('section-mural');
  const muralCount = document.getElementById('mural-count');

  // Camera elements
  const cameraFeed = document.getElementById('camera-feed');
  const cameraPlaceholder = document.getElementById('camera-placeholder');
  const cameraControls = document.getElementById('camera-controls');
  const startCameraBtn = document.getElementById('start-camera-btn');
  const captureBtn = document.getElementById('capture-btn');
  const switchCameraBtn = document.getElementById('switch-camera-btn');
  const snapshotCanvas = document.getElementById('snapshot-canvas');
  const fileUploadInput = document.getElementById('file-upload-input');
  const fileUploadAltInput = document.getElementById('file-upload-alt-input');

  // Editor elements
  const editorPanel = document.getElementById('editor-panel');
  const polaroidFrame = document.getElementById('polaroid-frame');
  const polaroidImg = document.getElementById('polaroid-img');
  const polaroidCaption = document.getElementById('polaroid-caption');
  const captionInput = document.getElementById('caption-input');
  const colorBtns = document.querySelectorAll('.color-btn');
  const customColorPicker = document.getElementById('custom-color-picker');
  const downloadBtn = document.getElementById('download-btn');
  const addToMuralBtn = document.getElementById('add-to-mural-btn');
  const retakeBtn = document.getElementById('retake-btn');

  // Mural elements
  const muralContainer = document.getElementById('mural-container');
  const muralEmptyState = document.getElementById('mural-empty-state');
  const goToCaptureBtn = document.getElementById('go-to-capture-btn');
  const layoutBtns = document.querySelectorAll('.layout-btn');

  // State variables
  let currentStream = null;
  let facingMode = 'user'; // 'user' (front) or 'environment' (back)
  let currentCapturedImageSrc = null;
  let currentBgColor = '#FFFFFF';
  let muralPhotos = [];

  // --- NAVIGATION ---
  function switchView(view) {
    if (view === 'capture') {
      navCaptureBtn.classList.add('active');
      navMuralBtn.classList.remove('active');
      sectionCapture.style.display = 'flex';
      sectionMural.style.display = 'none';
    } else {
      navMuralBtn.classList.add('active');
      navCaptureBtn.classList.remove('active');
      sectionMural.style.display = 'flex';
      sectionCapture.style.display = 'none';
      renderMural();
    }
  }

  navCaptureBtn.addEventListener('click', () => switchView('capture'));
  navMuralBtn.addEventListener('click', () => switchView('mural'));
  goToCaptureBtn.addEventListener('click', () => switchView('capture'));

  // --- CAMERA HANDLING ---
  async function startCamera() {
    stopCamera();
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 }
        },
        audio: false
      };
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraFeed.srcObject = currentStream;
      cameraFeed.style.display = 'block';
      cameraPlaceholder.style.display = 'none';
      cameraControls.style.display = 'flex';
    } catch (err) {
      console.warn('Câmera indisponível ou permissão negada:', err);
      alert('Não foi possível acessar a câmera. Você pode selecionar uma foto do seu arquivo/galeria.');
      cameraFeed.style.display = 'none';
      cameraPlaceholder.style.display = 'flex';
      cameraControls.style.display = 'none';
    }
  }

  function stopCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
    }
  }

  startCameraBtn.addEventListener('click', startCamera);

  switchCameraBtn.addEventListener('click', () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera();
  });

  // --- CAPTURE & FILE UPLOAD ---
  captureBtn.addEventListener('click', () => {
    if (!cameraFeed.srcObject) return;

    const width = cameraFeed.videoWidth || 640;
    const height = cameraFeed.videoHeight || 640;

    // Square crop math
    const minDim = Math.min(width, height);
    const startX = (width - minDim) / 2;
    const startY = (height - minDim) / 2;

    snapshotCanvas.width = minDim;
    snapshotCanvas.height = minDim;
    const ctx = snapshotCanvas.getContext('2d');

    // Handle selfie mirroring if facingMode is user
    if (facingMode === 'user') {
      ctx.translate(minDim, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(cameraFeed, startX, startY, minDim, minDim, 0, 0, minDim, minDim);

    const dataUrl = snapshotCanvas.toDataURL('image/png');
    openEditor(dataUrl);
    stopCamera();
  });

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        openEditor(event.target.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  }

  fileUploadInput.addEventListener('change', handleFileUpload);
  fileUploadAltInput.addEventListener('change', handleFileUpload);

  // --- EDITOR FUNCTIONALITY ---
  function openEditor(imageSrc) {
    currentCapturedImageSrc = imageSrc;
    polaroidImg.src = imageSrc;
    captionInput.value = '';
    polaroidCaption.textContent = '';
    setPolaroidBgColor('#FFFFFF');
    editorPanel.style.display = 'flex';
    editorPanel.scrollIntoView({ behavior: 'smooth' });
  }

  retakeBtn.addEventListener('click', () => {
    editorPanel.style.display = 'none';
    startCamera();
  });

  captionInput.addEventListener('input', (e) => {
    polaroidCaption.textContent = e.target.value;
  });

  function setPolaroidBgColor(color) {
    currentBgColor = color;
    polaroidFrame.style.backgroundColor = color;

    // Update caption text color based on frame background brightness
    const isDark = isColorDark(color);
    polaroidCaption.style.color = isDark ? '#ffffff' : '#1e293b';

    // Active state in color options
    colorBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color.toUpperCase() === color.toUpperCase());
    });
  }

  function isColorDark(hexColor) {
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      customColorPicker.value = color.length === 7 ? color : '#FFFFFF';
      setPolaroidBgColor(color);
    });
  });

  customColorPicker.addEventListener('input', (e) => {
    setPolaroidBgColor(e.target.value);
  });

  // --- GENERATE CANVAS FOR DOWNLOAD OR MURAL ---
  function renderPolaroidToCanvas() {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // High resolution output dimensions
        const outerWidth = 1000;
        const outerHeight = 1200;
        const paddingLeftRight = 60;
        const paddingTop = 60;
        const photoWidth = 880;
        const photoHeight = 880;

        canvas.width = outerWidth;
        canvas.height = outerHeight;

        // Draw Polaroid Background
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, outerWidth, outerHeight);

        // Draw Photo
        ctx.drawImage(img, paddingLeftRight, paddingTop, photoWidth, photoHeight);

        // Draw Caption Text
        const captionText = captionInput.value.trim();
        if (captionText) {
          const isDark = isColorDark(currentBgColor);
          ctx.fillStyle = isDark ? '#FFFFFF' : '#1E293B';
          ctx.font = '700 56px "Caveat", cursive, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textY = paddingTop + photoHeight + (outerHeight - (paddingTop + photoHeight)) / 2;
          ctx.fillText(captionText, outerWidth / 2, textY);
        }

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = currentCapturedImageSrc;
    });
  }

  downloadBtn.addEventListener('click', async () => {
    const dataUrl = await renderPolaroidToCanvas();
    const link = document.createElement('a');
    link.download = `polaroid-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  });

  // --- MURAL / GALLERY HANDLING ---
  addToMuralBtn.addEventListener('click', async () => {
    const finalDataUrl = await renderPolaroidToCanvas();
    const rotation = (Math.random() * 12 - 6).toFixed(1); // Random angle for mosaic layout

    muralPhotos.push({
      id: Date.now(),
      dataUrl: finalDataUrl,
      rotation: rotation
    });

    muralCount.textContent = muralPhotos.length;
    alert('Polaroid adicionada ao seu mural!');
  });

  function renderMural() {
    muralContainer.innerHTML = '';

    if (muralPhotos.length === 0) {
      muralContainer.appendChild(muralEmptyState);
      muralEmptyState.style.display = 'flex';
      return;
    }

    muralEmptyState.style.display = 'none';

    muralPhotos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'mural-item';
      item.style.setProperty('--rotation', `${photo.rotation}deg`);

      const img = document.createElement('img');
      img.src = photo.dataUrl;
      img.alt = 'Polaroid do mural';
      img.style.width = '200px';
      img.style.borderRadius = '4px';
      img.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '✕';
      deleteBtn.title = 'Remover foto';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removePhotoFromMural(photo.id);
      });

      item.appendChild(img);
      item.appendChild(deleteBtn);
      muralContainer.appendChild(item);
    });
  }

  function removePhotoFromMural(id) {
    muralPhotos = muralPhotos.filter(p => p.id !== id);
    muralCount.textContent = muralPhotos.length;
    renderMural();
  }

  layoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      layoutBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const layout = btn.dataset.layout;
      muralContainer.className = `mural-container ${layout}`;
    });
  });
});
