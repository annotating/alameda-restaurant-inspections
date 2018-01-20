require('dotenv').config();
var express = require('express');
var request = require('request');
var Inspections = require("../apis/acgov/inspections");
var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY
});  

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  request({
        url: Inspections.url,
        method: 'GET',
        qs: Inspections.query.recent
      }, function (error, response, dataJSON) {
        if (!error) {
          var records = JSON.parse(dataJSON);
          records = unique(records, 'facility_name');
          res.render('index', {
            records: records
          });
        } 
      }
  );
});

// process search request
router.post('/search', function(req, res) {
  var name = req.body.name;
  if (!name) {
    res.redirect("/");
  }
  request({
    url: Inspections.url,
    method: 'GET',
    qs: Inspections.query.search(name)
  }, function (error, response, dataJSON) {
    if (!error) {
      var records = JSON.parse(dataJSON);
      records = unique(records, 'location_1_location');
      res.send(records);
    }
  })
});

function unique(arr, property) {
  var seen = {};
  return arr.filter(function(item) {
      return seen[item[property]] ? false : (seen[item[property]] = true);
  });
}

module.exports = router;
