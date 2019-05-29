'use strict'

const express = require('express')
const env = require('./env')
const log = require('./log')
const scanner = require('./scanner')
const packager = require('./packager')
const lib = require('./lib')
const control = require('./mc/control')

const TAG = 'hub'

let start = function() {

    const app = express()
    const wss = require('express-ws')(app);
    app.use(express.json())

    log.out('=== COLLIDER.JAM ===')
    log.out('version: ' + env.version) 
    log.out('====================')
    log.debug('starting collider.jam hub...', TAG)

    if (!lib.isBaseDir(env.baseDir)) {
        log.debug('not a base - trying to locate the project base directory...')
        lib.lookupBaseDir()
    }

    // add local folder to paths and require extentions
    module.paths.push('./')
    module.paths.push('./node_modules')

    env.scanMap = lib.readOptionalJson(env.unitsConfig, env.scanMap)
    let scannedUnits = scanner.scan(env.baseDir, env.scanMap)
    packager.pack(env.baseDir, env.outDir, scannedUnits)

    if (env.dynamic) {
        env.config.dynamic = true

        // mount units
        scannedUnits.forEach(u => {
            let unitURL = lib.addPath(env.base, u.id)
            log.debug('mounting ' + unitURL + ' -> ' + u.path, TAG)

            app.use(unitURL, express.static(u.path))
            u.url = unitURL
        })

        app.get(env.base + env.configPath, function(req, res) {
            res.json(env.config)
        })

        app.get('*/' + env.unitsPath, function(req, res) {
            let unitId = req.path.substring(0, req.path.length - env.unitsPath.length - 1)
            unitId = unitId.substring(env.base.length)
            log.debug('building map for unit [' + unitId + ']', TAG)

            if (unitId === '' || unitId === '/') {
                let units = scanner.scan(env.baseDir, env.scanMap)
                res.json(units.map)
            } else {
                // find unit's real path before the scan
                // TODO are we looking for mixes or units or both here?
                let unit = scannedUnits.units[unitId]
                if (unit) {
                    let map = scanner.rescanUnit(unit)
                    res.json(map)
                } else {
                    res.status(404).send('unit [' + unitId + '] not found!')
                }
            }
        })

        app.get('units.debug', function(req, res) {
            let map = scanner.scan(env.baseDir, env.scanMap)
            res.json({
                units: map.units,
                mix: map.mix,
            })
        })

    } else {
        log.out('serving only static package!')
        env.config.dynamic = false

        let localPath = lib.addPath(env.baseDir, env.outDir)

        log.debug('mounting ' + env.base + ' -> ' + localPath, TAG)
        app.use(env.base, express.static(localPath)) // mount to root
    }

    // try to launch mission control
    if (env.mc) {
        control.start(this, app)
    }

    // try to boost
    // TODO check fs on boost availability first
    if (env.hub) {
        const boost = require('hub/boost')
        log.debug('boosting the app', TAG)
        boost(app)
    }

    process.on('uncaughtException', (err) => {
        if (env.debug) {
            log.dump(err)
        } else {
            log.error(err)
        }
        // provide details and hints
        if (err.toString().includes('address already in use')) {
            log.error('looks like the port ' + env.port + ' is occupied by another app')
            log.error('check that collider.jam is not running in another console')
        }
    })

    app.listen(env.port, () => {
        log.out('---Listening at http://localhost:' + env.port + ' ---', TAG);
    })
}

module.exports = {
    start: start,
}
