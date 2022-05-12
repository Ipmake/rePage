const config = require('../config/configs');
const log = require('../tools/log');
const keytar = require('keytar');
const os = require('os');
const osu = require('os-utils');
const logconfig = require('../config/logging.json');

module.exports = async (host, ip, req, res, cache) => {
    if(logconfig.logAPIRequests) log("connection", `${ip} connected to the api on ${req.originalUrl}`, "router");

    var url = req.originalUrl.split("/");
    //shift the array a certain amount of time
    url.splice(0, url.indexOf("api"))
    
    switch(url[1]) {
        case "login":
            const cachedUser = cache.get("users", req.body.username);
            if(cachedUser){
                const userPW = await keytar.getPassword("repage", req.body.username)
                if(userPW === req.body.password){
                    log("system", `user ${req.body.username} successfully logged in`, "router");
                    res.sendStatus(200);
                }   
                else return res.sendStatus(401), log("system", `user ${req.body.username} failed to log in`, "router");
            }
            else return res.sendStatus(401), log("system", `user ${req.body.username} failed to log in`, "router");
        break;

        case "stats":
            osu.cpuUsage(function(cpu){
                res.send({
                    cpu: cpu,
                    usedmemory: os.totalmem() - os.freemem,
                    totalmemory: os.totalmem()
                });
            })
        break;

        case "pages":
            const stats_user = cache.get("users", req.body.username);
            if(!stats_user) return res.sendStatus(401), log("system", `user ${req.body.username} failed to get stats`, "router");
            const stats_pw = await keytar.getPassword("repage", req.body.username)
            if(stats_pw !== req.body.password) return res.sendStatus(401), log("system", `user ${req.body.username} failed to get stats`, "router");
            res.send(JSON.stringify({
                hosts: stats_user.hosts
            }));
        break;
        default:
            res.sendStatus(404);
        break;
        }

}