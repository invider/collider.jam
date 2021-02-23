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

    col(spec) {
        const parts = []
        for (let i = 0; i < spec.length; i++) {
            const minlen = spec[i]
            const val = arguments[i + 1]

            let len = 0
            if (val !== undefined) {
                const sval = '' + val
                parts.push(sval)

                // pad column to minlen
                len = sval.length
                while (len < minlen) {
                    len ++
                    parts.push(' ')
                }
            }
        }
        const str = parts.join('')
        this.raw(str)
    },
}

module.exports = {
    fun: fun,
    off: fun.off,

    raw:    fun.raw,
    trace:  fun.trace,
    debug:  fun.debug,
    out:    fun.out,
    err:    fun.err,
    error:  fun.error,
    warn:   fun.warn,
    fatal:  fun.error,
    dump:   fun.dump,
    col:    fun.col,
}
