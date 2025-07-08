'use strict'

const fs = require('fs-extra')
const log = require('./log')
const env = require('./env')
const { execSync } = require('child_process')

const TAG = 'lib'

const isObj = function(o) {
    return (o && typeof o === 'object' && !Array.isArray(o))
}
const isObject = function(o) {
    return (o && typeof o === 'object' && !Array.isArray(o))
}
const isFun = function(f) {
    return !!(f && f.constructor && f.call && f.apply)
}
const isFunction = function(f) {
    return !!(f && f.constructor && f.call && f.apply)
}
const isClass = function(f) {
    return (f && typeof f === 'function' && /^\s*class\s+/.test(f.toString()))
}
const isStr = function(s) {
    return toString.call(s) == "[object String]"
}
const isString = function(s) {
    return toString.call(s) == "[object String]"
}
const isNum = function(s) {
    return toString.call(s) == "[object Number]"
}
const isNumber = function(s) {
    return (toString.call(s) == "[object Number]" && !Number.isNaN(s))
}
const isTypedArr = function(a) {
    const TypedArray = Object.getPrototypeOf(Uint8Array)
    return (a instanceof TypedArray)
}
const isArr = function(a) {
    return (Array.isArray(a) || isTypedArr(a))
}
const isArray = function(a) {
    return (Array.isArray(a) || isTypedArr(a))
}
const isContainer = function(o) {
    return isObj(o) || isArr(o) || isFun(o)
}
const isEmpty = function(o) {
    if (!o) return true
    if (isObj(o)) {
        for (let prop in o) {
            if (o.hasOwnProperty(prop)) return false
        }
        return true

    } else if (isArr(o)) {
        return o.length === 0
    }
    return false
}

