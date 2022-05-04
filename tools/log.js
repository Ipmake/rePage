const chalk = require('chalk');
const fs = require('fs');
const logconfig = require('../config/logging.json');

const startstamp = new Date();
const startstampString = `${startstamp.getDate()}.${startstamp.getMonth() + 1}.${startstamp.getFullYear()} ${startstamp.getHours()}h ${startstamp.getMinutes()}m ${startstamp.getSeconds()}s`;

if(logconfig.logToFile) fs.writeFile(`./logs/${startstampString}.log`, `----------------START OF LOG----------------\n\n`, err => {  if(err) console.error(err)}  );


module.exports = async (category, message, origin) => {
    const date = new Date();
    const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    const log = `${dateString} [${category}/${origin}] ${message}\n`;

    switch(category) {
        case 'init':
            console.log(chalk.bgCyan(message));
            break;

        case 'error':
            if(logconfig.logToConsole) console.log(chalk.red(`[${category}/${origin}] ${message}`));
            break;

        case 'system':
            if(logconfig.logToConsole) console.log(chalk.blue(`[${category}/${origin}] ${message}`));
            break;

        case 'info':
            if(logconfig.logToConsole) console.log(chalk.green(`[${category}/${origin}] ${message}`));
            break;

        case 'debug':
            if(!logconfig.debugMode) return;
            if(logconfig.logToConsole) console.log(chalk.yellow(`[${category}/${origin}] ${message}`));
            break;

        case 'sysOK':
            const offset = 10 - origin.length

            const offsetString = ' '.repeat(offset);
            if(logconfig.logToConsole) console.log(chalk.blue(`[${origin}] ${offsetString} | ${chalk.green("OK")}`));
            break;

        case 'sysERROR':
            const erroffset = 10 - origin.length

            const erroffsetString = ' '.repeat(offset);
            if(logconfig.logToConsole) console.log(chalk.blue(`[${origin}] ${erroffsetString} | ${chalk.red("ERROR")}`));
            break;

    }

    if(logconfig.logToFile) fs.appendFile(`./logs/${startstampString}.log`, log, (err) => {  if (err) { console.log(chalk.color.red(err)); }});
}