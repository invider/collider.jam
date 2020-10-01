const env = require('./env')
const log = require('./log')
const help = require('./help')
const fs = require('fs-extra')

const COL = 12

function readProto(name) {
    const content = fs.readFileSync(`${module.path}/../res/proto/${name}.pjs`)
    const source = content.toString('utf-8')
    return source
}

function replace(src, key, val) {
    return src.replace('<' + key + '>', val)
}

function touch(path) {
    fs.ensureDir(path)
}

function write(path, src) {
    log.raw(`==== ${path} ====`)
    log.raw(src)

    fs.writeFileSync(path, src)
}

const generators = {

    trap: {
        head: 'create a trap',
        create: function(params) {
            const name = params[1]
            if (!name) throw 'trap name is expected'

            const dir = './trap'
            const path = `${dir}/${name}.js`
            const src = replace(readProto('trap'), 'name', name)

            touch(dir)
            write(path, src)
        }
    },

    'brownian-dot': {
        head: 'create a brownian-moving dot',
        create: function(params) {
            const name = params[1]
            if (!name) throw 'entity name is expected'

            const dir = './lab'
            const path = `${dir}/${name}.js`
            const src = readProto('brownian-dot')

            touch(dir)
            write(path, src)
        }
    },

    'class': {
        head: 'create a sample dna class',
        create: function(params) {
            let cname = params[1]
            if (!cname) throw 'class name is expected'
            const rest = cname.substring(1)
            cname = cname.substring(0, 1).toUpperCase() + rest
            let oname = cname.substring(0, 1).toLowerCase() + rest

            // create dna
            let dir = './dna'
            let path = `${dir}/${cname}.js`
            let src = replace(readProto('sample-class/Dna'), 'class', cname)
            touch(dir)
            write(path, src)

            // create lab .spawn.js
            dir = './lab'
            path = `${dir}/${oname}.spawn.js`
            src = replace(readProto('sample-class/lab.spawn'), 'class', cname)
            src = replace(src, 'name', oname)
            touch(dir)
            write(path, src)
        }
    },
}

function tab(s, n) {
    if (!n || n < 0) return s
    for (let i = 0; i < n; i++) s += ' '
    return s
}

function list() {
    Object.entries(generators).forEach(e => {
        const name = tab(e[0], COL - e[0].length)
        const head = e[1].head
        log.raw(name + ' ' + head)
    })
}

function create(param) {
    const type = param[0]

    if (!type) {
        log.error('entity type MUST be specified!')
    } else if (type === 'help' || type === 'h') {
        help('new')
    } else if (type === 'list' || type === 'ls' || type === 'l') {
        list()
    } else {
        const gen = generators[type]
        if (!gen) {
            log.error(`unknown object type [${type}]! Run [jam new list] for available options`)
        } else {
            try {
                gen.create(param)
            } catch (e) {
                log.error(e)
            }
        }
    }
}

module.exports = create
