//REFERENCE VARIABLES
const diceImg = document.getElementById("diceimg");
const rollBtn = document.getElementById("roll-dice");
const holdBtn = document.getElementById("hold");
const restartBtn = document.getElementById("restart");
console.log(diceImg,'dic')
const playerEl=[
    document.querySelector(".left") ,
    document.querySelector(".right")
];
const currentScoreEl = [
    document.getElementById("current-score-0") , 
    document.getElementById("current-score-1")
];
const totalScoresEl = [
    document.getElementById("total-score-0") , 
    document.getElementById("total-score-1")
];

//GAME VARIABLES
var currentscore=0;
var totalScores= [0,0];
var isPlaying=true;
var activePlayer=0;

function switchPlayer(){
    currentscore=0;
    currentScoreEl[activePlayer].textContent=0;

    //removing active from the current player's class, and adding it to the other player
    playerEl[activePlayer].hclassList.remove("active-player");
    if (activePlayer===0){
        activePlayer=1;
    }else{
        activePlayer=0;
    }
    playerEl[activePlayer].classList.add("active-player");
}
rollBtn.addEventListener("click", function (){
    if(isPlaying){
        var rand = (Math.floor(Math.random()*6))+1;
        diceImg.src = `dice-imgs/dice-${rand}.png`;
        diceImg.style.display = "block";

        if (rand!==1){
            currentscore+=rand;
            currentScoreEl[activePlayer].textContent=currentscore;
        }else{
            currentscore=0;
            switchPlayer();
        }
    }
});

holdBtn.addEventListener("click", function() {
    if(isPlaying){
        totalScores[activePlayer]+=currentscore;
        totalScoresEl[activePlayer].textContent = totalScores[activePlayer];
        if (totalScores[activePlayer] >=10){
            isPlaying=false;
            playerEl[activePlayer].classList.add("winner");
            diceImg.style.display="none";
        }else{
            switchPlayer();
        }
    }
});
restartBtn.addEventListener("click", function() {
    currentscore=0;
    activePlayer=0;
    isPlaying=true;
    totalScores = [0,0];
    totalScoresEl[0].textContent = 0;
    totalScoresEl[1].textContent = 0;
    currentScoreEl[0].textContent = 0;
    currentScoreEl[1].textContent = 0;
  
    diceImg.style.display = "block";
    diceImg.src = "dice-imgs/dice-1.png";
  
    playerEl[0].classList.add("active-player");
    playerEl[1].classList.remove("active-player");
    playerEl[0].classList.remove("winner");
    playerEl[1].classList.remove("winner");
})