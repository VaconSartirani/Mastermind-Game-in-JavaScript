/*
MASTERMIND GAME
Abschlußprojekt by Yaiza Camps and Daniele Sartirani
teachers: Elisabeth Hronek and Klaus Domass
CIMDATA JavaScript Kurs, March 2017
JAVASCRIPT FILE
*/
//			                     _                      _           _
//			                    | |                    (_)         | |
//			 _ __ ___   __ _ ___| |_ ___ _ __ _ __ ___  _ _ __   __| |
//			| '_ ` _ \ / _` / __| __/ _ \ '__| '_ ` _ \| | '_ \ / _` |
//			| | | | | | (_| \__ \ ||  __/ |  | | | | | | | | | | (_| |
//			|_| |_| |_|\__,_|___/\__\___|_|  |_| |_| |_|_|_| |_|\__,_|



//############# GENERAL SET-UP #################

////////GLOBAL VARIABLES

	var rows = [];														//total rows
	var max_attempts;													//number of attempts available
	var secret_string = [];												//the secret code
	var current_string = []; 												//the code given by the player
	var bubblindex = 0; 													//the global index of all the bubbles
	var bubbles = [];										 				//where those bubbles are
	var code_length;    													//length of the secret code
	var num_colors = 6; 													//number of colors to pick from
	var pick;   															//the picked color
	var right_pos = [];													//the right values in the right position
	var right_col = [];													//the right values in the wrong position
	var attempt_index = 0;												//counter of the current attempt
	var unique = false;													//only unique colors?
	var memory = false;													//memory mode?
	var timerun = false;													//timerun mode?
	var timeinterval;													//timerun interval
	var pool = [];														//pool from where to pick random UNIQUE numbers
	var xbubble = 0;														//the current bubble index
	var startzeit;														//start of game
	var high_score;														//highscore
	var best_time;														//best time
	

////////HELPING FUNCTIONS

function el(id) {   														//short for calling id
	return document.getElementById(id);
}

function cl(classname, index) {  											//short for calling class
	return document.getElementsByClassName(classname)[index];
}

function create(id) {													//short for create element
	return document.createElement(id);
}

function random(min,max) {												//create random number in the given range
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min +1)) + min;
}

function random_u() {													//create random UNIQUE number in the range in the pool
	var uindex = Math.floor(pool.length * Math.random());
	var drawn = pool.splice(uindex, 1);
	return drawn[0];
}

////////OBJECT

	var object = {   														//the object, this is the basis "coin" of the game. All code values will be different objects
		secret 	: true, 													//is this part of the secret code or the one given by the player?
		index  	: 0,    													//the unique position in the code
		make   	: function(min, max) {  									//create the new object
			if(this.secret) {  											//create the secret code value, that means:
				this.color = random(min, max);							//assign a random value and
				this.matched = false; 									//set the object as not matched yet
			}															//end if
		},																//end make
		
		make_u  : function() {											//same thing with the random unique
			if(this.secret) {
				this.color = random_u();
				this.matched = false;
			}															//end if
		}																//end make_u
	};																	//end object


//############# PREPARATORY FUNCTIONS #################

////////DINAMICALLY GENERATE GAME BOARD

