'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const { bootstrap } = require('./bootstrap')

const TAG = 'init'

module.exports = function() {
    try {
        const base = './'
        const realPath = fs.realpathSync(base)
        const name = lib.getResourceName(realPath)
        env.name = name

        if (fs.existsSync(base + 'package.json')) {
            log.fatal("can't init the project - package.json is already exists!", TAG)
            return
        }

        log.out(`Generating project [${name}]`, 'init')

        log.out('Generating package.json...')

        const packageJson = {
            name: name,
            version: '0.0.1',
            description: 'collider.jam game project',
            scripts: {
                start: 'node ./node_modules/collider.jam/jam.js',
            },
            dependencies: {
              "collider.jam": "git+ssh://git@hub.ikhotin.com:/var/git/collider.jam.git",
              "collider.mix": "git+ssh://git@hub.ikhotin.com:/var/git/collider.mix.git",
              "collider-boot.mix": "git+ssh://git@hub.ikhotin.com:/var/git/collider-boot.mix.git",
              "collider-lib.mix": "git+ssh://git@hub.ikhotin.com:/var/git/collider-lib.mix.git",
              "collider-ext.mix": "git+ssh://git@hub.ikhotin.com:/var/git/collider-ext.mix.git",
            },
        }
        fs.writeJsonSync('./package.json', packageJson, { spaces: '    ' })

        log.out('Installing dependencies...')
        lib.npm.install()

        // copy bash boot script
        fs.copySync('./node_modules/collider.jam/jam', './jam')

        // set 0766
        fs.chmodSync('./jam', 7*8*8 + 6*8 + 6)

        // bootstrap
        bootstrap()

    } catch (err) {
        log.fatal("can't init the project! " + err, TAG)
    }
}
