

# online-Education-platform

## 📘 Online Education Platform

**online-education-platform** is a comprehensive web-based learning management system that provides courses, video tutorials, mock tests, and an exam module with timer and webcam monitoring, powered by a **MySQL database** for persistent data storage.

-----

## 🚀 Features

✅ Course-based modules
✅ YouTube video integration
✅ Mock tests with MCQs
✅ Scoring & points system
✅ Final exam with countdown timer
✅ Webcam monitoring
✅ **Persistent data storage (MySQL)** 🔄
✅ Fully responsive design

-----

## 📂 Project Structure

The project structure must now include a **Backend** directory and configuration files.

```
online-education-platform/
│
├── index.html
├── courses.html
├── watch-video.html
├── submit-exam.html
│
├── server/
│   ├── config/
│   └── api/ (e.g., Node.js/PHP/Python files handling DB logic)
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js (Frontend logic)
│
├── db/
│   └── schema.sql (Database setup scripts)
│
├── images/
│
└── videos/
```

-----

## 🎥 Video Integration

Supports YouTube embeds:

```html
<iframe width="560" height="315"
  src="https://www.youtube.com/embed/x9bTBcron78"
  frameborder="0"
  allowfullscreen></iframe>
```

-----

## 📝 Mock Test Format

```js
{
  id: 1,
  question: "What does HTML stand for?",
  options: ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
  correct: 0,
  points: 5
}
```

-----

## 🧪 Final Exam Module

  * Timer auto-submit
  * Result display
  * Webcam monitoring

-----

## 🔧 Technologies Used

  * HTML5
  * CSS3
  * JavaScript
  * **MySQL (Backend Database)** 💾
  * **[Server Language, e.g., Node.js, PHP, Python]** (Required for connecting to MySQL)
  * YouTube Embed API (optional)

-----

## 🛠️ How to Run

1️⃣ Clone the repo:

```
git clone https://github.com/yourusername/online-education-platform.git
```

2️⃣ **Set up the Database:**

  * Install **MySQL** or use a cloud-hosted instance.
  * Execute the schema file (`db/schema.sql`) to create the necessary tables.

3️⃣ **Configure Backend:**

  * Navigate to the `server/` directory.
  * Configure your database connection string/credentials (e.g., in a `.env` file).
  * Run the server using the appropriate command (e.g., `npm start` or `python server.py`).

4️⃣ **Access Frontend:**

  * Open `Dashboard.html` in your browser.

-----

## 🌟 Future Enhancements

  * Login & authentication
  * User progress tracking
  * Certification
  * Live classes

-----

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.
