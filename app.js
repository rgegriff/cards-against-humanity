// set up cards
var white_cards = new Array();
var black_cards = new Array();
for (i = 0; i < 460; i++) { white_cards[i] = i; }
for (i = 0; i < 90; i++) { black_cards[i] = i; }

var clients = new Array();

function drawWhiteCard() {
	if (white_cards.length == 0) {
		for (i = 0; i < 460; i++) { // reshuffle the deck. THIS IS DUMB, 
			//cards could still exist in hands
			white_cards[i] = i;
		}
	}
	i = Math.round(Math.random() * (white_cards.length - 1));
	return white_cards.splice(i, 1);
}

function drawBlackCard() {
	if (black_cards.lengh == 0) {
		for (i = 0; i < 90; i++) { // reshuffle the deck. THIS IS DUMB, 
			//cards could still exist in hands
			black_cards[i] = i;
		}
	}
	i = Math.round(Math.random() * (black_cards.length - 1));
	return black_cards.splice(i, 1);
}

/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')

var app = module.exports = express.createServer()
	, io = require('socket.io').listen(app);

	// Configuration

	app.configure(function(){
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(app.router);
		app.use(express.static(__dirname + '/public'));
	});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// Routes

//app.get('/', routes.index);
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/views/index.html');
});

app.listen(8060);
console.log("WARNING: check connection ip in public/javascript/cards.js");
console.log("for local work use localhost, if connecting remotely make sure ip is correct");
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

clients = new Object();
io.sockets.on('connection', function (socket) {
	clients[socket.id] = {'socket': socket};

	/* listners */
	socket.on('set name', function (data) {
		unique = true;
		user_names = new Array();
		for (i in clients) { // make sure user name is unique
			if (data == clients[i]['name']) {
				unique = false;
				break;
			}
			else if (clients[i]['name'] != null) { // do not add clients without a name
				user_names.push({'name': clients[i]['name'], 'id': i});
			}
		}
		if (unique) {
			clients[socket.id]['name'] = data;
			user_names.push({'name': data, 'id': socket.id});
			socket.emit('start');
			io.sockets.emit('user names', user_names);
		}
		else {
			socket.emit('non unique name', data);
		}
	});

	socket.on('draw white card', function () {
		socket.emit('send white card', drawWhiteCard());
	});

	socket.on('draw black card', function () {
		io.sockets.emit('send black card', drawBlackCard());
	});

	socket.on('submit white cards', function (data) {
		console.log(data);
	});
	
	socket.on('disconnect', function (data) {
		console.log('disconnect');
		delete clients[socket.id];
	});

});
