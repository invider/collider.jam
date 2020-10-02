const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const help = require('./help')
const fs = require('fs-extra')

const COL = 12
const protoPath = `${module.path}/../proto`

function read(path) {
    const content = fs.readFileSync(`${protoPath}/${path}`)
    const source = content.toString('utf-8')
    return source
}

function readProto(name) {
    return read(name + '.pjs')
}

function replace(src, key, val) {
    if (!src) return
    return src.replace('<' + key + '>', val)
}

function replaceAll(src, macro) {
    if (!src) return
    Object.entries(macro).forEach(e => {
        src = replace(src, e[0], e[1])
    })
    return src
}

function touch(path) {
    fs.ensureDir(path)
}

function notExists(path) {
    if (fs.existsSync(path)) throw `path conflict - [${path}] already exists!`
}

function write(path, src) {
    log.raw(`==== ${path} ====`)
    log.raw(src)

    fs.writeFileSync(path, src)
}

function realPath(path, macro) {
    return replaceAll(path, macro)
}

function readRules(path, macro) {
    const src = read(path + '/patch.rules')

    const rules = []
    rules.paths = []

    const lines = src.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .filter(l => !l.startsWith('#') && !l.startsWith('--'))

    lines.forEach(l => {
        const rule = l.split(/\s|\t/).filter(Boolean)
        const path = realPath(rule[2], macro)

        rules.push({
            action: rule[0],
            source: rule[1],
            dest:   path,
        })
        if (path) rules.paths.push(path)
    })
    return rules
}

function verifyPaths(paths) {
    paths.forEach(path => notExists(path))
}

function patch(path, macro) {
    const rules = readRules(path, macro)

    verifyPaths(rules.paths)
    rules.forEach(rule => {
        console.dir(rule)
        switch(rule.action) {
            case 'patch':
                const dir = lib.getDir(rule.dest)
                let src = readProto(path + '/' + rule.source)
                src = replaceAll(src, macro)
                touch(dir)
                write(rule.dest, src)
                break
        }
    })
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

            notExists(path)
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

            notExists(path)
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

            const macro = {
                'class': cname,
                'obj':   oname,
            }
            patch('sample-class', macro)
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
