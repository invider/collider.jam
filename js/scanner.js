'use strict'

const fs = require('fs-extra')
const _ = require('underscore')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const flow = require('./flow')

const TAG = 'scanner'

let logLevel = 2

let scans = 0
let lastUnits

function trace(msg) {
    if (logLevel < 2) return
    log.trace(msg, TAG)
}

function debug(msg) {
    if (logLevel === 0) return
    log.debug(msg, TAG)
}

function warn(msg) {
    if (logLevel < 2) return
    log.warn(msg, TAG)
}

function isIgnored(path) {
    if (!env.scanMap.ignorePaths) return false

    for (let i = 0; i < env.scanMap.ignorePaths.length; i++) {
        const ipath = env.scanMap.ignorePaths[i]
        const irex = new RegExp(ipath)
        if (irex.test(path)) return true
    }
    return false
    /*
    return (path.endsWith('.DS_Store')
        || path.includes('.git')
        || path.endsWith('.out'))
    */
}

function listFiles(unitPath, path, unit, onFile) {
    if (isIgnored(path)) {
        trace('ignoring X ' + lib.addPath(unitPath, path), TAG)
        return
    } else {
        trace('scanning ' + lib.addPath(unitPath, path), TAG)
    }

    fs.readdirSync(lib.addPath(unitPath, path)).forEach(entry => {
        const localPath = lib.addPath(path, entry)
        const fullPath = lib.addPath(unitPath, localPath)
        const lstat = fs.lstatSync(fullPath)


        // check on directory
        if (lstat.isDirectory()) {
            listFiles(unitPath, localPath, unit, onFile)
        } else {
            if (isIgnored(localPath)) {
                trace('          X ' + localPath + ' (ignored)')
            } else {
                if (onFile) {
                    onFile(localPath, fullPath, lstat, unit)
                } else {
                    trace('          ? ' + localPath)
                }
            }
        }
    })
}

function loadOptionalJson(path) {
    if (fs.existsSync(path)) {
        trace('loading json: ' + path)
        return fs.readJsonSync(path)
    }
}

function loadOptionalList(path) {
    if (fs.existsSync(path)) {
        trace('loading list: ' + path)
        const data = fs.readFileSync(path, 'utf8')
        const list = data.split(/\r?\n/g)
                .map(e => e.trim())
                .filter(e => e.length > 0)
                .filter(e => !e.startsWith('#'))
        return list
    } else {
        return []
    }
}

function loadOptionalUnitConfig(path) {
    const config = loadOptionalJson(path)
    if (config) {
        debug('extending global config with: ' + path, TAG)
        _.extendOwn(env.config, config)
    }
}

function scanPackageDependencies(mix, packageJson) {
    if (!packageJson || !_.isObject(packageJson.dependencies)) return
    let ls = []
    Object.keys(packageJson.dependencies).forEach(d => {
        if (d.endsWith('mix') || d.endsWith('mod') || d.endsWith('fix')) {
            if (d !== mix) ls.push(d)
        }
    })
    return ls.length > 0? ls : undefined
}

const Unit = function(id, mix, type, path, requireMix) {
    trace('================================================')
    trace(`found ${type} [${id}]: ${path}`)
    this.id = id
    this.mix = mix
    this.type = type
    this.path = path
    this.requireMix = requireMix
    this.pak = loadOptionalJson(lib.addPath(path, env.pakConfig))
    loadOptionalUnitConfig(lib.addPath(path, 'config.json'))
    this.ignore = loadOptionalList(lib.addPath(path, 'unit.ignore'))

    this.ls = []
    this.diff = []
    this.mtime = {}
    listFiles(path, '', this, (localPath, fullPath, lstat, unit) => {
        unit.ls.push(localPath) 
        unit.mtime[localPath] = lstat.mtimeMs
        trace('          * ' + localPath)
    })

    this.toString = function() {
        let s = 'unit/' + this.type + ' [' + this.id + ']\n'
        s += 'path: ' + this.path + '\n'
        s += this.ls.map(f => '* ' + f).join('\n')
        s += this.ignore.map(f => '- ' + f).join('\n')
        return s
    }
}

const UnitMap = function() {
    this.length = 0
    this.units = {}
    this.opt = {}
    this.map = {}
    this.mix = {}
    this.sample = {}
    this.patch = {}
}

