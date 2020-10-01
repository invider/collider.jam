'use strict'

const log = require('./log')
const fs = require('fs-extra')

module.exports = function(topic) {
    topic = topic || 'help'

    try {
        const content = fs.readFileSync(`${module.path}/../res/${topic}.txt`)
        const text = content.toString('utf-8')
        log.raw(text.trim())
    } catch (e) {
        log.error(`unable to find topic [${topic}]`)
    }
}
