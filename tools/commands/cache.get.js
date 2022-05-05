const log = require('../log');

module.exports = {
    name: 'cacheGet',
    description: 'Print the data in the cache.',
    async execute(args, cache) {

        log('system', 'Reading cache...', 'console')
        if(!args[0]) return log('syntax', 'SYNTAX ERROR: cache.get [category] [item]', 'console'), true
        if(!args[1]) return log('syntax', 'SYNTAX ERROR: cache.get [category] [item]', 'console'), true 

        const data = await cache.get(args[0], args[1]);
        
        log('cache', '----------------------------------------------------------------', 'console')
        if(!data) return log('error', `${args[0]} -> ${args[1]} not found!`, 'console')
        console.log(data)
        log('cache', '----------------------------------------------------------------', 'console')
        return true
    }

}