'use strict'

const log = require('./log')

module.exports = function() {
    log.raw(
        'Usage: jam <command>\n\n'
        + 'Following commands are available:\n'
        + '    run - start collider.jam hub server\n'
        + '    package - assemble all units and static content in ./pub folder\n'
        + '    package run - assemble package and run static http server over it\n'
        + '    init <bootstrap-template> - bootstrap the project from the template\n'
        + '    units - examine and show units structure\n'
        + '    update - update dependencies\n\n'
        + '[jam run] is executed by default if no command is available'
    )
}
