const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const introScreen = document.getElementById('intro-screen');
const introButton = document.getElementById('intro-button');
const introOverlay = document.getElementById('countdown');
const backButton = document.getElementById('back-button');
const gameScreen = document.getElementById('game-screen');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const rankingList = document.getElementById('ranking-list');
const countdownOverlay = document.getElementById('countdown');
const countdownNumber = document.getElementById('countdown-number');

let score = 0; // スコア初期値
let timeLeft = 30; // ゲーム残り時間
let gameInterval; // ゲームタイマー
let moleCount = 0; // モグラカウント初期値
let maxMoles = 100; // maxモグラ数
let baseSpeed = 1000; // モグラ出現の基本速度（ミリ秒）

function showRanking() {
  const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
  rankingList.innerHTML = ''; // ランキングのクリア
  ranking.slice(0, 3).forEach((entry, index) => { // slice: 上位3つのスコア表示
    const li = document.createElement('li'); // ランキングリストliの作成
    li.textContent = `${index + 1}位: ${entry}匹`;
    rankingList.appendChild(li); // ランキングリストに追加
  });
}

// 「遊び方」ボタンで説明画面に切り替え
introButton.addEventListener('click', () => {
  introScreen.style.display = 'flex';  // 直接display:flexに切り替え
  startScreen.style.display = 'none';
});

backButton.addEventListener('click', () => {
  introScreen.style.display = 'none';
  startScreen.style.display = 'flex';
});


// カウントダウンの開始
// カウントダウンの値は配列にあり、1秒ごとに表示を更新する
function startCountdown(callback) {
  const countdownValues = ['3', '2', '1', 'Start!']; // カウントダウン
  countdownOverlay.classList.remove('hidden'); // カウントダウンオーバーレイの表示
  countdownNumber.style.fontSize = '4em';
  countdownNumber.style.color = '#f00';
  countdownNumber.style.textShadow = '2px 2px 10px rgba(0,0,0,0.5)';
  
  let index = 0;
  countdownNumber.textContent = countdownValues[index]; // カウントダウンの初期値設定（3）
  const countdownInterval = setInterval(() => { // カウントダウンのインターバル
    index++;
    if (index < countdownValues.length) {
      countdownNumber.textContent = countdownValues[index]; // カウントダウンの更新
    } else {
      clearInterval(countdownInterval); // カウントダウン終了
      countdownOverlay.classList.add('hidden');
      callback(); // ゲーム開始
    }
  }, 1000); // 1秒ごとにカウントダウン更新
}

function startGame() {
  scoreDisplay.textContent = score; // スコアの初期化
  timerDisplay.textContent = timeLeft; // タイマーの初期化
  startScreen.classList.add('hidden'); // スタート画面を非表示
  gameScreen.classList.remove('hidden'); // ゲーム画面を表示
  gameInterval = setInterval(updateTimer, 1000); // タイマーの更新を1秒ごとに実行
  spawnMole();
}

function updateTimer() {
  timeLeft--; // タイマーを1秒減らす
  timerDisplay.textContent = timeLeft; // タイマーの表示を更新
  if (timeLeft <= 0 || moleCount >= maxMoles) {
    endGame();
  }
}

function getRandomPosition() {
  const gameArea = gameScreen.getBoundingClientRect();
  const rows = 4;
  const cols = 5;

  const paddingX = 300; // 左右の余白
  const paddingBottom = 100; // 👈 下方向の余白（px）

  const totalWidth = gameArea.width - paddingX * 2;
  const totalHeight = gameArea.height - paddingBottom; // 👈 下方向余白を引く

  const cellWidth = totalWidth / cols;
  const cellHeight = totalHeight / rows;

  const startY = gameArea.top + (cellHeight * 2); // 下半分スタート

  const positions = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < cols; col++) {
      const x = gameArea.left + paddingX + col * cellWidth + cellWidth / 2;
      const y = startY + row * cellHeight + cellHeight / 2;
      positions.push({ x, y });
    }
  }

  const randomIndex = Math.floor(Math.random() * positions.length);
  return positions[randomIndex];
}

function spawnMole() {
  if (moleCount >= maxMoles || timeLeft <= 0) return;

  const position = getRandomPosition(); // 位置を取得
  const mole = document.createElement('div');
  mole.classList.add('mole');

  mole.style.position = 'absolute';
  mole.style.left = `${position.x}px`;
  mole.style.top = `${position.y}px`;
  mole.style.transform = 'translate(-50%, -50%)'; // 中心に合わせる

  mole.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = score;
    mole.style.animation = 'none';

    const hitLabel = document.createElement('div');
    hitLabel.classList.add('hit-label');
    hitLabel.textContent = 'Hit!';
    mole.appendChild(hitLabel);

    setTimeout(() => {
      hitLabel.remove();
      mole.style.animation = 'slideDown 0.3s ease-out forwards';
      setTimeout(() => mole.remove(), 300);
    }, 100);

    baseSpeed = Math.max(200, baseSpeed - 20);
  });

  gameScreen.appendChild(mole); // 穴ではなく gameScreen に追加
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

function showFinishMessage(callback) {
  countdownOverlay.classList.remove('hidden');
  countdownNumber.textContent = 'Finish!';
  
  countdownNumber.style.fontSize = '4em';
  countdownNumber.style.color = '#f00';
  countdownNumber.style.textShadow = '2px 2px 10px rgba(0,0,0,0.5)';
  
  setTimeout(() => {
    countdownOverlay.classList.add('hidden');
    if (callback) callback(); // 終了後の処理（任意）
  }, 2000); // 2秒表示
}

function endGame() {
  clearInterval(gameInterval);
  document.querySelectorAll('.mole').forEach(m => m.remove());

  showFinishMessage(() => {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    ranking.push(score);
    ranking.sort((a, b) => b - a);
    localStorage.setItem('ranking', JSON.stringify(ranking.slice(0, 3)));

    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    showRanking();
  });
}

startButton.addEventListener('click', () => {
  console.log('ゲーム開始ボタンがクリックされました。');
  startButton.disabled = true; // ボタンを無効化
  startCountdown(() => {
    startGame();
    startButton.disabled = false; // ゲーム終了後にボタンを再度有効化
  });
});

document.head.appendChild(style);

showRanking();
