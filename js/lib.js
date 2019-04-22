'use strict'

const fs = require('fs-extra')
const log = require('./log')
const env = require('./env')

module.exports = {

    addPath: function(base, path) {
        if (!base) return path
        if (base.length >= 1 && !base.endsWith('/')) base += '/'
        return base + path
    },

    readOptionalJson: function(path, defaultJson) {
        if (fs.existsSync(path)) {
            return fs.readJsonSync(path)
        }
        return defaultJson
    },

    isBaseDir: function(path) {
        let baseMarker = false
        let lstat = fs.lstatSync(path)
        if (lstat.isDirectory()) {
            fs.readdirSync(path).forEach(entry => {
                if (entry === env.unitsJson || entry === 'package.json') {
                   baseMarker = true 
                }
            })
        }
        return baseMarker
    },

    lookupBaseDir: function() {
        // move up
        let cwd = process.cwd()
        if (cwd === '/') throw 'Unable to locate the collider.jam project base directory!'

        process.chdir('../')
        cwd = process.cwd()
        log.trace('chdir up to: ' + cwd)

        let isbase = this.isBaseDir(env.baseDir)
        if (isbase) {
            log.debug('found base: ' + cwd)
        } else {
            this.lookupBaseDir()
        }
    },
}
