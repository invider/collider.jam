'use strict'

const fs = require('fs-extra')
const log = require('./log')
const env = require('./env')
const { execSync } = require('child_process')

const TAG = 'lib'

const isObj = function(o) {
    return !!(o && typeof o === 'object')
}
const isFun = function(f) {
    return !!(f && f.constructor && f.call && f.apply)
}
const isString = function(s) {
    return toString.call(s) == "[object String]"
}
const isNumber = function(s) {
    return toString.call(s) == "[object Number]"
}
const isArray = function(a) {
    return Array.isArray(a)
}

module.exports = {

    addPath: function(base, path) {
        if (!base) return path
        if (!path) return base
        if (path.startsWith(base)) return path
        if (base.length >= 1 && !base.endsWith('/')) base += '/'
        return base + path
    },

    formPath: function(base, path) {
        if (!base) return path
        if (!path) return base
        if (base.length >= 1 && !base.endsWith('/')) base += '/'

        if (base === './' && path.startsWith('/')) return path
        return base + path
    },

    getResourceName: function(path) {
        return path.replace(/^.*[\\\/]/, '')
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

    checkBaseDir: function(path) {
        let packageMarker = false
        let modMarker = false
        let mixMarker = false

        let lstat = fs.lstatSync(path)
        if (lstat.isDirectory()) {
            const realpath = fs.realpathSync(path)

            // figure out if we are inside a mod or a mix
            if (realpath.endsWith('mod')) {
                modMarker = true
            } else if (realpath.endsWith('mix')) {
                mixMarker = true
            }

            // figure out if we are inside a package
            fs.readdirSync(path).forEach(entry => {
                if (entry === env.unitsJson || entry === 'package.json') {
                   packageMarker = true 
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
                + 'Try "jam init" to create a project in current directory.\n'
                + 'Run "jam help" for additional information'
        }

        process.chdir('../')
        cwd = process.cwd()
        log.trace('chdir up to: ' + cwd)

        let base = this.checkBaseDir(env.baseDir)
        if (base) {
            log.debug('found base: ' + cwd)
            return base

        } else {
            return this.lookupBaseDir()
        }
    },

    verifyBaseDir: function() {
        let base = this.checkBaseDir(env.baseDir)
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

    augment: function() {
        let mixin = arguments[0]
        if (!isObj(mixin) && !isFun(mixin)) mixin = {}

        for (let arg = 1; arg < arguments.length; arg++) {
            const source = arguments[arg]
            if (source && source !== mixin) for (let prop in source) {
                if (prop !== '_' && prop !== '__' && prop !== '___' && prop !== '_$') {
                    if (isObj(mixin[prop]) && isObj(source[prop])) {
                        // property is already assigned - augment it
                        if (mixin !== source[prop]) this.augment(mixin[prop], source[prop])
                    } else if (isArray(source[prop])) {
                        mixin[prop] = source[prop].slice()
                    } else if (isObj(source[prop])) {
                        mixin[prop] = augment({}, source[prop])
                    } else {
                        mixin[prop] = source[prop];
                    }
                }
            }
       }
        return mixin
    }

}
