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
        qs: {
          "$limit" : Inspections.limit,
          "$$app_token" : process.env.ACGOV_TOKEN
        }
      }, function (error, response, dataJSON) {
        if (!error) {
          var records = JSON.parse(dataJSON);
          res.render('index', {records: records, moment: moment});
        }
      }
  );
});

module.exports = router;
