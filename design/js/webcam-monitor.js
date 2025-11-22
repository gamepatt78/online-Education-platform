let webcamStream = null;

async function startWebcam() {
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const video = document.getElementById('webcam');
        video.srcObject = webcamStream;
    } catch (err) {
        const warning = document.getElementById('webcam-warning');
        if (warning) warning.style.display = 'block';
    }
}

function takeSnapshot() {
    const video = document.getElementById('webcam');
    if (!video || video.readyState !== 4) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
}

function logWebcamSnapshot() {
    const imgData = takeSnapshot();
    if (!imgData) return;
    const db = firebase.firestore();
    db.collection('exam_logs').add({
        student: 'Student 1', // Replace with dynamic student name/id if available
        event: 'Webcam Snapshot',
        details: 'Periodic webcam capture',
        image: imgData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

document.addEventListener('DOMContentLoaded', () => {
    startWebcam();
    setInterval(logWebcamSnapshot, 60000); // every 60 seconds
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            logWebcamSnapshot();
        }
    });
});