#!/usr/bin/env node

const env = require('./js/env')
const log = require('./js/log')
const hub = require('./js/hub')
const init  = require('./js/init')
const { bootstrap, patch } = require('./js/bootstrap')
const { generate, clean } = require('./js/packager')
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
        parsedOption = false
    } else if (arg === '-h' || arg === '--hub') {
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

    } else if (arg === '-v' || arg === '--verbose') {
        env.verbose = true
        parsedOption = false

    } else if (arg === '-m' || arg === '--mute') {
        env.mute = true
        log.debug = log.off
        log.trace = log.off
        log.out = log.off
        log.raw = log.off
        log.dump = log.off
        parsedOption = false

    } else if (arg === '-h' || arg === '--help') {
        cmd = 'help'

    } else if (arg === '-v' || arg === '--version') {
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

switch(cmd) {
    case 'version': log.raw(env.version); break;
    case 'run': hub.start(); break;
    case 'play': case 'open': player.play(); break;
    case 'init': init(); break;
    case 'bootstrap': bootstrap(); break;
    case 'patch': patch(); break;
    case 'pack': generate(); break;
    case 'clean': clean(env.params[0]); break;
    case 'help': help(); break;
    default: log.fatal('unknown command: ' + cmd, TAG)
}
