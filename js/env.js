'use strict'

module.exports = {
    version: '0.0.5 DR5',
    PACKAGE_MODE: 0,
    MOD_MODE: 1,
    MIX_MODE: 2,

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
    typesMeta: 'types.ts',
    mapConfig: 'map.json',
    remapConfig: 'remap.json',
    pakConfig: 'pak.json',

    defaultScanMap: {
        origin: 'default',
        units: [],
        mixes: [],
        modules: [
            'node_modules'
        ],
    },
    sketchScanMap: {
        origin: 'default-sketch',
        units: [],
        mixes: [],
        modules: [],
    },

    base: '/',
    unitsPath: 'units.map',
    configPath: 'jam.config',

    cache: {},
}
