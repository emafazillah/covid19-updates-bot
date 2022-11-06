require('dotenv').config();
import { setFailed } from '@actions/core';
import { StringStream } from 'scramjet';
import { get } from 'request';
import Telegram from 'node-telegram-bot-api';
const bot = new Telegram(process.env.TELEGRAM_TOKEN);

const URL = process.env.URL;
const CSV = process.env.CSV;
const COUNTRY = process.env.COUNTRY;

try {
    const today = new Date();
    const yesterday = new Date(today);
    const dayBeforeYesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    let formattedYesterdayDate = '';
    let formattedDayBeforeYesterdayDate = '';
    const getMonth = yesterday.getMonth() + 1;
    const getMonthBefore = dayBeforeYesterday.getMonth() + 1;
    if (getMonth < 10 || getMonthBefore < 10) {
        formattedYesterdayDate = '0' + getMonth + '-' + yesterday.getDate() + '-' + yesterday.getFullYear();
        formattedDayBeforeYesterdayDate = '0' + getMonthBefore + '-' + dayBeforeYesterday.getDate() + '-' + dayBeforeYesterday.getFullYear();
    } else {
        formattedYesterdayDate = getMonth + '-' + yesterday.getDate() + '-' + yesterday.getFullYear();
        formattedDayBeforeYesterdayDate = getMonthBefore + '-' + dayBeforeYesterday.getDate() + '-' + dayBeforeYesterday.getFullYear();
    }

    const generateMessage = (country, newcase, deaths, recovered, totalConfirmed, totalDeaths, totalRecovered, totalActive) =>
        `${country} COVID-19 Update as ${yesterday.toDateString()};
        New Case: ${newcase}.
        Deaths: ${deaths}.
        Recovered: ${recovered}.
        Total Confirmed: ${totalConfirmed}.
        Total Deaths: ${totalDeaths}.
        Total Recovered: ${totalRecovered}.
        Total Active: ${totalActive}.`;

    async function getResult(country) {
        let arr = [];
        await get(URL + formattedYesterdayDate + CSV)
                .pipe(new StringStream())
                .CSVParse({ delimiter: ',', skipEmptyLines: true, header: true })
                .filter(data => (data.Country_Region === country))
                .consume(data => arr.push(data));
        await get(URL + formattedDayBeforeYesterdayDate + CSV)
                .pipe(new StringStream())
                .CSVParse({ delimiter: ',', skipEmptyLines: true, header: true })
                .filter(data => (data.Country_Region === country))
                .consume(data => arr.push(data));
        return arr;
    }

    getResult(COUNTRY)
        .then(result => {
            let newcase = 0;
            let deaths = 0;
            let recovered = 0;
            let totalConfirmed = 0;
            let totalDeaths = 0;
            let totalRecovered = 0;
            let totalActive = 0;
            let curr = '';
            let prev = '';

            result.forEach(element => {
                if (curr === '')
                {
                    totalConfirmed = parseInt(element.Confirmed);
                    totalDeaths = parseInt(element.Deaths);
                    totalRecovered = parseInt(element.Recovered);
                    totalActive = parseInt(element.Active);
                }
                else
                {
                    prev = curr;
                }
                curr = element.Last_Update.replace(' ', 'T') + 'Z';
                newcase = Math.abs(newcase - parseInt(element.Confirmed));
                deaths = Math.abs(deaths - parseInt(element.Deaths));
                recovered = Math.abs(recovered - parseInt(element.Recovered));
                if (prev !== '')
                {
                    if (new Date(curr) > new Date(prev))
                    {
                        totalConfirmed = parseInt(element.Confirmed);
                        totalDeaths = parseInt(element.Deaths);
                        totalRecovered = parseInt(element.Recovered);
                        totalActive = parseInt(element.Active);
                    }
                }
            });

            const message = generateMessage(COUNTRY, newcase, deaths, recovered, totalConfirmed, totalDeaths, totalRecovered, totalActive);
            bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
        });

} catch (error) {
    setFailed(error.message);
}