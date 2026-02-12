'use strict'

const open = require('open')
const request = require('request')
const env = require('./env')
const log = require('./log')
const srv = require('./srv')

module.exports = {

    testUrl: function(url) {
        return new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                if (error) {
                    resolve('not available')
                } else if (response.statusCode !== 200) {
                    resolve('not available')
                } else {
                    resolve('online')
                }
            })
        })
    },

    isServerStarted: async function() {
        const url = 'http://localhost:' + env.port + env.base
        log.debug('checking collider.jam server at ' + url + '...')
        const res = await this.testUrl('http://localhost:' + env.port + env.base)

        log.debug('collider.jam server status: [' + res + ']')
        return res === 'online'
    },

    open: function(url) {
        open(url)
    },

    play: async function() {
        // check the server
        let serverOnline = await this.isServerStarted()
        if (!serverOnline) {
            log.out('collider.jam server seems to be offline - starting...')

            let open = this.open
            setTimeout(function() {
                log.out('opening browser at http://localhost:' + env.port)
                open('http://localhost:' + env.port)
            }, 3000)

            srv.start()

        } else {
            log.out('opening browser at http://localhost:' + env.port)
            this.open('http://localhost:' + env.port)
        }
    },

    man: function(topic) {
        env.debug = true
        env.config.debug = true
        env.flow = true
        env.config.flow = true
        env.config.man = topic || true

        this.play()
    },
}
