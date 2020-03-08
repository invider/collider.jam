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
    cleanIfExists(lib.addPath(env.baseDir, env.outDir))
	cleanIfExists(lib.addPath(env.baseDir, env.distDir))
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
		log.out('created [' + target + ']: ' + size + suffix)
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

function cleanAndCreateDir(path) {
    if (fs.existsSync(path)) {
		// remove dir first
        log.debug('cleaning up [' + path + ']', TAG) 
        fs.removeSync(path)
    }
    fs.ensureDirSync(path)
}

const determinePackageName = function() {
    const base = './'
    const realPath = fs.realpathSync(base)
    const name = lib.getResourceName(realPath)
    env.name = name
    return name
}

function determineOutputDir(baseDir, outputDir) {
    const outDir = env.sketch?
            lib.addPath(baseDir, `../${env.name}.out`) + '/'
            : lib.addPath(baseDir, outputDir) + '/'
    env.outDir = outDir

    if (env.sketch) {
        env.outDir2 = lib.addPath(baseDir, `${env.name}.out`) + '/'
    }
    return outDir
}

const pack = function(baseDir, outputDir, units) {
    const name = determinePackageName()
    const outDir = determineOutputDir(baseDir, outputDir)
    
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
    fs.writeJsonSync(outDir + env.unitsPath, units.map, { spaces: '    '})
    fs.writeJsonSync(outDir + env.configPath, env.config, { spaces: '    '} )

    repack()
}

const repack = function() {
    if (!env.sketch) return

    env.outDir2 = lib.addPath(env.baseDir, `${env.name}.out`) + '/'
    cleanIfExists(env.outDir2)

    log.trace(`moving ${env.outDir} -> ${env.outDir2}`)
    fs.moveSync(env.outDir, env.outDir2)
    env.outDir = env.outDir2
}

const generate = function() {

    lib.verifyBaseDir()
	env.distDir = lib.addPath(env.baseDir, env.distDir) + '/'
	cleanAndCreateDir(env.distDir)

    env.scanMap = lib.readOptionalJson(env.unitsConfig, env.scanMap)
    let scannedUnits = scanner.scan(env.baseDir, env.scanMap)

    pack(env.baseDir, env.outDir, scannedUnits)

	// generate dist archives
    const name = env.name
    log.debug(`generating package [${name}]`, TAG)
	zip(lib.addPath(env.distDir, name + '.zip'), env.outDir, 'zip')
	zip(lib.addPath(env.distDir, name + '.tar'), env.outDir, 'tar')
	zip(lib.addPath(env.distDir, name + '.tgz'), env.outDir, 'tgz')
}

module.exports = {
    pack: pack,
    generate: generate,
	clean: clean,
}
