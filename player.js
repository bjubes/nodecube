var PLAYER_LIST  =  {}
class Player {
    constructor(id){
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.color = randomColor();
        PLAYER_LIST[id] = this;
    }

    static onConnect(socket) {
        //create a new player server side
        var player = new Player(socket.id);
        Player.registerInputHandler(socket);

        //when client asks for color of player id, then return the color
        socket.on('colorOfPlayer', function(id){
            socket.emit("colorOfPlayerResponse", {id: id, color: PLAYER_LIST[id].color})
        });
    }

    static onDisconnect(socket) {
        delete PLAYER_LIST[socket.id];
        broadcast("playerDisconnect", {id: socket.id})
    }

    static registerInputHandler(socket) {
        socket.on('keyPress', function() {
            console.log("input not implemented");
        });
    }

    updatePacket() {
        return {
            id: this.id,
            x: this.x,
            y: this.y
        }
    }
}

function randomColor(){
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function broadcast(msg, data) {
    for(var i in SOCKET_LIST) {
        SOCKET_LIST[i].emit(msg, data);
    }
}

module.exports = Player;
module.exports.PLAYER_LIST = PLAYER_LIST;
