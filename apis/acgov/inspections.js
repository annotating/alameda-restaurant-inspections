require('dotenv').config();
var moment = require("moment");

var Inspections = {
    url: "https://data.acgov.org/resource/y2kh-zbwg.json",

    query : {
        "$select" : "facility_name, location_1, activity_date",
        "$where" : "activity_date > " + "'"+ moment().utcOffset("+0800").startOf('month').format("YYYY-MM-DD") + "'",
        "$order" : "activity_date DESC",
        "$limit" : 100,
        "$$app_token" : process.env.ACGOV_TOKEN
    }
}

module.exports = Inspections;