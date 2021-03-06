# Barcode Lookup & Ordering

This app allows you to look up a barcode by UPC id. It returns information on the barcode including a base64 encoded image of the product. You can also place orders for the items represented by the barcodes.

# Group APIs

# Recent Searches [/barcode/recent]

## /barcode/recent [GET]

List recent searches

+ Response 200 (application/json)
    + Body
            ["7622210141132","886742322705","0605168543705","9781432941048","0810815021097"]


# Read Barcode [/barcode/read]

## /barcode/read [POST]

Read a Barcode by barcode number

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


# List Orders [/orders]

## /orders [GET]

List current order items

+ Response 200 (application/json)
    + Body
    {
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
      "total" : "149.49";
    }

# Add Order [/orders]

## /orders [POST]

Add an Item to the Order


+ Request (application/json)
    + Body
            {
              "barcode": "9780201896831",
              "price": "68.95",
              "quantity" : 2
            }

+ Response 200 (application/json)
    + Body
            {
              "id": "a0312f777960e1dae7d3d0c8df6f0b43f91352d5",
              "barcode": "9780201896831",
              "price": "68.95",
              "quantity": "2",
              "total": "137.90"
            }

+ Response 400 (application/json)
    + Body
            {"Invalid Barcode Id"}

# Update Order [/orders/{id}]

## /orders/{id} [PUT]

Update Item Quantity

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


# Remove Order [/orders/{id}]

## /orders/{id} [DELETE]

Remove an Item from the Order

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
