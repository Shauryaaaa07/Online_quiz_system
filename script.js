const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {
  screens.forEach((screen) => screen.classList.remove("active"));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) targetScreen.classList.add("active");
}

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const continueBtn = document.getElementById("continue-btn");
const logoutBtn = document.getElementById("logout-btn");
const categoryLogoutBtn = document.getElementById("category-logout-btn");
const quizLogoutBtn = document.getElementById("quiz-logout-btn");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterBtn = document.getElementById("show-register-btn");
const showLoginBtn = document.getElementById("show-login-btn");
const registerBackBtn = document.getElementById("register-back-btn");
const registerSubmitBtn = document.getElementById("register-submit-btn");
const regUsernameInput = document.getElementById("reg-username");
const regEmailInput = document.getElementById("reg-email");
const regPasswordInput = document.getElementById("reg-password");
const regConfirmPasswordInput = document.getElementById("reg-confirm-password");

const displayName = document.getElementById("display-name");
const categoryButtons = document.querySelectorAll(".category-btn");
const openLeaderboardBtn = document.getElementById("open-leaderboard-btn");
const backToHomeBtn = document.getElementById("back-to-home-btn");
const clearLeaderboardBtn = document.getElementById("clear-leaderboard-btn");
const leaderboardList = document.getElementById("leaderboard-list");
const loginLeaderboardList = document.getElementById("login-leaderboard-list");

const categoryTitle = document.getElementById("category-title");
const questionCount = document.getElementById("question-count");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");
const nextBtn = document.getElementById("next-btn");
const timeEl = document.getElementById("time");
const progress = document.getElementById("progress");

const finalName = document.getElementById("final-name");
const finalCategory = document.getElementById("final-category");
const finalScore = document.getElementById("final-score");
const finalPercentage = document.getElementById("final-percentage");
const certificateMessage = document.getElementById("certificate-message");
const downloadCertificateBtn = document.getElementById("download-certificate-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const changeCategoryBtn = document.getElementById("change-category-btn");
const resultBackBtn = document.getElementById("result-back-btn");

let userName = "";
let currentUser = null;
let selectedCategory = "";
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 20;
let timer = null;
const questionsPerQuiz = 20;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shuffleArray(array) {
  const copiedArray = [...array];
  for (let i = copiedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]];
  }
  return copiedArray;
}

function getStoredUsers() {
  return JSON.parse(localStorage.getItem("quizRegisteredUsers") || "[]");
}

function saveStoredUsers(users) {
  localStorage.setItem("quizRegisteredUsers", JSON.stringify(users));
}

function saveCurrentUser(user) {
  localStorage.setItem("quizCurrentUser", JSON.stringify(user));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("quizCurrentUser") || "null");
}

function clearCurrentUser() {
  localStorage.removeItem("quizCurrentUser");
}

function getLeaderboard() {
  return JSON.parse(localStorage.getItem("quizLeaderboard") || "[]");
}

function saveLeaderboardEntry(entry) {
  const leaderboard = getLeaderboard();
  leaderboard.push(entry);

  leaderboard.sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return b.score - a.score;
  });

  localStorage.setItem("quizLeaderboard", JSON.stringify(leaderboard.slice(0, 10)));
}

function getMedal(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
}

function categoryLabel(categoryKey) {
  const labels = {
    gk: "General Knowledge",
    science: "Science",
    sports: "Sports",
    current: "Current Affairs"
  };
  return labels[categoryKey] || categoryKey;
}

function updateLoginState(isLoggedIn) {
  if (logoutBtn) {
    logoutBtn.classList.toggle("hidden", !isLoggedIn);
  }
}

function fillUserInfo(user) {
  currentUser = user;
  userName = user.name;

  if (usernameInput) usernameInput.value = user.name;
  if (emailInput) emailInput.value = user.email;
  if (passwordInput) passwordInput.value = user.password;
  if (displayName) displayName.textContent = user.name;

  updateLoginState(true);
}

function logoutUser() {
  clearCurrentUser();
  currentUser = null;
  userName = "";

  if (usernameInput) usernameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";

  updateLoginState(false);
  showScreen("login-screen");
}

function renderLoginLeaderboard() {
  if (!loginLeaderboardList) return;

  const leaderboard = getLeaderboard().slice(0, 3);
  loginLeaderboardList.innerHTML = "";

  if (leaderboard.length === 0) {
    loginLeaderboardList.innerHTML = `
      <div class="login-leaderboard-item">
        <span class="name">No scores yet — be the first to play.</span>
      </div>
    `;
    return;
  }

  leaderboard.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "login-leaderboard-item";
    row.innerHTML = `
      <span class="rank">${getMedal(index)}</span>
      <span class="name">${item.name}</span>
      <span class="score">${item.score}/${item.total} (${item.percentage}%)</span>
    `;
    loginLeaderboardList.appendChild(row);
  });
}

function renderLeaderboard() {
  if (!leaderboardList) return;

  const leaderboard = getLeaderboard();
  leaderboardList.innerHTML = "";

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<p>No scores added yet. Finish a quiz to appear here.</p>";
    return;
  }

  leaderboard.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-item";
    row.innerHTML = `
      <div>
        <div class="rank-badge">${getMedal(index)} ${item.name}</div>
        <div>${item.category}</div>
      </div>
      <div>
        <strong>${item.score}/${item.total}</strong><br>
        <span>${item.percentage}%</span>
      </div>
    `;
    leaderboardList.appendChild(row);
  });
}

