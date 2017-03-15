var Util = require('./utilities.js')

var boardList = [];

class Board {
    constructor(length, width){
        this.length = length;
        this.width = width;
        this.playerList = {}
        boardList.push(this);
    }

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
}

module.exports = Board;
