'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const scanner = require('./scanner')
const { execSync } = require('child_process')

const TAG = 'packager'

let pack = function(baseDir, outputDir, units) {
    let outDir = lib.addPath(baseDir, outputDir) + '/'
    if (fs.existsSync(outDir)) {
        // remove output dir first
        log.debug('cleaning up [' + outDir + ']', TAG) 
        fs.removeSync(outDir)
    }
    fs.ensureDirSync(outDir)

    units.forEach(u => {
        log.trace('copying ' + u.path + ' -> ' + lib.addPath(outDir, u.id), TAG)
        fs.copySync(u.path, lib.addPath(outDir, u.id))
    })

    //fs.writeFileSync(outDir + env.unitsPath, JSON.stringify(units.map))
    //fs.writeFileSync(outDir + env.configPath, JSON.stringify(env.config))
    fs.writeJsonSync(outDir + env.unitsPath, units.map, { spaces: '    '})
    fs.writeJsonSync(outDir + env.configPath, env.config, { spaces: '    '} )
}

const generate = function() {
    const base = './'
    const realPath = fs.realpathSync(base)
    const name = lib.getResourceName(realPath)
    env.name = name

    log.debug('generating package [' + name + ']', TAG)

    if (!lib.isBaseDir(env.baseDir)) {
        log.debug('not a base - trying to locate the project base directory...')
        lib.lookupBaseDir()
    }
    env.scanMap = lib.readOptionalJson(env.unitsConfig, env.scanMap)
    let scannedUnits = scanner.scan(env.baseDir, env.scanMap)
    pack(env.baseDir, env.outDir, scannedUnits)

    // TODO running project local scripts here - not good
    //      find out more portable way to create zip/tar
    execSync('./zip ' + name)
    execSync('./tar ' + name)
}

module.exports = {
    pack: pack,
    generate: generate,
}
