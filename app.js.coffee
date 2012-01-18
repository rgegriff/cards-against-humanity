clients = new Object()
card_czar = null
cur_black_card = null
white_cards = [0..459]
black_cards = [0..89]

shuffleWhiteDeck: () ->
  white_cards = [0..459]

shuffleBlackDeck: () ->
  black_cards = [0..89]

drawWhiteCard: () ->
  shuffleWhiteDeck() if white_cards.length == 0
  i = Math.round(Math.random() * (white_cards.length - 1))
  return white_cards.splice(i, 1)

drawBlackCard: () ->
  shuffleBlackDeck() if black_cards.length == 0
  i = Math.round(Math.random() * (black_cards.length - 1))
  return  black_cards.splice(i, 1)

nextCzar: () ->
  ord = new Array()
  for i in clients
    pos = ord.length if i == card_czar
    ord.push(i) if clients[i]['name'] != null
  if ord.length != 0
    pos++
    pos = 0 if pos == ord.length
    return ord[pos]
  return null

## Starting express server ##

express = require 'express'
routes = require './routes'

app = module.exports = express.createServer()
io = require('socket.io').listen(app)


app.configure () ->
  app.set 'views', __dirname + '/views'
  app.set 'view engine', 'jade'
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router
  app.use express.static(__dirname + '/public')

app.configure 'development', () ->
  app.use express.errorHandler({ dumpExceptions: true, showStack: true })


app.configure 'production', () ->
  app.use express.errorHandler()

## Routes
# app.get '/', routes.index
app.get '/', (req, res) ->
  res.sendfile(__dirname + '/views/index.html')

port = process.env.PORT || 8060
app.listen port
console.log "Express server listening on port %d in %s mode", app.address().port, app.settings.env


io.sockets.on 'connection', (socket) ->
  console.log('Anonymous client ' + socket.id + ' connected.')
  clients[socket.id] = {'socket': socket}
  socket.on 'set name', (data) ->
    unique = true
    user_names = new Array()
    for i in clients
      if data == clients[i]['name']
        unique = false
        break
      else if clients[i]['name'] != null
        user_names.push {'name': clients[i]['name'], 'id': i}
    if unique
      clients[socket.id]['name'] = data
      user_names.push {'name': data, 'id': socket.id}
      card_czar or= socket.id
      socket.emit 'start', cur_black_card
      io.socket.emit 'set czar', card_czar
      io.socket.emit 'user names', user_names
      console.log('Client ' + socket.id + ' set name to ' + data + ' and joined the game.')
    else
      socket.emit 'non unique name', data
