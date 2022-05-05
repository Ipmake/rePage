const enmap = require('enmap')
const { set } = require('express/lib/application')
const fs = require('fs')
const log = require('./log')


module.exports = class {
        constructor() {
            //
            this.routes = new enmap()
            //

            log('system', 'Initializing cache...', 'cache')
            const routeFile = require("../router/routes.json")
            var redirects = 0
    
            for (let c of routeFile.redirects) {
                
                const prev = this.routes.get(c.host)
                if(prev) 
                {
                    redirects++;
                    c.dir = c.dir.replaceAll("/", "_")
                    eval(`prev.${c.dir} = '${c.target}'`)
                    this.routes.set(c.host, prev)
                } else 
                {  
                    redirects++;
                    const data = {}
                    c.dir = c.dir.replaceAll("/", "_")
                    eval(`data.${c.dir} = '${c.target}'`)
                    this.routes.set(c.host, data)
                }
                
    
            }
    
            log('system', `Initialized ${redirects} routes`, 'cache')
            log('sysOK', 'Cache initialized', 'cache')
        }

        get(category, item) {
            log('cache', `CACHE GET ${category} -> ${item}`, 'cache')
            return eval(`this.${category}.get('${item}')`)
        }

        set(category, item, value) {
            log('cache', `CACHE SET ${category} -> ${item} TO ${value}`, 'cache')
            switch (category) {
                case 'routes':
                    value = value.replaceAll("/", "_")
                    return this.routes.set(item, value)
                break;
            }
            
        }
    }