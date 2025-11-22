const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "elearning-platform-28a74.firebasestorage.app",
  messagingSenderId: "314443132788",
  appId: "1:314443132788:web:744686f567168f865ac621",
  measurementId: "G-5RD6YDBLMP"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function logWebcamSnapshot(imgData) {
    fetch('http://localhost:5000/api/log', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            student: 'Student 1',
            event: 'Webcam Snapshot',
            details: 'Periodic webcam capture',
            image: imgData
        })
    });
}
