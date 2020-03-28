const { StringStream } = require('scramjet');
const request = require('request');
const Telegram = require('node-telegram-bot-api');
const bot = new Telegram(process.env.TELEGRAM_TOKEN);

const today = new Date();
const yesterdayDate = today.getDate() - 1;
const yesterdayMonth = today.getMonth() + 1;
let yesterday = '';
if (yesterdayMonth < 10) {
    yesterday = '0' + yesterdayMonth + '-' + yesterdayDate + '-' + today.getFullYear();
} else {
    yesterday = yesterdayMonth + '-' + yesterdayDate + '-' + today.getFullYear();
}

const generateMessage = object => 
    `Malaysia COVID-19 Updates; 
    Confirmed: ${object.Confirmed}. 
    Deaths: ${object.Deaths}. 
    Recovered: ${object.Recovered}. 
    Active: ${object.Active}.`;

// TODO: Get country region from configuration
const url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + yesterday + '.csv';
request.get(url)
    .pipe(new StringStream())
    .CSVParse({ skipEmptyLines: true, header: true })
    .filter(object => (object.Country_Region === 'Malaysia'))
    .map(async(object) => {
        const message = generateMessage(object);
        // console.log('message: ', message);
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
    });