require('dotenv').config();
var express = require('express');
var request = require('request');
var Inspections = require("../apis/acgov/inspections");
var moment = require("moment");
var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY
});  

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  request({
        url: Inspections.url,
        method: 'GET',
        qs: Inspections.query
      }, function (error, response, dataJSON) {
        if (!error) {
          var records = JSON.parse(dataJSON);
          records = unique(records, 'facility_name');

          res.render('index', {
            records: records, 
            moment: moment, 
            googleMapsAPIKey: process.env.GOOGLE_MAPS_API_KEY
          });
        } 
      }
  );
});

function unique(arr, property) {
  var seen = {};
  return arr.filter(function(item) {
      return seen[item[property]] ? false : (seen[item[property]] = true);
  });
}

module.exports = router;