function gen_board() {

	//SET NUMBER OF ROWS

	max_attempts = 7;													//standard n. of attempts

	if(el('custom').checked) {											//check if custom difficulty is on
		var attnumber = el('inputattempts').value;						//read the number of max attempts

		if(attnumber === 'What is love?') {								//easter egg :)
			alert("Baby don't hurt me, don't hurt me, no more.");
		} else {
			max_attempts = attnumber;									//set maximum of attempts/rows
		}																//end if
	}																	//end if

	//ENSURE ROW NUMBER IS VALID
	
	if (isNaN(max_attempts) || max_attempts == '' || max_attempts > 12 || max_attempts <= 0) { //check if the attempt number is a valid number
		alert('Please insert a valid number of attempts');
	} else {																//if everything is alright, let's go.
	
		//SET UP GAME

		total_reset();
		document.addEventListener('keydown', down);						//set up key listener
		
		//READ MODES

		if(el('memory').checked) {										//(re)set memory mode
			memory = true;
		} else {
			memory = false;
		}																//end if
		
		if(el('timerun').checked) {										//(re)set timerun mode
			timerun = true;
		} else {
			timerun = false;
		}																//end if

		//SET CODE LENGTH

		if(el('length0').checked) {										//read the length of the code
			code_length = 3;												//set it
		} else {
			code_length = 4;
		}																//end if

		for(i = 0; i < code_length; i++) {								//display only as many code bubbles as the code is long
			el('q' + i).style.display = 'block';
		}

		//SET UNIQUE

		if(el('same').checked) {											//check if "allow multiple use of same color" is checked
			unique = false;												//assign variable accordingly
		} else {
			unique = true;
		}																//end if 

		//SET COLORS NUMBER

		if(el('col0').checked) {											//check wich radio input is checked
			num_colors = 4;												//assign number of colors accordingly
		} else if (el('col1').checked) {
			num_colors = 5;
		} else {
			num_colors = 6;
		}																//end if

		for(i = 0; i < num_colors; i++) {								//display only as many colors as requested
			cl('color', i).style.display = 'block';
		}																//end for

		console.log('New game. Attempts: ' + max_attempts + ', Colors: ' + num_colors + ', code length: '
		+ code_length + ', unique colors: ' + unique);

		//SET UP CONTAINERS

		for(i = 0; i < max_attempts; i++) {								//generate 1 row per attempt
			var row = create('div');										//generate 1 row div
			var attempt = create('div');									//generate 1 attempt div
			var feedback = create('div');									//generate 1 feedback div
			var rownum = create('p');										//generate 1 paragraph

			//SET UP BUBBLES

			for(j = 0; j < code_length; j++) {  							//generate as many bubbles per row as the code is long
				var bubble = new Image();									//generate new image object
				bubble.src = 'img/gray.gif' 								//assign gray pic source
				bubble.classList.add ('bubble' + i);						//assign row class
				bubble.classList.add('bubble');							//assign general class
				bubble.id = 'bubble' + i + '_' + j;							//assign unique global id with row and number
				bubble.index = bubblindex; 								//assign unique global index
				bubble.row = i; 											//assign row value
				bubble.number = j; 										//assign column value
				bubble.color = undefined; 								//assign no color for now
				bubbles.push(bubble); 									//add it to the array
				attempt.appendChild(bubble);							//append it to the attempt div
				bubblindex++; 											//add 1 to global bubble index (counter)
			}   															//end for

			//SET UP FEEDS

			for(k = 0; k < code_length; k++) {							//generate as many feeds as the code is long
				var feed = new Image();									//generate the image
				feed.src = 'img/feedgray.gif';							//assign the neutral src
				feed.classList.add('feed');								//assign class
				feed.classList.add('feed' + i);							//assign row class
				feed.id = 'feed' + i + '_' + k;								//assign unique id row and number
				feed.row = i;											//assign row value
				feed.number = k;											//assign linear value
				feed.color = undefined; 									//assign no color
				feedback.appendChild(feed); 								//append to feedback div
			}															//end for

			//SET UP ROW

			row.id = 'row' + i; 											//assign index ID to row Important!
			row.className = 'row';										//assign class to row
			attempt.id = 'attempt' + i; 									//assign index ID to attempt
			attempt.className = 'attempt'; 								//assign class to attempt
			feedback.id = 'feedback' + i;									//assign index ID to feedback
			feedback.className = 'feedback'; 								//assign class to feedback
			rownum.innerHTML = (i + 1);									//write number into paragraph

			//WRAP UP ROW

			row.appendChild(attempt);									//append the attempt to row
			row.appendChild(feedback);									//append the feedback to row
			row.appendChild(rownum);									//append paragraph to row
			rows.push(row);												//push the row into the rows array
		}																//end for

		//INJECT ROWS

		for (i = 0; i < max_attempts;  i++) {
			el('game').appendChild(rows[(max_attempts - 1) - i]);			//append the row to the game (starting from the last one!)
		}

		console.log(bubbles);

		//ADD THE EVENTLISTENERS

		for (i = 0 ; i < num_colors; i++) { 								//for every "color picker"
			cl('color', i).addEventListener('click', pick_color); 		//have it pick the color
		}

		for (i = 0 ; i < code_length; i++) {								//for every "bubble" of current row
			cl('bubble' + attempt_index, i).addEventListener('click', assign_color);	//have it be assigned the picked color
			cl('bubble' + attempt_index, i).addEventListener('drop', drop);
			cl('bubble' + attempt_index, i).addEventListener('dragover', allowDrop);
		}

		el('check').addEventListener('click', checkit);					//check button
		el('giveup').addEventListener('click', endgame);					//giveup button
		el('row0').style.backgroundColor = 'white'						//highlight the first row
		
		//SHOW THE BOARD
		
		el('wrapper').style.display = 'block';							//show board
		el('howto').style.display = 'block';								//hide how to

		//RUN THE SECRET CODE

		gen_secret_string();											//generate the secret code
		
		//START TIMERS
		
		if(timerun) {													//if timerun
			timeinterval =  setInterval(time_run, 10000);					//start counting
		}
		
		startzeit = new Date();                                                  				//set up starting time
	}																	//end if
}																		//end function