UnitMap.prototype.register = function(unit) {
    let units = this.units
    if (unit.pak && unit.pak.optional) {
        // unit defined as optional
        if (env.scanMap.include
                && env.scanMap.include.includes(unit.id)) {
            debug(`including optional [${unit.id}] according to the config`)

        } else {
            debug(`skipping [${unit.id}]`
                + `- include explicitly in ${env.pakConfig} if needed`)
            units = this.opt
        }
    }

    if (units[unit.id]) {
        //log.dump(env.scanMap)
        warn(`unit [${unit.id}] at: ${unit.path}`)
        warn(`is replacing unit ${this.units[unit.id].path}`)
        warn(`could be a problem with ${env.mapConfig}`)
        warn('figure out if that is what you really want')
        warn(`if not, check [scanner] logs and [${env.scanMap.origin}]`)
        //throw 'unit mapped to [' + unit.id + '] already exists!'
    } else {
        this.length ++
    }

    units[unit.id] = unit

    // map mix to unit
    if (unit.type !== 'pub') {
        if (!this.mix[unit.mix]) this.mix[unit.mix] = []
        this.mix[unit.mix].push(unit.id)
    }
}

UnitMap.prototype.registerSample = function(sample) {
    // TODO what to do with possible name collisions?
    this.sample[sample.name] = sample
    this.sample[sample.id] = sample
}

UnitMap.prototype.registerPatch = function(patch) {
    // TODO what to do with possible name collisions?
    this.patch[patch.name] = patch
    this.patch[patch.id] = patch
}

UnitMap.prototype.generateMap = function() {
    const __ = this

    Object.values(this.units).forEach(unit => {

        if (unit.requireMix) {
            // resolve requirements from the mix
            unit.require = []
            unit.requireMix.forEach(mixId => {
                const mixUnits = __.mix[mixId]
                if (mixUnits) unit.require = unit.require.concat(mixUnits)
            })
        }

        // only mods and fixes are added to the map
        if (unit.type !== 'pub') {
            const unitMap = {
                type: unit.type,
                mix: unit.mix,
                require: unit.require,
                ls: unit.ls,
                ignore: unit.ignore,
            }
            __.map[unit.id] = _.extendOwn(unitMap, unit.pak)
        }
    })

    return this
}

UnitMap.prototype.forEach = function(fn) {
    Object.values(this.units).forEach(fn)
}

function includePath(units, mix, fullPath, entry, requireMix) {
    if (entry.endsWith('.pub') || entry === 'pub') {
        units.register(new Unit(mix, mix, 'pub', fullPath, requireMix))
    } else if (entry.endsWith('.fix') || entry === 'fix') {
        units.register(new Unit(lib.addPath(mix, entry), mix, 'fix', fullPath, requireMix))
    } else if (entry.endsWith('.mod') || entry === 'mod') {
        units.register(new Unit(lib.addPath(mix, entry), mix, 'mod', fullPath, requireMix))
    } else if (entry.endsWith('.sample')) {
        units.registerSample({
            id: lib.addPath(mix, entry),
            name: entry.substring(0, entry.length-7),
            mix: mix,
            type: 'sample',
            path: fullPath,
        })
    } else if (entry.endsWith('.patch')) {
        units.registerPatch({
            id: lib.addPath(mix, entry),
            name: entry.substring(0, entry.length-6),
            mix: mix,
            type: 'patch',
            path: fullPath,
        })
    } else if (entry === '') {
        units.register(new Unit(lib.addPath(mix, entry), mix, 'mod', fullPath, requireMix))
    }
}

const scanMix = function(units, path, mix) {
    if (!mix) mix = ''

    const packageJson = loadOptionalJson(lib.addPath(path, 'package.json'))
    const requireMix = scanPackageDependencies(mix, packageJson)

    fs.readdirSync(path).forEach(entry => {
        const fullPath = lib.addPath(path, entry)
        
        const lstat = fs.lstatSync(fullPath)
        if (lstat.isDirectory()) {
            includePath(units, mix, fullPath, entry, requireMix)
        }
    })
}

let scanModules = function(units, path) {
    try {
        fs.readdirSync(path).forEach(entry => {
            let fullPath = lib.addPath(path, entry)

            let lstat = fs.lstatSync(fullPath)
            if (lstat.isDirectory() || lstat.isSymbolicLink()) {
                if (entry.endsWith('.mix')) {
                    trace('================================================')
                    trace('found a mix: ' + fullPath)

                    // TODO dev/release includes should be configurable
                    if (env.config.release
                            && fullPath.includes('dev.mix')) {
                        trace('ignoring for release: ' + fullPath)
                    } else {
                        scanMix(units, fullPath, entry)
                    }
                }
            }
        })

        // also scan for mods and fixes
        scanMix(units, path)

    } catch (e) {
        log.error(e, TAG)
    }
}

