const log = require('./../log')
const lib = require('./../lib')
const env = require('./../env')
const {
    loadOptionalJson,
    loadOptionalUnitConfig,
    loadOptionalRootConfig,
    loadOptionalList,
    listFiles
} = require('./../loader')

const TAG = 'scanner'

function trace(msg) {
    if (log.level < 2) return
    log.trace(msg, TAG)
}

const Unit = function(id, mix, type, path, requireMix, opt) {
    trace('================================================')
    trace(`found a ${type} [${id}]: ${path}`)
    this.id = id
    this.mix = mix
    this.type = type
    this.path = path
    this.requireMix = requireMix
    this.opt = opt
    this.pak = loadOptionalJson(lib.addPath(path, env.pakConfig))
    loadOptionalUnitConfig(this, lib.addPath(path, env.unitConfig))
    loadOptionalRootConfig(this, lib.addPath(path, env.rootConfig))
    this.ignore = loadOptionalList(lib.addPath(path, env.unitIgnore))

    this.ls = []
    this.diff = []
    this.mtime = {}

    if (!opt || !opt.skipScan) {
        listFiles(path, '', this, (localPath, fullPath, lstat, unit) => {
            unit.ls.push(localPath) 
            unit.mtime[localPath] = lstat.mtimeMs
            trace('          * ' + localPath)
        })
    }

    this.addFile = function(localPath) {
        this.ls.push(localPath) 
        this.mtime[localPath] = 1 // TODO probe the file first!
        trace('          + ' + localPath)
    }

    this.toString = function() {
        let s = 'unit/' + this.type + ' [' + this.id + ']\n'
        s += 'path: ' + this.path + '\n'
        s += this.ls.map(f => '* ' + f).join('\n')
        s += this.ignore.map(f => '- ' + f).join('\n')
        return s
    }
}

module.exports = Unit
