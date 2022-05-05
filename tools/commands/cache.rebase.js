const log = require('../log');

module.exports = {
    name: 'rebase',
    description: 'Rebase the cache.',
    execute(args, cache) {
        log('system', 'Rebasing cache...', 'console')  
        cache.init()
        return true
    }

}