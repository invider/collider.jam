'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const scanner = require('./scanner')
const { bootstrap } = require('./bootstrap')

const TAG = 'init'

function listSamples() {
    env.headless = true
    env.globalMode = true
    const scannedUnits = scanner.scan()

    log.raw('Available init samples:')
    let width = 0
    scannedUnits.sampleList.forEach(sample => {
        if (sample.name.length > width) width = sample.name.length
    })
    scannedUnits.sampleList.forEach(sample => {
        if (sample.title) {
            log.raw(` * ${sample.name} - ${sample.title}`)
        } else {
            log.raw(` * ${sample.name}`)
        }
        log.raw(`          id: ${sample.id}`)
        log.raw(`        path: ${sample.path}`)
        log.raw('')
        //console.dir(sample)
    })
}

module.exports = function() {
    try {
        let bname
        if (env.params.length > 0) {
            bname = env.params[0]
        }
        if (bname === 'ls' || bname === 'list' || bname === 'help') {
            listSamples()
            return
        }

        const base = './'
        const realPath = fs.realpathSync(base)
        const name = lib.getResourceName(realPath)
        env.name = name

        if (fs.existsSync(base + 'package.json')) {
            log.fatal("can't init the project - package.json already exists!", TAG)
            return
        }

        log.out(`Generating project [${name}]...`, 'init')

        log.out('Generating package.json...')
        const packageJson = {
            name: name,
            version: '0.0.1',
            description: 'collider.jam game project',
            scripts: {
                start: 'node ./node_modules/collider.jam/jam.js',
            },
            dependencies: {
              "collider.jam": "https://github.com/invider/collider.jam.git",
              "collider.mix": "https://github.com/invider/collider.mix.git",
              "collider-boot.mix": "https://github.com/invider/collider-boot.mix.git",
              "collider-dev.mix": "https://github.com/invider/collider-dev.mix.git",
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
