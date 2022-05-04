const config = require('../config/configs');
const log = require('../tools/log');
const express = require('express');
const fs = require('fs')


module.exports = class {
    constructor(systemdata){
        this.systemdata = systemdata;
        this.app = express();
        this.app.use(express.json());

        if(config.router.ssl.enabled){
            const https = require('https');
            const httpsOptions = {
                key: fs.readFileSync(config.router.ssl.key),
                cert: fs.readFileSync(config.router.ssl.cert)
            }
            this.httpsServer = https.createServer(httpsOptions, this.app);
        }

        //start app on ports 80 and 443
        this.app.listen(config.router.port, () => {
            log("sysOK", null, "router");
        });


        if(config.router.ssl.enabled)
        {
            this.httpsServer.listen(config.router.ssl.port, () => {
                log("sysOK", null, "router/ssl");
            })
        }

        this.register()
    }

    register()
    {
        this.app.get('/', (req, res) => {

            const host = req.get('host');
            var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
            if(ip.startsWith("www.")) ip = ip.replace("www.", "");

            log("debug", `${host} requested by ${ip}`, "router");


            res.sendFile("index.html", { root: `./www/${host}` });  
            
        });

        this.app.all('*', (req, res) => {
            const host = req.get('host');
            var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
            if(ip.startsWith("www.")) ip = ip.replace("www.", "");

            log("debug", `${host}/${req.originalUrl} requested by ${ip}`, "router");


            res.sendFile(req.originalUrl, { root: `./www/${host}` })
            
        });


        this.app.use((err, req, res, next) => {
            if(`${err}`.includes("no such file or directory")) return res.sendFile("404.html", { root: `./www/static` }), console.log(`${err}`) 
        });
    }
}