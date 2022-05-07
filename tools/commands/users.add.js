const log = require('../log');
const fs = require('fs')
const keytar = require('keytar')
const config = require('../../config/system.json')

module.exports = {
    name: 'usersAdd',
    description: 'Add a user.',
    async execute(args, cache) {
        log('system', 'Trying to add user...', 'console')
        if(!args[0] || !args[1] || !args[2]) return log('syntax', 'SYNTAX ERROR: users.add [group] [username] [password]', 'console'), true

        var users = JSON.parse(fs.readFileSync('./config/dynamic/users.json', 'utf8'));
        users.push({ username: args[1], group: args[0], hosts: [`${args[1]}.${config.defaultHost}`]});
        await keytar.setPassword("repage", args[1], args[2])


        fs.mkdirSync(`./www/${args[1]}.${config.defaultHost}`);
        fs.writeFileSync('./config/dynamic/users.json', JSON.stringify(users));

        cache.init()

        log("sysOK", null, 'ADD USER')
        return true
    }

}