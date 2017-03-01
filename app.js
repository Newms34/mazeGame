var express = require('express'),
    http = require('http'),
    app = express(),
    routes = require('./routes'),
    path = require('path'),
    bodyParser = require('body-parser'),
    session = require('client-sessions');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(session({
    cookieName: 'session', // cookie name dictates the key name added to the request object
    secret: 'ea augusta est et carissima', // should be a large unguessable string
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    ephemeral: false, // when true, cookie expires when the browser closes
    httpOnly: true, // when true, cookie is not accessible from javascript
    secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
}));
app.use('/', routes);
var server = http.Server(app);
var io = require('socket.io')(server);
var names = [];
io.on('connection', function(socket) {
    socket.on('movData', function(movObj) {
        //first, if we dont have this name already, reg it
        if (names.indexOf(movObj.n) == -1) {
            names.push(movObj.n);
        }
        console.log('movement!', movObj); //update time
        io.emit('movOut', movObj);
    });
    socket.on('chkName', function(name) {
        //this is the user on the front end-desktop attempting to claim a phone 'username'. 
        //If we've got it in the database, go ahead and send that name to desktop. Otherwise, send false
        console.log('name', name.n, names)
        if (names.indexOf(name.n) != -1) {
            io.emit('chkNameRes', { n: name.n })
        } else {
            io.emit('chkNameRes', { n: false })
        }
    })
});
server.listen(process.env.PORT || 8080);
server.on('error', function(err) {
    console.log('Oh no! Err:', err)
});
server.on('listening', function(lst) {
    console.log('Server is listening!')
});
server.on('request', function(req) {
    console.log(req.body);
})

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('Client (probly) err:', err)
    res.send('Error!' + err)
});