let confettiCanvas = null;
let confettiContext = null;
let confettiPieces = [];
let confettiId = null;

function setupConfetti() {
  if (confettiCanvas) return;

  confettiCanvas = document.createElement("canvas");
  confettiCanvas.style.position = "fixed";
  confettiCanvas.style.top = "0";
  confettiCanvas.style.left = "0";
  confettiCanvas.style.width = "100%";
  confettiCanvas.style.height = "100%";
  confettiCanvas.style.pointerEvents = "none";
  confettiCanvas.style.zIndex = "9999";
  document.body.appendChild(confettiCanvas);

  confettiContext = confettiCanvas.getContext("2d");
  resizeConfetti();
  window.addEventListener("resize", resizeConfetti);
}

function resizeConfetti() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function runConfetti() {
  setupConfetti();
  confettiPieces = [];

  const colors = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];

  for (let i = 0; i < 180; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -confettiCanvas.height,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 4,
      speedX: -2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      rotateSpeed: -0.15 + Math.random() * 0.3
    });
  }

  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.angle += piece.rotateSpeed;

      confettiContext.save();
      confettiContext.translate(piece.x, piece.y);
      confettiContext.rotate(piece.angle);
      confettiContext.fillStyle = piece.color;
      confettiContext.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      confettiContext.restore();
    });

    confettiPieces = confettiPieces.filter((piece) => piece.y < confettiCanvas.height + 40);

    if (elapsed < 3000 && confettiPieces.length > 0) {
      confettiId = requestAnimationFrame(animate);
    } else {
      confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      cancelAnimationFrame(confettiId);
      confettiId = null;
    }
  }

  if (confettiId) cancelAnimationFrame(confettiId);
  confettiId = requestAnimationFrame(animate);
}

function resetQuestionState() {
  clearInterval(timer);
  timeLeft = 20;
  if (timeEl) timeEl.textContent = timeLeft;
  if (nextBtn) nextBtn.classList.add("hidden");
  if (answerButtons) answerButtons.innerHTML = "";
}

function updateProgressBar() {
  if (!progress) return;
  const value = (currentQuestionIndex / currentQuestions.length) * 100;
  progress.style.width = `${value}%`;
}

function lockAllAnswers(selectedButton = null) {
  Array.from(answerButtons.children).forEach((button) => {
    const correct = button.dataset.correct === "true";

    if (correct) {
      button.classList.add("correct");
    } else if (button === selectedButton) {
      button.classList.add("wrong");
    }

    button.disabled = true;
  });
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 20;
  if (timeEl) timeEl.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    if (timeEl) timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      lockAllAnswers(null);
      if (nextBtn) nextBtn.classList.remove("hidden");
    }
  }, 1000);
}

function loadQuestion() {
  resetQuestionState();

  if (currentQuestionIndex >= currentQuestions.length) {
    showResult();
    return;
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];

  if (questionText) questionText.textContent = currentQuestion.question;
  if (questionCount) {
    questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
  }

  updateProgressBar();

  const shuffledAnswers = shuffleArray(currentQuestion.answers);

  shuffledAnswers.forEach((answer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-btn";
    button.textContent = answer.text;

    if (answer.correct) {
      button.dataset.correct = "true";
    }

    button.addEventListener("click", () => {
      clearInterval(timer);

      if (button.dataset.correct === "true") {
        score++;
      }

      lockAllAnswers(button);
      if (nextBtn) nextBtn.classList.remove("hidden");
    });

    answerButtons.appendChild(button);
  });

  startTimer();
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showScreen("quiz-screen");
  loadQuestion();
}

function showResult() {
  showScreen("result-screen");

  const percentage = Math.round((score / currentQuestions.length) * 100);

  if (finalName) finalName.textContent = userName;
  if (finalCategory) finalCategory.textContent = categoryLabel(selectedCategory);
  if (finalScore) finalScore.textContent = `${score} / ${currentQuestions.length}`;
  if (finalPercentage) finalPercentage.textContent = percentage;

  saveLeaderboardEntry({
    name: userName,
    category: categoryLabel(selectedCategory),
    score: score,
    total: currentQuestions.length,
    percentage: percentage
  });

  renderLoginLeaderboard();

  if (percentage >= 75) {
    if (certificateMessage) {
      certificateMessage.textContent = "Great job! Your certificate is ready to download.";
    }
    if (downloadCertificateBtn) downloadCertificateBtn.classList.remove("hidden");
    runConfetti();
  } else {
    if (certificateMessage) {
      certificateMessage.textContent = "Score 75% or more to unlock the certificate.";
    }
    if (downloadCertificateBtn) downloadCertificateBtn.classList.add("hidden");
  }

  if (progress) progress.style.width = "100%";
}

