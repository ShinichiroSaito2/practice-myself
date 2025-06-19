
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const rankingList = document.getElementById('ranking-list');
const countdownOverlay = document.getElementById('countdown');
const countdownNumber = document.getElementById('countdown-number');

let score = 0; // スコア初期値
let timeLeft = 15; // ゲーム残り時間
let gameInterval; // ゲームタイマー
let moleCount = 0; // モグラカウント初期値
let maxMoles = 100; // maxモグラ数
let baseSpeed = 1000; // モグラ出現の基本速度（ミリ秒）

function showRanking() {
  const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
  rankingList.innerHTML = ''; // ランキングのクリア
  ranking.slice(0, 3).forEach((entry, index) => { // slice: 上位3つのスコア表示
    const li = document.createElement('li'); // ランキングリストliの作成
    li.textContent = `${index + 1}位: ${entry}回`; 
    rankingList.appendChild(li); // ランキングリストに追加
  });
}

// カウントダウンの開始
// カウントダウンの値は配列にあり、1秒ごとに表示を更新する
function startCountdown(callback) { 
  const countdownValues = ['3', '2', '1', 'Start!']; // カウントダウン
  countdownOverlay.classList.remove('hidden'); // カウントダウンオーバーレイの表示
  countdownNumber.style.fontSize = '2em'; // フォントサイズの設定

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
  score = 0;
  timeLeft = 15; // タイマー初期値
  baseSpeed = 1000; // モグラ出現の基本速度の初期化
  moleCount = 0;
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
  startButton.disabled = true; // ボタンを無効化
  startCountdown(() => {
    startGame();
    startButton.disabled = false; // ゲーム終了後にボタンを再度有効化
  });
});

document.head.appendChild(style);

showRanking();
