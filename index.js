require('dotenv').config();
const core = require('@actions/core');
const { StringStream } = require('scramjet');
const request = require('request');
const Telegram = require('node-telegram-bot-api');
const bot = new Telegram(process.env.TELEGRAM_TOKEN);

const URL = process.env.URL;
const CSV = process.env.CSV;
const COUNTRY = process.env.COUNTRY;

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
    
    const generateMessage = (country, totalConfirmed, totalDeaths, totalRecovered, totalActive) => 
        `${country} COVID-19 Update as ${yesterday.toDateString()}; 
        Total Confirmed: ${totalConfirmed}. 
        Total Deaths: ${totalDeaths}. 
        Total Recovered: ${totalRecovered}. 
        Total Active: ${totalActive}.`;

    async function getResult(country) {
        let arr = [];
        await request
                .get(URL + formattedYesterdayDate + CSV)
                .pipe(new StringStream())
                .CSVParse({ delimiter: ',', skipEmptyLines: true, header: true })
                .filter(data => (data.Country_Region === country))
                .consume(data => arr.push(data));
        return arr;
    }
    
    getResult(COUNTRY)
        .then(result => {
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
            
            const message = generateMessage(COUNTRY, totalConfirmed, totalDeaths, totalRecovered, totalActive);
            bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
        });

} catch (error) {
    core.setFailed(error.message);
}