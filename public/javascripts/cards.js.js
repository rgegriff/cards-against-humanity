(function() {
  var card_czar, draw_black, draw_white, name, pick_white, pick_winner;

  card_czar = null;

  name = null;

  pick_winner = function(id) {
    return $('.name').show();
  };

  draw_black = function(id) {
    return $('#black').html($('<img/>', {
      id: 'black_' + id,
      "class": 'black card',
      src: 'images/cards/black_card-' + id + '.jpg'
    }));
  };

  draw_white = function(id) {
    return $('<img/>', {
      num: id,
      id: 'white_' + id,
      "class": 'white hand card',
      src: 'images/cards/white_card-' + id + '.jpg',
      click: function() {
        return pick_white(id);
      }
    }).prependTo('#cards');
  };

  pick_white = function(id) {
    $('<img/>', {
      num: id,
      id: 'submit_' + id,
      "class": 'white submit card',
      src: 'images/cards/white_card-' + id + '.jpg',
      click: function() {
        draw_white(id);
        return $('#submit_' + id).remove();
      }
    }).appendTo('#submit');
    return $('#white_' + id).remove();
  };

  $(document).ready(function() {
    var socket;
    socket = io.connect(document.url);
    socket.on('start', function(data) {
      if (data) draw_black(data);
      $('#table').show();
      $('#name_input').remove();
      return socket.emit('draw white cards', 7);
    });
    socket.on('send black card', function(data) {
      $('#judge').html('');
      $('#submit_button').show();
      return draw_black(data);
    });
    socket.on('send white cards', function(data) {
      var i, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        i = data[_i];
        _results.push(draw_white(i));
      }
      return _results;
    });
    socket.on('give czar cards', function(data) {
      var card, div, i;
      div = $('<div/>', {
        "class": 'submitted_cards',
        id: 'name_' + data.id,
        click: function() {
          return pick_winner(data.id);
        }
      });
      div.append($('<div/>', {
        "class": 'name',
        html: 'TEST'
      }));
      console.log(data);
      for (i in data.cards) {
        console.log(i);
        card = data.cards[i];
        div.append($('<img/>', {
          num: card,
          id: 'white_' + card,
          "class": 'white hand card',
          src: 'images/cards/white_card-' + card + '.jpg'
        }));
      }
      return $('#judge').append(div);
    });
    socket.on('user names', function(data) {
      var id, isCzar, row, _results;
      console.log(data);
      $('#users').html('');
      _results = [];
      for (id in data) {
        row = $('<tr/>', {
          "class": 'user_info',
          id: 'user_info_' + data[id].id,
          socket: data[id].id
        }).appendTo('#users');
        isCzar = data[id].id === card_czar ? 'yes' : 'no';
        row.append($('<td/>', {
          "class": 'user',
          czar: isCzar,
          html: data[id].name
        }));
        _results.push(row.append($('<td/>', {
          "class": 'score',
          html: data[id].score
        })));
      }
      return _results;
    });
    socket.on('non unique name', function(data) {
      return alert('User name ' + data + ' is already in use.');
    });
    socket.on('set czar', function(data) {
      $('.user[socket=' + card_czar + ']').attr('czar', 'no');
      card_czar = data;
      $('.user[socket=' + card_czar + ']').attr('czar', 'yes');
      if (socket.socket.sessionid === card_czar) {
        $('#submit_contain').hide();
        $('#cards').hide();
        $('input[name=drawWhiteCard]').hide();
        $('#judge').show();
        $('input[name=drawBlackCard]').show();
        return $('input[name=nextCzar]').show();
      } else {
        $('#submit_contain').show();
        $('#cards').show();
        $('input[name=drawWhiteCard]').show();
        $('#judge').hide();
        $('input[name=drawBlackCard]').hide();
        return $('input[name=nextCzar]').hide();
      }
    });
    socket.on('receve message', function(data) {
      return $('<p/>', {
        html: data.message,
        user: data.id,
        "class": 'message'
      }).appendTo('#messages');
    });
    $('#submit_button').click(function() {
      var cards;
      $('#submit_button').hide();
      cards = new Array();
      $('.submit').each(function() {
        cards.push($(this).attr('num'));
        return $(this).remove();
      });
      return socket.emit('submit white cards', cards);
    });
    $('input[name=nameText]').keyup(function(event) {
      if (event.keyCode === 13) return $('input[name=setName]').click();
    });
    $('input[name=setName]').click(function() {
      name = $('input[name=nameText]').val();
      if (name.length <= 14) {
        if (name === '') name = 'anon';
        return socket.emit('set name', name);
      } else {
        return alert("Names must be under 14 charecters");
      }
    });
    $('input[name=drawBlackCard]').click(function() {
      return socket.emit('draw black card');
    });
    $('input[name=drawWhiteCard]').click(function() {
      return socket.emit('draw white cards');
    });
    $('input[name=nextCzar]').click(function() {
      return socket.emit('next czar');
    });
    $('#chat_message').keyup(function() {
      if (event.keyCode === 13) return $('#send_chat').click();
    });
    return $('#send_chat').click(function() {
      var message;
      if ($('#chat_message').val() !== '') {
        message = '<strong> ' + name + ':</strong> ' + $('#chat_message').val();
        $('<p/>', {
          html: message,
          user: 'you',
          "class": 'message'
        }).appendTo('#messages');
        socket.emit('send message', message);
        return $('#chat_message').val('');
      }
    });
  });

}).call(this);
