'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')

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

        log.out(`bootstrapping from [${sample}]`)

        // TODO scan for bootstrap samples
        fs.copySync('./node_modules/collider-boot.mix/init/' + sample, './')

        //console.dir(env)
    },

    patch: function() {
    },

}
