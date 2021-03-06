var Util = require('./utilities.js')

var boardList = [];

class Board {
    constructor(length, width){
        this.length = length;
        this.width = width;
        this.playerList = {}
        this._tiles = [[]] //2d array of ids x,y

        //this bit may be unnessicary
        for (var x = 0; x < width; x++) {
            this._tiles[x] = []
            for (var y = 0; y < length; y++) {
                this._tiles[x][y] = undefined;
            }
        }
        this.dtiles = [] //contains list of {x:int,y:int}
        //bookkeeping
        boardList.push(this);
    }

    get tiles(){return this._tiles}
    set tiles(value){
        throw new Error("Cannot directly set tiles, must use board.setTile()")
    }

    setTile(x,y,value){
        //dont trigger deltas for unchanged tiles
        if(x < 0 || y < 0 || this._tiles[x][y] == value) {return}

        this._tiles[x][y] = value;
        this.dtiles.push({x:x,y:y})
    }


    static get tileSize() {return 16}


    static getPlayerFromSocket(socket) {
        return getPlayerFromId(socket.id);
    }

    static getPlayerFromId(id){
        for (var i = 0; i < boardList.length; i++) {
            var plist = boardList[i].playerList
            for(var key in plist) {
                if ( plist[key].id == id){
                    return plist[key];
                }
            }
        }
    return null;
    }

    onPlayerMoved(player){
        var x = Math.floor(player.x / Board.tileSize);
        var y = Math.floor(player.y / Board.tileSize);
        this.setTile(x,y,player.id);
    }

    //needs to be optimized
    removePlayer(player){
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < length; y++) {
                if (this._tiles[x][y] == player.id){
                    setTile(x,y,undefined)
                }
            }
        }
    }

    sendBoardInit(socket) {
        //give the new player information the board
        var initPackage = {}
        initPackage.length = this.length;
        initPackage.width = this.width;
        initPackage.tiles = this.updatePacket(true);
        socket.emit("newBoard", initPackage)
    }

    updatePacket(ignoreDeltas = false) {
        if (ignoreDeltas){return this.tiles}
        var pack = []
        for (var i = 0; i < this.dtiles.length; i++) {
            var x = this.dtiles[i].x
            var y = this.dtiles[i].y
            var id = this.tiles[x][y]
            pack.push({x:x,y:y,id:id})
            console.log("x:" + x + " , " + "y:" + y);
        }
        this.dtiles = []
        return pack
    }

}


module.exports = Board;
