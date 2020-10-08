'use strict'

const fs = require('fs-extra')
const log = require('./log')
const env = require('./env')

module.exports = function(topic) {
    topic = topic || 'help'

    try {
        const content = fs.readFileSync(`${env.jamPath}/res/${topic}.txt`)
        const text = content.toString('utf-8')
        log.raw(text.trim())
    } catch (e) {
        log.error(`unable to find topic [${topic}]`)
    }
}
