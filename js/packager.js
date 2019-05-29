'use strict'

const fs = require('fs-extra')
const env = require('./env')
const log = require('./log')
const lib = require('./lib')
const scanner = require('./scanner')
const { execSync } = require('child_process')
const archiver = require('archiver')

const TAG = 'packager'

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

let pack = function(baseDir, outputDir, units) {
    let outDir = lib.addPath(baseDir, outputDir) + '/'
	cleanAndCreateDir(outDir)

    units.forEach(u => {
        log.trace('copying ' + u.path + ' -> ' + lib.addPath(outDir, u.id), TAG)
        fs.copySync(u.path, lib.addPath(outDir, u.id))
    })

    //fs.writeFileSync(outDir + env.unitsPath, JSON.stringify(units.map))
    //fs.writeFileSync(outDir + env.configPath, JSON.stringify(env.config))
    fs.writeJsonSync(outDir + env.unitsPath, units.map, { spaces: '    '})
    fs.writeJsonSync(outDir + env.configPath, env.config, { spaces: '    '} )
}

const generate = function() {
    const base = './'
    const realPath = fs.realpathSync(base)
    const name = lib.getResourceName(realPath)
    env.name = name

    log.debug('generating package [' + name + ']', TAG)

    if (!lib.isBaseDir(env.baseDir)) {
        log.debug('not a base - trying to locate the project base directory...')
        lib.lookupBaseDir()
    }
    env.scanMap = lib.readOptionalJson(env.unitsConfig, env.scanMap)
    let scannedUnits = scanner.scan(env.baseDir, env.scanMap)
    pack(env.baseDir, env.outDir, scannedUnits)

	// generate dist archives
    const sourceDir = lib.addPath(env.baseDir, env.outDir) + '/'
	const distDir = lib.addPath(env.baseDir, env.distDir) + '/'
	cleanAndCreateDir(distDir)
	zip(lib.addPath(distDir, name + '.zip'), sourceDir, 'zip')
	zip(lib.addPath(distDir, name + '.tar'), sourceDir, 'tar')
	zip(lib.addPath(distDir, name + '.tgz'), sourceDir, 'tgz')
}

module.exports = {
    pack: pack,
    generate: generate,
}
