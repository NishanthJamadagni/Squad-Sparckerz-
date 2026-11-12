const video = document.getElementById("cameraVideo");
const cameraFrame = document.getElementById("cameraFrame");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const cameraStatus = document.getElementById("cameraStatus");
const cameraNote = document.getElementById("cameraNote");
const recognizedSign = document.getElementById("recognizedSign");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const languageSelect = document.getElementById("language");
const toast = document.getElementById("toast");

let cameraStream = null;
let toastTimer = null;
const historyItems = [];

const translations = {
  en: {title:"Indian Sign Language Recognition with Multilingual Dialogue", subtitle:"Sign in front of the camera, get instant responses in your preferred language!", language:"Select Language:", live:"Live Sign Input", cameraTitle:"Your camera preview will appear here", cameraHint:"Allow camera access when your browser asks", recognized:"Recognized Sign:", waiting:"Waiting for a sign...", start:"Start Recognition", stop:"Stop", conversation:"Conversation", history:"View History", placeholder:"Continue signing or type a message...", helloUser:"Hello", helloBot:"Hello! How can I help you today?"},
  hi: {title:"भारतीय सांकेतिक भाषा पहचान और बहुभाषी संवाद", subtitle:"कैमरे के सामने संकेत करें और अपनी पसंदीदा भाषा में तुरंत जवाब पाएँ!", language:"भाषा चुनें:", live:"लाइव साइन इनपुट", cameraTitle:"आपका कैमरा यहाँ दिखाई देगा", cameraHint:"ब्राउज़र पूछे तो कैमरा अनुमति दें", recognized:"पहचाना गया संकेत:", waiting:"संकेत की प्रतीक्षा है...", start:"पहचान शुरू करें", stop:"रोकें", conversation:"बातचीत", history:"इतिहास देखें", placeholder:"संकेत जारी रखें या संदेश लिखें...", helloUser:"नमस्ते", helloBot:"नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूँ?"},
  kn: {title:"ಭಾರತೀಯ ಸಂಕೇತ ಭಾಷೆ ಗುರುತಿಸುವಿಕೆ ಮತ್ತು ಬಹುಭಾಷಾ ಸಂಭಾಷಣೆ", subtitle:"ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಸಂಕೇತ ಮಾಡಿ, ನಿಮ್ಮ ಆಯ್ಕೆಯ ಭಾಷೆಯಲ್ಲಿ ತಕ್ಷಣ ಉತ್ತರ ಪಡೆಯಿರಿ!", language:"ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:", live:"ಲೈವ್ ಸಂಕೇತ ಇನ್‌ಪುಟ್", cameraTitle:"ನಿಮ್ಮ ಕ್ಯಾಮೆರಾ ದೃಶ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ", cameraHint:"ಬ್ರೌಸರ್ ಕೇಳಿದಾಗ ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ನೀಡಿ", recognized:"ಗುರುತಿಸಿದ ಸಂಕೇತ:", waiting:"ಸಂಕೇತಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...", start:"ಗುರುತಿಸುವಿಕೆ ಪ್ರಾರಂಭಿಸಿ", stop:"ನಿಲ್ಲಿಸಿ", conversation:"ಸಂಭಾಷಣೆ", history:"ಇತಿಹಾಸ ನೋಡಿ", placeholder:"ಸಂಕೇತ ಮುಂದುವರಿಸಿ ಅಥವಾ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...", helloUser:"ನಮಸ್ಕಾರ", helloBot:"ನಮಸ್ಕಾರ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"}
};
function applyLanguage() {
  const t = translations[languageSelect.value] || translations.en;
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  set("pageTitle", t.title); set("pageSubtitle", t.subtitle); set("languageLabel", t.language);
  set("liveSignTitle", t.live); set("cameraPlaceholderTitle", t.cameraTitle); set("cameraPlaceholderHint", t.cameraHint);
  set("recognizedLabel", t.recognized); set("startButtonText", t.start); set("stopButtonText", t.stop);
  set("conversationTitle", t.conversation); set("historyButtonText", t.history);
  chatInput.placeholder = t.placeholder;
  const userBubble = chatMessages.querySelector(".user-bubble"); if (userBubble) userBubble.textContent = t.helloUser;
  const botBubble = chatMessages.querySelector(".bot-bubble");
  if (botBubble) { const speak = botBubble.querySelector(".speak-button"); botBubble.firstChild.textContent = t.helloBot; if (speak) speak.dataset.speak = t.helloBot; }
  recognizedSign.textContent = t.waiting;
  document.documentElement.lang = languageSelect.value;
}
languageSelect.addEventListener("change", applyLanguage);
applyLanguage();


