// face-monitor.js
// Client-side face monitoring using MediaPipe Face Detection.
// Detects: no-face, multiple-faces, looking-away (approx).

(function(){
  const videoElement = document.getElementById('localVideo');
  const canvasElement = document.getElementById('overlay');
  const canvasCtx = canvasElement.getContext('2d');
  const statusEl = document.getElementById('fm-state');
  const startBtn = document.getElementById('fm-start');
  const stopBtn = document.getElementById('fm-stop');

  let camera = null;
  let faceDetection = null;
  let running = false;

  // Configuration
  const NO_FACE_SECONDS = 3; // seconds before raising a no-face alert
  const MULTI_FACE_SECONDS = 2; // seconds for multiple faces
  const LOOKING_AWAY_SECONDS = 3; // seconds for looking away
  const CENTER_TOLERANCE = 0.30; // fraction of width from center tolerated
  const MIN_FACE_REL_WIDTH = 0.06; // minimum relative face width (face width/frame width)

  let lastNoFaceAt = null;
  let lastMultiFaceAt = null;
  let lastLookingAwayAt = null;

  function logEvent(eventType, details){
    const logsDiv = document.getElementById('logs');
    const now = new Date().toLocaleString();
    const msg = `<div class="log"><span class="event">${eventType}</span> - ${details}<div class="timestamp">${now}</div></div>`;
    if(logsDiv) logsDiv.insertAdjacentHTML('afterbegin', msg);
    console.warn('[FaceMonitor]', eventType, details);
    // Post to server endpoint for persistence / alerting (throttled)
    try{ postEvent(eventType, details); }catch(e){ console.warn('postEvent failed', e); }
  }

  // --- POST events to backend with small snapshot ---
  const lastPosted = {};
  const POST_THROTTLE_SECONDS = 6; // don't POST same event type more often than this

  async function captureSnapshotDataUrl(){
    try{
      const w = 320, h = 240;
      const tmp = document.createElement('canvas');
      tmp.width = w; tmp.height = h;
      const ctx = tmp.getContext('2d');
      // draw current video frame if available
      if(videoElement && videoElement.videoWidth){
        ctx.drawImage(videoElement, 0, 0, w, h);
      } else if(canvasElement){
        // fallback to overlay canvas
        ctx.drawImage(canvasElement, 0, 0, w, h);
      }
      // return jpeg data URL
      return tmp.toDataURL('image/jpeg', 0.6);
    }catch(e){
      console.warn('snapshot failed', e);
      return null;
    }
  }

  async function postEvent(eventType, details){
    const nowSec = Date.now() / 1000;
    if(lastPosted[eventType] && (nowSec - lastPosted[eventType] < POST_THROTTLE_SECONDS)) return;
    lastPosted[eventType] = nowSec;

    const payload = {
      event: eventType,
      details: details,
      timestamp: new Date().toISOString(),
      student: (localStorage && localStorage.getItem('userEmail')) || 'unknown'
    };

    // capture a snapshot if possible
    const dataUrl = await captureSnapshotDataUrl();
    if(dataUrl) payload.image = dataUrl;

    try{
      fetch('/monitor-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => {
        if(!res.ok) console.warn('monitor-event POST failed', res.status);
      }).catch(err => console.warn('monitor-event network error', err));
    }catch(e){
      console.warn('postEvent error', e);
    }
  }

  function setStatus(text, color = '#fff'){
    if(statusEl){
      statusEl.textContent = text;
      statusEl.style.color = color;
    }
  }

  function onResults(results){
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    const detections = results.detections || [];
    const now = Date.now();

    if(detections.length === 0){
      if(!lastNoFaceAt) lastNoFaceAt = now;
      const elapsed = (now - lastNoFaceAt) / 1000;
      setStatus(`No face detected (${elapsed.toFixed(1)}s)`, '#ff8888');
      drawText('No face', '#ff8888');
      if(elapsed >= NO_FACE_SECONDS){
        logEvent('no-face', `No face present for ${elapsed.toFixed(0)}s`);
        lastNoFaceAt = now; // reset to avoid spamming
      }
    } else {
      lastNoFaceAt = null;
      // Multiple faces
      if(detections.length > 1){
        if(!lastMultiFaceAt) lastMultiFaceAt = now;
        const elapsed = (now - lastMultiFaceAt) / 1000;
        setStatus(`Multiple faces (${detections.length})`, '#ffb347');
        drawText('Multiple faces', '#ffb347');
        if(elapsed >= MULTI_FACE_SECONDS){
          logEvent('multiple-faces', `Detected ${detections.length} faces for ${elapsed.toFixed(0)}s`);
          lastMultiFaceAt = now;
        }
      } else {
        lastMultiFaceAt = null;

        // Single face: evaluate position and size
        const det = detections[0];
        // boundingBox: {xCenter, yCenter, width, height} in normalized coordinates (0..1)
        const box = det.boundingBox;
        const cx = box.xCenter; // normalized
        const w = box.width; // normalized
        const relCenter = Math.abs(cx - 0.5);

        // draw box
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#4EE1A0';
        const px = (box.xCenter - box.width/2) * canvasElement.width;
        const py = (box.yCenter - box.height/2) * canvasElement.height;
        const pw = box.width * canvasElement.width;
        const ph = box.height * canvasElement.height;
        canvasCtx.strokeRect(px, py, pw, ph);

        // Condition: looking away if center too far from screen center OR face too small
        const isFarFromCenter = relCenter > CENTER_TOLERANCE;
        const isTooSmall = w < MIN_FACE_REL_WIDTH;

        if(isFarFromCenter || isTooSmall){
          if(!lastLookingAwayAt) lastLookingAwayAt = now;
          const elapsed = (now - lastLookingAwayAt) / 1000;
          setStatus(`Looking away (${elapsed.toFixed(1)}s)`, '#ffd966');
          drawText('Looking away', '#ffd966');
          if(elapsed >= LOOKING_AWAY_SECONDS){
            logEvent('looking-away', `Face off-center (${(relCenter*100).toFixed(0)}%) or too small (${(w*100).toFixed(1)}%) for ${elapsed.toFixed(0)}s`);
            lastLookingAwayAt = now;
          }
        } else {
          lastLookingAwayAt = null;
          setStatus('Face detected — OK', '#4EE1A0');
        }
      }
    }

    canvasCtx.restore();
  }

  function drawText(text, color){
    canvasCtx.font = '16px Arial';
    canvasCtx.fillStyle = color;
    canvasCtx.fillText(text, 8, 20);
  }

  async function start(){
    if(running) return;
    running = true;
    setStatus('Starting...', '#fff');

    // Check that MediaPipe FaceDetection and Camera are available
    const FaceDetectionClass = window.FaceDetection || (window.faceDetection && window.faceDetection.FaceDetection) || null;
    const CameraClass = window.Camera || (window.cameraUtils && window.cameraUtils.Camera) || null;
    if(!FaceDetectionClass){
      const msg = 'MediaPipe FaceDetection not found. Check that the CDN script loaded.';
      console.error(msg);
      setStatus(msg, '#ff8888');
      logEvent('library-missing', msg);
      running = false;
      return;
    }

    try{
      faceDetection = new FaceDetectionClass({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
      });

      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.6
      });

      faceDetection.onResults(onResults);

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      videoElement.srcObject = stream;
      await videoElement.play();

      // Hook MediaPipe camera util if available, else fall back to a manual frame loop
      if(CameraClass){
        camera = new CameraClass(videoElement, {
          onFrame: async () => {
            try{ await faceDetection.send({image: videoElement}); }catch(e){console.warn('faceDetection.send failed', e)}
          },
          width: 320,
          height: 240
        });
        camera.start();
      } else {
        // Fallback: use requestAnimationFrame loop to send frames
        const loop = async () => {
          if(!running) return;
          try{ await faceDetection.send({image: videoElement}); }catch(e){/*ignore*/}
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      }

      // Ensure canvas matches video dimensions once available
      function resizeCanvas(){
        const w = videoElement.videoWidth || 320;
        const h = videoElement.videoHeight || 240;
        if(w && h){
          canvasElement.width = w;
          canvasElement.height = h;
        }
      }
      if(videoElement.readyState >= 2) resizeCanvas();
      videoElement.addEventListener('loadedmetadata', resizeCanvas);

      setStatus('Monitoring', '#4EE1A0');
      logEvent('monitor-start', 'Face monitoring started');
    }catch(err){
      console.error('Camera or MediaPipe init failed', err);
      setStatus('Camera/MediaPipe init failed', '#ff8888');
      logEvent('camera-error', String(err));
      running = false;
    }
  }

  function stop(){
    if(!running) return;
    running = false;
    setStatus('Stopped', '#aaa');
    logEvent('monitor-stop', 'Face monitoring stopped');
    try{
      if(camera && camera.stop) camera.stop();
      const s = videoElement.srcObject;
      if(s){
        const tracks = s.getTracks();
        tracks.forEach(t=>t.stop());
      }
      videoElement.srcObject = null;
    }catch(e){console.warn(e)}
  }

  // Wire up buttons
  if(startBtn) startBtn.addEventListener('click', start);
  if(stopBtn) stopBtn.addEventListener('click', stop);

  // Auto-start when page loads (optional). For manual start, comment out autoStart.
  // Try to auto-start monitoring to make the feature visible without extra clicks.
  try{ start(); }catch(e){ console.warn('Auto-start failed', e); }

  // Expose start/stop on window for console control
  window.FaceMonitor = { start, stop };
})();
