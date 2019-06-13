'use strict'

const fs = require('fs-extra')
const _ = require('underscore')
const log = require('./log')
const lib = require('./lib')

const TAG = 'scanner'

const mixMap = {}

function listFiles(unitPath, path) {
    let ls = []
    //log.trace('scanning ' + lib.addPath(unitPath, path), TAG)

    fs.readdirSync(lib.addPath(unitPath, path)).forEach(entry => {
        const localPath = lib.addPath(path, entry)
        const fullPath = lib.addPath(unitPath, localPath)
        const lstat = fs.lstatSync(fullPath)
        // check on directory
        if (lstat.isDirectory()) {
            ls = ls.concat(listFiles(unitPath, localPath))
        } else {
            // TODO add actual ignore config
            if (!localPath.endsWith('.DS_Store')) {
                log.trace('          * ' + localPath)
                ls.push(localPath) 
            }
        }
    })
    return ls
}

function loadOptionalJson(path) {
    if (fs.existsSync(path)) {
        log.trace('loading : ' + path, 'scanner')
        return fs.readJsonSync(path)
    }
}

function loadOptionalList(path) {
    if (fs.existsSync(path)) {
        log.trace('loading : ' + path, 'scanner')
        const data = fs.readFileSync(path, 'utf8')
        const list = data.split(/\r?\n/g)
            .filter(e => e.trim().length > 0)
            .filter(e => !e.trim().startsWith('#'))
        return list
    }
}

function scanPackageDependencies(packageJson) {
    if (!packageJson || !_.isObject(packageJson.dependencies)) return
    let ls = []
    Object.keys(packageJson.dependencies).forEach(d => {
        if (d.endsWith('mix') || d.endsWith('mod') || d.endsWith('fix')) {
            ls.push(d)
        }
    })
    return ls.length > 0? ls : undefined
}

const Unit = function(id, mix, type, path, requireMix) {
    log.trace('found ' + type + ' [' + id + ']: ' + path, TAG)
    this.id = id
    this.mix = mix
    this.type = type
    this.path = path
    this.requireMix = requireMix
    this.pak = loadOptionalJson(lib.addPath(path, 'pak.json'))
    this.ignore = loadOptionalList(lib.addPath(path, 'jam.ignore'))
    this.ls = listFiles(path, '')
}

const UnitMap = function() {
    this.length = 0
    this.units = {}
    this.map = {}
    this.mix = {}
    this.sample = {}
    this.patch = {}
}

UnitMap.prototype.register = function(unit) {
    if (this.units[unit.id]) throw 'unit mapped to [' + unit.id + '] already exists!'

    this.length ++
    this.units[unit.id] = unit

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

let scanMix = function(units, path, mix) {
    if (!mix) mix = ''

    const packageJson = loadOptionalJson(lib.addPath(path, 'package.json'))
    const require = scanPackageDependencies(packageJson)

    fs.readdirSync(path).forEach(entry => {
        const fullPath = lib.addPath(path, entry)
        
        const lstat = fs.lstatSync(fullPath)
        if (lstat.isDirectory()) {
            if (entry.endsWith('.pub') || entry === 'pub') {
                units.register(new Unit(mix, mix, 'pub', fullPath, require))
            } else if (entry.endsWith('.fix') || entry === 'fix') {
                units.register(new Unit(lib.addPath(mix, entry), mix, 'fix', fullPath, require))
            } else if (entry.endsWith('.mod') || entry === 'mod') {
                units.register(new Unit(lib.addPath(mix, entry), mix, 'mod', fullPath, require))
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
            }
        }
    })
}

let scanModules = function(units, path) {
    try {
        fs.readdirSync(path).forEach(entry => {
            let fullPath = lib.addPath(path, entry)

            let lstat = fs.lstatSync(fullPath)
            if (lstat.isDirectory() || lstat.isSymbolicLink()) {
                if (entry.endsWith('.mix')
                        || entry.endsWith('.mod')
                        || entry.endsWith('.fix')) {
                    log.debug('found a mix: ' + fullPath, TAG)
                    scanMix(units, fullPath, entry)
                }
            }
        })
    } catch (e) {
        log.error(e, TAG)
    }
}

module.exports = {

    // scan collider project structure
    scan: function(base, scanMap) {
        log.debug('scanning environment for collider.jam units...', TAG)
        let units = new UnitMap()

        _.isArray(scanMap.mixes)? scanMap.mixes.forEach(path => {
            scanModules(units, lib.addPath(base, path))
        }) : false

        _.isArray(scanMap.units)? scanMap.units.forEach(path => {
            scanMix(units, lib.addPath(base, path))
        }) : false

        log.debug('units found: ' + units.length, TAG)
        return units.generateMap()
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
}
