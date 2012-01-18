var clients = new Object();
var card_czar = null;
var cur_black_card = null;

// set up cards
var white_cards = new Array();
var black_cards = new Array();
for (i = 0; i < 460; i++) { white_cards[i] = i; }
for (i = 0; i < 90; i++) { black_cards[i] = i; }

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

function nextCzar() {
	console.log('PICKING NEW CZAR');
	ord = new Array();
	for (i in clients) {
		if (i == card_czar)
			pos = ord.length;
		if (clients[i]['name'] != null) // only add clients with name (clients that have joined)
			ord.push(i);
	}

	if (ord.length != 0) {
		console.log('len: ' + ord.length);
		console.log(ord);
		console.log('0: ' + ord[0]);
		console.log('czar pos: ' + pos);
		console.log('czar id: ' + ord[pos]);
		pos++;
		if (pos == ord.length) {
			pos = 0;
			console.log('wrap');
		}
		console.log('next czar: ' + ord[pos]);
		return ord[pos];
	}
	else {
		return null;
	}
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

var port = process.env.PORT || 8060;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

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
			if (!card_czar)
				card_czar = socket.id;
			socket.emit('start', cur_black_card);
			io.sockets.emit('set czar', card_czar);
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
		cur_black_card = drawBlackCard();
		io.sockets.emit('send black card', cur_black_card);
	});

	socket.on('submit white cards', function (data) {
		clients[card_czar]['socket'].emit('give czar cards', {'id': socket.id, 'name': clients[socket.id]['name'], 'cards':data});
	});

	socket.on('next czar', function () {
		card_czar = nextCzar();
		io.sockets.emit('set czar', card_czar);
	});
	
	socket.on('disconnect', function (data) {
		console.log('disconnect');
		if (socket.id == card_czar) { // if socket is czar get a new czar
			card_czar = nextCzar();
			if (card_czar == socket.id) { // and make sure it's not the disconnecting user
				card_czar = null;
			}
			io.sockets.emit('set czar', card_czar);
		}
		delete clients[socket.id];
    user_names = new Array();
    for (i in clients) { // make sure user name is unique
      if (clients[i]['name'] != null) { // do not add clients without a name
        user_names.push({'name': clients[i]['name'], 'id': i});
      }
    }
    io.sockets.emit('user names', user_names);
	});

});
