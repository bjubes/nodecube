//app.js
var express = require('express');
var app = express();
var serv = require('http').Server(app);

//custom requires
var Player = require('./player.js')
var Util = require('./utilities.js')

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
	socket.id = Util.generateId();
	SOCKET_LIST[socket.id] = socket;

	socket.on('login', function(data){
		//TODO: validate playername

		var player = Player.onConnect(socket, data.name);
	    console.log("New Conection - name: ", player.name, ", id: ", socket.id)
		socket.emit("loginResponse",{success:true})

	})

	socket.on('disconnect',function(){
		Player.onDisconnect(socket)
		delete SOCKET_LIST[socket.id];
	});

	socket.on('chatToServer',function(data){
	   var playerName = Player.idToName(socket.id)
	   Util.broadcast('addToChat', {name: playerName, msg: data});
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
	Util.broadcast('newPositions', pack);
}, 1000/25);
