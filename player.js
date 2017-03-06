var Util = require('./utilities.js')

var PLAYER_LIST  =  {}
class Player {
    constructor(id, name){
        if(name == ""){
            name = id //TODO: generate random names
        }
        this._name = name;
        this.id = id;
        this.x = 0;
        this.y = 0;
        this._color = Util.randomColor();
        this.dir = 0 //multiply by pi/2
        //bookkeeping

        //flags
        this.delta = {} // delta.<attribute> MUST correspond to player.<attribute>, otherwise updatePacket will fail
        this.delta.name = false
        this.delta.color = false

        PLAYER_LIST[id] = this;
    }

    //setters and getters
    get name(){return this._name}
    set name(val){
        this.delta.name = true
        this._name = val
    }
    get color(){return this._color}
    set color(val){
        this.delta.color = true
        this._color = val
    }

    //static vars
    static get speed() {return 1}

    //static events
    static onConnect(socket, name) {
        //create a new player server side
        var player = new Player(socket.id, name);
        player.registerInputHandler(socket);
        player.sendNewPlayerInit(socket);
        player.updateExistingPlayers();
        return player;
    }

    static onDisconnect(socket) {
        delete PLAYER_LIST[socket.id];
        Util.broadcast("playerDisconnect", {id: socket.id})
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

    //sends "per request" information to a new player to catch them up
    //with stuff already happenign in the game
    updateExistingPlayers(){
        //send existing players my info
        var initPackages = {}
        initPackages[this.id] = this.updatePacket(true)
        Util.broadcast("newPlayer", initPackages);
    }

    sendNewPlayerInit(socket) {
        //give the new player, this, the information about other players
        var initPackages = {}
        for(var i in PLAYER_LIST){
            var player = PLAYER_LIST[i]
            initPackages[player.id] = player.updatePacket(true)
        }
        socket.emit("newPlayer", initPackages)
    }

    static idToName(id){
        if (!(id in PLAYER_LIST)){
            return id
        }
        return PLAYER_LIST[id].name
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

    updatePacket(ignoreDeltas = false) {
        var pack = {
            id: this.id,
            x: this.x,
            y: this.y
        };
        for (var d in this.delta){
            if (this.delta[d] || ignoreDeltas ){
                pack[d] = this[d]
            }
        }
        return pack
    }
}

module.exports = Player;
module.exports.PLAYER_LIST = PLAYER_LIST;
