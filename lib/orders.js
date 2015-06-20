var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fh = require('fh-mbaas-api');
var services = require('./serviceMap.js');
var winston = require('winston');

function ordersRoute() {
  var orders = new express.Router();
  orders.use(cors());
  orders.use(bodyParser());

  orders.get('/', function(req, res) {
    fh.service({guid : services.order, path : '/orders' , method : 'GET'},
      function(err, body, serviceRes) {
        if (err) {
          winston.warn('Error calling order service - ' + err);
          return res.status(500).send(err);
        } else {
          winston.info('Returning service data for orders: ' + body);
          return res.json(body);
        }
      }
    );
  });

  orders.post('/', function(req, res) {
    fh.service({guid : services.order, path : '/orders' , method : 'POST', params:req.body},
      function(err, body, serviceRes) {
        if (err) {
          winston.warn('Error calling order service - ' + err);
          return res.status(500).send(err);
        } else {
          winston.info('Returning service data for orders: ' + JSON.stringify(body));
          return res.json(body);
        }
      }
    );
  });

  orders.put('/:id', function(req, res) {
    console.log('req.body = ', req.body);
    fh.service({guid : services.order, path : '/orders/' + req.params.id , method : 'PUT', params:req.body},
      function(err, body, serviceRes) {
        if (err) {
          winston.warn('Error calling order service - ' + err);
          return res.status(500).send(err);
        } else {
          winston.info('Returning service data for orders: ' + JSON.stringify(body));
          return res.json(body);
        }
      }
    );
  });

  orders.delete('/:id', function(req, res) {
    fh.service({guid : services.order, path : '/orders/' + req.params.id , method : 'DELETE', params:req.body},
      function(err, body, serviceRes) {
        if (err) {
          winston.warn('Error calling order service - ' + err);
          return res.status(500).send(err);
        } else {
          winston.info('Returning service data for orders: ' + JSON.stringify(body));
          return res.json(body);
        }
      }
    );
  });

  return orders;
}

module.exports = ordersRoute;
