require('dotenv').config();

import { setFailed } from '@actions/core';
import Telegram from 'node-telegram-bot-api';
import getCovid19Message from './getCovid19Message';

const bot = new Telegram(process.env.TELEGRAM_TOKEN);
const country = process.env.COUNTRY;
const csv = process.env.CSV;
const url = process.env.URL;

export function sendCovid19Message() {
    try {
        const message = getCovid19Message(country, csv, url);
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
    } catch (error) {
        setFailed(error.message);
    }
}
