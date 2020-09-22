//  record #1 is invalid
//  record #2 is valid

export const fixture = [
  {
    _table: {
      _base: {
        _airtable: {
          requestTimeout: 300000,
        },
        _id: "app42",
      },
      id: null,
      name: "Fridges",
    },
    id: "rec1",
    _rawJson: {
      id: "rec1",
      fields: {
        Name: "First location",
        "Zip Code": "11111",
        "Geocode cache":
          "🔴 eyJpIjoiNzc0NCBBdXN0aW4gU3RyZWV0LCBRdWVlbnMsIE5ZIiwibyI6eyJzdGF0dXMiOiJFUlJPUiJ9LCJlIjoxNjAwMjY2MTM4ODkxfQ==",
      },
      createdTime: "2020-08-28T23:41:16.000Z",
    },
    fields: {
      Name: "First location",
      "Zip Code": "11111",
      "Geocode cache":
        "🔴 eyJpIjoiNzc0NCBBdXN0aW4gU3RyZWV0LCBRdWVlbnMsIE5ZIiwibyI6eyJzdGF0dXMiOiJFUlJPUiJ9LCJlIjoxNjAwMjY2MTM4ODkxfQ==",
    },
  },
  {
    _table: {
      _base: {
        _airtable: {
          requestTimeout: 300000,
        },
        _id: "app42",
      },
      id: null,
      name: "Fridges",
    },
    id: "rec2",
    _rawJson: {
      id: "rec2",
      fields: {
        Name: "Second location",
        "Zip Code": "11112",
        "Geocode cache":
          "🔵 eyJpIjoiMjQtMjAgRGl0bWFycyBCbHZkLCBBc3RvcmlhLCAxMTEwNSIsIm8iOnsic3RhdHVzIjoiT0siLCJmb3JtYXR0ZWRBZGRyZXNzIjoiMjQtMjAgRGl0bWFycyBCbHZkLCBMb25nIElzbGFuZCBDaXR5LCBOWSAxMTEwNSwgVVNBIiwibGF0Ijo0MC43Nzg3MzE4LCJsbmciOi03My45MTQ2OTV9LCJlIjoxNjAyMzkwMzI2MjY4fQ==",
      },
      createdTime: "2020-08-28T23:41:16.000Z",
    },
    fields: {
      Name: "Second location",
      "Zip Code": "11112",
      "Geocode cache":
        "🔵 eyJpIjoiMjQtMjAgRGl0bWFycyBCbHZkLCBBc3RvcmlhLCAxMTEwNSIsIm8iOnsic3RhdHVzIjoiT0siLCJmb3JtYXR0ZWRBZGRyZXNzIjoiMjQtMjAgRGl0bWFycyBCbHZkLCBMb25nIElzbGFuZCBDaXR5LCBOWSAxMTEwNSwgVVNBIiwibGF0Ijo0MC43Nzg3MzE4LCJsbmciOi03My45MTQ2OTV9LCJlIjoxNjAyMzkwMzI2MjY4fQ==",
    },
  },
]
