'use strict'

const open = require('open')
const request = require('request')
const env = require('./env')
const log = require('./log')
const hub = require('./hub')

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

    isHubStarted: async function() {
        const url = 'http://localhost:' + env.port + env.base
        log.debug('checking hub server at ' + url + '...')
        const res = await this.testUrl('http://localhost:' + env.port + env.base)

        log.debug('hub server status: [' + res + ']')
        return res === 'online'
    },

    open: function(url) {
        open(url)
    },

    play: async function() {
        // check the server
        let hubOnline = await this.isHubStarted()
        if (!hubOnline) {
            log.out('collider.jam hub server seems to be offline - starting...')

            let open = this.open
            setTimeout(function() {
                log.out('opening browser at http://localhost:' + env.port)
                open('http://localhost:' + env.port)
            }, 3000)

            hub.start()

        } else {
            log.out('opening browser at http://localhost:' + env.port)
            this.open('http://localhost:' + env.port)
        }
    },
}
