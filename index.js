const { StringStream } = require('scramjet');
const request = require('request');

const today = new Date();
const yesterdayDate = today.getDate() - 1;
const yesterdayMonth = today.getMonth() + 1;
const yesterday = '0' + yesterdayMonth + '-' + yesterdayDate + '-' + today.getFullYear();
console.log('yesterday: ', yesterday);

// https://stackoverflow.com/questions/47823288/parse-remote-csv-file-using-nodejs-papa-parse
// request.get("https://srv.example.com/main.csv")   // fetch csv
//     .pipe(new StringStream())                       // pass to stream
//     .CSVParse()                                   // parse into objects
//     .consume(object => console.log("Row:", object))  // do whatever you like with the objects
//     .then(() => console.log("all done"));

// const url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + yesterday + '.csv';
// request.get(url)
//     .pipe(new StringStream())
//     .CSVParse({ skipEmptyLines: true, header: true })
//     .filter(object => (object.Country_Region === 'Malaysia'))
//     .peek(1000, object => console.log("object:", object));

// const url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + yesterday + '.csv';
// request.get(url)
//     .pipe(new StringStream())
//     .CSVParse({ skipEmptyLines: true, header: true })
//     .filter(object => (object.Country_Region === 'US'))
//     .map(async(object) => {
//         console.log('object: ', object);
//     });

const url = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/' + yesterday + '.csv';
request.get(url)
    .pipe(new StringStream())
    .CSVParse({ skipEmptyLines: true, header: true })
    .filter(object => (object.Country_Region === 'Canada'))
    .map(async(object) => {   
        return object;
    });