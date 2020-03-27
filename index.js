const {StringStream} = require("scramjet");
const request = require("request");

request.get("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-26-2020.csv")   // fetch csv
    .pipe(new StringStream())                       // pass to stream
    .CSVParse()                                   // parse into objects
    .consume(object => console.log("Row:", object))  // do whatever you like with the objects
    .then(() => console.log("all done"));