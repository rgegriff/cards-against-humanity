var card_czar = null;

function pickWinner(id) {
  console.log(id);
 $('.name').show();
}

$(document).ready(function() {
	function draw_white (data) {
		$('#cards').prepend("<img num=\"" + data + "\" id=\"white_" + data + "\" class=\"white hand card\" src=\"images/cards/white_card-" + data + ".jpg\" />");
		$('#white_' + data).click(function () { 
			pick_white(data);
		});
	}

	function pick_white  (data) {
		$('#submit').append("<img num=\"" + data + "\" id=\"submit_" + data + "\" class=\"white submit card\" src=\"images/cards/white_card-" + data + ".jpg\" />");
		$('#white_' + data).remove();
		$('#submit_' + data).click( function () {
			draw_white(data);
			$('#submit_' + data).remove();
		});
	}

	// loading websockets

  /* local network */ //var socket = io.connect('http://192.168.1.11'); 
  /* heroku */        //var socket = io.connect('http://blooming-samurai-6301.herokuapp.com/');
  /* localhost */     //var socket = io.connect('localhost')
  /* might work */     var socket = io.connect(document.url)
  
	//var socket = io.connect('localhost');

	// event handlers

	/* socket events */
	socket.on('start', function (data) {
		if (data != null)
			$('#black').html("<img id=\"black_" + data + "\" class=\"black card\" src=\"images/cards/black_card-" + data + ".jpg\" />");
		$('#table').show();
		$('#name_input').remove();
		for (i = 0; i < 7; i++) {
			socket.emit('draw white card');
		}
	});

	socket.on('send black card', function (data) {
		$('#judge').html('');
		$('#black').html("<img id=\"black_" + data + "\" class=\"black card\" src=\"images/cards/black_card-" + data + ".jpg\" />");
    $('#submit_button').show();
	});

	socket.on('send white card', function (data) {
		draw_white(data);
	});

	socket.on('give czar cards', function (data) {
		div = '<div class=\'submitted_cards\' id=\'name_' + data['id'] + '\' >';
    div += '<div class=\'name\'> TEST </div>';
		for (card in data['cards']['cards']) {
			console.log(card);
			c = data['cards']['cards'][card];
			div += "<img num=\"" + c + "\" id=\"white_" + c + "\" class=\"white hand card\" src=\"images/cards/white_card-" + c + ".jpg\" />";
		}
		div += '</div>';
		$('#judge').append(div);
    console.log($('#name_' + data['id']));
    $('#name_' + data['id']).click(function () {
      pickWinner(data['id']);
    });
	});

	socket.on('user names', function (data) {
		$('#users').html('');
		for ( i in data) {
			if (data[i]['id'] == card_czar)
				isCzar = 'yes';
			else
				isCzar = 'no';
			$('#users').append('<div class=\'user\' czar=\'' + isCzar + '\' socket=\'' + data[i]['id'] + '\'>' + data[i]['name'] + '</div>');
		}
	});

	socket.on('non unique name', function (data) {
		alert('User name ' + data + ' is already in use.');
	});

	socket.on('set czar', function (data) {
		// marking czar in user list
		$('.user[socket='+card_czar+']').attr('czar', 'no');
		card_czar = data;
		$('.user[socket='+card_czar+']').attr('czar', 'yes');
		if (socket.socket.sessionid == card_czar){
			$('#submit_contain').hide();
			$('#cards').hide();
			$('input[name=drawWhiteCard]').hide();

			$('#judge').show();
			$('input[name=drawBlackCard]').show();
			$('input[name=nextCzar]').show();
		}
		else {
			$('#submit_contain').show();
			$('#cards').show();
			$('input[name=drawWhiteCard]').show();

			$('#judge').hide();
			$('input[name=drawBlackCard]').hide();
			$('input[name=nextCzar]').hide();
		}
	});

	/* javascript events */
	$('#submit_button').click( function() {
    $('#submit_button').hide();
		cards = new Array();
		$('.submit').each( function(index) {
			cards.push($(this).attr('num'));
		});
		socket.emit('submit white cards', {cards: cards});
    $('.submit').each(function(index) {
      $(this).remove();
    });
	});

	$('input[name=setName]').click( function () {
		name = $('input[name=nameText]').val()
		if (name == '') name = 'anon'
	socket.emit('set name', name);
	});
	$('input[name=drawBlackCard]').click(function(){
		socket.emit('draw black card');
	});

	$('input[name=drawWhiteCard]').click(function(){
		socket.emit('draw white card');
	});

	$('input[name=nextCzar]').click(function(){
		socket.emit('next czar');
	});
});
