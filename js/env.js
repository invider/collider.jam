'use strict'

module.exports = {
    debug: false,
    verbose: false,
    silent: false,
    dynamic: true,

    config: {
        debug: false,
    },
    params: [],

    port: 9999,

    baseDir: './',
    outDir: 'out',
    unitsConfig: 'units.json',
    scanMap: {
        units: [
            ''
        ],
        mixes: [
            'node_modules'
        ],
    },

    base: '/',
    unitsPath: 'units.map',
    configPath: 'jam.config',
}
