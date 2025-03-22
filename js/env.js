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

const env = {
    poweredBy: 'Collider.JAM',
    version: '0.1.0 WR1',
    releaseName: 'War Release 1',
    releaseDate: '2025-03-22',
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
    unitsPath:  'units.map',
    configPath: 'jam.config',
    warPath:    'war',

    cache: {},
}

env.config.poweredBy   = env.poweredBy
env.config.version     = env.version
env.config.releaseName = env.releaseName
env.config.releaseDate = env.releaseDate

module.exports = env
