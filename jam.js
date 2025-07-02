#!/usr/bin/env node

const args = require('./js/args')
const env = require('./js/env')
const log = require('./js/log')
const hub = require('./js/hub')
const init  = require('./js/init')
const create = require('./js/create')
const { bootstrap, patch } = require('./js/bootstrap')
const { generate, clean } = require('./js/packager')
const { printUnits, printFiles } = require('./js/scanner')
const help = require('./js/help')
const player = require('./js/player')

const TAG = 'jam'

let cmd = args()

// apply flags
if (!cmd) cmd = 'run' // run by default
if (!env.debug && !env.verbose) {
    log.debug = log.off
    log.trace = log.off
    log.dump = log.off
}

// short commands - execute and exit, no need to setup environment for these
switch(cmd) {
    case 'version': case 'v':
        if (env.verbose) {
            log.raw(`${env.poweredBy} - ${env.version} - ${env.releaseName} - ${env.releaseDate}`)
        } else {
            log.raw(env.version)
        }
        return
}

// determine collider.jam node modules base
const hubPath = require.resolve('./js/hub.js')
const jamPath = hubPath.substring(0, hubPath.length - 10)

env.jamPath = jamPath
if (env.jamPath) {
    log.debug('collider.jam path: ' + env.jamPath)
} else {
    log.warn("can't determine collider.jam module path!")
}
// TODO the right way is to scan all available paths
env.jamModules = module.paths[0]

// core commands
switch(cmd) {
    case 'run': case 'r': hub.start(); break;
    case 'play': case 'open': case 'o': player.play(); break;
    case 'man': case 'm': player.man(env.params[0]); break;
    case 'init': case 'i': init(); break;
    case 'bootstrap': bootstrap(); break;
    case 'patch': patch(); break;
    case 'create': case 'new':  case 'n': create(env.params); break;
    case 'pack': case 'p': generate(env.params[0]); break;
    case 'clean': case 'c': clean(env.params[0]); break;
    case 'ca': clean('all'); break;
    case 'units': case 'u': printUnits(); break;
    case 'files': case 'f': printFiles(); break;
    case 'help': case 'h': help(env.params[0]); break;
    default: log.fatal('unknown command: ' + cmd, TAG)
}
