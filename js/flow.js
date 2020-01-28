
const TAG = 'flow'
const log = require('./log')

// flow state
let uid = 0
const sockets = {}

function start(app, ws) {
    // websocket endpoint
    app.ws('/flow', function(ws, req) {

        ws.id = ++uid
        sockets[ws.id] = ws
        log.debug(`[ws-${ws.id}] open`)

        ws.on('message', function(msg) {
            log.debug(`[ws-${ws.id}] ${msg}`)
            ws.send(msg);
        })

        ws.on('close', function(code, reason) {
            delete sockets[ws.id]
            log.debug(`[ws-${ws.id}] closed`)
        })
    })
}

function notify(msg) {
    Object.values(sockets).forEach(ws => {
        ws.send(msg)
    })
}

module.exports = {
    start: start,
    notify: notify,
}