////////GENERATE THE SECRET CODE

function gen_secret_string() {

	//EMPTY PREVIOUS CODE
	
	secret_string = [];													//empty the secret string array
	pool = [];															//empty pool array
	
	//C
	
	for(i = 0; i < num_colors; i++) {									//create a pool array from where to take values to generate unique random numbers
		pool.push(i);
	}																	//end for

	for(i = 0; i < code_length; i++) {									//creates as many secret values as the code length
		var secret_value = Object.create(object);							//create it

		if(unique === false) {											//if "allow multiple use of same color" is checked
			secret_value.make(0, (num_colors - 1));						//make it random
		} else {															//else
			secret_value.make_u();										//make it random & unique
		}																//end if
		secret_value.secret = true; 										//make it secret
		secret_value.index = i;											//set the index
		console.log(secret_value);										//log it
		secret_string.push(secret_value);								//push the object into the "secret" array
	}																	//end for
}																		//end function



//############# MAIN GAME #################

////////PICKING A COLOR

function pick_color() {

	el('select').play();                                            		                            //play select sound when color is picked 
	pick = this.id;														//read the color id
	el('picker').style.backgroundColor = pick;
	
	switch(pick) {														//convert each color in its index value 0 - 5
		case 'yellow' :
			pick = 0;
			break;
		case 'green' :
			pick = 1;
			break;
		case 'blue' :
			pick = 2;
			break;
		case 'purple' :
			pick = 3;
			break;
		case 'red' :
			pick = 4;
			break;
		case 'cyan' :
			pick = 5;
			break;
	}																	//end switch

	console.log('picked: ' + pick);

}																		//end function

////////ASSIGNING A COLOR

function assign_color() {
	
	el('select').play();												//play select sound when color is picked 

	if(pick === undefined) {												//if a color wasn't picked yet, keep it undefined
		this.src = 'img/gray.gif';
		this.color = undefined;
	} else {																//otherwise
		this.src = 'img/' + pick + '.gif';									//assign the picked color to the object's src
		this.color = pick;												//assign the picked color to the object's "color" value
	}																	//end if

	xbubble = this.number												//assign this as xbubble
	console.log('bubble ' + this.number + ' has color ' + this.color);
}

////////GENERATING THE PLAYER'S CODE

function gen_current_string() {

	current_string = [];													//empty the player's array

	for(i = 0; i < code_length; i++) {										//create a value for each pick
		var current_value = Object.create(object);						//create the object
		current_value.color = cl('bubble' + attempt_index, i).color;		// read the current index's pick color value and put it in the object
		current_value.matched = false;									//make it not matched
		current_value.secret = false; 									//make it the player's
		current_value.index = i;											//set the index
		console.log(current_value);		 								//log it
		current_string.push(current_value);								//push the object into the "player's" array
	}																	//end for
}																		//end function

////////CHECKING THE CODE

