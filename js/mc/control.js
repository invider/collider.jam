'use strict'

const log = require('../log')
const env = require('../env')

const TAG = 'mc'

function Session(ws) {
    this.ws = ws
    this.id = ws.id
    this.user = 'user #' + this.id
}
Session.prototype.send = function(msg) {
    this.ws.send(msg)
}

const chat = {
    session: {},

    log: [],

    cmd: {
        'log': function(session, w) {
            // replay chat history
            chat.log.forEach(m => {
                session.send('[' + m.user + ']: ' + m.msg)
            })
        },
        'user': function(session, w) {
            const user = w[1]
            if (user) {
                // lookup if already exists
                let exists = false
                Object.values(chat.session).forEach(s => {
                    if (s && s.user === user) exists = true
                })

                if (exists) {
                    session.send('user [' + user + '] already exists!')
                    log.debug('session #' + session.id + ' user [' + user + '] already exists!')
                } else {
                    session.user = user
                    session.send('setting user as [' + user + ']')
                    log.debug('session #' + session.id + ' user: [' + user + ']')
                }
            } else {
                session.send('user name is expected!')
            }
        },
        'who': function(session, w) {
            let list = ''
            Object.values(chat.session).forEach(s => {
                if (!s) return
                if (s.user === session.user) list += s.user + ' (you)\n'
                else list += s.user + '\n'
            })
            session.send('users online:\n' + list)
        },
        'whoami': function(session, w) {
            session.send(session.user)
        },
        'help': function(session, w) {
            session.send('available commands: \n'
                + '    #log - show full chat log\n'
                + '    #user <name> - set user name\n'
                + '    #help - this message'
            )
        },
    },

    createSession: function(ws) {
        this.session[ws.id] = new Session(ws)
        log.debug('[mc] session #' + ws.id + ' is open')
    },

    closeSession: function(id) {
        this.session[id] = undefined
        log.debug('[mc] session #' + id + ' is closed')
    },

    command: function(session, msg) {
        const w = msg.substring(1).split(' ')
        if (w.length === 0) return

        const name = w[0]
        const fn = this.cmd[name]
        
        if (fn) {
            fn(session, w)
        } else {
            session.send('unknown command [' + name + ']')
            log.debug('session #' + session.id + ' unknown command: [' + name + ']')
        }
    },

    broadcast: function(id, msg) {
        const session = this.session[id]
        if (!session) {
            log.warn('no session #' + id)
            return
        }

        if (msg.startsWith('#')) {
            this.command(session, msg)
        } else {
            this.log.push({
                time: Date.now(),
                user: session.user,
                msg: msg
            })

            msg = '[' + session.user + ']: ' + msg
            Object.values(this.session).forEach(s => {
                if (s && id !== s.id) {
                    s.send(msg)
                }
            })
        }
    },
}

module.exports = {

    start: function(hub, app) {
        log.out('starting mission control at http://localhost:' + env.port, TAG)

        // websocket endpoint
        let user = 1
        app.ws('/chat', function(ws, req) {
            ws.id = user++
            chat.createSession(ws)

            ws.on('message', function(msg) {
                log.debug('[mc] #' + ws.id + ': ' + msg, TAG)
                ws.send('')
                chat.broadcast(ws.id, msg)
            });

            ws.on('close', () => {
                chat.closeSession(ws.id)
            })
        })
    }
}
