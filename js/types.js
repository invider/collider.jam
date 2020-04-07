'use strict'

const fs = require('fs-extra')
const log = require('./log')
const env = require('./env')

const TAG = '[types]'
const TAB = '    '

let buf

function isId(id) {
    const res = id.match(/^[a-zA-Z_][a-zA-Z0-9_$]*$/)
    if (res) return true
    else return false
}

function print(txt) {
    buf += txt
}

function println(txt) {
    buf += txt + '\n'
}

function shift(level) {
    for (let i = 0; i < level; i++) print(TAB)
}

function scope(dir) {
    Object.values(dir).forEach(m => {
        if (m.type === 'function') {
            if (m.data && m.data.usage) {
                println(`function ${m.name}`
                    + `(): any {}`)
            } else {
                println(`function ${m.name}`
                    + `(): any {}`)
            }
        }
    })
}

function node(meta, path) {
    if (!meta) return

    let name = meta.name
    let def = meta.name

    if (!path) {
        path = name
        def = 'var ' + name

    } else {
        if (!isId(name)) path = path + "['" + name +  "']"
        else path = path + '.' + name
        def = path
    }

    if (meta.type === 'object') {
        println(`${def} = <any>{}`)

        if (meta.dir) {
            Object.values(meta.dir).forEach(e => {
                node(e, path)
            })
        }

    } else if (meta.type === 'function') {
        println(`${def} = function(): any {}`)
    } else {
        println(`${def} = 1`)
    }
}

function flat(meta, level) {
    if (!meta) return

    let name = meta.name
    let def = meta.name
    level = level || 0

    if (!level) {
        // top-level declaration
        def = 'var ' + name

    } else {
        if (!isId(name)) name = `'${name}'`
        def = `${name}: `
    }

    if (meta.type === 'object') {
        if (!level) {
            println(`${def} = <any>{`)
        } else {
            shift(level)
            println(`${def} {`)
        }

        if (meta.dir) {
            Object.values(meta.dir).forEach(e => {
                shift(level)
                flat(e, level + 1)
            })
        }
        if (level) {
            shift(level)
            println('},')
        } else {
            println('}')
        }

    } else if (meta.type === 'function') {
        if (level) {
            shift(level)
            println(`${def} function(): any {},`)
        } else {
            println(`${def} = function(): any {}`)
        }
    } else {
        if (level) {
            shift(level)
            println(`${def} 1,`)
        } else {
            println(`${def} = 1`)
        }
    }
}

function generate(meta) {
    if (!env.types) return
    log.debug(TAG, `generating ${env.typesMeta}`)
    
    buf = ''
    println('//\n// autogenerated type definitions\n//')
    scope(meta.scene.dir.alt.dir)

    
    println('\n// root mod')
    flat(meta.scene)

    println('\n// local context')
    flat(meta.scene.dir.sys)
    flat(meta.scene.dir.lib)
    flat(meta.scene.dir.res)
    flat(meta.scene.dir.dna)
    flat(meta.scene.dir.env)
    flat(meta.scene.dir.lab)
    flat(meta.scene.dir.mod)
    flat(meta.scene.dir.pub)
    flat(meta.scene.dir.cue)
    flat(meta.scene.dir.job)
    flat(meta.scene.dir.trap)

    fs.writeFile(env.typesMeta, buf, () => {
        log.debug(TAG, `./${env.typesMeta} is generated`)
    })
}

module.exports = {
    generate,
}
