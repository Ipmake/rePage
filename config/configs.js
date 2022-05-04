const fs = require('fs');
const path = require('path');

var configs = {}

console.log(__dirname)
fs.readdirSync(__dirname).forEach(file => {

    if (!file.endsWith('.json')) return;
    
    const config = require(`./${file}`);

    eval(`configs.${file.split(".")[0]} = config;`);
})

module.exports = configs;