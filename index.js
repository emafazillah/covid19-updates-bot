require('dotenv').config();
const { StringStream } = require('scramjet');
const request = require('request');
const Telegram = require('node-telegram-bot-api');
const bot = new Telegram(process.env.TELEGRAM_TOKEN);

const URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';
const CSV = '.csv';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
let formattedYesterdayDate = '';
const getMonth = yesterday.getMonth() + 1;
if (getMonth < 10) {
    formattedYesterdayDate = '0' + getMonth + '-' + yesterday.getDate() + '-' + yesterday.getFullYear();
} else {
    formattedYesterdayDate = getMonth + '-' + yesterday.getDate() + '-' + yesterday.getFullYear();
}

const generateMessage = object => 
    `Malaysia COVID-19 Updates as ${yesterday.toDateString()}; 
    Confirmed: ${object.Confirmed}. 
    Deaths: ${object.Deaths}. 
    Recovered: ${object.Recovered}. 
    Active: ${object.Active}.`;

// TODO: Get country region from configuration
request.get(URL + formattedYesterdayDate + CSV)
    .pipe(new StringStream())
    .CSVParse({ skipEmptyLines: true, header: true })
    .filter(object => (object.Country_Region === 'Malaysia'))
    .map(async(object) => {
        const message = generateMessage(object);
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
    });