function downloadCertificate() {
  const percentage = Math.round((score / currentQuestions.length) * 100);

  if (percentage < 75) {
    alert("You need at least 75% to download the certificate.");
    return;
  }

  const certificateWindow = window.open("", "_blank");

  certificateWindow.document.write(`
    <html>
      <head>
        <title>Quiz Certificate</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f8fafc;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .certificate {
            width: 900px;
            max-width: 100%;
            padding: 40px;
            border: 10px solid #2563eb;
            background: white;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          }
          h1 {
            font-size: 42px;
            color: #1e3a8a;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 30px;
            margin: 20px 0;
            color: #111827;
          }
          p {
            font-size: 20px;
            color: #374151;
            margin: 12px 0;
          }
          .highlight {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
          }
          .footer {
            margin-top: 30px;
            font-size: 18px;
            color: #555;
          }
          .print-btn {
            margin-top: 30px;
            padding: 12px 20px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          }
          @media print {
            .print-btn {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>Certificate of Achievement</h1>
          <p>This certificate is proudly presented to</p>
          <h2>${userName}</h2>
          <p>for successfully completing the</p>
          <p class="highlight">${categoryLabel(selectedCategory)} Quiz</p>
          <p>with a score of <strong>${score} / ${currentQuestions.length}</strong></p>
          <p>Percentage: <strong>${percentage}%</strong></p>
          <div class="footer">
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Online Quiz System</p>
          </div>
          <button class="print-btn" onclick="window.print()">Download / Print Certificate</button>
        </div>
      </body>
    </html>
  `);

  certificateWindow.document.close();
}

continueBtn?.addEventListener("click", () => {
  const nameValue = usernameInput.value.trim();
  const emailValue = emailInput.value.trim().toLowerCase();
  const passwordValue = passwordInput.value.trim();

  if (!nameValue || !emailValue || !passwordValue) {
    alert("Please enter all login details.");
    return;
  }

  if (!validateEmail(emailValue)) {
    alert("Please enter a correct email.");
    return;
  }

  if (passwordValue.length < 6) {
    alert("Password should be at least 6 characters.");
    return;
  }

  const users = getStoredUsers();
  const existingUser = users.find(
    (user) => user.email === emailValue && user.password === passwordValue
  );

  if (!existingUser) {
    alert("Login details are not matching. Please check or register first.");
    return;
  }

  saveCurrentUser(existingUser);
  fillUserInfo(existingUser);
  showScreen("category-screen");
});

showRegisterBtn?.addEventListener("click", () => {
  loginForm?.classList.add("hidden");
  registerForm?.classList.remove("hidden");
});

showLoginBtn?.addEventListener("click", () => {
  registerForm?.classList.add("hidden");
  loginForm?.classList.remove("hidden");
});

registerBackBtn?.addEventListener("click", () => {
  registerForm?.classList.add("hidden");
  loginForm?.classList.remove("hidden");
});

registerSubmitBtn?.addEventListener("click", () => {
  const nameValue = regUsernameInput.value.trim();
  const emailValue = regEmailInput.value.trim().toLowerCase();
  const passwordValue = regPasswordInput.value.trim();
  const confirmPasswordValue = regConfirmPasswordInput.value.trim();

  if (!nameValue || !emailValue || !passwordValue || !confirmPasswordValue) {
    alert("Please fill all registration fields.");
    return;
  }

  if (!validateEmail(emailValue)) {
    alert("Please enter a correct email.");
    return;
  }

  if (passwordValue.length < 6) {
    alert("Password should be at least 6 characters.");
    return;
  }

  if (passwordValue !== confirmPasswordValue) {
    alert("Both passwords should be the same.");
    return;
  }

  const users = getStoredUsers();
  const alreadyExists = users.some((user) => user.email === emailValue);

  if (alreadyExists) {
    alert("This email is already registered. Try logging in.");
    return;
  }

  const newUser = {
    name: nameValue,
    email: emailValue,
    password: passwordValue
  };

  users.push(newUser);
  saveStoredUsers(users);

  regUsernameInput.value = "";
  regEmailInput.value = "";
  regPasswordInput.value = "";
  regConfirmPasswordInput.value = "";

  alert("Account created successfully. You can login now.");
  registerForm?.classList.add("hidden");
  loginForm?.classList.remove("hidden");

  if (emailInput) emailInput.value = emailValue;
});

logoutBtn?.addEventListener("click", logoutUser);
categoryLogoutBtn?.addEventListener("click", logoutUser);
quizLogoutBtn?.addEventListener("click", logoutUser);

openLeaderboardBtn?.addEventListener("click", () => {
  renderLeaderboard();
  showScreen("leaderboard-screen");
});

backToHomeBtn?.addEventListener("click", () => {
  showScreen("category-screen");
});

clearLeaderboardBtn?.addEventListener("click", () => {
  localStorage.removeItem("quizLeaderboard");
  renderLeaderboard();
  renderLoginLeaderboard();
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    currentQuestions = shuffleArray(quizData[selectedCategory]).slice(0, questionsPerQuiz);

    if (categoryTitle) {
      categoryTitle.textContent = categoryLabel(selectedCategory);
    }

    startQuiz();
  });
});

nextBtn?.addEventListener("click", () => {
  currentQuestionIndex++;
  loadQuestion();
});

playAgainBtn?.addEventListener("click", () => {
  currentQuestions = shuffleArray(quizData[selectedCategory]).slice(0, questionsPerQuiz);
  startQuiz();
});

