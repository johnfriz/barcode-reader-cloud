var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fh = require('fh-mbaas-api');
var services = require('./serviceMap.js');
var winston = require('winston');
var mime = require('mime');
var fs = require('fs');

// Add timestamps to log statements
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({'timestamp': function() { return (new Date()); }})
    ]
});

function barcodeRoute() {
  var barcode = new express.Router();
  barcode.use(cors());
  barcode.use(bodyParser());

  barcode.all('/recent', function(req, res) {
    logger.info('************************');
    logger.info('/barcode/recent');

    // Check if we have recent searches in cache
    fh.cache({act : 'load', key : 'barcode-recent'}, function (err, cacheRes) {
      if(err || !cacheRes) {
        logger.info('No cached data for recent barcodes - calling barcode service');
        fh.service({guid : services.barcode, path : '/barcode/recent' , method : 'GET'},
          function(err, body, serviceRes) {
//            logger.debug('Res Status Code = ',  serviceRes.statusCode);
            if (err || (serviceRes && serviceRes.statusCode != 200)) {
              logger.warn('Error calling barcode service - Error = ', err, " - body = ", body);
              return res.status(500).send({"error":"Unable to reach barcode microservice", "body":body});
            } else {
              var barcodeSearches = JSON.stringify(body);
              logger.info('Returning service data for recent barcode searches: ' + barcodeSearches);

              // Cache the recent barcode searches for 10 seconds
              fh.cache({act : 'save', key : 'barcode-recent', value : barcodeSearches, expire : 10}, function (err, cacheRes) {
                return res.json(JSON.parse(barcodeSearches));
              });
            }
          }
        );
      } else {
        logger.info('Returning cached data for recent barcode searches: ' + cacheRes);
        return res.json(JSON.parse(cacheRes));
      }
    });
  });

  barcode.all('/read', function(req, res) {
    logger.info('************************');
    logger.info('/barcode/read');

    var barcodeId = req.query.barcode || req.body.barcode;
    logger.info('barcodeId = ' + barcodeId);

    // Check if we have data on this barcode in cache
    fh.cache({'act':'load','key':'barcode-' + barcodeId}, function (err, cacheRes) {
      if(err || !cacheRes) {
        logger.info('No cached data for barcode - calling barcode service');
        fh.service({guid : services.barcode, path : '/barcode/read', method : 'GET',params : {barcode : barcodeId}},
          function(err, body, barcodeServiceRes) {
            if (err || (barcodeServiceRes && barcodeServiceRes.statusCode != 200)) {
              logger.warn('Error calling barcode service - ' + err);
              return res.status(500).send({"error":"Unable to reach barcode microservice", "msg":err});
            } else {
              logger.info('Response from Barcode Sercice = ', body);

              var barcodeInfo = {}
              if( body && body.code === 'NO-BARCODE') {
                return barcodeInfo = setUnknownBarcodeInfo(barcodeInfo, res);
              }

              // Potentially more then one item can be returned for a barcode - just take the first one
              barcodeInfo = body[0];

              if(barcodeInfo && barcodeInfo.imageurl && barcodeInfo.imageurl != 'N/A') {
                logger.info('Calling image service to get base64 encoded data for barcode item image');
                fh.service({guid : services.image, path : '/image', method : 'GET', params : {url : barcodeInfo.imageurl, base64 : true}},
                  function(err, body, imageServiceRes) {
                    if (err || (imageServiceRes && imageServiceRes.statusCode && imageServiceRes.statusCode != 200)) {
                      logger.warn('Error calling image service. Returning "unknown" image. Err = ' + err);
                      barcodeInfo.imagebase64 = getUnknownImage();
                      return returnBarcodeInfo(barcodeId, barcodeInfo, res);
                    } else {
                      var mimeType = mime.lookup(barcodeInfo.imageurl);
                      logger.info('mime type of image = ' + mimeType);
                      var base64Image = 'data:' + mimeType + ';base64,' + body

                      // Store the base64 encoded image in the object
                      barcodeInfo.imagebase64 = base64Image;
                      return returnBarcodeInfo(barcodeId, barcodeInfo, res);
                    }
                  }
                );
              } else {
                barcodeInfo.imagebase64 = getUnknownImage();
                return returnBarcodeInfo(barcodeId, barcodeInfo, res);
              }
            }
          }
        );
      } else {
        // Trim the log data so the full base64 image is not pumped into the logs
        logger.info('Returning cached data for barcode : ' + cacheRes.substring(0,256) + '...');
        return res.json(JSON.parse(cacheRes));
      }
    });
  });

  return barcode;
}

function setUnknownBarcodeInfo(barcodeInfo, res) {
  logger.info('Setting unknown Barcode Info');
  barcodeInfo = {"productname" : "No product found for barcode!", "price":0};
  barcodeInfo.imagebase64 = getUnknownImage();
  return res.json(barcodeInfo);
}

function returnBarcodeInfo(barcodeId, barcodeInfo, res) {
  if(barcodeInfo) {
    // Trim the payload to remove un-needed fields
    delete barcodeInfo.imageurl;
    delete barcodeInfo.producturl;
    delete barcodeInfo.saleprice;
    delete barcodeInfo.storename;
  } else {
    setUnknownBarcodeInfo(barcodeInfo, res);
  }

  // Cache the barcode data for 10 seconds
  fh.cache({act : 'save', key : 'barcode-'+barcodeId, value : JSON.stringify(barcodeInfo), expire : 10}, function (err, cacheRes) {
    // Trim the log data so the full base64 image is not pumped into the logs
    logger.info('Returning service data for barcode : ' + JSON.stringify(barcodeInfo).substring(0,256) + '...');
    return res.json(barcodeInfo);
  });
}

function getUnknownImage() {
  var img = fs.readFileSync('./public/unknown.png');
  var b64 = Buffer(img).toString('base64');
  return 'data:image/png;base64,' + b64;
}

module.exports = barcodeRoute;
