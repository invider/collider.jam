const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const help = require('./help')
const fs = require('fs-extra')

const COL = 24
const protoPath = lib.levelUp(module.path) + '/proto'

function expect(val, errorMessage) {
    if (val) return val
    throw (errorMessage || 'parameter is expected')
}

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
    return src.split('<' + key + '>').join(val)
}

function replaceAll(src, macro) {
    if (!src || !macro) return src
    Object.entries(macro).forEach(e => {
        src = replace(src, e[0], e[1])
    })
    return src
}

function touch(path) {
    fs.ensureDir(path)
}

function notExists(path) {
    if (fs.existsSync(path)) {
        if (env.force) {
            log.warn(`path conflict - [${path}] already exists! Force overwrite!`)
        } else {
            throw (`path conflict - [${path}] already exists!`
                + '\nUse [jam new -f] or [jam new force] to override')
        }
    }
}

function write(path, src) {
    log.raw(`==== ${path} ====`)
    log.raw(src)

    fs.writeFileSync(path, src)
}

function cp(source, dest) {
    log.raw(`copying ${source} => ${dest}...`)
    fs.copySync(source, dest)
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
        const dir = lib.getDir(rule.dest)
        switch(rule.action) {
            case 'patch':
                let src = readProto(`${path}/${rule.source}`)
                src = replaceAll(src, macro)
                touch(dir)
                write(rule.dest, src)
                break
            case 'cp':
                touch(dir)
                cp(`${protoPath}/${path}/${rule.source}`, rule.dest)
                break
        }
    })
}

const generators = {

    trap: {
        usage: '<name>',
        head: 'create a trap',
        create: function(params) {
            const macro = {
                'name': expect(params[0], 'trap name is expected'),
            }
            patch('trap', macro)
        }
    },

    'brownian-dot': {
        usage: '<name>',
        head: 'create a brownian-moving dot',
        create: function(params) {
            const macro = {
                'name': expect(params[0], 'entity name is expected'),
            }
            patch('brownian-dot', macro)
        }
    },

    'bouncing-planet': {
        usage: '<name>',
        head: 'create a bouncing planet',
        create: function(params) {
            const macro = {
                'name': expect(params[0], 'entity name is expected'),
            }
            patch('bouncing-planet', macro)
        }
    },

    'class': {
        usage: '<name>',
        head: 'create a sample dna class',
        create: function(params) {
            const name = expect(params[0], 'class name is expected')
            const rest = name.substring(1)

            const macro = {
                'class': name.substring(0, 1).toUpperCase() + rest,
                'obj':   name.substring(0, 1).toLowerCase() + rest,
            }
            patch('sample-class', macro)
        }
    },

    'prototype': {
        usage: '<name>',
        head: 'create a sample dna prototype',
        create: function(params) {
            const name = expect(params[0], 'prototype name is expected')
            const rest = name.substring(1)

            const macro = {
                'prototype': name.substring(0, 1).toUpperCase() + rest,
                'obj':   name.substring(0, 1).toLowerCase() + rest,
            }
            patch('sample-prototype', macro)
        }
    },

    'factory': {
        usage: '<name>',
        head: 'create a sample dna factory',
        create: function(params) {
            const name = expect(params[0], 'factory name is expected')
            const rest = name.substring(1)
            const fname = name.substring(0, 1).toLowerCase() + rest

            const macro = {
                'factory': fname,
            }
            patch('sample-factory', macro)
        }
    },

    'eyes': {
        usage: '',
        head: 'mouse tracking eyes',
        create: function(params) {
            patch('eyes')
        }
    },
}

function tab(s, n) {
    if (!n || n < 0) return s
    for (let i = 0; i < n; i++) s += '.'
    return s
}

function list() {
    Object.entries(generators).forEach(e => {
        let header = e[0] + ' '
        if (e[1].usage) header += e[1].usage + ' '
        header = tab(header, COL - header.length)

        log.raw(header + ' ' + e[1].head)
    })
}

function create(param) {
    let type = param[0]
    param.splice(0, 1)

    if (type === 'f' || type === 'force') {
        env.force = true
        type = param[0]
        param.splice(0, 1)
        console.dir(param)
    }


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
