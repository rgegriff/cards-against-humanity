clients = new Object()
card_czar = null
cur_black_card = null
white_cards = [0..459]
black_cards = [0..89]

shuffleWhiteDeck = () ->
  white_cards = [0..459]

shuffleBlackDeck = () ->
  black_cards = [0..89]

drawWhiteCard = () ->
  shuffleWhiteDeck() if white_cards.length == 0
  i = Math.round(Math.random() * (white_cards.length - 1))
  return white_cards.splice(i, 1)[0]

drawBlackCard = () ->
  shuffleBlackDeck() if black_cards.length == 0
  i = Math.round(Math.random() * (black_cards.length - 1))
  return  black_cards.splice(i, 1)

nextCzar = () ->
  ord = new Array()
  for i of clients
    if i == card_czar
      pos = ord.length
    if clients[i]['name']
      ord.push(i)
  if ord.length != 0
    pos++
    pos = 0 if pos == ord.length
    return ord[pos]
  else
    return null

getUsers = () ->
  user_names = new Array()
  console.log clients
  for i of clients
    if clients[i]['name']
      user_names.push
        name: clients[i]['name']
        id: i
        score: clients[i]['score']
  return user_names

## Starting express server ##

express = require 'express'
routes = require './routes'

app = module.exports = express.createServer()


app.configure () ->
  app.set 'views', __dirname + '/views'
  app.set 'view engine', 'jade'
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router
  app.use express.static(__dirname + '/public')

app.configure 'development', () ->
  app.use express.errorHandler
    dumpExceptions: true
    showStack: true

io = require('socket.io').listen(app)

# heroku configs
io.configure () ->
  io.set 'transports', ['xhr-polling']
  io.set 'polling duration', 10
  
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
  clients[socket.id] = 
    socket: socket
    score: 0

  ## set name
  socket.on 'set name', (data) ->
    unique = true
    user_names = new Array()
    for i of clients
      if data == clients[i]['name']
        unique = false
        break
      else if clients[i]['name']
        console.log clients[i]['name']
        user_names.push 
          name: clients[i]['name']
          id: i
          score: clients[i]['score']
    if unique
      clients[socket.id]['name'] = data
      user_names.push 
        name: data
        id: socket.id
        score: clients[socket.id]['score']
      card_czar or= socket.id
      cur_black_card or= drawBlackCard()
      socket.emit 'start', cur_black_card
      io.sockets.emit 'set czar', card_czar
      io.sockets.emit 'user names', user_names
      console.log 'Client ' + socket.id + ' set name to ' + data + ' and joined the game.'
      io.sockets.emit 'receve message',
        message: data + ' joined the game'
        id: 'system'
    else
      socket.emit 'non unique name', data

  ## draw white cards
  socket.on 'draw white cards', (data = 1) ->
    console.log data
    cards = new Array
    for i in [1..data]
      cards.push drawWhiteCard()
    socket.emit 'send white cards', cards

  ## draw black card
  socket.on 'draw black card', () ->
    cur_black_card = drawBlackCard()
    io.sockets.emit 'send black card', cur_black_card

  ## submit white cards
  socket.on 'submit white cards', (data) ->
    clients[card_czar].socket.emit 'give czar cards',
      id: socket.id
      name: clients[socket.id].name
      cards: data

  ## winner
  socket.on 'winner', (data) ->
    console.log 'didnt crash'
    #clients[data].score++
    #io.sockets.emit 'user names', getUsers()

  ## send message
  socket.on 'send message', (data) ->
    socket.broadcast.emit 'receve message',
      message: data
      id: socket.id

  ## next czar
  socket.on 'next czar', () ->
    card_czar = nextCzar()
    cur_black_card = drawBlackCard()
    io.sockets.emit 'send black card', cur_black_card
    io.sockets.emit 'set czar', card_czar

  ## disconnect
  socket.on 'disconnect', (data) ->
    console.log clients[socket.id].name + ' has disconnected.'
    io.sockets.emit 'receve message',
      message: clients[socket.id].name + ' has left the game'
      id: 'system'
    if card_czar == socket.id
      card_czar = nextCzar()
      if card_czar == socket.id
        card_czar = null
      cur_black_card = drawBlackCard()
      io.sockets.emit 'send black card', cur_black_card
      io.sockets.emit('set czar', card_czar)
    delete clients[socket.id]
    io.sockets.emit 'user names', getUsers()
