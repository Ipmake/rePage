const log = require('../log');

module.exports = {
    name: 'ping',
    description: 'Check if the console is alive.',
    execute(args) {
        log('debug', 'Console was Pinged!', 'console')
        log('info', 'PONG!', 'console')
        return true
    }
}