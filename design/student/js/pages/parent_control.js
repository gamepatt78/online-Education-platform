const PARENT_PASSWORD = "parent123";

function login() {
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("errorMessage");
  const loginSection = document.getElementById("loginSection");
  const controlPanel = document.getElementById("controlPanel");

  if (passwordInput.value === PARENT_PASSWORD) {
    errorMessage.textContent = "";
    loginSection.classList.add("hidden");
    controlPanel.classList.remove("hidden");
  } else {
    errorMessage.textContent = "Incorrect password. Please try again.";
  }
}

function saveSettings() {
  const screenTime = document.getElementById("screenTime").value;
  const blockSites = document.getElementById("blockSites").value;
  const saveMessage = document.getElementById("saveMessage");

  saveMessage.textContent = "Settings saved! (Screen Time: " + screenTime + " min, Blocked: " + blockSites + ")";
  setTimeout(() => {
    saveMessage.textContent = "";
  }, 3000);
}
