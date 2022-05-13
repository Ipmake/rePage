const enmap = require('enmap')
const { set } = require('express/lib/application')
const fs = require('fs')
const log = require('./log')


module.exports = class {
        constructor() {
            //
            this.routes = new enmap()
            this.commands = new enmap()
            this.users = new enmap()
            this.hosts = new enmap()
            //
            this.init()

        }

        get(category, item) {
            log('cache', `CACHE GET ${category} -> ${item}`, 'cache')
            return eval(`this.${category}.get('${item}')`)
        }

        async set(category, item, value) {
            log('cache', `CACHE SET ${category} -> ${item} TO ${value}`, 'cache')
            switch (category) {
                case 'routes':
                    value = value.replaceAll("/", "_")
                    return this.routes.set(item, value)
                break;
                
                default:
                    eval(`this.${category}.set('${item}', '${value}')`)
                    console.log(`this.${category}.set('${item}', '${value}')`)
                    return 
                break;
            }
            
        }
    
        init() {
            this.routes.clear()
            this.commands.clear()
            this.users.clear()
            this.hosts.clear()

            log('system', 'Initializing cache...', 'cache')
            const routeFile = JSON.parse(fs.readFileSync('./config/dynamic/routes.json', 'utf8'))
    
            for (let c of routeFile) {
                
                if(c.dir === '/repage' || c.dir === '/repage/') return console.error('ERROR: /repage is reserved for the RePage webserver.')
                const prev = this.routes.get(c.host)
                if(prev) 
                {
                    c.dir = c.dir.replaceAll("/", "_")
                    eval(`prev.${c.dir} = '${c.target}'`)
                    log('debug', `Redirect ${c.host}${c.dir.replaceAll("_", "/")} to ${c.target} has been added to cache`, 'cache')
                    this.routes.set(c.host, prev)
                } else 
                {  
                    const data = {}
                    c.dir = c.dir.replaceAll("/", "_")
                    eval(`data.${c.dir} = '${c.target}'`)
                    log('debug', `Redirect ${c.host}${c.dir.replaceAll("_", "/")} to ${c.target} has been added to cache`, 'cache')
                    this.routes.set(c.host, data)
                }
                
    
            }

            const hostsfile = JSON.parse(fs.readFileSync('./config/dynamic/hosts.json', 'utf8'))
    
            for (let c of hostsfile) {
                this.hosts.set(c.host, c)
            }
            
            const commands = fs.readdirSync("./tools/commands/")
            for (let c of commands) {
                if(!c.endsWith(".js")) continue;

                const command = c.replace(".js", "")
                const commandFile = require(`./commands/${c}`)


                this.commands.set(command, commandFile)
            }
            

            const users = JSON.parse(fs.readFileSync("./config/dynamic/users.json"))
            for (let u of users) {

                this.users.set(u.username, u)

            }


            log('system', `${routeFile.length} route/s have been cached`, 'cache')
            log('system', `${commands.length} command/s have been cached.`, 'cache')
            log('system', `${users.length} useraccount/s have been cached.`, 'cache')
            log('system', `${hostsfile.length} host/s have been cached.`, 'cache')
            log('sysOK', 'Cache initialized', 'cache')
        }
    }