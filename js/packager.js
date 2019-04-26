'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')

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

module.exports = {
    pack: pack,
}
