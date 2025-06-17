// 1. Selecting elements
const totalScoresEl = [
    document.getElementById("total-score-0"),
    document.getElementById("total-score-1")
  ];
  const currentScoresEl = [
    document.getElementById("current-score-0"),
    document.getElementById("current-score-1")
  ];
  const playerEl = [
    document.querySelector(".left"),
    document.querySelector(".right")
  ];
  
  const diceImg = document.getElementById("diceimg");
  const rollBtn = document.getElementById("roll-dice");
  const holdBtn = document.getElementById("hold");
  const restartBtn = document.getElementById("restart");
  
  // 2. Game state
  let currentScore = 0;
  let activePlayer = 0; // 0 or 1
  let totalScores = [0, 0];
  let isPlaying = true;
  
  // 3. Function to switch player
  function switchPlayer() {
    currentScore = 0;
    currentScoresEl[activePlayer].textContent = 0;
  
    playerEl[activePlayer].classList.remove("active-player");
    activePlayer = activePlayer === 0 ? 1 : 0;
    playerEl[activePlayer].classList.add("active-player");
  }
  
  // 4. Roll Dice
  rollBtn.addEventListener("click", function () {
    if (!isPlaying) return;
  
    const dice = Math.floor(Math.random() * 6) + 1;
    diceImg.src = `dice-imgs/dice-${dice}.png`;
    diceImg.style.display = "block";
  
    if (dice !== 1) {
      currentScore += dice;
      currentScoresEl[activePlayer].textContent = currentScore;
    } else {
      switchPlayer();
    }
  });
  
  // 5. Hold
  holdBtn.addEventListener("click", function () {
    if (!isPlaying) return;
  
    totalScores[activePlayer] += currentScore;
    totalScoresEl[activePlayer].textContent = totalScores[activePlayer];
  
    if (totalScores[activePlayer] >= 100) {
      isPlaying = false;
      diceImg.style.display = "none";
      playerEl[activePlayer].classList.add("winner");
    } else {
      switchPlayer();
    }
  });
  
  // 6. Restart
  restartBtn.addEventListener("click", function () {
    currentScore = 0;
    activePlayer = 0;
    totalScores = [0, 0];
    isPlaying = true;
  
    totalScoresEl[0].textContent = 0;
    totalScoresEl[1].textContent = 0;
    currentScoresEl[0].textContent = 0;
    currentScoresEl[1].textContent = 0;
  
    diceImg.style.display = "block";
    diceImg.src = "dice-imgs/dice-1.png";
  
    playerEl[0].classList.add("active-player");
    playerEl[1].classList.remove("active-player");
    playerEl[0].classList.remove("winner");
    playerEl[1].classList.remove("winner");
  });
  