var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

function ordersRoute() {
  var orders = new express.Router();
  orders.use(cors());
  orders.use(bodyParser());

  orders.get('/', function(req, res) {
    return res.json({
      "orders": [
        {
          "id": "6367c48dd193d56ea7b0baad25b19455e529f5ee",
          "barcode": "7622210141132",
          "price": "11.59",
          "quantity": "1",
          "total": "11.59"
        },
        {
          "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5",
          "barcode": "886742322705",
          "price": "68.95",
          "quantity": "2",
          "total": "137.90"
        }
      ],
      "total" : "149.49"
    });
  });

  orders.post('/', function(req, res) {
    if(req.body.barcode === "error") {
      return res.status(400).json({"error":"Invalid Barcode Id"});
    }
    return res.json({
      "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5",
      "barcode": "886742322705",
      "quantity": "2",
      "total": "137.90"
    });
  });

  orders.put('/:id', function(req, res) {
    if(req.params.id === "error") {
      return res.status(400).json({"error":"Invalid Order Id"});
    }
    return res.json({
      "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5",
      "barcode": "886742322705",
      "quantity": "2",
      "total": "137.90"
    });
  });

  orders.delete('/:id', function(req, res) {
    if(req.params.id === "error") {
      return res.status(400).json({"error":"Invalid Order Id"});
    }
    return res.json({});
  });

  return orders;
}

module.exports = ordersRoute;
