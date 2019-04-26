'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const scanner = require('./scanner')

module.exports = {

    bootstrap: function() {
        let fromBash = 'false'
        let sample = 'default'

        if (env.params.length > 0) {
            if (env.params.length > 1 && env.params[0] === 'init') {
                fromBash = true
                env.params.splice(1)
            }
            sample = env.params[0]
        }

        log.out(`bootstrapping from [${sample}]`, 'bootstrap')

        env.scanMap = lib.readOptionalJson(env.unitsConfig, env.scanMap)
        let scannedUnits = scanner.scan(env.baseDir, env.scanMap)

        let sampleDescr = scannedUnits.sample[sample]

        if (!sampleDescr) {
            log.fatal("bootstrap error - can't find sample [" + sample + "]", 'bootstrap')
            return
        }

        log.debug('copying sample [' + sample + '] from [' + sampleDescr.path + ']')
        fs.copySync(sampleDescr.path + '/', './')
    },

    patch: function() {
        if (env.params.length === 0) {
            log.fatal('need patch name of id to apply', 'patch')
            return
        }
        let id = env.params[0]

        log.out(`applying patch [${id}]`)

        env.scanMap = lib.readOptionalJson(env.unitsConfig, env.scanMap)
        let scannedUnits = scanner.scan(env.baseDir, env.scanMap)

        let patch = scannedUnits.patch[id]

        if (!patch) {
            log.fatal("can't find patch [" + id + "]", 'patch')
            return
        }

        // TODO handle file conflicts with existing content
        log.debug('copying from [' + patch.path + ']', 'patch')
        fs.copySync(patch.path + '/', './')
    },

}
