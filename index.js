require('dotenv').config();

import { setFailed } from '@actions/core';
import Telegram from 'node-telegram-bot-api';
import getCovid19Message from './getCovid19Message';

const bot = new Telegram(process.env.TELEGRAM_TOKEN);
const country = process.env.COUNTRY !== undefined ? process.env.COUNTRY : 'Malaysia';
const csv = process.env.CSV !== undefined ? process.env.CSV : '.csv';
const url = process.env.URL !== undefined ? process.env.URL : 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';

sendCovid19Message();

export function sendCovid19Message() {
    try {
        const message = getCovid19Message(country, csv, url);
        Promise.all([message]).then((values) => {
            //console.log('send message: ' + values[0]);
            bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
        });
    } catch (error) {
        setFailed(error.message);
    }
}
