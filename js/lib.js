'use strict'

const fs = require('fs-extra')
const log = require('./log')
const env = require('./env')
const { execSync } = require('child_process')

const TAG = 'lib'

module.exports = {

    addPath: function(base, path) {
        if (!base) return path
        if (base.length >= 1 && !base.endsWith('/')) base += '/'
        return base + path
    },

    getResourceName: function(path) {
        return path.replace(/^.*[\\\/]/, '')
    },

    readOptionalJson: function(path, defaultJson) {
        if (fs.existsSync(path)) {
            return fs.readJsonSync(path)
        }
        return defaultJson
    },

    checkBaseDir: function(path) {
        let packageMarker = false
        let modMarker = false
        let mixMarker = false

        let lstat = fs.lstatSync(path)
        if (lstat.isDirectory()) {
            const realpath = fs.realpathSync(path)
            if (realpath.endsWith('mod')) {
                modMarker = true
            }
            if (realpath.endsWith('mix')) {
                mixMarker = true
            }
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
        } else if (mixMarker) {
            base = {
                mode: env.MIX_MODE,
                path: path,
            }
        }
        else if (modMarker) {
            base = {
                mode: env.MOD_MODE,
                path: path,
            }
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
}
