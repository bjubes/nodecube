//app.js
var express = require('express');
var app = express();
var serv = require('http').Server(app);

//custom requires
var Player = require('./player.js')

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

DEBUG = true;
SOCKET_LIST = {};

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = generateId();
	SOCKET_LIST[socket.id] = socket;
	Player.onConnect(socket);
    console.log("New Conection. id - ", socket.id)

	socket.on('disconnect',function(){
		Player.onDisconnect(socket)
		delete SOCKET_LIST[socket.id];
	});

	socket.on('chatToServer',function(data){
	   var playerName = socket.id //TODO: real names
	   broadcast('addToChat', {name: playerName, msg: data});
   });

   socket.on('evalServer',function(data){
	   if(!DEBUG)
		   return;
	   var res = eval(data);
	   socket.emit('evalResponse',res);
   });

});

setInterval(function(){
	var pack = [];
	for(var i in Player.PLAYER_LIST){
		var player = Player.PLAYER_LIST[i];
		player.move();
		pack.push({
			x:player.x,
			y:player.y,
			id:player.id,
		});
	}
	broadcast('newPositions', pack);
}, 1000/25);

function generateId (){
	//gen a number between 0 and 9 millon, and convert to alphanumeric
	return (0|Math.random()*9e6).toString(36)
}

function broadcast(msg, data) {
    for(var i in SOCKET_LIST) {
        SOCKET_LIST[i].emit(msg, data);
    }
}
