'use strict'

const express = require('express')
const env = require('./env')
const log = require('./log')
const scanner = require('./scanner')
const packager = require('./packager')
const flow = require('./flow')
const lib = require('./lib')
const control = require('./mc/control')

const TAG = 'hub'

function start() {

    const app = express()
    const ws = require('express-ws')(app);
    app.use(express.json({ limit: '4mb' }))

    log.out('=== COLLIDER.JAM ===')
    log.out('version: ' + env.version) 
    log.out('====================')
    log.debug('starting collider.jam hub...', TAG)

    // fix module paths
    module.paths.push('./')
    module.paths.push('./node_modules')

    const unitsMap = scanner.scan()

    /*
    // add local folder to paths and require extentions
    module.paths.push('./')
    module.paths.push('./node_modules')

    env.scanMap = lib.readOptionalJson(env.unitsConfig, env.scanMap)
    let unitsMap = scanner.scan(env.baseDir, env.scanMap)
    */

    // TODO figure out do we really need that in some scenarios?
    if (env.config.cors) {
        log.debug('Allowing cross-origin access')
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Accept')
            next()
        })
    }


    if (env.dynamic) {
        env.config.dynamic = true

        // mount units
        let rootFlag = false
        unitsMap.forEach(u => {
            let unitURL = lib.addPath(env.base, u.id)
            log.debug('mounting ' + unitURL + ' -> ' + u.path, TAG)

            if (unitURL === '/') rootFlag = true
            app.use(unitURL, express.static(u.path))
            u.url = unitURL
        })
        if (!rootFlag) {
            log.error('===========================================================', TAG)
            log.error('No root path mounted! Could be a trouble with units.config!', TAG)
            log.error('===========================================================', TAG)
        }

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
                let unit = unitsMap.units[unitId]
                if (unit) {
                    let map = scanner.rescanUnit(unit)
                    res.json(map)
                } else {
                    res.status(404).send('unit [' + unitId + '] not found!')
                }
            }
        })

        app.get('/units.debug', function(req, res) {
            log.out('units debug')
            let map = scanner.scan(env.baseDir, env.scanMap)
            res.json({
                units: map.units,
                mix: map.mix,
            })
        })

        app.post('/help/sync', function(req, res) {
            // handle help data
            log.debug('receiving help data from the client...')
            //console.dir(req.body)

            env.cache.help = req.body

            res.status(200).send('done')
        })

        app.get('/help/data', function(req, res) {
            if (env.cache.help) {
                res.json(env.cache.help)
            } else {
                res.status(404).send('No help data')
            }
        })

    } else {
        log.out('serving only static package!')
        env.config.dynamic = false
        packager.pack(env.baseDir, env.outDir, unitsMap)

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
        boost(app, env)
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

    if (env.flow) flow.start(app, ws)
    startSyncMonitor()
}

function startSyncMonitor() {
    const syncTime = 2000
    const syncTimeS = Math.round(syncTime/1000)
    log.debug(`running sync every ${syncTimeS}s...`, TAG)

    setInterval(() => {
        scanner.sync()
    }, syncTime)
}


module.exports = {
    start: start,
}
