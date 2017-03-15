
var playerList = {}

class Player {
    constructor(initPackage){
        this.name = initPackage.name;
        this.id = initPackage.id;
        this.x = initPackage.x;
        this.y = initPackage.y;
        this.color = initPackage.color;
        //bookkeeping
        playerList[this.id] = this;
    }
}

class Board {
    constructor(length, width, tiles ={}){
        this.length = length;
        this.width = width;
        this.tiles = [[]] //2d array of ids x,y
        for (var x = 0; x < width; x++) {
            this.tiles[x] = []
            for (var y = 0; y < length; y++) {
                this.tiles[x][y] = undefined;
            }
        }
    }
}


//TODO: put this in a real call, for now assuming board is 500,500
var board = new Board(500,500)


//this is sent to existing players when a new player joins and
//to a new player to tell them about existing players
socket.on('newPlayer', function(initPackages){
    for(var i in initPackages){
        var initPackage = initPackages[i]
        new Player(initPackage)
    }
})

socket.on('update',function(delta){
    //delta is {players: [{id,x,y},{id,x,y}], tiles:[{id,x,y},{id,x,y}]}
    for(var i = 0; i < delta.players.length; i++){
        var newInfo = delta.players[i];
        if (!(newInfo.id in playerList)) {
            //we got an update about a player we don't know about
            //TODO: request this players init
            continue;
        }
        var player = playerList[newInfo.id]
        //update every value in player that exists in the deltapack
        for(key in newInfo){
            //except id
            if(key == "id") {continue;}
            player[key] = newInfo[key]
        }
        // save changes
        playerList[newInfo.id] = player;
    }
    for (var i = 0; i < delta.tiles.length; i++) {
        var tile = delta.tiles[i]
        board.tiles[tile.x,tile.y] = tile.id
        //console.log("tile x:",tile.x," y:",tile.y," belongs to ",tile.id);
    }
});

//update screen every frame based on locally cached information
setInterval(function(){
	ctx.clearRect(0,0,500,500);
	for(var i in playerList) {
		var player = playerList[i];
        ctx.fillStyle = player.color;
		ctx.fillRect(player.x - size/2, player.y - size/2, size, size);
	}
    for (var x = 0; x < board.width; x++) {
        for (var y = 0; y < board.length; y++) {
            var tile = board.tiles[x][y]
            if (tile == undefined){continue}
            ctx.fillStyle = "#333333"
            ctx.fillRect(tile.x*size - size/2, tile.y*size - size/2,size,size)
        }
    }
}, 1000/25);

socket.on('playerDisconnect', function(data){
	delete playerList[data.id];
})


//keyboard events
document.onkeydown = function(event){
	//TODO: bail if user is focused on chat
   if(event.keyCode === 68)    //d
	   socket.emit('keyPress',{dir:0});
   else if(event.keyCode === 87) // w
	 socket.emit('keyPress',{dir:1});
   else if(event.keyCode === 65) //a
	   socket.emit('keyPress',{dir:2});
   else if(event.keyCode === 83)   //s
	 socket.emit('keyPress',{dir:3});
}


//chat
