var express = require('express');
var app = express();
var serv = require('http').Server(app);

//custom requires
var Player = require('./player.js')
var Util = require('./utilities.js')
var Board = require('./board.js')

//https on heroku
app.get('*', function(req,res,next) {
  if(req.headers['x-forwarded-proto'] != 'https' && process.env.NODE_ENV === 'production')
    res.redirect('https://'+req.hostname+req.url)
  else
    next() /* Continue to other routes if we're not redirecting */
});
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

DEBUG = process.env.DEBUG
SOCKET_LIST = {};
var board = new Board(500,500);

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Util.generateId();
    //give the socket the board of the player. fix later since socket should be agnostic
    socket.board = board;
	SOCKET_LIST[socket.id] = socket;

	socket.on('login', function(data){
		//TODO: validate playername


		var player = Player.onConnect(socket, data.name, board);
	    console.log("New Conection - name: ", player.name, ", id: ", socket.id)
		socket.emit("loginResponse",{success:true})

	})

	socket.on('disconnect',function(){
		Player.onDisconnect(socket)
		delete SOCKET_LIST[socket.id];
	});

	socket.on('chatToServer',function(data){
	   var playerName = Player.idToName(socket.id, board)
	   Util.broadcast('addToChat', {name: playerName, msg: data});
   });

   socket.on('evalServer',function(data){
	   if(!DEBUG)
		   return;
	   var res = eval(data);
	   socket.emit('evalResponse',res);
   });

});

//update and send deltas
setInterval(function(){
	var pack = [];
	for(var i in board.playerList){
		var player = board.playerList[i];
		player.move();
		pack.push(player.updatePacket());
	}
	if (pack.length == 0) {
		return;
	}
	Util.broadcast('update', {players: pack});
}, 1000/25);