function tryToReadScanMap(path, defaultScanMap) {
    const scanMap = lib.readOptionalJson(path, undefined,
            () => debug(`found ${env.mapConfig} at: ${path}`))
    if (scanMap) {
        scanMap.origin= path
        return scanMap
    } else {
        return defaultScanMap
    }
}

function augmentArray(target, source, name) {
    const tar = target[name] || []
    if (source[name]) {
        target[name] = tar.concat(source[name])
    }
}

function replaceArray(target, source, name) {
    if (source[name]) {
        target[name] = source[name]
    }
}

function remap(path, scanMap) {
    const remap = lib.readOptionalJson(path, undefined,
            () => debug(`found ${env.remapConfig} at: ${path}`))
    if (remap) {
        //lib.augment(scanMap, remap)
        replaceArray(scanMap, remap, 'units')
        replaceArray(scanMap, remap, 'mixes')
        replaceArray(scanMap, remap, 'modules')
        replaceArray(scanMap, remap, 'include')
        replaceArray(scanMap, remap, 'ignore')
        replaceArray(scanMap, remap, 'ignorePaths')
    }
}

function determineScanMap() {
    if (env.sketch) {

        if (env.mode === env.MOD_MODE) {
            debug('running in sketch mod mode')
        } else {
            debug('running in sketch mix mode')
        }

        // set sketch mod defaults
        // can be redefined later
        env.scanMap = lib.augment({}, env.sketchScanMap)

        log.debug('MODULES: ' + env.jamModules)
        if (env.jamModules) {
            env.scanMap.modules.push(env.jamModules)
        } else {
            log.warn("Can't determine collider.jam module path.")
            log.warn(`Set the path manually in modules: [] section by creating ./${env.mapConfig}.`)
        }

    } else {
        debug('running in package mode')
        env.scanMap = lib.augment({}, env.defaultScanMap)
    }

    // try to read default unit structure from jam
    const jpath = lib.addPath(env.jamPath, env.mapConfig)
    env.scanMap = tryToReadScanMap(jpath, env.scanMap)
    /*
    env.scanMap = lib.readOptionalJson(jpath, env.scanMap,
            () => debug(`using ${env.mapConfig} from: ${jpath}`))
    */

    // try to read unit structure from local project
    env.scanMap = tryToReadScanMap(env.mapConfig, env.scanMap)
    remap(env.jamPath + '/' + env.remapConfig, env.scanMap)
    remap(env.remapConfig, env.scanMap)
    //env.scanMap = lib.readOptionalJson(env.mapConfig, env.scanMap,
    //        () => debug(`using local ./${env.mapConfig}`))

    if (env.sketch) {
        if (!env.scanMap.mixes) env.scanMap.mixes = []
        env.scanMap.mixes.push(env.jamPath)

        if (env.mode === env.MIX_MODE) {
            env.scanMap.mixes.push('./')
        }

    } else {
        if (!env.scanMap.mixes) env.scanMap.mixes = []
        env.scanMap.mixes.push('')
    }

    return env.scanMap
}

function dumpScanMap() {
    const map = env.scanMap
    debug('=======================')
    debug('|         MAP         |')
    debug('=======================')
    if (map.modules && map.modules.length > 0) {
        debug('=== module paths ===')
        map.modules.forEach(path => debug(`* [${path}]`))
    }
    if (map.mixes && map.mixes.length > 0) {
        debug('=== mixes paths ===')
        map.mixes.forEach(path => debug(`* [${path}]`))
    }
    if (map.units && map.units.length > 0) {
        debug('=== units included ===')
        map.units.forEach(path => debug(`* [${path}]`))
    }

    if (map.include && map.include.length > 0) {
        debug('=== include ===')
        map.include.forEach(path => debug(`* [${path}]`))
    }

    if (map.ignore && map.ignore.length > 0) {
        debug('=== ignore ===')
        map.ignore.forEach(path => debug(`* [${path}]`))
    }

    if (map.ignorePaths && map.ignorePaths.length > 0) {
        debug('=== ignore paths ===')
        map.ignorePaths.forEach(path => debug(`* [${path}]`))
    }
}

