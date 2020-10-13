'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const scanner = require('./scanner')
const { execSync } = require('child_process')
const archiver = require('archiver')

const TAG = 'packager'

function cleanIfExists(path) {
    if (fs.existsSync(path)) {
        log.debug('cleaning up [' + path + ']', TAG) 
        fs.removeSync(path)
    }
}

function clean(opt) {
    lib.verifyBaseDir()
	env.distDir = lib.addPath(env.baseDir, env.distDir) + '/'

    env.scanMap = lib.readOptionalJson(env.mapConfig, env.scanMap)
    let scannedUnits = scanner.scan(env.baseDir, env.scanMap)

    determinePackageName()
    determineOutputDir(env.baseDir, env.outDir)

    if (env.outDir) cleanIfExists(lib.addPath(env.baseDir, env.outDir))
    if (env.outDir2) cleanIfExists(lib.addPath(env.baseDir, env.outDir2))
	if (env.distDir) cleanIfExists(lib.addPath(env.baseDir, env.distDir))
	cleanIfExists(lib.addPath(env.baseDir, env.typesMeta))
	if (opt === 'all') {
		cleanIfExists(lib.addPath(env.baseDir, 'node_modules'))
	}
}

function zip(target, source, type) {
	const output = fs.createWriteStream(target);
	let archive
	switch(type) {
	case 'tar': archive = archiver('tar'); break;
	case 'zip':
		archive = archiver('zip', {
			zlib: { level: 9 } // compression level
		})
		break;
	case 'tgz':
		archive = archiver('tar', {
			gzip: true,
			gzipOptions: {
				level: 1
			}
		})
		break;
	}

	output.on('close', function() {
		let size = archive.pointer()
		let suffix = 'b'
		if (size > 1024) {
			size = Math.round(size/1024)
			suffix = 'kb'
		}
		if (size > 1024) {
			size = Math.round(size/1024)
			suffix = 'mb'
		}
		log.out('created [' + target + ']: ' + size + suffix, TAG)
	})

	archive.on('warning', function(err) {
		if (err.code === 'ENOENT') {
			log.warn(err, TAG)
		} else {
			throw err;
		}
	})
	 
	// good practice to catch this error explicitly
	archive.on('error', function(err) {
	  throw err;
	});

	// pipe archive data to the file
	archive.pipe(output);

	// append content at the root of archive
	archive.directory(source, false);
	archive.finalize();

}

function cleanPath(path) {
    if (fs.existsSync(path)) {
		// remove dir first
        log.debug('cleaning up [' + path + ']', TAG) 
        fs.removeSync(path)
    }
}

function cleanAndCreateDir(path) {
    cleanPath(path)
    fs.ensureDirSync(path)
}

const determinePackageName = function() {
    const base = './'
    const realPath = fs.realpathSync(base)
    const name = lib.getResourceName(realPath)
    env.name = name
    return name
}

function determineOutputDir() {
    if (!env.name) determinePackageName()

    const baseDir = env.baseDir
    const outDir = env.sketch?
            lib.addPath(baseDir, `../${env.name}.out`) + '/'
            : lib.addPath(baseDir, env.outDir) + '/'
    env.outDir = outDir

    if (env.sketch) {
        env.outDir2 = lib.addPath(baseDir, `${env.name}.out`) + '/'
    }
    return outDir
}

function determineFinalOutputDir() {
    determineOutputDir()
    if (env.sketch) return env.outDir2
    else return env.outDir
}

function saveUnitsMap(outDir, units) {
    const path = lib.addPath(outDir, env.unitsPath)
    log.debug(`saving units map to [${path}]`, TAG)
    fs.writeJsonSync(path, units.map, { spaces: '    '})
}

function pack(baseDir, outputDir, units) {
    const name = determinePackageName()
    const outDir = determineOutputDir()
    
    log.debug(`output dir: [${outDir}]`, TAG)
	cleanAndCreateDir(outDir)

    units.forEach(u => {
        log.trace(`copying ${u.path} -> `
                    + lib.addPath(outDir, u.id), TAG)
        //fs.copySync(u.path, lib.addPath(outDir, u.id))
        u.ls.forEach(f => {
            const src = lib.addPath(u.path, f)
            const dest = lib.addPath(
                lib.addPath(outDir, u.id), f)

            log.trace(`copying ${src} -> ${dest}`, TAG)
            fs.copySync(src, dest)
        })
    })

    //fs.writeFileSync(outDir + env.unitsPath, JSON.stringify(units.map))
    //fs.writeFileSync(outDir + env.configPath, JSON.stringify(env.config))
    saveUnitsMap(outDir, units)
    fs.writeJsonSync(outDir + env.configPath, env.config, { spaces: '    '} )

    if (env.sketch) moveIntoSketch()
}

function moveIntoSketch() {
    if (!env.sketch) return
    //env.outDir2 = lib.addPath(env.baseDir, `${env.name}.out`) + '/'
    cleanIfExists(env.outDir2)

    log.trace(`moving ${env.outDir} -> ${env.outDir2}`, TAG)
    fs.moveSync(env.outDir, env.outDir2)
    env.outDir = env.outDir2
}

function regenerateUnitMap() {
    determineOutputDir()
    const outDir = env.outDir2 || env.outDir

    env.scanMap = {
        origin: 'packager-out-scan',
        units: [],
        modules: [ outDir ],
        ignorePaths: [
            'fav',
            'jam.config',
            'units.map',
            'index.html',
            'site.webmanifest'
        ]
    }
    env.freezeScanMap = true
    let scannedUnits = scanner.scan(env.baseDir, env.scanMap)
    saveUnitsMap(outDir, scannedUnits)
    //console.dir(env.scanMap)
    //console.dir(scannedUnits)
}

function generateDist(rescan) {
    if (rescan) regenerateUnitMap()
    // generate dist archives
    const name = env.name || determinePackageName()
    const srcDir = determineFinalOutputDir()
    log.debug(`generating dist package [${name}]`, TAG)
    log.debug(`source dir: [${srcDir}]`, TAG)
    zip(lib.addPath(env.distDir, name + '.zip'), srcDir, 'zip')
    zip(lib.addPath(env.distDir, name + '.tar'), srcDir, 'tar')
    zip(lib.addPath(env.distDir, name + '.tgz'), srcDir, 'tgz')
}

function generate(opt) {
    lib.verifyBaseDir()
    env.distDir = lib.addPath(env.baseDir, env.distDir) + '/'

    if (opt === 'out') clean(env.distDir)
    else cleanAndCreateDir(env.distDir)

    if (opt === 'dist') {
        generateDist(true)
        return
    }

    env.scanMap = lib.readOptionalJson(env.mapConfig, env.scanMap)
    let scannedUnits = scanner.scan(env.baseDir, env.scanMap)

    pack(env.baseDir, env.outDir, scannedUnits)

    if (opt !== 'out') {
        generateDist()
    }
}

module.exports = {
    pack: pack,
    generate: generate,
	clean: clean,
    determineFinalOutputDir: determineFinalOutputDir,
}
