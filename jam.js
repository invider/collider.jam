#!/usr/bin/env node

const env = require('./js/env')
const log = require('./js/log')
const hub = require('./js/hub')
const help = require('./js/help')
const player = require('./js/player')

const TAG = 'jam'


// process args
let cmd = false
const args = process.argv;
for (let i = 2; i < args.length; i++) {
    // TODO -d/--debug -v/--verbose -s/--silent -h/--help options
    let arg = args[i]

    if (arg === '-d' || arg === '--debug') {
        env.debug = true
    } else if (arg === '-v' || arg === '--verbose') {
        env.verbose = true
    } else if (arg === '-s' || arg === '--silent') {
        env.silent = true
        log.debug = log.off
        log.trace = log.off
        log.out = log.off
        log.raw = log.off
        log.dump = log.off

    } else {
        if (!cmd) {
            cmd = arg
        } else  {
            log.error("can't handle argument: " + arg + '!', TAG)
            process.exit(12)
        }
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
    default:
        log.error('unknown command: ' + cmd + '!', TAG)
        process.exit(11)
}
