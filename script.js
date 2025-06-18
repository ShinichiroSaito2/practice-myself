
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const rankingList = document.getElementById('ranking-list');
const countdownOverlay = document.getElementById('countdown');
const countdownNumber = document.getElementById('countdown-number');

let score = 0;
let timeLeft = 30;
let gameInterval;
let moleCount = 0;
let maxMoles = 20;
let baseSpeed = 500;

function showRanking() {
  const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
  rankingList.innerHTML = '';
  ranking.slice(0, 3).forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}位: ${entry}回`;
    rankingList.appendChild(li);
  });
}

function startCountdown(callback) {
  const countdownValues = ['3', '2', '1', 'Start!'];
  let index = 0;

  countdownOverlay.classList.remove('hidden');
  countdownNumber.textContent = countdownValues[index];

  const countdownInterval = setInterval(() => {
    index++;
    if (index < countdownValues.length) {
      countdownNumber.textContent = countdownValues[index];
    } else {
      clearInterval(countdownInterval);
      countdownOverlay.classList.add('hidden');
      callback(); // ゲーム開始
    }
  }, 1000);
}

function startGame() {
  score = 0;
  timeLeft = 30;
  moleCount = 0;
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  gameInterval = setInterval(updateTimer, 1000);
  spawnMole();
}

function updateTimer() {
  timeLeft--;
  timerDisplay.textContent = timeLeft;
  if (timeLeft <= 0 || moleCount >= maxMoles) {
    endGame();
  }
}

function spawnMole() {
  if (moleCount >= maxMoles || timeLeft <= 0) return;

  const holes = document.querySelectorAll('.hole');
  const index = Math.floor(Math.random() * holes.length);
  const hole = holes[index];

  const mole = document.createElement('div');
  mole.classList.add('mole');

  mole.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = score;
    mole.style.animation = 'none';
    mole.style.bottom = '0';

    const hitLabel = document.createElement('div');
    hitLabel.classList.add('hit-label');
    hitLabel.textContent = 'Hit!';
    hole.appendChild(hitLabel);

    setTimeout(() => {
      hitLabel.remove();
      mole.style.animation = 'slideDown 0.3s ease-out forwards';
      setTimeout(() => mole.remove(), 300);
    }, 100);

    baseSpeed = Math.max(200, baseSpeed - 20);
  });

  hole.appendChild(mole);
  moleCount++;

  setTimeout(() => {
    if (document.body.contains(mole)) {
      mole.style.animation = 'slideDown 0.5s ease-out forwards';
      setTimeout(() => mole.remove(), 500);
    }
    if (timeLeft > 0 && moleCount < maxMoles) {
      setTimeout(spawnMole, baseSpeed);
    }
  }, baseSpeed);
}

function endGame() {
  clearInterval(gameInterval);
  document.querySelectorAll('.mole').forEach(m => m.remove());

  const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
  ranking.push(score);
  ranking.sort((a, b) => b - a);
  localStorage.setItem('ranking', JSON.stringify(ranking.slice(0, 3)));

  gameScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  showRanking();
}

startButton.addEventListener('click', () => {
  console.log('ゲーム開始ボタンがクリックされました。');
  startCountdown(startGame);
});

showRanking();