function checkit(){

	gen_current_string();												//generate the player's code
	var complete = true;													//create a variable to see if all the bubbles are complete

	for(i = 0; i < code_length; i++) {										//for every bubble
		if(current_string[i].color === undefined) {						//check if has a color
			complete = false;											//if not, than the row is not complete
		}																//end if
	}																	//end for

	if(complete) {														//if the row is complete
		match();														//go match the codes
	} else {																//otherwise
		alert('please complete all fields!'); 							//prompt to complete the fields
	}																	//end if
}																		//end function

////////MATCHING THE CODES

function match(){

	//SEARCH FIRST FOR VALUES THAT SHARE THE SAME INDEX AND COLOR

	for(i = 0; i < current_string.length; i++) {
		console.log("matching bubble " + i + ", color " + current_string[i].color + " with secret " + i + ", color " + secret_string[i].color);
		
		if(current_string[i].color === secret_string[i].color) {			//search for positional match first (important!)
			secret_string[i].matched = true;								//set the secret as matched
			current_string[i].matched = true;							//set the current as matched
			right_pos.push(true);										//add a true element in the "right position" array
			console.log('match, right position');
		}																//end if
	}																	//end for

	//SET UP A LOOP THAT MATCHES EACH ELEMENT OF ONE ARRAY TO THE OTHER

	for(i = 0; i < current_string.length; i++) {						//for each of the current string...
		for(j=0; j < secret_string.length; j++) {						//...and for each of the secret string:

			//AVOID MATCHING ELEMENT TWICE

			if(secret_string[j].matched === false && current_string[i].matched === false) {
				//check if neither of them was matched already
				console.log("matching bubble " + i + " color " + current_string[i].color +
				" with secret " + j + " color " + secret_string[j].color);	//log which one are being currently compared

				//RECORD EACH MATCH AND MARK THE MATCHED VALUES

				if(current_string[i].color === secret_string[j].color) {	//if they match
					secret_string[j].matched = true;						//set the secret as matched
					current_string[i].matched = true;					//set the current as matched
					right_col.push(true);								//add them in the "right color" array
					console.log('match, right color');
				}														//end if
			}															//end if
		}																//end for
	}																	//end for
	
	console.log('right position: ' + right_pos.length + ', right color: ' + right_col.length)	//log the number of correct positions and correct colors

	//SET UP WINNING CONDITION

	if(right_pos.length === code_length) {									//if all the values are in the right position...
		el('win').play();                                                                				//play winning sound
		console.log('player wins');
				
		//BEST TIME
		
		var stopzeit = new Date();  											//measure the end time
		var diff = Math.floor((stopzeit - startzeit)/1000);					//calculate difference
		
		if(best_time === undefined || diff < best_time) {						//check if best time
			best_time = diff;												//set new best time
			var thisbesttime = true;
		}																	//end if
		
		//HIGH SCORE
		
		if(high_score === undefined || attempt_index < high_score) {
			high_score = (attempt_index + 1);	
			var thisbestscore = true;
		}
		
		if(thisbestscore === true && thisbesttime === true) {
			el('highscore').innerHTML = "NEW HIGH SCORE!";
		}
		 
		 el('info').innerHTML = "Score: " + (attempt_index + 1) + " attempts<br>Best score: " + high_score + " attempts<br>Time: " + diff + " seconds<br>Best time: "  + best_time + " seconds<br>";	//report score
		endgame();														//game over!
		alert('you win');												//congratulations!

	} else {																//otherwise
		feedback();														//go ahead
	}																	//end if
}																		//end function

////////GIVING FEEDBACK

