let webcamStream = null;

async function startWebcam() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera access is not available in this browser.');
        }
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const video = document.getElementById('webcam');
        if (video) video.srcObject = webcamStream;
    } catch (err) {
        const warning = document.getElementById('webcam-warning');
        if (warning) {
            warning.textContent = err.message || 'Webcam access was denied.';
            warning.style.display = 'block';
        }
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    const video = document.getElementById('webcam');
    if (video) video.srcObject = null;
}

window.WebcamMonitor = { start: startWebcam, stop: stopWebcam };