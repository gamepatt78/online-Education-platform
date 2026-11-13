document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form');
  const message = document.getElementById('profile-message');
  const saveButton = form.querySelector('button[type="submit"]');
  const dateInput = document.getElementById('profile-dob');
  const uploadInput = document.getElementById('profile-upload');
  const photoButton = document.querySelector('.change-photo-btn');
  const startCameraButton = document.getElementById('start-camera-btn');
  const capturePhotoButton = document.getElementById('capture-photo-btn');
  const stopCameraButton = document.getElementById('stop-camera-btn');
  const cameraPanel = document.getElementById('profile-camera-panel');
  const cameraVideo = document.getElementById('profile-camera');
  const token = localStorage.getItem('token');
  let pendingProfileImage = null;
  let cameraStream = null;

  function showMessage(text, type = '') {
    message.textContent = text;
    message.className = `profile-message${type ? ` ${type}` : ''}`;
  }

  async function readApiResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const errorMessage = response.status === 404
        ? 'The Student API route was not found. Restart the app servers and reload this page.'
        : `The Student API returned an unexpected response (${response.status}).`;
      throw new Error(errorMessage);
    }
    return response.json();
  }

  if (!token) {
    saveButton.disabled = true;
    showMessage('Sign in before editing your profile.');
    const loginLink = document.createElement('a');
    loginLink.href = '/student/html/login.html';
    loginLink.textContent = ' Open login page';
    message.appendChild(loginLink);
    return;
  }

  const today = new Date();
  dateInput.max = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  const savedImage = localStorage.getItem('studentProfileImage');
  function applyProfileImage(imageData) {
    document.querySelectorAll('.profile-img, .profile-image, .profile .image')
      .forEach(image => { image.src = imageData; });
  }
  if (savedImage) applyProfileImage(savedImage);

  photoButton.addEventListener('click', () => uploadInput.click());
  uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      uploadInput.value = '';
      showMessage('Choose an image file.', 'error');
      return;
    }
    if (file.size > 1024 * 1024) {
      uploadInput.value = '';
      showMessage('The profile image must be 1 MB or smaller.', 'error');
      return;
    }

    stopCamera();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        showMessage('Unable to preview this image.', 'error');
        return;
      }
      pendingProfileImage = reader.result;
      applyProfileImage(pendingProfileImage);
      showMessage('Photo selected. Save changes to keep it in this browser.');
    };
    reader.onerror = () => showMessage('Unable to read this image file.', 'error');
    reader.readAsDataURL(file);
  });

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    cameraVideo.srcObject = null;
    cameraPanel.hidden = true;
    capturePhotoButton.disabled = true;
  }

  startCameraButton.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showMessage('Live camera capture is unavailable in this browser. Use Upload Photo instead.', 'error');
      return;
    }

    startCameraButton.disabled = true;
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      cameraVideo.srcObject = cameraStream;
      cameraPanel.hidden = false;
      await cameraVideo.play();
      capturePhotoButton.disabled = false;
      showMessage('Camera is on. Take a photo when you are ready.');
    } catch (error) {
      stopCamera();
      console.error('Profile camera could not be started:', error);
      const messageText = error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError'
        ? 'Camera permission was denied. Allow camera access or use Upload Photo.'
        : 'Unable to start the camera. Check that it is connected and not being used by another app.';
      showMessage(messageText, 'error');
    } finally {
      startCameraButton.disabled = false;
    }
  });

  capturePhotoButton.addEventListener('click', () => {
    if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
      showMessage('Wait for the camera preview before taking a photo.', 'error');
      return;
    }

    try {
      const scale = Math.min(1, 512 / Math.max(cameraVideo.videoWidth, cameraVideo.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(cameraVideo.videoWidth * scale);
      canvas.height = Math.round(cameraVideo.videoHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to prepare the camera image.');
      context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
      pendingProfileImage = canvas.toDataURL('image/jpeg', 0.82);
      applyProfileImage(pendingProfileImage);
      stopCamera();
      showMessage('Photo captured. Save changes to keep it in this browser.');
    } catch (error) {
      console.error('Profile camera capture failed:', error);
      showMessage(error.message || 'Unable to capture a photo. Try again or upload an image.', 'error');
    }
  });

  stopCameraButton.addEventListener('click', stopCamera);
  window.addEventListener('pagehide', stopCamera);

  async function loadProfile() {
    saveButton.disabled = true;
    try {
      const response = await fetch('/api/students/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await readApiResponse(response);
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || 'Unable to load your profile.');
      }

      document.getElementById('profile-name').value = result.data.name;
      document.getElementById('profile-email').value = result.data.email;
      document.getElementById('profile-phone').value = result.data.phone;
      document.getElementById('profile-dob').value = result.data.dob;
      document.getElementById('profile-designation').value = result.data.designation;
      saveButton.disabled = false;
      showMessage('');
    } catch (error) {
      console.error('Student profile load failed:', error);
      showMessage(error.message || 'Unable to load your profile. Please try again.', 'error');
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    saveButton.disabled = true;
    showMessage('Saving your profile...');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saving...';

    try {
      const response = await fetch('/api/students/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: document.getElementById('profile-name').value.trim(),
          phone: document.getElementById('profile-phone').value.trim(),
          dob: dateInput.value,
          designation: document.getElementById('profile-designation').value.trim()
        })
      });
      const result = await readApiResponse(response);
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to save your profile.');
      }

      try {
        localStorage.setItem('userName', result.data.name);
      } catch (storageError) {
        console.error('Profile name could not be stored in browser preferences:', storageError);
      }
      let photoStorageFailed = false;
      if (pendingProfileImage) {
        try {
          localStorage.setItem('studentProfileImage', pendingProfileImage);
        } catch (storageError) {
          console.error('Profile image could not be stored:', storageError);
          photoStorageFailed = true;
        }
      }

      showMessage(
        photoStorageFailed
          ? 'Profile saved, but the selected photo could not be stored in this browser.'
          : 'Profile updated successfully.',
        photoStorageFailed ? 'error' : 'success'
      );
      window.setTimeout(() => {
        window.location.href = '/student/html/profile.html';
      }, 700);
    } catch (error) {
      console.error('Student profile update failed:', error);
      showMessage(error.message || 'Unable to save your profile. Please try again.', 'error');
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }
  });

  loadProfile();
});
