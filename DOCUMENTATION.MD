This documents every single socket.io event and states its purpose, data attributes, and such.

## Socket Level Events
### login
**Sent by:** Client

**Description:** Sends user data to server upon submitting the login form

**Data:**

    {
        name: "username"
    }

### loginResponse
**Sent by:** Server

**Description:** Returns whether login was successful

**Data:**

    {
        success: bool
    }

### disconnect
**Sent by:** User

**Description:** Sent by user when they close the webpage

**Data:**

    {
        socket: socket
    }

## Gameplay

### newPlayer
**Sent by:** Server

**Description:** Sends  player data initPackage to clients about a player who has joined the board

**Data:**

    {
        name: "username",
        id: "id",
        x: x
        y: y
        color: "#hexcode"
    }

### newBoard
**Sent by:** Server

**Description:** Sends  board data to clients when a board is created or they join a board.

**Data:**

    {
        length: int
        width: int
        tiles: {
            [ ["id", "id", undefined],  ["id", "id", undefined],  ["id", "id", undefined] ],
            [ ["id", "id", undefined],  ["id", "id", undefined],  ["id", "id", undefined] ],
            [ ["id", "id", undefined],  ["id", "id", undefined],  ["id", "id", undefined] ]
        }
    }

### keyPress
**Sent by:** Client

**Description:** Sends  direction data to client when a player hits a directional key that frame

**Data:**

    {
        dir: int
        // int is 0-3. The direction is int * (pi/2)
    }

### playerDisconnect

**Sent by:** Server

**Description:** Sends  id of player to other clients upon player disconnecting

**Data:**
    {
        id: "playerID"
    }

### update
**Sent by:** Server

**Description:** Sends  delta game information every tick

**Data:**
    {
        players: playerPack,
        tiles: board.updatePacket()
    }

## Chat

### chatToServer

**Sent by:** Client

**Description:** Sends  chat message to server for distribution.
 Note: user is determined by the socket of the sender, not by any data passed

**Data:**

    {
        "chat message"
    }

### addToChat
**Sent by:** Server

**Description:** Sendschat message and sender to each client

**Data:**

    {
        name: "playerName",
        msg: "chat message"
    }

## Debug

### evalServer

**Sent by:** Client

**Description:** Sends a javascript command to be executed on the server.
 Note: DEBUG environment variable must be enabled on server
**Data:**

    {
        "javascript code as string ();"
    }

### evalResponse

**Sent by:** Server

**Description:** Sends the result of evalServer to client's log

**Data:**

    {
        <anything>
    }
