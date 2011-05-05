var arkanoid = (function(){    

    jQuery(document).ready(function(){

        /*
            Sergio Ruiz. Contact: serginator at gmail dot com
			
			I should try this without using jQuery. The Keyboard would be the same as
			on Space Invaders, and I just have to figure out how to do the same with
			the mouse, because the game at advanced waves is impossible with the arrows.
			Maybe I should increase arrows speed just like with the ball :S
			
            Credits: I readed code from a tutorial made by Bill Mill
        */            
        //LIBRARY - This could be on other .js and import it at the beginning
        var score = 0;
        var x = 25;
        var y = 250;
        var dx = 1.5;
        var dy = -4;
        var WIDTH;
        var HEIGHT;
        var bufferctx;
        var canvas;
        var ctx;
        var intervalId = 0;
        //Init the paddle
        var paddlex;
        var paddleh = 15;
        var paddlew = 100;
        //Init the keypress to false
        var rightDown = false;
        var leftDown = false;
        //Init min and max of the x edge
        var canvasMinX = 0;
        var canvasMaxX = 0;
        //Init the bricks
        var bricks;
        var NROWS = 5;
        var NCOLS = 5;
        var brickscount = NROWS * NCOLS;
        var BRICKWIDTH;
        var BRICKHEIGHT = 15;
        var PADDING = 1;
        var wave = 1; //To increase the difficult.
        var showWaveY = 220;
        var showWaveEnabled = false;
        var gameOver = true; //To check if you lose or not. T for the initscreen
        var newGame = true;
        var yDown = false;
        var nDown = false;
        var spacebarDown = false;
        
        //Paint a circle
        function circle(x, y, r){
            bufferctx.beginPath();
            bufferctx.arc(x, y, r, 0, Math.PI*2, true);
            bufferctx.closePath();
            bufferctx.fill();
        }
        
        //Paint a rectangle
        function rect(x, y, w, h){
            bufferctx.beginPath();
            bufferctx.rect(x, y, w, h);
            bufferctx.closePath();
            bufferctx.fill();
        }
        
        //Clear the canvas
        function clear(){
            bufferctx.clearRect(0, 0, WIDTH, HEIGHT);
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            //rect(0,0,WIDTH,HEIGHT);
			//because clearRect takes the bg of the canvas,if the back is black
			//it clears it to black.
        }
        
        //Check if left or right are pressed
        function onKeyDown(evt){
            if(evt.keyCode == 39){
                rightDown = true;
		        evt.preventDefault();
	        }
            else if(evt.keyCode == 37){
		        leftDown = true;
		        evt.preventDefault();
	        }
	        if(evt.keyCode == 32){
		        evt.preventDefault();
		        spacebarDown = true;
            }
            if(evt.keyCode == 89){
                yDown = true;
		        evt.preventDefault();
	        }
            else if(evt.keyCode == 78){
		        nDown = true;
		        evt.preventDefault();
	        }
        }        
        //Check if left or right are released
        function onKeyUp(evt){
            if(evt.keyCode == 39) rightDown = false;
            if(evt.keyCode == 37) leftDown = false;
            if(evt.keyCode == 32) spacebarDown = false;
            if(evt.keyCode == 89) yDown = false;
            if(evt.keyCode == 78) nDown = false;
        }        
        //Take it from the document using jQuery
        $(document).keydown(onKeyDown);
        $(document).keyup(onKeyUp);
        
        //Capture the mouse movement
        function onMouseMove(evt){
            if(evt.pageX > canvasMinX && evt.pageX < canvasMaxX){
                paddlex = Math.max(evt.pageX - canvasMinX - (paddlew/2), 0);
                paddlex = Math.min(WIDTH - paddlew, paddlex);
            }
        }
		
		//Capture the click event. The Y axis was buggy so I just use X
		function onMouseClick(evt){
			if(evt.pageX > canvasMinX && evt.pageX < canvasMaxX){
				if(newGame) spacebarDown = true;
				else yDown = true; //To avoid to set yDown to true at the beginning
			}
		}
		
        //Take it from the document using jQuery
        $(document).mousemove(onMouseMove);
		$(document).click(onMouseClick);
		
        //Let's init the bricks
        function initbricks(){
            bricks = new Array(NROWS);
            for(i = 0; i < NROWS; i++){
                bricks[i] = new Array(NCOLS);
                for(j = 0; j < NCOLS; j++){
                    bricks[i][j] = 1;
                }
            }
        }
        
        //Draw the bricks
        function drawbricks(){
            for(i = 0; i < NROWS; i++){
                bufferctx.fillStyle = rowcolors[i];
                for(j = 0; j < NCOLS; j++){
                    if(bricks[i][j] == 1){
                        rect((j * (BRICKWIDTH + PADDING)) + PADDING, 
                              (i * (BRICKHEIGHT + PADDING)) + PADDING,
                              BRICKWIDTH, BRICKHEIGHT);
                    }
                }
            }   
        }
        
        function setScore(){
			bufferctx.fillStyle = "#8b8989";
            rect(0,335,WIDTH,15);
            bufferctx.fillStyle = "#FF0000";
            bufferctx.fillText("Sergio Ruiz", 190, 345);
            bufferctx.fillStyle = "#000000";
            bufferctx.fillText("Score: " + score, 10, 345);
            //And some credits
            bufferctx.fillText("4-3-2011", 390, 345);
        }
        
        function showWave(){
            if(showWaveEnabled){
                bufferctx.fillText("Wave " + wave, 200, showWaveY);
                showWaveY += 1;
                switch(wave){
                    case 1:
                        bufferctx.fillText("Too easy", 200, showWaveY - 15);
                        break;
                    case 2:
                        bufferctx.fillText("Increasing velocity", 200, showWaveY - 15);
                        break;
                    case 3:
                        bufferctx.fillText("Are you feeling tired?",200,showWaveY-15);
                        break;
                    case 4:
                        bufferctx.fillText("It's getting harder",200,showWaveY - 15);
                        break;
                    case 5:
                        bufferctx.fillText("Wow, you are good", 200, showWaveY - 15);
                        break;
                    case 6:
                        bufferctx.fillText("That was a sweat drop?",200,showWaveY-15);
                        break;
                    case 7:
                        bufferctx.fillText("That was great!", 200, showWaveY - 15);
                        break;
                    case 8:
                        bufferctx.fillText("Can u follow the ball?",200,showWaveY-15);
                        break;
                    case 9:
                        bufferctx.fillText("You must to be faster!",200,showWaveY-15);
                        break;
                    case 10:
                        bufferctx.fillText("Now keep the rythm", 200, showWaveY - 15);
                        break;
                    default: 
                        bufferctx.fillText("Ou yeah!", 200, showWaveY - 15);
                        break;
                }
                if(showWaveY == 350){
                    showWaveY = 220;
                    showWaveEnabled = false;
                }
            }
        }
        
        //Draw every 0ms
        function init(){
            buffer = document.createElement("canvas");
            //Get the reference to the canvas
            bufferctx = buffer.getContext("2d");
            canvas = document.getElementById("canvas");
            ctx = canvas.getContext("2d");
            buffer.width = canvas.width;
            buffer.height = canvas.height;
            //Load WIDTH
            WIDTH = $("#canvas").width();
            //Load HEIGHT
            HEIGHT = $("#canvas").height() - 15;
            //Set paddlex
            paddlex = WIDTH / 2;
            //Init the width of the bricks
            BRICKWIDTH = (WIDTH/NCOLS) - 1;
            //Set the left limit of the canvas for the mouse
            canvasMinX = $("#canvas").offset().left;
            //Now set the right edge for the mouse
            canvasMaxX = canvasMinX + WIDTH;
            //Draw every 10ms to create movement illusion
            intervalId = setInterval(draw, 10);
	        initbricks();
	        setScore();
            return intervalId;
        }
        //ENDLIBRARY
        
        var d = 10; //diameter
        //The colors of the five row bricks
        var rowcolors = ["#e1d3d3","#bebebe","#778899","#696969","#2f4f4f",
                        "#66cdaa","#2e8b57","#32cd32","#228b22","#006400"];
        //The paddle color
        var paddlecolor = "#FFFFFF";
        //The ball color
        var ballcolor = "#FFFFFF";
        //Background color
        var backcolor = "#000000";
        
        function draw(){
            bufferctx.fillStyle = backcolor; 
            clear();
            if(!gameOver){
                bufferctx.fillStyle = ballcolor;
                //bufferctx.drawImage(ball, x, y, d, d);
                circle(x, y, d);
		
                //move the paddle if left or right is pressed
                if(rightDown && (paddlex + paddlew)< WIDTH) paddlex += 5;
                else if(leftDown && paddlex > 0) paddlex -=5;
                bufferctx.fillStyle = paddlecolor;
                rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);
                
                drawbricks();
                
                //
                
                //Check if we hit a brick
                rowheight = BRICKHEIGHT + PADDING;
                colwidth = BRICKWIDTH + PADDING;
                row = Math.floor(y / rowheight);
                col = Math.floor(x / colwidth);
                //If we hit, reverse the ball and mark the brick as broken
                if (y < NROWS * rowheight && row >= 0 && col >= 0 &&
                   bricks[row][col] == 1){
                    dy = -dy;
                    bricks[row][col] = 0;    
                    brickscount--;
                    score += 50 * wave;
                    setScore();
                }
                
                //Now let's make the ball bounce on the walls
                if(x + dx + d > WIDTH || x + dx - d < 0) dx = -dx;
                if(y + dy - d < 0) dy = -dy;
                else if (y + dy + d > HEIGHT - paddleh){
                    if (x > paddlex && x < paddlex + paddlew){
                        //Move the ball differently based on where it hits
                        dx = 8 * ((x-(paddlex+paddlew/2))/paddlew);
                        dy = -dy;
                    }
                    else if (y + dy + d > HEIGHT){
                        gameOver = true;
                    }
                }
                
                if(brickscount == 0){
                    wave++;
                    if(wave%2 == 0){
                        if (NROWS < 8) 
                        {
                            NROWS += 1;
                            BRICKHEIGHT -= 1;
                        }
                        if(wave%3 == 0) NCOLS += 1;
                        BRICKWIDTH = (WIDTH/NCOLS) - 1;
                    }
				    brickscount = NROWS * NCOLS;
                    initbricks(); //more bricks
                    showWaveEnabled = true;
                    if(wave < 10) dy = dy + 0.2*wave;
                    if (d > 2) d -= 1;
                }
                
                showWave();
                
                x += dx;
                y += dy;
            }
            else{
                if(newGame){
                    bufferctx.font = "italic 400 50px/2 Unknown Font, sans-serif";
                    bufferctx.fillStyle = "white";
                    bufferctx.fillText("Arkanoid test", 40, 125); 
                    bufferctx.font = "italic 400 20px/2 Unknown Font, sans-serif";
                    bufferctx.fillText("by Sergio Ruiz. 2011", 200, 250);
                    bufferctx.fillStyle = "red";
                    bufferctx.fillText("Move: Left Right / Mouse", 60, 170)
                    bufferctx.fillText("Press space or click", 260, 300);
                    if(spacebarDown){
                        gameOver = false;
                        newGame = false;
						//so I just run this once during the normal game
						bufferctx.font = "italic 400 12px/2 Unknown Font, sans-serif";
                    }
                }
                else{
                bufferctx.fillStyle = ballcolor;
                bufferctx.font = "italic 400 30px/2 Unknown Font, sans-serif";
                bufferctx.fillText("You lose!", 150, 150);
                bufferctx.font = "italic 400 20px/2 Unknown Font, sans-serif";
                bufferctx.fillText("Score: " + score, 150, 200);
                bufferctx.font = "italic 400 30px/2 Unknown Font, sans-serif";
                bufferctx.fillText("retry? (y or click, n)", 100, 250);
                if(yDown){
                    wave = 1;
                    NROWS = 5; NCOLS = 5;
                    brickscount = NROWS * NCOLS;
                    BRICKWIDTH = (WIDTH/NCOLS) - 1;
                    BRICKHEIGHT = 15;
                    paddlex = WIDTH / 2;
                    x = 25; y = 250; d = 10; dx = 1.5; dy = -4;
                    initbricks(); //more bricks
                    score = 0;
                    gameOver = false;
					yDown = false;
					//same as in newGame
					bufferctx.font = "italic 400 12px/2 Unknown Font, sans-serif";
                }
                else if(nDown){
                    bufferctx.fillStyle = backcolor; 
                    clear();
				    bufferctx.fillStyle = ballcolor;
                    bufferctx.font = "italic 400 30px/2 Unknown Font, sans-serif";
                    bufferctx.fillText("Good bye!", 100, 150);
                    bufferctx.font = "italic 400 20px/2 Unknown Font, sans-serif";
                    bufferctx.fillText("Thanks for playing", 100, 200);
                    clearInterval(intervalId);
                }
                }
            }
            //Copy the image of the buffer (invisible) to the 
            //canvas context (visible)
            ctx.drawImage(buffer, 0, 0);
        }
        
        init();
    });
})();
