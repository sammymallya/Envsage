var buttonColours = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var level = 0;
var hasGameStarted = false;

$(document).keypress(function() {
    if(hasGameStarted=== false){
        $("#level-title").text("Level "+level);
        nextSequence();
        hasGameStarted=true;
    }
})

//using jQuery to detect any button click;
$(".btn").click(function (){
    var userChosenColour = this.id;    
    userClickedPattern.push(userChosenColour);
    playSound(userChosenColour)
    animatePress(userChosenColour);

    //checking user inputted answer with the pattern:
    checkAnswer(userClickedPattern.length -1);
});


function nextSequence(){
    level+=1;
    $("#level-title").text("Level "+level);
    userClickedPattern=[];
    // to generate a new pattern of colours
    var rand = Math.floor(Math.random()*4) ;
    var randomChosenColour = buttonColours[rand];
    gamePattern.push(randomChosenColour);

    //flash animation effect
    $("#"+randomChosenColour).fadeIn(100).fadeOut(100).fadeIn(100);
    playSound(randomChosenColour);  

}

function playSound(name){
    var audio = new Audio("sounds/" + name + ".mp3");
    audio.play();    
}
function animatePress(currentColour){   
    $("#"+ currentColour).addClass("pressed");
    setTimeout(function(){
        $("#"+ currentColour).removeClass("pressed");
    },100);
}

function checkAnswer(currentLevel){
    if (gamePattern[currentLevel]=== userClickedPattern[currentLevel]){
        console.log("Success");
        
        //if user got most recent answer right, check lengths:
        if (userClickedPattern.length === gamePattern.length){
            setTimeout(function () {
                nextSequence();
            }, 1000);
        }
    } else{
        playSound("wrong");
        $("body").addClass("game-over");
        setTimeout(function() {
            $("body").removeClass("game-over");
        },200);

        $("#level-title").text("Game Over, Press Any Key to Restart");
        startOver();
    }
}

function startOver(){
    level = 0;
    gamePattern=[];
    hasGameStarted=false;
}

