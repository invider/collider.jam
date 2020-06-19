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
        else dir[name] = 'fi'
    }

    return dir
}

function list(dir, partial) {
    if (!dir) return ''

    let i = 0
    let res = ''
    Object.keys(dir).forEach(k => {
        if (partial) {
            if (k.startsWith(partial)) {
                const v = dir[k]
                const type = v === 'f'? 'f' : 'fi'
                res += type + ' ' + k + '\n'
                i++
            }

        } else {
            const v = dir[k]
            const type = v === 'f'? 'f' : 'fi'
            res += type + ' ' + k + '\n'
            i++
        }
    })

    //log.debug('found: ' + i)
    return res
}

function lookup(dir, path) {
    if (!dir) return ''

    if (!path || path.length === 0) {
        return list(dir)

    } else {
        const nextDot = path.indexOf('.')
        if (nextDot >= 0) {
            const next = path.substring(0, nextDot)
            const nextPath = path.substring(nextDot+1, path.length)

            if (!dir[next]) return ''
            return lookup(dir[next], nextPath)

        } else {
            return list(dir, path)
        }
    }
}

function fillContext(dir) {
    dir._ = dir._$

    // TODO fill context
    dir.ctx = 'fi'

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

    const alt = dir._.alt
    Object.keys(alt).forEach(k => {
        const v = alt[k]
        dir[k] = v
    })
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

        //log.debug('>>> ' + context)
        const res = lookup(this.map, context)
        return res
    },

    definition: function(context, file) {
        const res = [
                    '/home/shock/dna/jam/collider.mix/pub/collider.js 11 4'
        ].join('\n')

        return res
    },
}