function scanUnits() {
    lib.verifyBaseDir()
    const base = env.baseDir

    const scanMap = determineScanMap()
    debug(`using ${env.mapConfig} from: [${scanMap.origin}]`)

    trace('scanning environment for collider.jam units...')
    dumpScanMap()
    const units = new UnitMap()

    if (_.isArray(scanMap.modules)) scanMap.modules.forEach(path => {
        if (path === undefined) return
        debug(`looking for units in [${path}]`)
        scanModules(units, lib.formPath(base, path))
    })

    if (_.isArray(scanMap.mixes)) scanMap.mixes.forEach(path => {
        if (path === undefined) return
        debug(`looking for units in mix [${path}]`)
        scanMix(units, lib.formPath(base, path))
    })

    if (_.isArray(scanMap.units)) scanMap.units.forEach(path => {
        if (path === undefined) return
        debug(`including unit: [${path}]`)
        const fullPath = lib.formPath(base, path)
        const i = fullPath.lastIndexOf('/')
        let entry = fullPath
        if (i >= 0) {
            entry = fullPath.substring(i+1)
        }

        includePath(units, '', fullPath, entry)
    })

    if (env.sketch && env.mode === env.MOD_MODE) {
        // need to include manually,
        // since ./ is remapped to /mod
        trace('================================================')
        debug(`map patch: including sketch mod at [./]`)
        includePath(units, '', './', 'mod')
    }

    debug('units found: ' + units.length)
    lastUnits = units

    scans ++
    if (scans === 1) logLevel = 0

    return units
}

function syncUnit(unit) {
    listFiles(unit.path, '', unit,
        function (path, fullPath, lstat, unit) {
            // TODO replace with actual ignore config
            if (path.endsWith('.DS_Store')) return

            const lastTime = unit.mtime[path]

            if (!lastTime || lstat.mtimeMs > lastTime) {
                // we've got updated file here!
                log.trace('[sync] ' + fullPath)
                unit.mtime[path] = lstat.mtimeMs
                unit.diff.push(path)
                flow.notify(`${unit.id}:${unit.path}:${path}`)
            }
            if (!lastTime) {
                // got a new file! register and notify
                unit.ls.push(path) 
            }
            // TODO add actual ignore config
        }
    )

    /*
    unit.ls.forEach(path => {
        const fullPath = lib.addPath(unit.path, path)
        const lstat = fs.lstatSync(fullPath)
        const lastTime = unit.mtime[path]
        if (lstat.mtimeMs > lastTime) {
            // we've got updated file here!
            log.trace('[sync] ' + fullPath, TAG)
            unit.mtime[path] = lstat.mtimeMs
            unit.diff.push(path)
            flow.notify(`${unit.id}:${unit.path}:${path}`)
        }
    })
    */
}

function syncUnits() {
    Object.values(lastUnits.units).forEach(u => syncUnit(u))
}

module.exports = {

    // scan collider project structure
    scan: function() {
        return scanUnits().generateMap()
    },

    sync: function() {
        if (!lastUnits) this.scan()
        syncUnits()
    },

    // scan a single unit structure
    rescanUnit: function(unit) {
        const map = {}
        const u = new Unit(unit.id, unit.type, unit.path, unit.require)
        map[u.id] = {
            type: u.type,
            mix: u.mix,
            pak: u.pak,
            require: unit.require,
            ls: u.ls,
        }
        return map
    },

    printUnits: function() {
        const unitMap = scanUnits()

        Object.values(unitMap.units).forEach(unit => {
            log.raw("[" + unit.type + "] - '"
                + unit.id + "': "
                + unit.path
                + ` [${unit.ls.length} files]`)
        })

        Object.values(unitMap.opt).forEach(unit => {
            log.raw(" X [" + unit.type + "] - '"
                + unit.id + "': "
                + unit.path
                + ` [${unit.ls.length} files] (skipped)`)
        })
    },

    printFiles: function() {
        const unitMap = scanUnits()

        Object.values(unitMap.units).forEach(unit => {
            log.raw("[" + unit.type + "] - '" + unit.id + "': " + unit.path)

            unit.ls.forEach(f => log.raw('* ' + f))
            unit.ignore.forEach(f => log.raw('- ' + f))
        })
    }, 
}