function feedback() {

	for(i = 0; i < right_pos.length; i++) {								//for each right color in the right position
		cl('feed' + attempt_index, i).src = 'img/feedblack.gif';			//put a black src in one of the feeds
	}																	//end for
	
	for(j = 0; j < right_col.length; j++) {								//for each right color NOT in the right position
		cl('feed' + attempt_index, j + i).src = 'img/feedwhite.gif';		//put a white src in one of the feeds, but don't overwite i.
	}

	for (i = 0 ; i < code_length; i++) {									//for every class "bubble" of the current row
		cl('bubble' + attempt_index, i).removeEventListener('click', assign_color);	
		//remove the event listener
		cl('bubble' + attempt_index, i).removeEventListener('drop', drop);
		cl('bubble' + attempt_index, i).removeEventListener('dragover', allowDrop);
	}																	//end for
	
	//MEMORY MODE
		
	if(memory) {															//if memory game
		var hide = random(0, code_length);								//random: how many colors to hide
		
		for(i = 0; i < hide; i++) {
			var hidethis = random(0, (code_length -1));					//choose a random bubble
			cl('bubble' + (attempt_index ), hidethis).src = 'img/question.gif';//hide it
		}																//end if															
	}																	//end for	
	
	//SET UP LOSING CONDITION

	if(attempt_index === max_attempts - 1) {								//if all the attempts are gone...
		el('lose').play();												//play sound
		console.log('player loses');
		endgame();														//game over.
		alert('you lose!');												//I'm sorry
	} else {																//otherwise
		
		//SET UP NEW ATTEMPT
		
		attempt_index++;												//add 1 to attempt index
		xbubble = 0;														//reset current bubble counter
		console.log('next attempt: ' + (attempt_index + 1));
		el('row' + attempt_index).style.backgroundColor = 'white'			//highlight next row
		el('row' + (attempt_index - 1)).style.backgroundColor = '#e1e1e1'	//remove highlight from previous row
		
		for (i = 0 ; i < code_length; i++) {   							//set up the new row
			cl('bubble' + attempt_index, i).addEventListener('click', assign_color);
			//by adding the new eventlisteners
			cl('bubble' + attempt_index, i).addEventListener('drop', drop);
			cl('bubble' + attempt_index, i).addEventListener('dragover', allowDrop);
			secret_string[i].matched = false;							//set all the secret colors back to unmatched.
		}																//end for
		
		right_pos = [];													//empty all arrays
		right_col = [];
		current_string = [];	
	}																	//end if
}																		//end function

////////ENDGAME

function endgame(){
	
	//STOP INTERVAL

	clearInterval(timeinterval);										//clear interval

	//REVEAL CODE
	 
	for(i = 0; i < code_length; i++) {
		cl('question', i).src = 'img/' + secret_string[i].color + '.gif'; 	//reveal the code
	}																	//end for
	
	//SET ENDGAME BOARD
	
	el('check').innerHTML = 'Play Again';								//switch to play again button
	el('check').removeEventListener('click', checkit);
	el('check').addEventListener('click', gen_board);
	document.removeEventListener('keydown', down);						//remove key listener
	el('settings').style.display = 'block';								//show settings
	el('howto').style.display = 'none';									//hide how to
}																		//end function

////////RESET

function total_reset() {
	
	//RESET VARIABLES

	secret_string = [];													//empty all arrays
	pool = [];
	right_pos = [];
	right_col = [];
	rows = [];
	bubbles = [];
	bubblindex = 0;														//reset all global variables
	attempt_index = 0;
	maxattempts = 7;
	xbubble = 0;
	pick = undefined;
	
	//RESET VISUAL ELEMENTS
	
	var clean = el('game');												//remove the previous board
	el('info').innerHTML = '';
	el('highscore').innerHTML = '';

	while(clean.firstChild) {											//total reset of the game DIV from previous matches
		clean.removeChild(clean.firstChild);
	}																	//end while

	el('settings').style.display = 'none';								//hide settings
	el('picker').style.backgroundColor = 'gray';							//reset the picker to gray
	var questz = document.getElementsByClassName('question');				//reset all the secret code bubble to invisible
	
	for (i = 0; i < questz.length; i++) {
		questz[i].style.display = 'none';
	}																	//end for

	var colz = document.getElementsByClassName('color');					//reset all the colors to invisible

	for (i = 0; i < colz.length; i++) {
		colz[i].style.display = 'none';
	}																	//end for
 
	for(i = 0; i < code_length; i++) {
		cl('question', i).src = 'img/question.gif';						//reset the code bubbles to questions
	}

	el('check').removeEventListener('click', gen_board);
	el('check').innerHTML = 'Check';										//switch to check button
}																		//end function

////////DRAG AND DROP

function allowDrop(ev) {													//let the elements by dropped over
	ev.preventDefault();
}
	
	//DRAG
	
