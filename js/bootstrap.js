'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const scanner = require('./scanner')

function mixSample(name, sample) {
    log.out('mixing sample [' + name + '] from [' + sample.path + ']')

    // extend module paths
    module.paths.push('./')

    // premix
    lib.execIfExists(sample.path + '/premix')
    lib.evalIfExists(sample.path, 'premix.js')

    // mix in the content
    if (fs.existsSync(sample.path + '/mix')) {
        fs.copySync(sample.path + '/mix/', './')
    }

    // mix in dependencies
    const dpPath = sample.path + '/dependencies.json'
    if (fs.existsSync(dpPath)) {
        const dp = fs.readJsonSync(dpPath)
        lib.fixJson('./package.json', (pkg) => {

            if (!pkg.dependencies) pkg.dependencies = {}
            const target = pkg.dependencies

            Object.keys(dp).forEach(k => {
                const v = dp[k]

                if (!target[k]) {
                    console.log('adding dependency "' + k + '": "' + v + '"')
                    target[k] = v
                } else {
                    if (target[k] !== v) {
                        log.warn('existing dependency "'
                            + k + '" conflicts with the sample version')
                        log.warn('"' + target[k] + '" !== "' + v + '"')
                    }
                }
            })

            return pkg
        })
    }

    // postmix
    lib.execIfExists(sample.path + '/postmix')
    lib.evalIfExists(sample.path, 'postmix.js')

    log.out('Updating dependencies...')
    lib.npm.install()
}

module.exports = {

    bootstrap: function() {
        let fromBash = 'false'
        let sample = 'default'

        if (env.params.length > 0) {
            sample = env.params[0]
        }

        log.out(`bootstrapping from [${sample}]`, 'bootstrap')

        env.scanMap = lib.readOptionalJson(env.mapConfig, env.scanMap)
        let scannedUnits = scanner.scan(env.baseDir, env.scanMap)

        let sampleDescr = scannedUnits.sample[sample]

        if (!sampleDescr) {
            log.fatal("bootstrap error - can't find sample [" + sample + "]", 'bootstrap')
            return
        }

        mixSample(sample, sampleDescr)
    },

    patch: function() {
        if (env.params.length === 0) {
            log.fatal('need patch name of id to apply', 'patch')
            return
        }
        let id = env.params[0]

        log.out(`applying patch [${id}]`)

        env.scanMap = lib.readOptionalJson(env.mapConfig, env.scanMap)
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
