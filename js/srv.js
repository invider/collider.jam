var net = require('net');
var express = require('express');
var app = express();
var ws = require('express-ws')(app);

var hub = require('./hub/scene');

// static http
app.use(express.static('pub'));

app.get('/stat', function(req, res) {
    res.json(hub.state());
});
app.listen(8888);

// websocket endpoint
app.ws('/echo', function(ws, req) {

    ws.on('open', function() {
        console.log('[ws] open')
    })

    ws.on('message', function(msg) {
        console.log('[ws] ' + msg)
        ws.send(msg);
    });
});


// socket server
var log = function(who, what) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    console.log('[%s on %s]', who, what, args);
  };
};

var echo = function(socket) {
  socket.on('end', function() {
    console.log('[end]');
  });
  socket.on('data', function(data) {
    console.log('[data]', data);
    var res = hub.post(socket.remoteAddress + ':' + socket.remotePort, data)
    socket.write(res, 'utf-8')
  });
  socket.on('timeout', log('socket', 'timeout'));
  socket.on('drain', function() {
    console.log('[drain]');
  });
  socket.on('error', log('socket', 'error'));
  socket.on('close', log('socket', 'close'));
};

var server = net.createServer(echo);
server.listen(7777); 

server.on('listening', function() {
  var ad = server.address();
  if (typeof ad === 'string') {
    console.log('[server on listening] %s', ad);
  } else {
    console.log('[server on listening] %s:%s using %s', ad.address, ad.port, ad.family);
  }
});

server.on('connection', function(socket) {
  server.getConnections(function(err, count) {
    console.log('%d open connections!', count);
  });
});

server.on('close', function() { console.log('[close]'); });

server.on('err', function(err) { 
  console.log(err);
  server.close(function() { console.log("shutting down the server!"); });
});

