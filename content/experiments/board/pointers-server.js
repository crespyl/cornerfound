var app = require('http').createServer(handler)
  , io  = require('socket.io').listen(app)

var red, blue, reset;
red  = '\033[31m';
blue = '\033 [36m';
reset= '\033[0m';

function log(msg) { console.log(msg); }
function info(msg) { console.log(blue + "info: " + reset + msg); }
function error(msg) { console.log(red + " err: " + reset + msg); }

app.listen(3042);
info("listening on port 3042");

io.set("log level",1); 

function handler(req, res) {
}

var viewers = 0;

io.sockets.on('connection', function(socket) {
    viewers++;

    var id = Math.random().toString(15).substr(4,6);
    var date = new Date();
    info(date + ": client joined: "+id+", total: "+viewers);

    socket.set('id', id, function() {
	socket.emit('set-id', {id:id});
    });

    io.sockets.emit('viewer-connect', {id:id});
    io.sockets.emit('viewers-update', {count:viewers});

    socket.on('disconnect', function(data) {
	viewers--;
	var date = new Date();
	info(date +": client gone: "+id+", total: "+viewers);
	io.sockets.emit('viewer-disconnect', {id:id});
	io.sockets.emit('viewers-update', {count:viewers});
    });
    socket.on('mouse-move', function(data) {
	var date = new Date();
	socket.get('id', function(err, id) {
	    if(!err)
		io.sockets.volatile.emit('pointer-update', {id:id,x:data.x,y:data.y});
	    else
		log(date +": ERR: Error while reading client id: "+err);
	});
    });
    socket.on('chirp', function(data) {
	socket.get('id', function(err, id) {
	    if(!err)
		io.sockets.volatile.emit('chirp', {id:id,x:data.x,y:data.y});
	    else
		log(date +": ERR: Error while reading client id: "+err);
	});
    });
});