changeCategoryBtn?.addEventListener("click", () => {
  showScreen("category-screen");
});

resultBackBtn?.addEventListener("click", () => {
  showScreen("category-screen");
});

downloadCertificateBtn?.addEventListener("click", downloadCertificate);

function convertQuestions(rawList) {
  return rawList.map((item) => ({
    question: item[0],
    answers: item[1].map((text, index) => ({
      text,
      correct: index === item[2]
    }))
  }));
}

const baseQuestions = {
  gk: [
    ["What is the capital of India?", ["Mumbai", "New Delhi", "Kolkata", "Chennai"], 1],
    ["Which is the largest planet in our solar system?", ["Earth", "Mars", "Jupiter", "Saturn"], 2],
    ["Who is known as the Father of the Nation in India?", ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhas Chandra Bose", "Bhagat Singh"], 1],
    ["How many continents are there in the world?", ["5", "6", "7", "8"], 2],
    ["Which is the smallest state of India by area?", ["Goa", "Sikkim", "Tripura", "Manipur"], 0],
    ["Which is the longest river in the world?", ["Amazon", "Nile", "Ganga", "Yangtze"], 1],
    ["Which festival is called the festival of lights?", ["Holi", "Diwali", "Eid", "Christmas"], 1],
    ["Who wrote the national anthem of India?", ["Bankim Chandra Chatterjee", "Rabindranath Tagore", "Sarojini Naidu", "Premchand"], 1],
    ["Which ocean is the largest?", ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"], 2],
    ["How many colors are there in a rainbow?", ["5", "6", "7", "8"], 2],
    ["Which is the national animal of India?", ["Lion", "Tiger", "Elephant", "Leopard"], 1],
    ["Which country is called the Land of the Rising Sun?", ["China", "Japan", "Thailand", "Korea"], 1],
    ["Who was the first Prime Minister of India?", ["Mahatma Gandhi", "Sardar Patel", "Jawaharlal Nehru", "Rajendra Prasad"], 2],
    ["Which desert is the largest hot desert in the world?", ["Thar", "Sahara", "Gobi", "Kalahari"], 1],
    ["Which planet is known as the Red Planet?", ["Venus", "Mars", "Mercury", "Jupiter"], 1],
    ["Which is the highest mountain peak in the world?", ["K2", "Kangchenjunga", "Mount Everest", "Makalu"], 2],
    ["What is the currency of Japan?", ["Dollar", "Won", "Yen", "Euro"], 2],
    ["Which Indian city is known as the Pink City?", ["Udaipur", "Jaipur", "Jodhpur", "Bhopal"], 1],
    ["Which gas is most abundant in Earth’s atmosphere?", ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], 1],
    ["Which day is celebrated as Independence Day in India?", ["26 January", "15 August", "2 October", "14 November"], 1],
    ["Which Indian monument is known as the symbol of love?", ["Qutub Minar", "India Gate", "Taj Mahal", "Red Fort"], 2],
    ["How many states are there in India currently?", ["26", "27", "28", "29"], 2],
    ["Which is the largest continent by area?", ["Africa", "Asia", "Europe", "North America"], 1],
    ["Which country has the most population in the world?", ["India", "China", "USA", "Indonesia"], 0],
    ["What is the national flower of India?", ["Rose", "Lotus", "Sunflower", "Jasmine"], 1],
    ["Which month has the fewest days?", ["January", "February", "April", "June"], 1],
    ["How many letters are there in the English alphabet?", ["24", "25", "26", "27"], 2],
    ["Which instrument is used to measure earthquakes?", ["Thermometer", "Barometer", "Seismograph", "Altimeter"], 2],
    ["Which is the national bird of India?", ["Parrot", "Peacock", "Sparrow", "Pigeon"], 1],
    ["Which Indian state is famous for tea gardens?", ["Punjab", "Assam", "Rajasthan", "Gujarat"], 1],
    ["Which is the largest island in the world?", ["Greenland", "Madagascar", "Borneo", "Sri Lanka"], 0],
    ["How many planets are there in the solar system?", ["7", "8", "9", "10"], 1],
    ["Who invented the telephone?", ["Thomas Edison", "Alexander Graham Bell", "Newton", "Einstein"], 1],
    ["What is the capital of France?", ["Rome", "Madrid", "Paris", "Berlin"], 2],
    ["Which Indian state has the longest coastline?", ["Kerala", "Gujarat", "Tamil Nadu", "Maharashtra"], 1],
    ["Which organ helps us to think?", ["Heart", "Brain", "Liver", "Lungs"], 1],
    ["Which is the fastest land animal?", ["Tiger", "Leopard", "Cheetah", "Horse"], 2],
    ["Which sport is called the gentleman’s game?", ["Football", "Cricket", "Tennis", "Golf"], 1],
    ["What is 100 years called?", ["Century", "Decade", "Millennium", "Era"], 0],
    ["Which country gifted the Statue of Liberty to the USA?", ["France", "England", "Germany", "Canada"], 0],
    ["Which city is called the City of Lakes in India?", ["Bhopal", "Jaipur", "Agra", "Lucknow"], 0],
    ["Who painted the Mona Lisa?", ["Picasso", "Leonardo da Vinci", "Van Gogh", "Michelangelo"], 1],
    ["Which vitamin is found in citrus fruits?", ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], 2],
    ["Which is the smallest planet in the solar system?", ["Mercury", "Mars", "Venus", "Earth"], 0],
    ["How many hours are there in a day?", ["12", "18", "24", "48"], 2],
    ["Which is the largest mammal?", ["Elephant", "Blue Whale", "Giraffe", "Shark"], 1],
    ["Which direction does the sun rise from?", ["West", "North", "East", "South"], 2],
    ["Which gas do humans need to breathe?", ["Nitrogen", "Carbon Dioxide", "Oxygen", "Helium"], 2],
    ["Which Indian currency note has Mahatma Gandhi on it?", ["All modern notes", "Only ₹500", "Only ₹100", "Only ₹2000"], 0],
    ["Which is the largest democracy in the world?", ["India", "USA", "UK", "Japan"], 0]
  ],

  science: [
    ["What is the chemical formula of water?", ["H2O", "CO2", "NaCl", "O2"], 0],
    ["Which organ pumps blood in the human body?", ["Brain", "Lungs", "Heart", "Kidney"], 2],
    ["Which gas do plants absorb during photosynthesis?", ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], 1],
    ["How many bones are there in an adult human body?", ["198", "206", "210", "216"], 1],
    ["The Sun is a:", ["Planet", "Satellite", "Star", "Galaxy"], 2],
    ["Which vitamin is mainly obtained from sunlight?", ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], 2],
    ["What force pulls objects toward Earth?", ["Magnetism", "Gravity", "Pressure", "Friction"], 1],
    ["Which part of the cell contains genetic material?", ["Cytoplasm", "Nucleus", "Membrane", "Ribosome"], 1],
    ["What is the boiling point of water at sea level?", ["90°C", "100°C", "110°C", "120°C"], 1],
    ["Which blood cells help fight infection?", ["Red blood cells", "White blood cells", "Platelets", "Plasma"], 1],
    ["Which planet is closest to the Sun?", ["Venus", "Earth", "Mercury", "Mars"], 2],
    ["Which instrument is used to measure temperature?", ["Barometer", "Thermometer", "Hygrometer", "Ammeter"], 1],
    ["Which gas is essential for human respiration?", ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], 0],
    ["Which metal is liquid at room temperature?", ["Iron", "Mercury", "Copper", "Aluminium"], 1],
    ["What is the SI unit of force?", ["Joule", "Newton", "Pascal", "Watt"], 1],
    ["Which organ helps in purification of blood?", ["Heart", "Kidney", "Liver", "Lungs"], 1],
    ["Which layer protects Earth from harmful UV rays?", ["Troposphere", "Ozone layer", "Ionosphere", "Mesosphere"], 1],
    ["What is the powerhouse of the cell?", ["Nucleus", "Mitochondria", "Golgi body", "Vacuole"], 1],
    ["Which branch of science deals with plants?", ["Zoology", "Botany", "Chemistry", "Physics"], 1],
    ["Which simple machine is used to draw water from a well?", ["Lever", "Pulley", "Wedge", "Inclined plane"], 1],
    ["What is the SI unit of temperature?", ["Kelvin", "Celsius", "Fahrenheit", "Newton"], 0],
    ["Which organ is used for breathing?", ["Heart", "Liver", "Lungs", "Kidney"], 2],
    ["Which particle has a negative charge?", ["Proton", "Neutron", "Electron", "Photon"], 2],
    ["What is freezing point of water?", ["0°C", "10°C", "32°C", "100°C"], 0],
    ["What part of the plant absorbs water from soil?", ["Leaf", "Root", "Stem", "Flower"], 1],
    ["What do bees collect from flowers?", ["Milk", "Pollen and nectar", "Water", "Salt"], 1],
    ["Which gas is released by plants during photosynthesis?", ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"], 1],
    ["How many teeth does an adult human usually have?", ["28", "30", "32", "36"], 2],
    ["Which is the nearest star to Earth?", ["Sirius", "Sun", "Polaris", "Alpha Centauri"], 1],
    ["Which organ controls the body?", ["Heart", "Brain", "Liver", "Stomach"], 1],
    ["What is the main source of energy for Earth?", ["Moon", "Sun", "Wind", "Coal"], 1],
    ["What is measured by a weighing balance?", ["Temperature", "Mass", "Pressure", "Speed"], 1],
    ["Which part of the body helps us see?", ["Ear", "Nose", "Eye", "Tongue"], 2],
    ["Which gas is used in balloons to make them float?", ["Oxygen", "Helium", "Nitrogen", "Hydrogen"], 1],
    ["What is the common name of sodium chloride?", ["Sugar", "Salt", "Vinegar", "Baking soda"], 1],
    ["Which state of matter has definite shape and volume?", ["Liquid", "Gas", "Solid", "Plasma"], 2],
    ["Which vitamin helps in blood clotting?", ["Vitamin K", "Vitamin C", "Vitamin D", "Vitamin B12"], 0],
    ["Which organ stores urine?", ["Kidney", "Bladder", "Liver", "Pancreas"], 1],
    ["What is the center of an atom called?", ["Shell", "Nucleus", "Core", "Orbit"], 1],
    ["What causes day and night?", ["Earth’s rotation", "Moon’s orbit", "Sun’s motion", "Wind"], 0],
    ["Which energy source is renewable?", ["Coal", "Petrol", "Solar", "Diesel"], 2],
    ["Which blood group is known as universal donor?", ["AB+", "O-", "A+", "B-"], 1],
    ["Which organ helps in digestion?", ["Stomach", "Heart", "Lungs", "Brain"], 0],
    ["Which scientist gave the law of gravity?", ["Einstein", "Newton", "Galileo", "Tesla"], 1],
    ["Which lens is used to correct short-sightedness?", ["Convex lens", "Concave lens", "Plane lens", "Cylindrical lens"], 1],
    ["Which is the hardest natural substance?", ["Iron", "Gold", "Diamond", "Silver"], 2],
    ["What do we call animals that eat only plants?", ["Carnivores", "Herbivores", "Omnivores", "Insectivores"], 1],
    ["Which organ produces insulin?", ["Liver", "Kidney", "Pancreas", "Heart"], 2],
    ["Which gas is commonly called laughing gas?", ["Oxygen", "Nitrous oxide", "Hydrogen", "Carbon monoxide"], 1],
    ["Which metal is attracted by a magnet most strongly?", ["Aluminium", "Copper", "Iron", "Silver"], 2]
  ],

  sports: [
    ["How many players are there in a cricket team?", ["9", "10", "11", "12"], 2],
    ["Which sport uses a shuttlecock?", ["Tennis", "Badminton", "Hockey", "Squash"], 1],
    ["In which sport is the term 'checkmate' used?", ["Football", "Chess", "Boxing", "Kabaddi"], 1],
    ["Sachin Tendulkar is associated with which sport?", ["Football", "Cricket", "Hockey", "Tennis"], 1],
    ["How many players are on the court for one basketball team?", ["5", "6", "7", "8"], 0],
    ["Which country is famous for sumo wrestling?", ["China", "Japan", "Thailand", "Korea"], 1],
    ["How many points is a goal worth in football?", ["1", "2", "3", "5"], 0],
    ["Which sport is known as the king of sports?", ["Cricket", "Football", "Hockey", "Basketball"], 1],
    ["Milkha Singh was famous in which sport?", ["Wrestling", "Athletics", "Boxing", "Cricket"], 1],
    ["Which country hosted the 2016 Summer Olympics?", ["China", "Brazil", "Japan", "Russia"], 1],
    ["Which sport is associated with Wimbledon?", ["Cricket", "Badminton", "Tennis", "Golf"], 2],
    ["In which sport can you score a try?", ["Rugby", "Hockey", "Tennis", "Basketball"], 0],
    ["Which game is played with a cue and balls on a table?", ["Snooker", "Tennis", "Golf", "Baseball"], 0],
    ["What is the maximum score in one dart throw using three darts?", ["120", "150", "180", "200"], 2],
    ["Which Indian athlete is known as the Golden Boy after Olympic javelin success?", ["Neeraj Chopra", "Milkha Singh", "Bajrang Punia", "Abhinav Bindra"], 0],
    ["How many rings are there in the Olympic symbol?", ["4", "5", "6", "7"], 1],
    ["Which sport uses the terms birdie and eagle?", ["Baseball", "Golf", "Tennis", "Badminton"], 1],
    ["Which sport is P. V. Sindhu famous for?", ["Badminton", "Tennis", "Table Tennis", "Athletics"], 0],
    ["In kabaddi, players chant 'kabaddi' mainly to show what?", ["Balance", "Single breath control", "Speed", "Victory"], 1],
    ["Which sport has positions like goalkeeper, defender, and striker?", ["Cricket", "Football", "Baseball", "Volleyball"], 1],
    ["How many players are there in a volleyball team on court?", ["5", "6", "7", "8"], 1],
    ["Which sport uses a racket and net but no shuttlecock?", ["Badminton", "Tennis", "Hockey", "Polo"], 1],
    ["Who is known as the God of Cricket?", ["Virat Kohli", "MS Dhoni", "Sachin Tendulkar", "Kapil Dev"], 2],
    ["Which game has terms like ace, deuce, and love?", ["Tennis", "Cricket", "Basketball", "Football"], 0],
    ["Which country won the FIFA World Cup 2022?", ["France", "Brazil", "Argentina", "Germany"], 2],
    ["Which sport is called the fastest racket sport?", ["Tennis", "Badminton", "Squash", "Table Tennis"], 1],
    ["In which sport is a pommel horse used?", ["Athletics", "Gymnastics", "Wrestling", "Boxing"], 1],
    ["Which sport is associated with the NBA?", ["Football", "Basketball", "Baseball", "Golf"], 1],
    ["How many overs are there in a T20 innings?", ["10", "15", "20", "25"], 2],
    ["Which country is famous for baseball?", ["USA", "India", "Nepal", "Sri Lanka"], 0],
    ["What is the full form of LBW in cricket?", ["Long Bat Win", "Leg Before Wicket", "Left Ball Wide", "Leg Bat Wicket"], 1],
    ["Which sport uses a puck?", ["Ice Hockey", "Cricket", "Football", "Rugby"], 0],
    ["Which Indian captain won the 2011 Cricket World Cup?", ["Virat Kohli", "MS Dhoni", "Sourav Ganguly", "Kapil Dev"], 1],
    ["What color card means expulsion in football?", ["Yellow", "Green", "Blue", "Red"], 3],
    ["Which sport includes slam dunk?", ["Basketball", "Tennis", "Volleyball", "Baseball"], 0],
    ["Which sport is associated with the Ashes?", ["Cricket", "Football", "Tennis", "Golf"], 0],
    ["Which country started modern Olympic Games?", ["Italy", "Greece", "France", "USA"], 1],
    ["In which game is a queen the most powerful piece?", ["Ludo", "Carrom", "Chess", "Snooker"], 2],
    ["Which sport uses gloves, ring, and knockout?", ["Wrestling", "Boxing", "Karate", "Judo"], 1],
    ["Which country has won the most Cricket World Cups?", ["India", "Australia", "England", "Pakistan"], 1],
    ["What is a hat-trick in cricket?", ["3 sixes", "3 wickets in 3 balls", "3 catches", "3 runs"], 1],
    ["Which sport uses a balance beam?", ["Gymnastics", "Athletics", "Boxing", "Archery"], 0],
    ["Which game is known as the queen of sports?", ["Athletics", "Football", "Badminton", "Swimming"], 0],
    ["Which athlete is famous for sprinting and multiple Olympic gold medals?", ["Usain Bolt", "Roger Federer", "Tiger Woods", "LeBron James"], 0],
    ["Which surface is used at Wimbledon?", ["Clay", "Grass", "Hard Court", "Synthetic"], 1],
    ["In badminton, what is the maximum points in one game now?", ["11", "15", "21", "25"], 2],
    ["What is the national sport of India traditionally considered in general GK?", ["Cricket", "Football", "Hockey", "Kabaddi"], 2],
    ["Which sport uses arrows and target?", ["Shooting", "Archery", "Darts", "Fencing"], 1],
    ["Which game is played on a board with black and white squares?", ["Carrom", "Chess", "Ludo", "Monopoly"], 1],
    ["Which player is called Captain Cool in Indian cricket?", ["Rohit Sharma", "MS Dhoni", "Virat Kohli", "Rahul Dravid"], 1]
  ],

  current: [
    ["Which digital payment system is widely used in India?", ["UPI", "FTP", "HTTP", "GPS"], 0],
    ["Which Indian mission landed near the Moon’s south pole?", ["Mangalyaan", "Chandrayaan-3", "Aditya-L1", "Gaganyaan"], 1],
    ["Which mission is focused on studying the Sun?", ["Chandrayaan-2", "Aditya-L1", "RISAT", "GSLV"], 1],
    ["5G technology is mainly related to:", ["Banking", "Mobile communication", "Railways", "Agriculture"], 1],
    ["Which platform is commonly used for online video meetings?", ["Photoshop", "Zoom", "Excel", "Paint"], 1],
    ["Which Indian campaign focuses on cleanliness?", ["Digital India", "Make in India", "Swachh Bharat Abhiyan", "Skill India"], 2],
    ["AI stands for:", ["Automated Internet", "Artificial Intelligence", "Advanced Interface", "Auto Information"], 1],
    ["Which sector includes apps like PhonePe, Paytm, and Google Pay?", ["Edtech", "Fintech", "Agritech", "Medtech"], 1],
    ["Which device combination became common for online classes?", ["Typewriter and fax", "Smartphones and laptops", "Camera and printer", "Scanner and TV"], 1],
    ["Which Indian program encourages digital services and technology adoption?", ["Digital India", "Green India", "Skill India", "Swachh Bharat"], 0],
    ["Cybersecurity mainly protects:", ["Only buildings", "Digital systems and data", "Only forests", "Only vehicles"], 1],
    ["Cloud computing allows users to:", ["Store and access data online", "Only print documents", "Repair hardware", "Build roads"], 0],
    ["Electric vehicles are promoted mainly because they can:", ["Increase smoke", "Reduce fuel dependence and emissions", "Run without batteries", "Use only diesel"], 1],
    ["A startup is generally a:", ["Traditional village market", "New business with innovation focus", "Government holiday", "Type of hardware chip"], 1],
    ["QR codes are widely used today mainly for:", ["Cooking food", "Quick scanning and payments", "Cutting paper", "Measuring temperature"], 1],
    ["Which technology helps recommendation systems on apps?", ["Machine Learning", "Plumbing", "Carpentry", "Welding"], 0],
    ["Data privacy means:", ["Sharing all personal data publicly", "Protecting personal information from misuse", "Deleting all files daily", "Using no password ever"], 1],
    ["Which Indian mission is related to human spaceflight?", ["Gaganyaan", "Aditya-L1", "Chandrayaan-1", "NavIC"], 0],
    ["Remote work mainly depends on:", ["Internet connectivity and collaboration tools", "Only paper files", "Only landline phones", "Only classroom boards"], 0],
    ["Which term is used for fake attempts to steal passwords online?", ["Phishing", "Streaming", "Hosting", "Caching"], 0],
    ["What does OTT commonly refer to in entertainment?", ["Online streaming platforms", "Offline test tools", "Open tech transfer", "Only TV transmission"], 0],
    ["Which payment method uses scan-and-pay most often?", ["Cheque", "QR code", "Money order", "Draft slip"], 1],
    ["Which Indian event celebrates startups and entrepreneurship widely?", ["Startup events", "Sports Day", "Teacher’s Day", "Army Day"], 0],
    ["Which device is most used for digital payments by common users?", ["Typewriter", "Smartphone", "Fax", "Printer"], 1],
    ["Which tech is used to unlock phones with face or fingerprint?", ["Biometric authentication", "Analog relay", "Manual coding", "Cardboard sensor"], 0],
    ["Which app type is used to order food online?", ["Browser-only calculator", "Food delivery app", "Video editor", "Gallery app"], 1],
    ["Which organization launches missions like Chandrayaan and Aditya-L1?", ["DRDO", "ISRO", "BARC", "NITI Aayog"], 1],
    ["Which online threat locks files and asks money?", ["Firewall", "Ransomware", "Bluetooth", "Caching"], 1],
    ["What does UPI enable?", ["Instant digital bank transfers", "Offline maps", "Photo editing", "Gaming only"], 0],
    ["Which kind of shopping has grown rapidly due to mobile apps?", ["Only street shopping", "Online shopping", "Only newspaper orders", "Only catalog shopping"], 1],
    ["What is commonly used for secure login besides password?", ["2-factor authentication", "Only username", "Only wallpaper", "Only ringtone"], 0],
    ["Which tech field focuses on robots and smart automation?", ["Robotics", "Botany", "History", "Geography"], 0],
    ["Which app category includes Google Maps?", ["Navigation", "Banking", "Gaming", "Music"], 0],
    ["Which technology is used to store huge data online for companies?", ["Cloud storage", "Typewriter", "CD-only system", "Radio signal"], 0],
    ["Which online method is common for learning from home?", ["E-learning platforms", "Only blackboard", "Only radio", "Printed walls"], 0],
    ["Which is a common social media content format now?", ["Short videos / reels", "Telegram wire only", "Fax copy", "Punch card"], 0],
    ["Which device category includes smartwatch?", ["Wearable technology", "Heavy machinery", "Kitchenware", "Stationery"], 0],
    ["Which technology powers chatbots and virtual assistants?", ["Artificial Intelligence", "Steam power", "Hand tools", "Ink printing"], 0],
    ["What is used to protect online accounts from guessing attacks?", ["Strong password", "Public PIN sharing", "No lock", "Single digit password"], 0],
    ["Which category do EV charging stations belong to?", ["Transport infrastructure", "Agriculture tools", "Library systems", "Printing units"], 0],
    ["Which government digital identity service is common in India?", ["Aadhaar-linked services", "Only passports", "Only ration paper", "Only stamps"], 0],
    ["What is commonly used to attend remote office meetings?", ["Video conferencing software", "Only landline", "Only chalkboard", "Only newspaper"], 0],
    ["Which online fraud often pretends to be a bank message?", ["Phishing scam", "Bluetooth pairing", "Photo filter", "Cache clear"], 0],
    ["Which modern payment feature allows tap-to-pay?", ["NFC-based payments", "Pencil marks", "Fax code", "Paper pin"], 0],
    ["Which technology is often used in self-driving research?", ["AI and sensors", "Only mirrors", "Only horns", "Only paint"], 0],
    ["Which mission area is Gaganyaan connected to?", ["Human space mission", "Underwater mission", "Forest mission", "Road survey"], 0],
    ["What is one major benefit of cloud backups?", ["Data recovery", "More dust", "Battery drain only", "Slower typing"], 0],
    ["Which skill is most important for safe internet use?", ["Identifying suspicious links", "Sharing OTPs", "Using weak passwords", "Ignoring updates"], 0],
    ["Which term describes working from home using internet tools?", ["Remote work", "Manual press", "Field ploughing", "Postal mode"], 0],
    ["Which area has grown through app-based cab booking?", ["Mobility services", "Brick making", "Plumbing only", "Fishing only"], 0],
    ["Which data practice is important in modern apps?", ["User privacy protection", "Public password display", "Open misuse", "No security"], 0]
  ]
};

const quizData = {
  gk: convertQuestions(baseQuestions.gk),
  science: convertQuestions(baseQuestions.science),
  sports: convertQuestions(baseQuestions.sports),
  current: convertQuestions(baseQuestions.current)
};

window.addEventListener("load", () => {
  let users = getStoredUsers();

  const demoEmail = "shauryapratap90@gmail.com";
  const demoExists = users.some((user) => user.email === demoEmail);

  if (!demoExists) {
    users.push({
      name: "shaurya",
      email: "shauryapratap90@gmail.com",
      password: "190710"
    });
    saveStoredUsers(users);
  }

  const savedUser = getCurrentUser();

  if (savedUser) {
    fillUserInfo(savedUser);
    showScreen("category-screen");
  } else {
    updateLoginState(false);
    showScreen("login-screen");
  }

  renderLeaderboard();
  renderLoginLeaderboard();
});