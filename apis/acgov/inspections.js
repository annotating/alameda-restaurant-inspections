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
                        "activity_date > " + "'"+ moment().utcOffset("+0800").startOf('month').subtract(1, 'month').format("YYYY-MM-DD") + "'",
            "$order" : "activity_date DESC",
            //"$limit" : 250,
            "$$app_token" : process.env.ACGOV_TOKEN
        },
        search : function(obj) {
            if (obj.location) {
                return {
                    "$select" : "facility_name, activity_date, " +
                               "resource_code, service, violation_description",
                    "$where" : "LOWER(facility_name)=LOWER('" + obj.name + "') AND " +
                                "location_1_location='" + obj.location.location_1_location + "' AND " +
                                "location_1_city='" + obj.location.location_1_city + "'",
                    "$order" : "activity_date DESC",
                    "$$app_token" : process.env.ACGOV_TOKEN
                }
            } else {
                return {
                    "$where" : "LOWER(facility_name) like LOWER('%"+obj.name+"%')",
                    "$select" : "facility_name, " +
                                "activity_date, " +
                                "resource_code, " +
                                "location_1, " +
                                "location_1_city, " +
                                "location_1_location, " +
                                "location_1_state, " +
                                "location_1_zip",
                    "$order" : "activity_date DESC",
                    "$$app_token" : process.env.ACGOV_TOKEN
                }
            }
        }
    }

}

module.exports = Inspections;