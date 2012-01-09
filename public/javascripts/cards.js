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
	//var socket = io.connect('http://192.168.1.12'); /* use when connecting remotely */
	var socket = io.connect('localhost');            /* use for local portablility */

	// event handlers

	/* socket events */
	socket.on('start', function () {
		$('#table').show();
		$('#name_input').remove();
		console.log(socket);
		for (i = 0; i < 7; i++) {
			socket.emit('draw white card');
		}
	});

	socket.on('send black card', function (data) {
		$('#black').prepend("<img id=\"black_" + data + "\" class=\"black card\" src=\"images/cards/black_card-" + data + ".jpg\" />");
	});

	socket.on('send white card', function (data) {
		draw_white(data);
	});

	socket.on('user names', function (data) {
		$('#users').html('');
		for ( i in data) {
			console.log(data[i]);
			$('#users').append(data[i]['name'] + '<br>');
		}
	});

	/* javascript events */
	$('#submit_button').click( function() {
		cards = new Array();
		$('.submit').each( function(index) {
			cards.push($(this).attr('num'));
			console.log($(this).attr('num'));
		});
		socket.emit('submit white cards', {cards: cards});
	});

	$('input[name=setName]').click( function () {
		name = $('input[name=nameText]').val()
		if (name == '') name = 'anon'
		console.log(name);
	socket.emit('set name', name);
	});
	$('input[name=drawBlackCard]').click(function(){
		socket.emit('draw black card');
	});

	$('input[name=drawWhiteCard]').click(function(){
		socket.emit('draw white card');
	});
});
