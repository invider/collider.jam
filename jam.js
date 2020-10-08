#!/usr/bin/env node

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

// process args
let cmd = false
const args = process.argv;

let lastOption
let parsedOption = false

for (let i = 2; i < args.length; i++) {
    // TODO -d/--debug -v/--verbose -s/--silent -h/--help options
    let arg = args[i]

    if (arg === '-d' || arg === '--debug') {
        env.debug = true
        env.config.debug = true
        env.flow = true
        env.config.flow = true
        parsedOption = false

    } else if (arg === '-y' || arg === '--types') {
        env.types = true
        parsedOption = false

    } else if (arg === '-f' || arg === '--flow') {
        // TODO make it into a --force flag?
        //      should it be hot reload or something?
        env.flow = true
        env.config.flow = true
        parsedOption = false

    } else if (arg === '-t' || arg === '--test') {
        //parsedOption = false
        parsedOption = true
        lastOption = 'test'
        env.test = true
        env.config.test = true

    } else if (arg === '-b' || arg === '--hub') {
        env.hub = true
        env.config.hub = true
        parsedOption = false

    } else if (arg === '-mc' || arg === '--mission-control') {
        env.mc = true
        parsedOption = false

    } else if (arg === '-p' || arg === '--port') {
        if (++i === args.length) throw 'number is expected after the [' + arg + ']'
        let p = parseInt(args[i])
        if (isNaN(p)) throw 'number is expected after the [' + arg + ']'
        env.port = p
        parsedOption = false

    } else if (arg === '-s' || arg === '--static') {
        env.dynamic = false
        parsedOption = false

    } else if (arg === '-n' || arg === '--pregen') {
        env.dynamic = false
        env.pregen = true
        parsedOption = false

    } else if (arg === '-g' || arg === '--global') {
        env.globalMode = true
        parsedOption = false

    } else if (arg === '-v' || arg === '--verbose') {
        env.verbose = true
        parsedOption = false

    } else if (arg === '-m' || arg === '--mute') {
        // switch off all except warnings and errors
        env.mute = true
        log.trace = log.off
        log.debug = log.off
        log.out = log.off
        log.raw = log.off
        log.dump = log.off
        parsedOption = false

    } else if (arg === '-h' || arg === '--help') {
        cmd = 'help'

    } else if (arg === '--version') {
        cmd = 'version'

    } else if (arg.startsWith('--')) {
        parsedOption = true
        lastOption = arg.substring(2) 
        env.config[lastOption] = true

    } else {
        if (parsedOption) {
            env.config[lastOption] = arg
        } else if (!cmd) {
            cmd = arg
        } else  {
            env.params.push(arg)
        }
        parsedOption = false
    }
}

// apply flags
if (!cmd) cmd = 'run' // run by default
if (!env.debug && !env.verbose) {
    log.debug = log.off
    log.trace = log.off
    log.dump = log.off
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

switch(cmd) {
    case 'version': case 'v': log.raw(env.version); break;
    case 'run': case 'r': hub.start(); break;
    case 'play': case 'open': case 'o': player.play(); break;
    case 'init': case 'i': init(); break;
    case 'bootstrap': bootstrap(); break;
    case 'patch': patch(); break;
    case 'create': case 'new':  case 'n': create(env.params); break;
    case 'pack': case 'p': generate(env.params[0]); break;
    case 'clean': case 'c': clean(env.params[0]); break;
    case 'units': case 'u': printUnits(); break;
    case 'files': case 'f': printFiles(); break;
    case 'help': case 'h': help(env.params[0]); break;
    default: log.fatal('unknown command: ' + cmd, TAG)
}
