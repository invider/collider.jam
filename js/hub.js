'use strict'

const express = require('express');
const env = require('./env')
const log = require('./log')
const scanner = require('./scanner')
const packager = require('./packager')
const lib = require('./lib')

const TAG = 'hub'

let scannedUnits

let start = function() {
    let app = express();

    log.debug('starting collider.jam hub...', TAG)

    if (!lib.isBaseDir(env.baseDir)) {
        log.debug('not a base - trying to locate the project base directory...')
        lib.lookupBaseDir()
    }
    env.scanMap = lib.readOptionalJson(env.unitsConfig, env.scanMap)
    scannedUnits = scanner.scan(env.baseDir, env.scanMap)
    packager.pack(env.baseDir, env.outDir, scannedUnits)

    scannedUnits.forEach(u => {
        let unitPath = lib.addPath(env.base, u.id)
        log.debug('mounting ' + unitPath + ' -> ' + u.path, TAG)

        app.use(unitPath, express.static(u.path))
        u.url = unitPath
    })

    if (env.dynamic) {

        env.config.dynamic = true
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
    }

    app.get('/stat', function(req, res) {
        res.json(hub.state());
    });

    app.listen(env.port);
    log.out('--- Listening at http://localhost:' + env.port + ' ---', TAG);
}

module.exports = {
    start: start,
}
