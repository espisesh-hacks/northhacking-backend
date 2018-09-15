const Server = require('socket.io');
let http = require('http').Server();
const io = new require('socket.io')(http);
const fs = require('fs');

console.log("Starting IPD backend...");

let db = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log(JSON.stringify(db));

io.on('connection', function (socket) {
    console.log("connected");
    socket.on('login', function (data) {
        console.log("login: " + JSON.stringify(data));
        socket.emit("login", verifyUser(data));
    });

    socket.on('register', function (data) {
        console.log("register: " + JSON.stringify(data));
        createUser(data.username, data.password);
    });

    socket.on('vmlist', function (data) {
        console.log("vmlist: " + JSON.stringify(data));
        if (verifyUser(data)) {
            return db[data.username].vms;
        }
    });

    socket.on('addvm', function (data) {
        console.log("addvm: " + JSON.stringify(data));
        if (verifyUser(data.auth)) {
            addVM(data.baseImage, data.dataHash, data.auth);
        }
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

});

http.listen(80, function () {
    console.log("Listening on *:80");
});

function verifyUser(object) {
    console.log("verify: " + db['username'].password + " " + object.password);

    if (!db.hasOwnProperty(object.username)) return false;

    if (db[object.username].password == object.password) {
        return true;
    }
    return false;
}

function createUser(username, password) {
    db[username] = {
        password: password,
        vms: []
    };
    fs.writeFile('data.json', JSON.stringify(db), function (err) {
        if (err) return console.log(err);
        console.log("File was saved!");
    });
}

function addVM(baseImageLink, dataHash, auth) {
    db[auth.username].vms.push({
        hash: dataHash,
        base_image: baseImageLink
    });
    fs.writeFile('data.json', JSON.stringify(db), function (err) {
        if (err) return console.log(err);
        console.log("File was saved!");
    });
}
