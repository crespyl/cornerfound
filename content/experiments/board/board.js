var canvas = {
    canvas: null,
    g: null,

    width: 600,
    height: 400,
    
    offsetX: 0,
    offsetY: 0,
    
    drawing: false
}

var mouse = {
    x: 0,
    y: 0
}

var client = {
    color: 'black'
}

var clients = [];

var server = {
    ready: false,
    clientID: null,
    server: null,
    msgid: 0,
    send: function(type,params) {
	var msg = {type:type, data:params, clientID:server.clientID, msgid:server.msgid};
	var json = JSON.stringify(msg);
	server.server.send(json);
	server.msgid++;
    }
}

function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
    deferTimer;
    return function () {
	var context = scope || this;

	var now = +new Date,
        args = arguments;
	if (last && now < last + threshhold) {
	    // hold on to it
	    clearTimeout(deferTimer);
	    deferTimer = setTimeout(function () {
		last = now;
		fn.apply(context, args);
	    }, threshhold);
	} else {
	    last = now;
	    fn.apply(context, args);
	}
    };
}

function init() {
    initWS();
    initCanvas();
    initControls();
}

function initWS() {
    with(server) {
	server = new WebSocket('ws://crespyl.net:2389');
	server.onopen = function() {
	    console.log('saying hi...');
	    send('join');
	}
	server.onmessage = function(e) {
	    var msg = JSON.parse(e.data);

	    switch(msg.type) {
	    case 'response.join':
		clientID = msg.data.clientID;
		ready = true;
		console.log("got id: "+clientID);
		break;
	    case 'move':
		clientMoved(msg.data);
		break;
	    case 'draw':
		clientDraw(msg.clientID, msg.data);
		break;
	    case 'changecolor':
		if( clients[ msg.clientID ] == undefined )
		    clients[ msg.clientID ] = { clientID: msg.clientID, color: msg.data.color };
		clients[msg.clientID].color = msg.data.color;
		console.log("Client "+msg.clientID+" changed to "+msg.data.color);
		break;
	    case 'clear':
		clear();
		break;
	    }
	}
    }
}

function initCanvas() {

    with(canvas) {

	canvas = $('#canvas');
	width = canvas.width();
	height = canvas.height();
	canvas = canvas[0];

	g = canvas.getContext("2d");

	clear();

	g.moveTo( 0,0 );
	g.beginPath();
	drawing = true;

	canvas.onmousedown = function(e) {
	    with(canvas) {
		offsetX = $('canvas').offset().left;
		offsetY = $('canvas').offset().top;

		mouse.x = e.pageX;
		mouse.y = e.pageY;
		g.moveTo( mouse.x,mouse.y );
		g.beginPath();

		drawing = true;
	    }
	}

	canvas.onmouseup = function(e) {
	    canvas.drawing = false;
	}

	canvas.onmousemove = function(e) {
	    var oldX = mouse.x;
	    var oldY = mouse.y;

	    mouse.x = e.pageX - offsetX;
	    mouse.y = e.pageY - offsetY;

	    if( Math.abs(mouse.x - oldX) > 50 )
		oldX = mouse.x;
	    if( Math.abs(mouse.y - oldY) > 50 )
		oldY = mouse.y;

	    if( !canvas.drawing )
		return;

	    if(server.ready)
		server.send('draw', { x: mouse.x,
				      y: mouse.y,
				      ox: oldX,
				      oy: oldY,
				      color: client.color
				    });

	    with(canvas) {
		g.strokeStyle = client.color;
		g.beginPath();
		g.moveTo( oldX, oldY );
		g.lineTo( mouse.x,mouse.y);
		g.closePath();
		g.stroke();
	    }
	}
    }

    $('canvas').trigger('mousedown');
    $('canvas').trigger('mousemove');
    $('canvas').trigger('mouseup');
}

function initControls() {
    $('.controls .clear').on('click', function() {
	if( server.ready )
	    server.send('clear');
    });

    $('.controls .colors .btn').on('click', function() {
	client.color = $(this).data('color');

	if( server.ready )
	    server.send('changecolor', {color: client.color})
    });
}

function clear() {
    with(canvas) {
	g.fillStyle = 'white';
	g.fillRect(0,0, width,height);
    }
}

function clientMoved(data) {
    // show client cursors?
}

function clientDraw(clientID, data) {
    with(canvas) {

	var color;
	if( clients[clientID] != undefined )
	    color = clients[clientID].color;
	else
	    color = 'black'

	g.strokeStyle = color;

	g.beginPath();
	g.moveTo( data.ox, data.oy );
	g.lineTo( data.x, data.y );
	g.closePath();
	g.stroke();
    }
}

$(function() {
    init();
});
