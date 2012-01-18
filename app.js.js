(function() {
  var app, black_cards, card_czar, clients, cur_black_card, drawBlackCard, drawWhiteCard, express, getUsers, io, nextCzar, port, routes, shuffleBlackDeck, shuffleWhiteDeck, white_cards, _i, _j, _results, _results2;

  clients = new Object();

  card_czar = null;

  cur_black_card = null;

  white_cards = (function() {
    _results = [];
    for (_i = 0; _i <= 459; _i++){ _results.push(_i); }
    return _results;
  }).apply(this);

  black_cards = (function() {
    _results2 = [];
    for (_j = 0; _j <= 89; _j++){ _results2.push(_j); }
    return _results2;
  }).apply(this);

  shuffleWhiteDeck = function() {
    var _k, _results3;
    return white_cards = (function() {
      _results3 = [];
      for (_k = 0; _k <= 459; _k++){ _results3.push(_k); }
      return _results3;
    }).apply(this);
  };

  shuffleBlackDeck = function() {
    var _k, _results3;
    return black_cards = (function() {
      _results3 = [];
      for (_k = 0; _k <= 89; _k++){ _results3.push(_k); }
      return _results3;
    }).apply(this);
  };

  drawWhiteCard = function() {
    var i;
    if (white_cards.length === 0) shuffleWhiteDeck();
    i = Math.round(Math.random() * (white_cards.length - 1));
    return white_cards.splice(i, 1);
  };

  drawBlackCard = function() {
    var i;
    if (black_cards.length === 0) shuffleBlackDeck();
    i = Math.round(Math.random() * (black_cards.length - 1));
    return black_cards.splice(i, 1);
  };

  nextCzar = function() {
    var i, ord, pos;
    ord = new Array();
    for (i in clients) {
      if (i === card_czar) pos = ord.length;
      if (clients[i]['name'] !== null) ord.push(i);
    }
    if (ord.length !== 0) {
      pos++;
      if (pos === ord.length) pos = 0;
      return ord[pos];
    } else {
      return null;
    }
  };

  getUsers = function() {
    var i, user_names;
    user_names = new Array();
    console.log(clients);
    for (i in clients) {
      if (clients[i]['name'] !== null) {
        user_names.push({
          'name': clients[i]['name'],
          'id': i
        });
      }
    }
    return user_names;
  };

  express = require('express');

  routes = require('./routes');

  app = module.exports = express.createServer();

  io = require('socket.io').listen(app);

  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    return app.use(express.static(__dirname + '/public'));
  });

  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('production', function() {
    return app.use(express.errorHandler());
  });

  app.get('/', function(req, res) {
    return res.sendfile(__dirname + '/views/index.html');
  });

  port = process.env.PORT || 8060;

  app.listen(port);

  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

  io.sockets.on('connection', function(socket) {
    console.log('Anonymous client ' + socket.id + ' connected.');
    clients[socket.id] = {
      'socket': socket
    };
    socket.on('set name', function(data) {
      var i, unique, user_names;
      unique = true;
      user_names = new Array();
      for (i in clients) {
        if (data === clients[i]['name']) {
          unique = false;
          break;
        } else if (clients[i]['name'] !== null) {
          console.log(clients[i]['name']);
          user_names.push({
            'name': clients[i]['name'],
            'id': i
          });
        }
      }
      if (unique) {
        clients[socket.id]['name'] = data;
        user_names.push({
          'name': data,
          'id': socket.id
        });
        card_czar || (card_czar = socket.id);
        socket.emit('start', cur_black_card);
        io.sockets.emit('set czar', card_czar);
        io.sockets.emit('user names', user_names);
        return console.log('Client ' + socket.id + ' set name to ' + data + ' and joined the game.');
      } else {
        return socket.emit('non unique name', data);
      }
    });
    socket.on('draw white card', function() {
      return socket.emit('send white card', drawWhiteCard());
    });
    socket.on('draw black card', function() {
      cur_black_card = drawBlackCard();
      return io.sockets.emit('send black card', cur_black_card);
    });
    socket.on('submit white cards', function(data) {
      return clients[card_czar]['socket'].emit('give czar cards', {
        'id': socket.id,
        'name': clients[socket.id]['name'],
        'cards': data
      });
    });
    socket.on('next czar', function() {
      card_czar = nextCzar();
      return io.sockets.emit('set czar', card_czar);
    });
    return socket.on('disconnect', function(data) {
      console.log(clients[socket.id]['name'] + ' had disconnected.');
      if (card_czar === socket.id) {
        card_czar = nextCzar();
        if (card_czar === socket.id) card_czar = null;
        io.sockets.emit('set czar', card_czar);
      }
      delete clients[socket.id];
      return io.sockets.emit('user names', getUsers());
    });
  });

}).call(this);
