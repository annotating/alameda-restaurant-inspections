require('dotenv').config();
var express = require('express');
var request = require('request');
var Inspections = require("../apis/acgov/inspections");
var moment = require("moment");

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
            records: records,
            alertHeader : moment().format('MMMM') + ' Alerts'
          });
        } 
      }
  );
});

router.get('/search', function(req, res, next) {
  var query = req.query.q;
  if (!query.name) {
    res.redirect("/");
  }
  request({
        url: Inspections.url,
        method: 'GET',
        qs: Inspections.query.search(query)
      }, function (error, response, dataJSON) {
        if (!error) {
          var records = JSON.parse(dataJSON);
          records = unique(records, 'facility_name');
          res.render('index', {
            records: records,
            alertHeader : 'Search Results'
          });
        } 
      }
  );
});

// process search request
router.post('/search', function(req, res) {
  var query = req.body.q;
  if (!query) {
    res.redirect("/");
  }

  request({
    url: Inspections.url,
    method: 'GET',
    qs: Inspections.query.search(query)
  }, function (error, response, dataJSON) {
    if (!error) {
      var records = JSON.parse(dataJSON);
      if (query.location) {
        // no filter
      } else {
        records = unique(records, 'location_1_location');
      }
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
