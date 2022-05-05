const log = require('../log');

module.exports = {
    name: 'readBack',
    description: 'Print the data in the cache.',
    async execute(args, cache) {

        log('system', 'Reading cache...', 'console')
        if(!args[0]) return log('syntax', 'SYNTAX ERROR: cache.get [category] [item] [value]', 'console'), true
        if(!args[1]) return log('syntax', 'SYNTAX ERROR: cache.get [category] [item] [value]', 'console'), true 
        if(!args[2]) return log('syntax', 'SYNTAX ERROR: cache.get [category] [item] [value]', 'console'), true 

        const data = await cache.set(args[0], args[1], args[2]);
        
        if(!data) return log('error', `${args[0]} -> ${args[1]} not found!`, 'console')
        log("sysOK", 'CACHE WRITE', 'CACHE WRITE')
        return true
    }

}