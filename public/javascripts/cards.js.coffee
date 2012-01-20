card_czar = null
name = null

pick_winner = (id) ->

draw_black = (id) ->
  $('#black').html($('<img/>'
    id: 'black_' + id
    class: 'black card'
    src: 'images/cards/black_card-' + id + '.jpg'
  ))
draw_white = (id) ->
  $('<img/>'
    num: id
    id: 'white_' + id
    class: 'white hand card'
    src: 'images/cards/white_card-' + id + '.jpg'
    click: () -> pick_white(id)
  ).prependTo('#cards')

pick_white = (id) ->
  $('<img/>'
    num: id
    id: 'submit_' + id
    class: 'white submit card'
    src: 'images/cards/white_card-' + id + '.jpg'
    click: () ->
      draw_white(id)
      $('#submit_' + id).remove()
  ).appendTo('#submit')
  $('#white_' + id).remove()

receve_message = (sender, message) ->
  $('<p/>',
    html: message
    user: sender
    class: 'message'
  ).appendTo('#messages')
  $('#messages').scrollTop($('#messages').get(0).scrollHeight)

$(document).ready () ->
  socket = io.connect(document.url)

  ## socket events ##

  ## start
  socket.on 'start', (data) ->
    draw_black(data) if data
    $('#table').show()
    $('#name_input').remove()
    socket.emit('draw white cards', 7)

  ## send black cards
  socket.on 'send black card', (data) ->
    $('#judge').html('')
    $('#submit_button').show()
    draw_black(data)

  ## send white cards
  socket.on 'send white cards', (data) ->
    for i in data
      draw_white i

  ## give czar cards
  socket.on 'give czar cards', (data) ->
    div = $('<div/>',
      class: 'submitted_cards'
      id: 'name_' + data.id
      click: () ->
        console.log data
        $('#judge > div').each () ->
          $(this).off('click')
        $('.name').show()
        socket.emit 'winner', data.id
    )
    div.append($('<div/>',
      class: 'name'
      html: data.name
    ))
    for i of data.cards
      card = data.cards[i]
      div.append($('<img/>',
        num: card
        id: 'white_' + card
        class: 'white hand card'
        src: 'images/cards/white_card-' + card + '.jpg'
      ))
    $('#judge').append div

  ## user names
  socket.on 'user names', (data) ->
    $('#users').html ''
    for id of data
      row = $('<tr/>',
        class: 'user_info'
        id: 'user_info_' + data[id].id
      ).appendTo '#users'
      isCzar = if data[id].id == card_czar then 'yes' else 'no'
      row.append $('<td/>',
        class: 'user'
        czar: isCzar
        socket: data[id].id
        html: data[id].name      )
      row.append $('<td/>',
        class: 'score'
        html: data[id].score
      )

  ## non unique name
  socket.on 'non unique name', (data) ->
    alert 'User name ' + data + ' is already in use.'

  ## set czar
  socket.on 'set czar', (data) ->
    console.log card_czar + $('.user[socket=' + card_czar + ']').attr('czar')
    $('.user[socket=' + card_czar + ']').attr('czar', 'no')
    card_czar = data
    console.log card_czar + $('.user[socket=' + card_czar + ']').attr('czar')
    $('.user[socket=' + card_czar  + ']').attr('czar', 'yes')
    if socket.socket.sessionid == card_czar
      $('#submit_contain').hide()
      $('#cards').hide()
      $('input[name=drawWhiteCard]').hide()

      $('#judge').show()
      $('input[name=drawBlackCard]').show()
      $('input[name=nextCzar]').show()
    else
      $('#submit_contain').show()
      $('#cards').show()
      $('input[name=drawWhiteCard]').show()

      $('#judge').hide()
      $('input[name=drawBlackCard]').hide()
      $('input[name=nextCzar]').hide()

  ## recive message
  socket.on 'receve message', (data) ->
    receve_message data.id, data.message
    console.log $('#messages').scrollTop()


  ## Javascript events ##
  
  $('#submit_button').click () ->
    $('#submit_button').hide()
    cards = new Array()
    $('.submit').each () ->
      cards.push $(this).attr('num')
      $(this).remove()
    socket.emit 'submit white cards', cards

  $('input[name=drawWhiteCard]').click () ->
    socket.emit 'draw white cards', 1

  $('input[name=nameText]').keyup (event) ->
    if event.keyCode == 13
      $('input[name=setName]').click()

  $('input[name=setName]').click () ->
    name = $('input[name=nameText]').val()
    if name.length <= 14
      name = 'anon' if name == ''
      socket.emit 'set name', name
    else
      alert "Names must be under 14 charecters"

  $('input[name=nextCzar]').click () ->
    socket.emit 'next czar'

  $('#chat_message').keyup () ->
    if event.keyCode == 13
      $('#send_chat').click()
    

  $('#send_chat').click () ->
    if $('#chat_message').val() != ''
      message = '<strong> ' + name + ':</strong> ' + $('#chat_message').val() 
      receve_message 'you', message
      socket.emit 'send message', message
      $('#chat_message').val('')





        
























