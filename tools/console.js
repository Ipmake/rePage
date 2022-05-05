const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
const fs = require('fs');
const log = require('./log');


module.exports = class {
    constructor(cache, router){
        this.cache = cache;
        this.router = router;
        this.listen()
    }

    listen(loop, listen, cache, router){
        if(!loop) cache = this.cache
        if(!loop) router = this.router
        if(!loop) listen = this.listen
        

        rl.question('', async function (out) {
            log('system', 'running command: ' + out, 'console')

            const args = out.split(' ')
            const cmd = args[0]
            args.shift()


            const regCommand = cache.get('commands', cmd)
            if(regCommand){

                const command = regCommand
                const data = await command.execute(args, cache)

                if(!data) return log('error', `${out} returned an error`, 'console'), listen(true, listen, cache, router)
                return listen(true, listen, cache, router)

            } else {
                log('error', 'Command not found!', 'console')
                return listen(true, listen, cache, router)
            }
            

            
        });
    }

}