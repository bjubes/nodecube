var PLAYER_LIST  =  {}
class Player {
    constructor(id){
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.color = randomColor();
        this.dir = 0 //multiply by pi/2
        //bookkeeping
        PLAYER_LIST[id] = this;
    }

    static get speed() {return 10}

    static onConnect(socket) {
        //create a new player server side
        var player = new Player(socket.id);
        player.registerInputHandler(socket);

        //when client asks for color of player id, then return the color
        socket.on('colorOfPlayer', function(id){
            socket.emit("colorOfPlayerResponse", {id: id, color: PLAYER_LIST[id].color})
        });
    }

    static onDisconnect(socket) {
        delete PLAYER_LIST[socket.id];
        broadcast("playerDisconnect", {id: socket.id})
    }

    registerInputHandler(socket) {
        var player = this; //declared outside of callback so "this" scope
                    // is player, not socket
        socket.on('keyPress', function(data) {
            //dir must be number 0-3
            if (data.dir > 3 || data.dir < 0) {
                return;
            }
            player.dir = data.dir
        });
    }

    move(){
        var speed = Player.speed //TODO: muliplier for speed boosts?
        switch(this.dir) {
    case 0:
        this.x += speed;
        break;
    case 1:
        this.y -= speed;
        break;
    case 2:
        this.x -= speed;
        break;
    case 3:
        this.y += speed;
        break;
    default:
        throw errror("direction value is invalid for player ", this.id, " - ", this.dir)
}
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
