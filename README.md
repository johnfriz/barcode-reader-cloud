# Barcode Lookup & Ordering

This app allows you to look up a barcode by UPC id. It returns information on the barcode including a base64 encoded image of the product. You can also place orders for the items represented by the barcodes.

# Group Barcode API

# Recent Searches [/barcode/recent]

'List recent searches' endpoint.

## barcode/recent [GET]

'List recent searches' endpoint.

+ Response 200 (application/json)
    + Body
            ["7622210141132","886742322705","0605168543705","9781432941048","0810815021097"]


# Read Barcode [/barcode/read]

'Read Barcode' endpoint.

## barcode/read [POST]

'Read Barcode' endpoint.

+ Request (application/json)
    + Body
            {
              "barcode": "7622210141132"
            }

+ Response 200 (application/json)
    + Body
            [
              "barcode": "7622210141132",
              "productname": "Cadbury Wispa Gold Hot Chocolate Drink",
              "imagebase64" : "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUE..."
              "price": "11.59",
              "currency": "USD"
            ]

+ Response 400 (application/json)
    + Body
            {"Invalid Barcode Id"}


# Group Orders API

# Manage Orders [/orders]

## List Orders [GET]

'List orders' endpoint.

+ Response 200 (application/json)
    + Body
    {
      "orders": [
        {
          "id": "6367c48dd193d56ea7b0baad25b19455e529f5ee",
          "barcode": "7622210141132",
          "productname": "Cadbury Wispa Gold Hot Chocolate Drink",
          "imagebase64": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEB..."
          "price": "11.59",
          "currency": "USD"
          "quantity": "1",
          "total": "11.59"
        },
        {
          "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5",
          "barcode": "886742322705",
          "productname": "Lucky Women's Fastt Gladiator Sandal, Black, 6.5 M US",
          "imageurl": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQF...",
          "price": "68.95",
          "currency": "USD",
          "quantity": "2",
          "total": "137.90"
        }
      ],
      "total" : "149.49";
    }

## Add Order [POST]

'Add Item' endpoint.

+ Request (application/json)
    + Body
            {
              "barcode": "9780201896831",
              "quantity" : 1
            }

+ Response 200 (application/json)
    + Body
            {
              "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5",
              "barcode": "9780201896831",
              "quantity": "2",
              "total": "137.90"
            }

+ Response 400 (application/json)
    + Body
            {"Invalid Barcode Id"}

# Manage Orders [/orders/{id}]

## [PUT]

'Update Item Quantity' endpoint.

+ Request (application/json)
    + Body
            {
              "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5",
              "quantity": 2
            }

+ Response 200 (application/json)
    + Body
            {
              "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5",
              "barcode": "9780201896831",
              "quantity": "2",
              "total": "137.90"
            }

+ Response 400 (application/json)
    + Body
            {"Invalid Order Id"}


## [DELETE]

'Remove Order' endpoint.

+ Request (application/json)
    + Body
            {
              "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5"
            }

+ Response 200 (application/json)
    + Body
            {}

+ Response 400 (application/json)
    + Body
            {"Invalid Order Id"}
