'use strict'

const log = require('./log')
const fs = require('fs-extra')

module.exports = function() {
    const content = fs.readFileSync(module.path + '/../res/help.txt')
    const text = content.toString('utf-8')
    log.raw(text.trim())
}
