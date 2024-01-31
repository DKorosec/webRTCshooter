class PeerClient {
    constructor(onDataCallback = function () { }) {
        this.ID = null;
        this.connections = {};
        this.peer = new Peer();
        this._onDataCallback = onDataCallback;
        this._CONNECTING_TO = {};
        this.MAX_MS_DEAD = 5000;
    }
    start(callback = function () { }) {
        this.peer.on('open', id => this._onOpen(id, callback));
        this.peer.on('connection', connection => this._onConnection(connection));
    }

    connect(id, callback = function () { }) {
        if (this._CONNECTING_TO[id] || this.connections[id])
            return callback();
        this._CONNECTING_TO[id] = true;
        var connection = this.peer.connect(id);
        connection.on('open', () => {
            delete this._CONNECTING_TO[id];
            connection.LAST_TIME_ALIVE = +new Date();
            this.connections[connection.peer] = connection;
            callback();
        })
        connection.on('data', data => this._onData(data));
    }

    connectAll(ids) {
        for (let id of ids) {
            this.connect(id);
        }
    }

    broadCast(data, onDeadClient = null) {

        let t_now = +new Date();
        for (let conn_id in this.connections) {
            let conn = this.connections[conn_id];
            if (conn.peerConnection.signalingState == "closed" || t_now - conn.LAST_TIME_ALIVE > this.MAX_MS_DEAD) {
                conn.on('data', () => { });
                conn.close();
                delete this.connections[conn_id];
                if (onDeadClient)
                    onDeadClient(conn_id);
            } else if (conn.peerConnection.signalingState == "stable") {
                conn.send({ id: this.ID, data: data });
            }
        }
    }

    _onOpen(id, callback) {
        this.ID = id;
        callback();
        console.log(`client ${this.ID} up and running`);
    }

    _onData(data) {
        let sender = this.connections[data.id];
        if (sender)
            sender.LAST_TIME_ALIVE = +new Date();
        //console.log("client", this.ID, "recieved", data);
        this._onDataCallback(data);
    }
    _onConnection(connection) {
        connection.on('data', data => this._onData(data));
        connection.LAST_TIME_ALIVE = +new Date();
        this.connections[connection.peer] = connection;
    }

}
