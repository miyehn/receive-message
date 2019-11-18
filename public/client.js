//super hacky fix for the caching problem :'(
if (!window.location.hash) {
  window.location = window.location + "#loaded";
  window.location.reload();
}

//urls
const deskUrl =
  "/assets/desk2.png";
const letterUrl =
  "https://cdn.glitch.com/8bc1104a-4df8-4489-912a-a92c0f2f207f%2FGroup%207.png?v=1574058271014";

//user's image variables
let imageToSendURL;
let imageToSendHeight;
let imageToSendWidth;
const maxImageWidth = 380;

//collect DOM elemnts up here
let backgroundCanvas = document.getElementById("background-canvas");
let letterCanvas = document.getElementById("letter-canvas");
let overlay = document.getElementById("overlay");
let exitButton = document.getElementById("exit");
let continueToLetterButton = document.getElementById("continue-to-letter");
let imageSelection = document.getElementById("image-selection");
let letter = document.getElementById("letter");
let continueToLineButton = document.getElementById("move-to-lines");
let finishLines = document.getElementById("finish-lines");
let dotNote = document.getElementById("dot-note");
let lineNote = document.getElementById("line-note");
let letterInfo = document.getElementById("letter-info");
let dotList = document.getElementById("dot-list");
let lineList = document.getElementById("line-list");


let messages = [
	{
		'animal': 'bird',
		'x': '150.34',
		'y': '269.3333',
		'index': '2'
	}, {
		'animal': 'bird',
		'data': '[[1,2], [1,3]]'
	}, {
		'animal': 'fly',
		'x': '250.34',
		'y': '169.3333',
		'index': '1'
	}, {
		'animal': 'rat',
		'x': '350.34',
		'y': '169.3333',
		'index': '3'
	}
];

let all_messages = [];
let bird_messages = [];
let fly_messages = [];
let rat_messages = [];
let meta;

let hovered_animal;

let paper_up = false;

function on_animal(animal, mouse_x, mouse_y) {
	let x = animal['display_x'];
	let y = animal['display_y'];
	let w = animal['w'];
	let h = animal['h'];
	if(mouse_x >= x && mouse_x < x + w &&
		 mouse_y >= y && mouse_y < y + h) return true;
	else return false;
}

function on_paper(mouse_x, mouse_y) {
	let x = 230;
	let y = 400;
	let w = 260;
	let h = 220;
	if(mouse_x >= x && mouse_x < x + w &&
		 mouse_y >= y && mouse_y < y + h) return true;
}

