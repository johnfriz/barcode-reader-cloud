var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fh = require('fh-mbaas-api');
var services = require('./serviceMap.js');
var winston = require('winston');
var mime = require('mime');

function barcodeRoute() {
  var barcode = new express.Router();
  barcode.use(cors());
  barcode.use(bodyParser());

  barcode.get('/recent', function(req, res) {
    winston.info('/barcode/recent');

    // Check if we have recent searches in cache
    fh.cache({act : 'load', key : 'barcode-recent'}, function (err, cacheRes) {
      if(err || !cacheRes) {
        winston.info('No cached data for recent barcodes - calling barcode service');
        fh.service({guid : services.barcode, path : '/barcode/recent' , method : 'GET'},
          function(err, body, serviceRes) {
            if (err) {
              winston.warn('Error calling barcode service - ' + err);
              return res.status(500).send(err);
            } else {
              var barcodeSearches = JSON.stringify(body);
              winston.info('Returning service data for recent barcode searches: ' + barcodeSearches);

              // Cache the recent barcode searches for 10 seconds
              fh.cache({act : 'save', key : 'barcode-recent', value : barcodeSearches, expire : 10}, function (err, cacheRes) {
                return res.json(JSON.parse(barcodeSearches));
              });
            }
          }
        );
      } else {
        winston.info('Returning cached data for recent barcode searches: ' + cacheRes);
        return res.json(JSON.parse(cacheRes));
      }
    });
  });

  barcode.all('/read', function(req, res) {
    winston.info('/barcode/read');

    var barcodeId = req.query.barcode || req.body.barcode;
    winston.info('barcodeId = ' + barcodeId);

    // Check if we have data on this barcode in cache
    fh.cache({'act':'load','key':'barcode-' + barcodeId}, function (err, cacheRes) {
      if(err || !cacheRes) {
        winston.info('No cached data for barcode - calling barcode service');
        fh.service({guid : services.barcode, path : '/barcode/read', method : 'GET',params : {barcode : barcodeId}},
          function(err, body, barcodeServiceRes) {
            if (err) {
              winston.warn('Error calling barcode service - ' + err);
              return res.status(500).send(err);
            } else {
              winston.info('Response from Barcode Sercice = ', body);

              // Potentially more then one item can be returned for a barcode - just take the first one
              var barcodeInfo = body[0];

              function returnBarcodeInfo(barcodeInfo) {
                // Trim the payload to remove un-needed fields
                delete barcodeInfo.imageurl;
                delete barcodeInfo.producturl;
                delete barcodeInfo.saleprice;
                delete barcodeInfo.storename;

                // Cache the barcode data for 10 seconds
                fh.cache({act : 'save', key : 'barcode-'+barcodeId, value : JSON.stringify(barcodeInfo), expire : 10}, function (err, cacheRes) {
                  // Trim the log data so the full base64 image is not pumped into the logs
                  winston.info('Returning service data for barcode : ' + JSON.stringify(barcodeInfo).substring(0,256) + '...');
                  return res.json(barcodeInfo);
                });
              }

              if(barcodeInfo.imageurl && barcodeInfo.imageurl != 'N/A') {
                winston.info('Calling image service to get base64 encoded data for barcode item image');
                fh.service({guid : services.image, path : '/image', method : 'GET', params : {url : barcodeInfo.imageurl, base64 : true}},
                  function(err, body, imageServiceRes) {
                    if (err) {
                      winston.warn('Error calling barcode service - ' + err);
                      return res.status(500).send(err);
                    } else {
                      var mimeType = mime.lookup(barcodeInfo.imageurl);
                      winston.info('mime type of image = ' + mimeType);
                      var base64Image = 'data:' + mimeType + ';base64,' + body

                      // Store the base64 encoded image in the object
                      barcodeInfo.imagebase64 = base64Image;
                      return returnBarcodeInfo(barcodeInfo);
                    }
                  }
                );
              } else {
                return returnBarcodeInfo(barcodeInfo);
              }
            }
          }
        );
      } else {
        // Trim the log data so the full base64 image is not pumped into the logs
        winston.info('Returning cached data for barcode : ' + cacheRes.substring(0,256) + '...');
        return res.json(JSON.parse(cacheRes));
      }
    });
  });

  return barcode;
}

module.exports = barcodeRoute;
