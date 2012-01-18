(function() {
  var card_czar, draw_black, draw_white, pick_white, pick_winner;

  card_czar = null;

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
        id: 'name_' + data['id'],
        click: function() {
          return pick_winner(data['id']);
        }
      });
      div.append($('<div/>', {
        "class": 'name',
        html: 'TEST'
      }));
      console.log(data);
      for (i in data['cards']) {
        console.log(i);
        card = data['cards'][i];
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
      var id, isCzar, _results;
      $('#users').html('');
      _results = [];
      for (id in data) {
        if (data[id]['id'] === card_czar) {
          isCzar = 'yes';
        } else {
          isCzar = 'no';
        }
        _results.push($('<div/>', {
          "class": 'user',
          czar: isCzar,
          socket: data[id]['id'],
          html: data[id]['name']
        }).appendTo('#users'));
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
    $('input[name=setName]').click(function() {
      var name;
      name = $('input[name=nameText]').val();
      if (name === '') name = 'anon';
      return socket.emit('set name', name);
    });
    $('input[name=drawBlackCard]').click(function() {
      return socket.emit('draw black card');
    });
    $('input[name=drawWhiteCard]').click(function() {
      return socket.emit('draw white cards');
    });
    return $('input[name=nextCzar]').click(function() {
      return socket.emit('next czar');
    });
  });

}).call(this);
