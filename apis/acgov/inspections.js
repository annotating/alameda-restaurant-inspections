require('dotenv').config();
var moment = require("moment");

var Inspections = {
    url: "https://data.acgov.org/resource/y2kh-zbwg.json",

    query : {
        recent : {
            "$select" : "facility_name, resource_code, activity_date, " +
                        "location_1, " +
                        "location_1_city, " +
                        "location_1_location, " +
                        "location_1_state, " +
                        "location_1_zip",
            "$where" :  "(resource_code='Y' OR resource_code='R') AND " +
                        "activity_date > " + "'"+ moment().utcOffset("+0800").startOf('month').format("YYYY-MM-DD") + "'",
            "$order" : "activity_date DESC",
            //"$limit" : 250,
            "$$app_token" : process.env.ACGOV_TOKEN
        },
        name : function(name) {
            return {
                "facility_name" : name,
                "$$app_token" : process.env.ACGOV_TOKEN
            }
        }, 
        search : function(name) {
            return {
                "$where" : "LOWER(facility_name) like LOWER('%"+name+"%')",
                "$select" : "facility_name, " +
                            "location_1, " +
                            "location_1_city, " +
                            "location_1_location, " +
                            "location_1_state, " +
                            "location_1_zip",
                "$$app_token" : process.env.ACGOV_TOKEN
            }
        }
    }
}

module.exports = Inspections;