module.exports = {

    isObj,
    isObject,
    isFun,
    isFunction,
    isClass,
    isStr,
    isString,
    isNum,
    isNumber,
    isTypedArr,
    isArr,
    isArray,
    isContainer,
    isEmpty,

    addPath: function(base, path) {
        if (!base) return path
        if (!path) return base
        //if (path.startsWith(base)) return path
        if (base.length >= 1 && !base.endsWith('/')) base += '/'

        if (base === './') {
            if (path.startsWith('/')) return path
            // check for Windows absolute path
            if (/[a-zA-Z]:.*/.test(path)) return path
        }
        return base + path
    },

    formPath: function(base, path) {
        if (!base) return path
        if (!path) return base
        if (base.length >= 1 && !base.endsWith('/')) base += '/'

        if (base === './') {
            if (path.startsWith('/')) return path

            // check for Windows absolute path
            if (/[a-zA-Z]:.*/.test(path)) return path
        }
        return base + path
    },

    getResourceName: function(path) {
        return path.replace(/^.*[\\\/]/, '')
    },

    getDir: function(path) {
        if (path.endsWith('/')) return path.substring(0, path.length - 1)
        const i = path.lastIndexOf('/')
        if (i < 0) return './'
        return path.substring(0, i)
    },

    levelUp: function(path) {
        if (!path) return ''
        if (path.endsWith('/')) path = path.substring(0, path.length - 1)
        const i = path.lastIndexOf('/')
        if (i < 0) return './'
        return path.substring(0, i)
    },

    readOptionalJson: function(path, defaultJson,
                                onSuccess, onMissing) {
        if (fs.existsSync(path)) {
            const data = fs.readJsonSync(path)
            if (data && onSuccess) onSuccess()
            return data
        }
        if (onMissing) onMissing()
        return defaultJson
    },

    probeBaseDir: function(path) {
        let packageMarker = false
        let modMarker = false
        let mixMarker = false

        let lstat = fs.lstatSync(path)
        if (lstat.isDirectory()) {
            const realpath = fs.realpathSync(path)

            // figure out if we are inside a mod or a mix
            if (realpath.endsWith('mod')) {
                modMarker = env.modMarker = true
            } else if (realpath.endsWith('mix')) {
                mixMarker = env.mixMarker = true
            }

            // figure out if we are inside a package
            fs.readdirSync(path).forEach(entry => {
                if (entry === env.unitsJson || entry === 'package.json') {
                   packageMarker = env.packageMarker = true 
                }
            })
        }

        let base = false

        if (packageMarker) {
            base = {
                mode: env.PACKAGE_MODE,
                path: path,
            }
        } else if (modMarker) {
            base = {
                mode: env.MOD_MODE,
                path: path,
            }
            env.sketch = true
        } else if (mixMarker) {
            base = {
                mode: env.MIX_MODE,
                path: path,
            }
            env.sketch = true
        }
        return base 
    },

    lookupBaseDir: function() {
        // move up
        let cwd = process.cwd()
        if (cwd === '/') {
            throw 'Unable to locate the collider.jam project base directory!\n'
                + '  Try "jam init" to create a project in current directory.\n'
                + '  Run "jam help" for additional information'
        }

        process.chdir('../')
        cwd = process.cwd()
        log.trace('chdir up to: ' + cwd)

        let base = this.probeBaseDir(env.baseDir)
        if (base) {
            log.debug('found base: ' + cwd)
            return base

        } else {
            return this.lookupBaseDir()
        }
    },

    verifyBaseDir: function() {
        let base = this.probeBaseDir(env.baseDir)

        if (env.monoLab) {
            env.sketch = true
            env.mode = base.mode
            if (env.mode === env.PACKAGE_MODE) {
                this.verifyModules()
            }
            return
        }

        if (!base) {
            log.debug('not a base - trying to locate the project base directory...')
            base = this.lookupBaseDir()
        }

        env.mode = base.mode
        if (env.mode === env.PACKAGE_MODE) {
            this.verifyModules()
        }
    },

    verifyModules: function() {
        if (!fs.existsSync('./node_modules')) {
            log.out('Installing modules...')
            this.npm.install()
        }
    },

    npm: {
        install: function(module) {
            if (module) {
                try {
                    const res = execSync('npm install ' + module)
                } catch (err) {
                    if (env.debug) {
                        log.dump(err)
                    }
                    log.fatal('unable to install module [' + module + ']')
                    return
                }
            } else {
                const res = execSync('npm install')
            }
        },

        update: function() {
            const code = execSync('npm update')
        },
    },

    execIfExists: function(path) {
        if (fs.existsSync(path)) {
            log.debug('executing ' + path, TAG)
            try {
                execSync(path, {
                    stdio: 'inherit',
                    env: env.config,
                })
            } catch (err) {
                log.error('unable to execute [' + path + ']: ' + err, TAG)
            }
        }
    },

    evalIfExists: function(path, script) {
        const target = this.addPath(path, script)
        if (fs.existsSync(target)) {
            log.debug('evaluating ' + target, TAG)
            if (!module.paths.includes(path)) module.paths.push(path)
            const fn = require(script)
        }
    },

    fixJson: function(path, fn) {
        if (fs.existsSync(path)) {
            const origContent = fs.readJsonSync(path)
            const fixedContent = fn(origContent)
            fs.writeJsonSync(path, fixedContent, { spaces: '    ' })
        } else {
            throw `[${path}] doesn't exist`
        }
    },

    augment: function(mixin) {
       if (!mixin) mixin = {}
       if (!isContainer(mixin)) throw new Error('a target container is expected!')

       for (let arg = 1; arg < arguments.length; arg++) {
           const source = arguments[arg]
           if (source && source !== mixin) {
               if (isFun(mixin.augment) && mixin.augment !== augment) {
                   mixin.augment(source)
               } else {
                   for (let prop in source) {
                       if (prop !== '_' && prop !== '__' && prop !== '___' && prop !== '_$') {
                           if (isObj(mixin[prop]) && isObj(source[prop])) {
                               // property is already assigned - augment it
                               if (mixin !== source[prop]) augment(mixin[prop], source[prop])
                           } else {
                               const val = source[prop]
                               if (isArr(val)) {
                                   mixin[prop] = val.slice() // shallow array copy
                               } else {
                                   mixin[prop] = val
                               }
                           }
                       }
                   }
               }
               if (isFun(source.onAugment)) {
                   source.onAugment.call(mixin)
               }
           }
       }
       return mixin
    }

}
