import { setFailed } from '@actions/core';
import { StringStream } from 'scramjet';
import { get } from 'request';

const today = new Date();

export default function getCovid19Message(country, csv, url) {
    try {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedYesterdayDate = getFormattedDate(yesterday);

        const dayBeforeYesterday = new Date(today);
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
        const formattedDayBeforeYesterdayDate = getFormattedDate(dayBeforeYesterday);

        return generateMessage(country, csv, url, formattedYesterdayDate, formattedDayBeforeYesterdayDate, yesterday);
    } catch (error) {
        setFailed(error.message);
    }
}

async function generateMessage(country, csv, url, formattedYesterdayDate, formattedDayBeforeYesterdayDate, todayMinusOne) {
    const resultYesterday = getResult(country, csv, url, formattedYesterdayDate);
    const resultDayBeforeYesterday = getResult(country, csv, url, formattedDayBeforeYesterdayDate);

    let message = await Promise.all([resultYesterday, resultDayBeforeYesterday]).then((values) => {
        const totalYesterdayConfirmed = countTotal(values[0], 'Confirmed');
        const totalYesterdayDeaths = countTotal(values[0], 'Deaths');
        const totalYesterdayRecovered = countTotal(values[0], 'Recovered');
        const totalYesterdayActive = countTotal(values[0], 'Active');

        const totalDayBeforeYesterdayConfirmed = countTotal(values[1], 'Confirmed');
        const totalDayBeforeYesterdayDeaths = countTotal(values[1], 'Deaths');
        const totalDayBeforeYesterdayRecovered = countTotal(values[1], 'Recovered');

        const msg = `${country} COVID-19 Update as ${todayMinusOne.toDateString()};
        New Case: ${Math.abs(parseInt(totalYesterdayConfirmed) - parseInt(totalDayBeforeYesterdayConfirmed))}.
        Deaths: ${Math.abs(parseInt(totalYesterdayDeaths) - parseInt(totalDayBeforeYesterdayDeaths))}.
        Recovered: ${Math.abs(parseInt(totalYesterdayRecovered) - parseInt(totalDayBeforeYesterdayRecovered))}.
        Total Confirmed: ${totalYesterdayConfirmed}.
        Total Deaths: ${totalYesterdayDeaths}.
        Total Recovered: ${totalYesterdayRecovered}.
        Total Active: ${totalYesterdayActive}.`;

        return msg;
    });

    return message;
}

async function getResult(country, csv, url, formattedDate) {
    let arr = [];
    await get(url + formattedDate + csv)
        .pipe(new StringStream())
        .CSVParse({ delimiter: ',', skipEmptyLines: true, header: true })
        .filter(data => (data.Country_Region === country))
        .consume(data => arr.push(data));
    return arr;
}

function getFormattedDate(dateVal) {
    const monthVal = dateVal.getMonth() + 1;
    let formattedDateVal = monthVal + '-' + dateVal.getDate() + '-' + dateVal.getFullYear();
    if (monthVal < 10) {
        formattedDateVal = '0' + formattedDateVal;
    }
    return formattedDateVal;
}

function countTotal(arrayVal, propertyVal) {
    let sum = 0;
    arrayVal.forEach(element => {
        for (let property in element) {
            if (property === propertyVal) {
                if (element[property] !== '' && element[property] !== null && element[property] !== undefined) {
                    sum += parseInt(element[property]);
                }
            }
        }
    });
    return sum;
}