let sketch = function(p) {

	let background;
	let bird, fly, rat;
	let paper, stant_up_paper;

	p.preload = function() {
		background = p.loadImage("/assets/desk2.png");
		bird = p.loadImage("assets/bird1.png");
		fly = p.loadImage("assets/fly1.png");
		rat = p.loadImage("assets/mouse1.png");
		paper = p.loadImage("https://cdn.glitch.com/8bc1104a-4df8-4489-912a-a92c0f2f207f%2FGroup%207.png?v=1574058271014");
		stand_up_paper = p.loadImage("https://cdn.glitch.com/8bc1104a-4df8-4489-912a-a92c0f2f207f%2Fnotebook-paper.png?v=1574081612387");
	}

	p.setup = function() {
		var wid = window.innerWidth - 96;
		var height = wid * (5.0 / 7.0);
		if (height > window.innerHeight) {
			height = window.innerHeight - 96;
			var wid = wid * (5.0 / 7.0);
		}
		p.createCanvas(wid, height);
		p.background(255);
		p.frameRate(24);

		p.fill(255);
		p.textSize(18);
	};

	p.draw = function() {
		p.image(background, 0, 0, p.width, p.height);
		let has_message = false;
		if (!paper_up) p.image(paper, 230, 400, 260, 220);
		// draw the animals
		if(meta) {
			let x = meta['display_x'];
			let y = meta['display_y'];
			let w = meta['w'];
			let h = meta['h'];
			if(meta['animal']=='bird') p.image(bird, x, y, w, h);
			else if(meta['animal']=='fly') p.image(fly, x, y, w, h);
			else if(meta['animal']=='rat') p.image(rat, x, y, w, h);
		}
		for (let i=0; i<bird_messages.length; i++) {
			has_message = true;
			p.image(bird, 
				bird_messages[i]['display_x'], bird_messages[i]['display_y'], 
				bird_messages[i]['w'], bird_messages[i]['h'])
		}
		for (let i=0; i<fly_messages.length; i++) {
			has_message = true;
			p.push();
			let x = fly_messages[i]['display_x'];
			let y = fly_messages[i]['display_y'];
			let w = fly_messages[i]['w'];
			let h = fly_messages[i]['h'];
			p.translate(x + w/2, y + h/2);
			p.rotate(fly_messages[i]['rot']);
			p.image(fly, -w/2, -h/2, w, h);
			p.translate(-x - w/2, -y - h/2);
			p.pop();
		}
		for (let i=0; i<rat_messages.length; i++) {
			has_message = true;
			let x = rat_messages[i]['display_x'];
			let y = rat_messages[i]['display_y'];
			p.image(rat, x, y);
		}

		// UI
		if (!paper_up) {
			if (has_message) {
				p.text("You received messages!", p.width / 2, p.height - 60);
				if (meta) {
					p.text("You can start putting the pieces together.", p.width / 2, p.height - 30);
				} else {
					p.text("Still need to wait for an important piece of info..", p.width / 2, p.height - 30);
				}
			}
			if (hovered_animal) {
				let txt;
				if (hovered_animal['data']) {
					txt = "Instructions for connecting the dots";
				} else {
					txt = '(' + Number(hovered_animal['x']).toFixed(1) + ', ' + Number(hovered_animal['y']).toFixed(1) + ')';
				}
				p.text(txt, p.mouseX, p.mouseY - 22);
			}
			if (meta && on_paper(p.mouseX, p.mouseY)) {
				p.text("Start putting message together", p.mouseX, p.mouseY - 22);
			}
		} else {
			p.image(stand_up_paper, 80, 50, 350, 500);
		}
	}

	p.keyTyped = function() { // emulate msg received
		if(p.key == 'a' && messages.length > 0) {
			let msg = messages.pop();
			if( msg['animal'] == 'bird' ){ 
				msg['display_x'] = 650 + Math.random() * 180; 
				msg['display_y'] = 88;
				msg['w'] = 50;
				msg['h'] = 60;
				if( !msg['data'] ){ bird_messages.push(msg); }
				all_messages.push(msg);
			} else if( msg['animal'] == 'fly' ){
				msg['display_x'] = Math.random() * p.width; 
				msg['display_y'] = Math.random() * p.height;
				msg['w'] = 39;
				msg['h'] = 43;
				msg['rot'] = Math.random() * p.TWO_PI;
				if( !msg['data'] ){ fly_messages.push(msg); }
				all_messages.push(msg);
			} else if( msg['animal'] == 'rat' ){
				msg['display_x'] = Math.random() * p.width / 2 + p.width / 2; 
				msg['display_y'] = Math.random() * 50 + 200;
				msg['w'] = 212;
				msg['h'] = 122;
				if( !msg['data'] ){ rat_messages.push(msg); }
				all_messages.push(msg);
			};
			if( msg['data'] )meta = msg;
		}
	}

	p.mouseClicked = function() {
		if( !paper_up && meta && on_paper(p.mouseX, p.mouseY) ){
			paper_up = true;
		}
	}

	p.mouseMoved = function() {
		hovered_animal = undefined;
		for (let i=0; i<all_messages.length; i++) {
			if(on_animal(all_messages[i], p.mouseX, p.mouseY)) hovered_animal = all_messages[i];
		}
	}
}

let myp5 = new p5(sketch, 'center-container');

