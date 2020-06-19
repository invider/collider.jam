const fs = require('fs')
const env = require('./env')
const log = require('./log')
const types = require('./types')

function scan(name, meta, dir) {
    name = name || meta.name

    if (meta.dir) {
        const subDir = {}
        dir[name] = subDir

        const keys = Object.keys(meta.dir)
        if (keys.length === 0) {
            if (meta.type === 'function') dir[name] = 'f'
            else dir[name] = 'p'
        } else {
            keys.forEach(k => {
                const subMeta = meta.dir[k]
                scan(k, subMeta, subDir)
            })
        }
    } else {
        if (meta.type === 'function') dir[name] = 'f'
        else dir[name] = 'p'
    }

    return dir
}

function list(dir) {
    if (!dir) return ''

    let res = ''
    Object.keys(dir).forEach(k => {
        const v = dir[k]
        const type = v === 'f'? 'f' : 'p'
        res += type + ' ' + k + '\n'
    })
    return res
}

function lookup(dir, parts) {
    if (!dir) return ''

    if (!parts || parts.length === 0 || parts[0] === '') {
        return list(dir)
    } else {
        const next = parts[0]
        parts.shift()

        if (!dir[next]) return ''
        return lookup(dir[next], parts)
    }
}

function fillContext(dir) {
    dir._ = dir._$

    // TODO fill context
    dir.ctx = true

    dir.sys = dir._.sys
    dir.lib = dir._.lib
    dir.log = dir._.log
    dir.res = dir._.res
    dir.dna = dir._.dna
    dir.env = dir._.env
    dir.lab = dir._.lab
    dir.mod = dir._.mod
    dir.pub = dir._.pub
    dir.cue = dir._.cue
    dir.job = dir._.job
    dir.trap = dir._.trap
}


module.exports = {

    load: function() {
        log.debug('loading metadata cache...', 'meta')

        const meta = this
        fs.exists(env.metaCache, (exists) => {

            if (exists) {
                fs.readFile(env.metaCache, (err, json) => {
                    if (err) throw err

                    const data = JSON.parse(json)
                    meta.sync(data, true)
                })

            } else {
                log.debug('no metadata cache found')
            }
        })
    },

    save: function(data) {
        const json = JSON.stringify(data)
        fs.writeFile(env.metaCache, json, (err) => {
            if (err) throw err
        })
    },

    sync: function(data, nosave) {
        env.cache.help = data
        types.generate(env.cache.help)
        if (!nosave) this.save(data)

        const map = {
            _$: {},
        }
        Object.keys(data.scene.dir).forEach(k => {
            const meta = data.scene.dir[k]
            scan(k, meta, map._$)
        })
        fillContext(map)

        this.map = map
    },

    autocomplete: function(context, file) {
        if (context === undefined) return ''

        const parts = context.split('.')
        const res = lookup(this.map, parts)
        console.dir(res)
        return res
    },

    definition: function(context, file) {
        const res = [
                    '/home/shock/dna/jam/collider.mix/pub/collider.js 11 4'
        ].join('\n')

        return res
    },
}
