const _   = require('underscore')
const fs  = require('fs-extra')
const env = require('./env')
const lib = require('./lib')
const log = require('./log')

const TAG  = 'loader'
const STAG = 'scanner'

function trace(msg) {
    if (log.level < 2) return
    log.trace(msg, TAG)
}

function strace(msg) {
    if (log.level < 2) return
    log.trace(msg, STAG)
}

function debug(msg) {
    if (log.level === 0) return
    log.debug(msg, TAG)
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

function loadOptionalUnitConfig(unit, path) {
    const config = loadOptionalJson(path)
    if (config) {
        const id = unit.id
        debug('extending unit [${id}] config with: ' + path, TAG)
        env.config[id] = config
    }
}

function loadOptionalRootConfig(unit, path) {
    const config = loadOptionalJson(path)
    if (config) {
        debug('extending root config with: ' + path, TAG)
        _.extendOwn(env.config, config)
    }
}

function isIgnored(path) {
    if (lib.getResourceName(path).startsWith('.')) return true
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
        strace(`==X ${lib.addPath(unitPath, path)} (ignored)`)
        return
    } else {
        strace(`==> ${lib.addPath(unitPath, path)}`)
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
                trace('           X ' + localPath + ' (ignored)')
            } else {
                if (onFile) {
                    onFile(localPath, fullPath, lstat, unit)
                } else {
                    trace('           ? ' + localPath)
                }
            }
        }
    })
}

module.exports = {
    loadOptionalJson,
    loadOptionalList,
    loadOptionalUnitConfig,
    loadOptionalRootConfig,
    listFiles,
}
