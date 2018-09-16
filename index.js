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
            socket.emit('vmlist', db[data.username].vms);
        }
    });

    socket.on('addvm', function (data) {
        console.log("addvm: " + JSON.stringify(data));
        if (true) { //verify?
            addVM(data.baseImage, data.dataHash, data.name, data.auth);
        }
    });

    socket.on('updatevm', function (data) {
        console.log("updatevm: " + JSON.stringify(data));
        updateVM(data.name, data.auth, data.hash);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

});

http.listen(80, function () {
    console.log("Listening on *:80");
});

function verifyUser(object) {

    if (!db.hasOwnProperty(object.username)) return false;
    console.log("verify: " + db[object.username].password + " " + object.password);

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

function addVM(baseImageLink, dataHash, name, auth) {
    db[auth.username].vms.push({
        hash: dataHash,
        base_image: baseImageLink,
        name: name
    });
    console.log("vmafter: " + JSON.stringify(db[auth.username]));
    fs.writeFile('data.json', JSON.stringify(db), function (err) {
        if (err) return console.log(err);
        console.log("File was saved!");
    });
}

function updateVM(name, auth, hash) {
    console.log("updatevm " + name + " " + hash);
    for (let i in db[auth.username].vms) {
        let vm = db[auth.username].vms[i];
        if (vm.name == name) {
            db[auth.username].vms[i].hash = hash;
            console.log("updatedvm");
            break;
        }
    }
}
