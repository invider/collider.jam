'use strict'

// TODO include some auto-ignore paths - like fix, ignore
const ignorePaths = [
    "map.json",
    "remap.json",
    "dist",
    ".*\\.out",
    ".*\\.git",
    ".*\\.DS_Store",
]

module.exports = {
    version: '0.0.9 DR8',
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
    metaCache: '.meta.cache',
    colliderPackage: 'collider.jam',

    defaultScanMap: {
        origin: 'default',
        units: [],
        mixes: [],
        modules: [
            'node_modules'
        ],
        ignorePaths: ignorePaths,
    },
    sketchScanMap: {
        origin: 'default-sketch',
        units: [],
        mixes: [],
        modules: [],
        ignorePaths: ignorePaths,
    },

    base: '/',
    unitsPath: 'units.map',
    configPath: 'jam.config',

    cache: {},
}
