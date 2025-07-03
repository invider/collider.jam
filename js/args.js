const env = require('./env')

module.exports = function() {
    // process args
    let cmd = ''
    const args = process.argv;

    let lastOption
    let parsedOption = false

    for (let i = 2; i < args.length; i++) {
        // TODO -d/--debug -v/--verbose -s/--silent -h/--help options
        let arg = args[i]

        if (arg === '-d' || arg === '--debug') {
            env.debug = true
            env.config.debug = true
            env.flow = true
            env.config.flow = true
            parsedOption = false

        } else if (arg === '-y' || arg === '--types') {
            env.types = true
            parsedOption = false

        } else if (arg === '-f' || arg === '--flow') {
            // TODO make it into a --force flag?
            //      should it be hot reload or something?
            env.flow = true
            env.config.flow = true
            parsedOption = false

        } else if (arg === '-t' || arg === '--test') {
            //parsedOption = false
            parsedOption = true
            lastOption = 'test'
            env.test = true
            env.config.test = true

        } else if (arg === '-l' || arg === '--lab') {
            if (++i === args.length) throw 'a lab .js file is expected after the [' + arg + '] option'
            env.monoLab = args[i]
            parsedOption = false
            lastOption = 'lab'

        } else if (arg === '-b' || arg === '--hub') {
            env.hub = true
            env.config.hub = true
            parsedOption = false

        } else if (arg === '-mc' || arg === '--mission-control') {
            env.mc = true
            parsedOption = false

        } else if (arg === '-p' || arg === '--port') {
            if (++i === args.length) throw 'number is expected after the [' + arg + '] option'
            let p = parseInt(args[i])
            if (isNaN(p)) throw 'number is expected after the [' + arg + '] option'
            env.port = p
            parsedOption = false

        } else if (arg === '-s' || arg === '--static') {
            env.dynamic = false
            parsedOption = false

        } else if (arg === '-n' || arg === '--pregen') {
            env.dynamic = false
            env.pregen = true
            parsedOption = false

        } else if (arg === '-g' || arg === '--global') {
            env.globalMode = true
            parsedOption = false

        } else if (arg === '-v' || arg === '--verbose') {
            env.verbose = true
            parsedOption = false

        } else if (arg === '-m' || arg === '--mute') {
            // switch off all except warnings and errors
            env.mute = true
            log.trace = log.off
            log.debug = log.off
            log.out = log.off
            log.raw = log.off
            log.dump = log.off
            parsedOption = false

        } else if (arg === '-h' || arg === '--help') {
            cmd = 'help'

        } else if (arg === '--version') {
            cmd = 'version'

        } else if (arg.startsWith('--')) {
            parsedOption = true
            lastOption = arg.substring(2) 
            env.config[lastOption] = true

        } else {
            if (parsedOption) {
                env.config[lastOption] = arg
            } else if (!cmd) {
                cmd = arg
            } else  {
                env.params.push(arg)
            }
            parsedOption = false
        }
    }
    env.cmd = cmd
    return cmd
}
