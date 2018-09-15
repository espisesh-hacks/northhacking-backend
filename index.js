const Server = require('socket.io');
const io = new Server();
const IPFS = require('ipfs');
const node = new IPFS();
var fs = require('fs');

console.log("Starting IPD backend...");

let db = {
    "username": {
        password: "password",
        vms: [
            {
                hash: "duhh",
                base_image: "link"
            }
        ]
    }
};

fs.readFile(('data.json', 'utf8', function (err, contents) {
    db = JSON.parse(contents);
}));

io.on('connection', function (socket) {
    socket.emit("connected");
});

io.on('login', function (data) {
    socket.emit(verifyUser(data));
});

io.on('register', function (data) {
    createUser(data.username, data.password);
});

io.on('vmlist', function (data) {
    if (verifyUser(data)) {
        return db[data.username].vms;
    }
});

io.on('addvm', function (data) {
    if (verifyUser(data.auth)) {
        addVM(data.baseImage, data.dataHash, data.auth);
    }
});

server.listen(80);

function verifyUser(object) {
    if (db['username'].password == object.password) {
        return true;
    }
    return false;
}

function createUser(username, password) {
    db[username] = {
        password: password,
        vms: []
    }
    fs.writeFile('data.json', JSON.stringify(db), 'utf8');
}

function addVM(baseImageLink, dataHash, auth) {
    db[auth.username].vms.push({
        hash: dataHash,
        base_image: baseImageLink
    })
    fs.writeFile('data.json', JSON.stringify(db), 'utf8');
}