function drag(ev) {
	
	el('drag').play();													//play a sound
	pick = ev.target.id;													//read the color id
	switch(pick) {														//convert each color in its index value 0 - 5
		case 'yellow' :
			pick = 0;
			break;
		case 'green' :
			pick = 1;
			break;
		case 'blue' :
			pick = 2;
			break;
		case 'purple' :
			pick = 3;
			break;
		case 'red' :
			pick = 4;
			break;
		case 'cyan' :
			pick = 5;
			break;
	}
	ev.dataTransfer.setData('it', pick);									//set pick value to be transfered
}
	
	//DROP
	
function drop(ev) {
	
	ev.preventDefault();
	el('select').play();												//play sound
	var data = ev.dataTransfer.getData('it');								//transfer pick color to destination
	var num = Number(data);												//convert into numeric
	ev.target.src = 'img/' + num + '.gif';									//assign the picked color to the object's src
	ev.target.color = num;												//assign the picked color to the object's "color" value

	console.log('bubble ' + this.number + ' has color ' + this.color);
}

////////KEYBOARD EVENTS
	
function down(ev){
	
	function key_assign(key) {											//assign the color to the bubble throught keyboard
		
		if(xbubble >= code_length) {										//start from the beginning when reaching the end of the string
			xbubble = 0;
		}
		
		var thisbubble =  el('bubble' + attempt_index + '_' + xbubble);		//find the current bubble
		
		thisbubble.src =  'img/' + key + '.gif';							//assign color to the bubble
		thisbubble.color = key;
		xbubble++;														//add 1 to the counter
		console.log('bubble ' + thisbubble.number + ' has color ' + thisbubble.color);
	}
	
	var key = ev.keyCode;													//read the key
		
	switch(key){														//enter = check
		case 13:
			checkit();
			break;
		case 27:															//esc = give up
			endgame();
			break;
	} 
	
	var k;																//set a variable from 1 to 6
	
	if(key > 48 && key < 55) {												//make it match the keyboard and the numlock keys
		k = (key - 49);
	} else if(key > 96 && key < 103) {
		k = (key - 97);
	}
	
	if(k < num_colors) {													//make sure the color is within range
		key_assign(k);													//assign the color
	}																	//end if	
}																		//end function


	//TIMERUN
	
function time_run() {

	if(attempt_index === (max_attempts-1)) {								//if all the attempts are gone...
            clearInterval(timeinterval);                                    					//stop timer
			el('lose').play();                                                                                   //play sound
			console.log('player loses');
			endgame();													//game over.
			alert('Time out!');											//I'm sorry
	} else {
		
        var game = el('game');
        game.removeChild(game.childNodes[0]);                               				//remove a row
        max_attempts--;                                                     							//remove an attempt
        console.log('timerun' );
    }
}

////////RUN FUNCTIONS AND LISTENERS

el('go').addEventListener('click', gen_board);							//add the generate board event listener

/*

Proudly coded by
				___  ____ _  _ _ ____ _    ____    _  _    ____ ____ ____ ___ _ ____ ____ _  _ _  
				|  \ |__| |\ | | |___ |    |___    |  |    [__  |__| |__/  |  | |__/ |__| |\ | |
				|__/ |  | | \| | |___ |___ |___     \/  .  ___] |  | |  \  |  | |  \ |  | | \| | 
												 
							 _   _ ____ _ ___  ____    ____ ____ _  _ ___  ____ 
							  \_/  |__| |   /  |__|    |    |__| |\/| |__] [__  
							   |   |  | |  /__ |  |    |___ |  | |  | |    ___] 
												|  |  |  |					   
												|  |__|  |
												| /\   \ |
												|/  \   \|
												/    \   \
											   /      \   \
											  /   /\   \   \
				_____________________________/   /  \   \   \_____________________________
				____________________________/   /    \   \   \____________________________
				___________________________/   /    / \   \   \___________________________
										  /   /    2017\   \   \
										 /   /    /---------'   \
										/   /    /_______________\
										\  /                     /
										 \/_____________________/
												|  |  |  |
												|  |  |  |
												|  |  |  |
												|  |  |  |
*/
