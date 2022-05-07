const config = require('../config/configs');
const log = require('../tools/log');
const keytar = require('keytar');
const os = require('os');
const osu = require('os-utils');

module.exports = async (host, ip, req, res, cache) => {

    log("connection", `${ip} connected to the api on ${req.originalUrl}`, "router");

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
            //send cpu utilization and memory usage
            res.send({
                cpu: osu.cpuUsage(),
                usedmemory: os.totalmem - os.freemem
            });
        break;
        }

}