var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;
var wss = new WebSocketServer({port:2389});

wss.on('connection', function(ws) {

    ws.sendPlain = ws.send;
    ws.send = function(data) {
	this.sendPlain(JSON.stringify(data));
    }

    ws.on('message', function(msg, flags) {
	msg = JSON.parse(msg);

	switch( msg.type ) {
	case 'join':
	    clientJoined(ws, msg.msgid);
	    break;
	case 'draw':
	    clientDraw(ws, msg.clientID, msg.data);
	    break;
	case 'changecolor':
	    broadcast({
		type: 'changecolor',
		clientID: msg.clientID,
		data: { color: msg.data.color }
	    });
	    break;
	case 'clear':
	    broadcast({
		type: 'clear'
	    });
	}
    });
});

function broadcast(data) {
    for(var i in wss.clients) {
	var ws = wss.clients[i];
	ws.send(data);
    }
}

function clientDraw(socket, clientID, params) {
    for(var i in wss.clients) {
	var ws = wss.clients[i];
	if( ws != socket )
	    ws.send({
		type: 'draw',
		clientID: clientID,
		data: {
		    x: params.x,
		    y: params.y,
		    ox: params.ox,
		    oy: params.oy,
		}
	    });
    }
}

function clientJoined(socket, msgid) {
    socket.send({
	type: 'response.join',
	msgid: msgid,
	data: { clientID: parseInt(Math.random()*1024) }
    });
}
