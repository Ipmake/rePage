const config = require('../config/configs');
const log = require('../tools/log');
const keytar = require('keytar');
const os = require('os');
const osu = require('os-utils');
const logconfig = require('../config/logging.json');
const fs = require('fs');

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
                    res.send(JSON.stringify({ username: req.body.username, password: req.body.password, group: cachedUser.group }));
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

        case "hosts":
            const host_user = cache.get("users", req.body.username);
            if(!host_user) return res.sendStatus(401), log("system", `user ${req.body.username} failed to get host`, "router");
            const host_pw = await keytar.getPassword("repage", req.body.username)
            if(host_pw !== req.body.password) return res.sendStatus(401), log("system", `user ${req.body.username} failed to get host`, "router");
            const hostlist = []
            for(let c of host_user.hosts){

                let h = cache.get("hosts", c)
                if(!h) continue;
                hostlist.push(h);
            }

            res.send(JSON.stringify({
                hosts: hostlist,
                username: req.body.username
            }))
            log("system", `Hosts of ${req.body.username} successfully retrieved`, "router");
        break;

        case "gethost":
            let host = req.query.host;
            if(!host) return res.sendStatus(400), log("system", `user ${req.body.username} failed to get host`, "router");
            let user = await cache.get("users", req.body.username);
            if(!user) return res.sendStatus(401), log("system", `user ${req.body.username} failed to get host`, "router");
            let pw = await keytar.getPassword("repage", req.body.username)
            if(pw !== req.body.password) return res.sendStatus(401), log("system", `user ${req.body.username} failed to get host`, "router");
            if(!user.hosts.includes(host)) return res.sendStatus(401), log("system", `user ${req.body.username} failed to get host`, "router");
            let h = await cache.get("hosts", host)
            if(!h) return res.sendStatus(401), log("system", `user ${req.body.username} failed to get host`, "router");
            res.send(JSON.stringify({
                host: h.host,
                dir: h.dir,
                SSL: h.SSL
            }))
            log("system", `Host ${host} of ${req.body.username} successfully retrieved`, "router");
        break;

        case "edithost":
            try{
            await (async () => {
                let origin = req.body.origin
                let host = req.body.host;
                let dir = req.body.dir;
                let SSL = req.body.SSL;
                let user = req.body.username;
                let pw = req.body.password;

                var cacheduser = await authenticate(req, cache)
                if(!cacheduser) return res.sendStatus(401), log("system", `user ${req.body.username} failed authentication`, "router");

                if(!cacheduser.hosts.includes(origin)) return res.sendStatus(401), log("system", `user ${user} does not own host`, "router");

                let h = await cache.get("hosts", origin)
                if(!h) return res.sendStatus(401), log("system", `user ${user} requested a missing host`, "router");

                h.host = host;
                h.dir = dir;
                h.SSL = SSL;

                cacheduser.hosts[cacheduser.hosts.indexOf(origin)] = host;
                console.log(cacheduser, cacheduser.hosts.indexOf(origin))


                var hosts = fs.readFileSync(`./config/dynamic/hosts.json`)
                hosts = JSON.parse(hosts)
                hosts[getIndex(hosts, "host", origin)] = h
                fs.writeFileSync(`./config/dynamic/hosts.json`, JSON.stringify(hosts))

                var users = fs.readFileSync('./config/dynamic/users.json')
                users = JSON.parse(users)
                users[getIndex(users, "username", user)].hosts[users[getIndex(users, "username", user)].hosts.indexOf(origin)] = host
                fs.writeFileSync('./config/dynamic/users.json', JSON.stringify(users))

                cache.init()


                res.sendStatus(200);
                log("system", `Host ${host} of ${user} successfully edited`, "router");

            })()                   
            }
            catch (err) {
                log("error", err, "router");
                res.sendStatus(500);
            }
        break;


        case "deletehost":
            try {
                const host_user_del = cache.get("users", req.body.username);
                if(!host_user_del) return res.sendStatus(401), log("system", `user ${req.body.username} failed to delete host`, "router");
                const host_pw_del = await keytar.getPassword("repage", req.body.username)
                if(host_pw_del !== req.body.password) return res.sendStatus(401), log("system", `user ${req.body.username} failed to delete host`, "router");
    
                if(host_user_del.hosts.includes(req.body.host)){
                    host_user_del.hosts.splice(host_user_del.hosts.indexOf(req.body.host), 1);
    
                    let content = fs.readFileSync(`./config/dynamic/hosts.json`)
                    content = JSON.parse(content);
                    content.splice(getIndex(content, "host", req.body.host), 1);
                    fs.writeFileSync(`./config/dynamic/hosts.json`, JSON.stringify(content));
    
                    let usercontent = fs.readFileSync(`./config/dynamic/users.json`)
                    usercontent = JSON.parse(usercontent);
                    usercontent[getIndex(usercontent, "username", req.body.username)].hosts.splice(usercontent[getIndex(usercontent, "username", req.body.username)].hosts.indexOf(req.body.host), 1);
                    fs.writeFileSync(`./config/dynamic/users.json`, JSON.stringify(usercontent));
    
                    cache.init()
    
                    log("system", `Host ${req.body.host} successfully deleted`, "router");
                    return res.sendStatus(200);
                    }
                else return res.sendStatus(400), log("system", `user ${req.body.username} failed to delete host`, "router");
            } catch (err) {
                log("error", err, "router");
                res.sendStatus(500);
            }
            break;
        
        case "createhost":
            try {
                const host_user_create = cache.get("users", req.body.username);
                if(!host_user_create) return res.sendStatus(401), log("system", `user ${req.body.username} failed to create host`, "router");
                const host_pw_create = await keytar.getPassword("repage", req.body.username)
                if(host_pw_create !== req.body.password) return res.sendStatus(401), log("system", `user ${req.body.username} failed to create host`, "router");

                if(host_user_create.hosts.includes(req.body.host)) return res.sendStatus(400), log("system", `user ${req.body.username} failed to create host`, "router");
                host_user_create.hosts.push(req.body.host);
    
                let content = fs.readFileSync(`./config/dynamic/hosts.json`)
                content = JSON.parse(content);
                if(content.includes(req.body.host)) return res.sendStatus(400).send("Host already exists");
                content.push({
                    host: req.body.host,
                    dir: req.body.dir,
                    SSL: req.body.SSL,
                    owner: req.body.username,
                    group: host_user_create.group
                });
                fs.writeFileSync(`./config/dynamic/hosts.json`, JSON.stringify(content));

                let usercontent = fs.readFileSync(`./config/dynamic/users.json`)
                usercontent = JSON.parse(usercontent);
                if(usercontent[getIndex(usercontent, "username", req.body.username)].hosts.includes(req.body.host)) return res.sendStatus(400).send("Host already exists");
                usercontent[getIndex(usercontent, "username", req.body.username)].hosts.push(req.body.host);
                fs.writeFileSync(`./config/dynamic/users.json`, JSON.stringify(usercontent));

                cache.init()

                log("system", `Host ${req.body.host} successfully created`, "router");
                return res.sendStatus(200);
            } catch (err) {
                log("error", err, "router");
                res.sendStatus(500);
            }

        default:
            res.sendStatus(404);
        break;
        }

}


function getIndex(array, category, item) {
    return array.findIndex(object => {
        return eval(`object.${category} === '${item}'`);
      });
}

async function authenticate(req, cache) {
    let user = req.body.username;
    let pw = req.body.password;
    let user_cache = cache.get("users", user);
    if(!user_cache) return false;
    let user_pw = await keytar.getPassword("repage", user);
    if(user_pw === pw) return user_cache;
    return false;
}