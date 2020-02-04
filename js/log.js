'use strict'

let logFun = function(prefix, fun) {
    return function(msg, tag) {
        tag = tag? '[' + tag + '] ' : ''
        fun(prefix + (new Date()).toISOString() + ' - ' + tag + msg)
    }
}

let fun = {
    off: function() {},
    raw: console.log,
    trace: logFun(': ', console.log),
    debug: logFun('. ', console.log),
    out: logFun('> ', console.log),
    warn: logFun('? ', console.error),
    err: logFun('! ', console.error),
    error: logFun('! ', console.error),

    fatal: function(msg, tag) {
        tag = tag? '[' + tag + '] ' : ''
        fun('!!! ' + (new Date()).toISOString() + ' - ' + tag + msg)
        process.exit(1)
    },

    dump: function(obj) {
        process.stdout.write('# ' + (new Date()).toISOString() + ': ')
        console.dir(obj)
    },
}

module.exports = {
    fun: fun,
    off: fun.off,

    raw: fun.raw,
    trace: fun.trace,
    debug: fun.debug,
    out: fun.out,
    err: fun.err,
    error: fun.error,
    fatal: fun.error,
    dump: fun.dump,
}
