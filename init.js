const log = require('./tools/log');
const config = require("./config/configs");
const os = require("os")
const routecore = require("./router/core")

log("init", "Initializing...", "init");

log("system", "-------------------------------------", "init");
log("system", "Starting up...", "init");
log("system", "", "init")
log("system", `CPU: ${os.cpus()[0].model}`, "init");
log("system", "OS: " + process.platform, "init");
log("system", "Node: " + process.version, "init");
log("system", "RAM: " + Math.round(os.totalmem() / 1024 / 1024 / 1024) + " GB", "init");
log("system", "-------------------------------------", "init");

const router = new routecore();