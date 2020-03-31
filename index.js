require('dotenv').config();
const core = require('@actions/core');
const github = require('@actions/github');
const { StringStream } = require('scramjet');
const request = require('request');
const Telegram = require('node-telegram-bot-api');
const bot = new Telegram(process.env.TELEGRAM_TOKEN);

const URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';
const CSV = '.csv';

try {
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
    
    // request.get(URL + formattedYesterdayDate + CSV)
    //     .pipe(new StringStream())
    //     .CSVParse({ skipEmptyLines: true, header: true })
    //     .filter(object => (object.Country_Region === 'Malaysia'))
    //     .map(async(object) => {
    //         const message = generateMessage(object);
    //         bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
    //     });

    async function getResult(country) {
        let arr = [];
        await request
                .get(URL + formattedYesterdayDate + CSV)
                .pipe(new StringStream())
                .CSVParse({ skipEmptyLines: true, header: true })
                .filter(data => (data.Country_Region === country))
                .consume(data => arr.push(data));
        return arr;
    }
    
    getResult('Australia')
        .then(result => {
            // console.log('result: ', result);
            let totalConfirmed = 0;
            let totalDeaths = 0;
            let totalRecovered = 0;
            let totalActive = 0;
            result.forEach(element => {
                totalConfirmed = totalConfirmed + parseInt(element.Confirmed);
                totalDeaths = totalDeaths + parseInt(element.Deaths);
                totalRecovered = totalRecovered + parseInt(element.Recovered);
                totalActive = totalActive + parseInt(element.Active);
            });
            // console.log('totalConfirmed: ', totalConfirmed);
            // console.log('totalDeaths: ', totalDeaths);
            // console.log('totalRecovered: ', totalRecovered);
            // console.log('totalActive: ', totalActive);
        });

} catch (error) {
    core.setFailed(error.message);
}