function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraNote.textContent = "Camera is unavailable. Open this page using Live Server or localhost.";
    showToast("Please open the project with Live Server.");
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }, audio: false
    });
    video.srcObject = cameraStream;
    video.style.display = "block";
    cameraPlaceholder.style.display = "none";
    cameraFrame.classList.add("is-live");
    cameraStatus.classList.add("active");
    cameraStatus.innerHTML = "<i></i> Camera Active";
    startButton.disabled = true;
    stopButton.disabled = false;
    cameraNote.textContent = "Camera preview is active. Sign recognition needs an ML model connected to this frontend.";
    recognizedSign.textContent = "Camera ready — waiting for recognition";
    showToast("Camera started successfully.");
  } catch (error) {
    const reason = error.name === "NotAllowedError" ? "Camera permission was denied." : "Could not start the camera.";
    cameraNote.textContent = reason + " Check browser permissions and try again.";
    showToast(reason);
  }
}

function stopCamera() {
  if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
  cameraStream = null;
  video.srcObject = null;
  video.style.display = "none";
  cameraPlaceholder.style.display = "flex";
  cameraFrame.classList.remove("is-live");
  cameraStatus.classList.remove("active");
  cameraStatus.innerHTML = "<i></i> Camera Off";
  startButton.disabled = false;
  stopButton.disabled = true;
  recognizedSign.textContent = "Waiting for a sign...";
  cameraNote.textContent = "Camera access is used only for this browser preview.";
}

function addMessage(text, sender) {
  const row = document.createElement("div");
  row.className = "message-row " + (sender === "user" ? "user-row" : "bot-row");
  if (sender === "user") {
    const bubble = document.createElement("div");
    bubble.className = "bubble user-bubble";
    bubble.textContent = text;
    const avatar = document.createElement("div");
    avatar.className = "message-avatar user-avatar";
    avatar.textContent = "♟";
    row.append(bubble, avatar);
  } else {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar bot-avatar";
    avatar.textContent = "🤖";
    const content = document.createElement("div");
    content.className = "bot-content";
    const bubble = document.createElement("div");
    bubble.className = "bubble bot-bubble";
    const message = document.createElement("span");
    message.textContent = text;
    const speak = document.createElement("button");
    speak.className = "speak-button";
    speak.type = "button";
    speak.textContent = "◖))";
    speak.setAttribute("aria-label", "Read response aloud");
    speak.dataset.speak = text;
    bubble.append(message, speak);
    content.append(bubble);
    row.append(avatar, content);
  }
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  historyItems.push({ text, sender, time: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}) });
}

function getReply(message) {
  const lang = languageSelect.value;
  const lower = message.toLowerCase();
  if (lang === "hi") {
    if (lower.includes("hello") || lower.includes("hi")) return "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?";
    return "आपका संदेश मिल गया। मैं आपकी मदद के लिए यहाँ हूँ।";
  }
  if (lang === "kn") {
    if (lower.includes("hello") || lower.includes("hi")) return "ನಮಸ್ಕಾರ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?";
    return "ನಿಮ್ಮ ಸಂದೇಶ ಬಂದಿದೆ. ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.";
  }
  if (lower.includes("help")) return "Of course! You can sign in front of the camera or type a message here.";
  if (lower.includes("thank")) return "You're welcome! Happy to help.";
  return "I received your message: “" + message + "”. A multilingual AI response service can be connected here.";
}

chatForm.addEventListener("submit", event => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  addMessage(message, "user");
  chatInput.value = "";
  setTimeout(() => addMessage(getReply(message), "bot"), 350);
});

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    showToast("Speech playback is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = languageSelect.value;
  utterance.lang = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN";
  window.speechSynthesis.speak(utterance);
}

document.addEventListener("click", event => {
  const speakButton = event.target.closest("[data-speak]");
  if (speakButton) speakText(speakButton.dataset.speak);
});

startButton.addEventListener("click", startCamera);
stopButton.addEventListener("click", stopCamera);

document.getElementById("viewHistory").addEventListener("click", () => {
  if (!historyItems.length) {
    showToast("Your new messages will appear in chat history.");
    return;
  }
  const summary = historyItems.slice(-5).map(item => `${item.time} · ${item.sender}: ${item.text}`).join("\\n");
  alert("Recent conversation\\n\\n" + summary);
});

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const page = button.dataset.page;
    if (page === "home") window.scrollTo({top: 0, behavior: "smooth"});
    else if (page === "history") document.getElementById("viewHistory").click();
    else if (page === "profile") showToast("Profile page can be connected to your login system.");
    else if (page === "logout") showToast("Connect your authentication service to log out.");
  });
});

document.getElementById("profileButton").addEventListener("click", () => showToast("User profile menu"));
window.addEventListener("beforeunload", stopCamera);
