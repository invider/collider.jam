'use strict'

module.exports = {
    version: '0.1.0 DR1',

    PACKAGE_MODE: 0,
    MOD_MODE: 1,

    mode: 0,
    sketch: false,
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
        origin: 'default',
        paths: [],
        units: [],
        mixes: [
            'node_modules'
        ],
    },

    base: '/',
    unitsPath: 'units.map',
    configPath: 'jam.config',

    cache: {},
}
