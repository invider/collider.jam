'use strict'

module.exports = {
    version: '0.1.0 DR1',

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
	distDir: 'dist',
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
