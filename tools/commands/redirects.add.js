const log = require('../log');
const fs = require('fs')

module.exports = {
    name: 'addRedirect',
    description: 'Add a redirect.',
    async execute(args, cache) {
        log('system', 'Trying to add redirect...', 'console')
        if(!args[0] || !args[1] || !args[2]) return log('syntax', 'SYNTAX ERROR: redirects.add [host] [from] [to]', 'console'), true

        var redirects = JSON.parse(fs.readFileSync('./config/dynamic/routes.json', 'utf8'));
        redirects.push({ host: args[0], dir: args[1], target: args[2]});
        fs.writeFileSync('./config/dynamic/routes.json', JSON.stringify(redirects));

        cache.init()

        log("sysOK", null, 'ADD REDIRECT')
        return true
    }

}