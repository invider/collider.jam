#!/usr/bin/env node

const env = require('./js/env')
const log = require('./js/log')
const hub = require('./js/hub')
const init  = require('./js/init')
const { bootstrap, patch } = require('./js/bootstrap')
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

    } else if (arg === '-v' || arg === '--verbose') {
        env.verbose = true
        parsedOption = false

    } else if (arg === '-s' || arg === '--silent') {
        env.silent = true
        log.debug = log.off
        log.trace = log.off
        log.out = log.off
        log.raw = log.off
        log.dump = log.off
        parsedOption = false

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

log.out('=== COLLIDER.JAM ===')
log.out('version: 0.0.1 DR1') 
log.out('====================')
log.trace('executing: ' + cmd, TAG)

switch(cmd) {
    case 'run': hub.start(); break;
    case 'play': case 'open': player.play(); break;
    case 'help': help(); break;
    case 'init': init(); break;
    case 'bootstrap': bootstrap(); break;
    default: log.fatal('unknown command: ' + cmd, TAG)
}
