# airtable-geojson

Convert Airtable records into a GeoJSON FeatureCollection.

Given an Airtable configured with the [Map App](https://support.airtable.com/hc/en-us/articles/115013405108-Map-app) add-on (formerly the Map Block) this library can take the Airtable record result set (as returned by [airtable.js](https://github.com/airtable/airtable.js/)) and transform it into a GeoJSON FeatureCollection suitable for mapping or other geospatial applications.

## Basic usage

```js
import Airtable from "airtable"
import { transformRecordsToFeatureCollection } from "airtable-geojson"

const apiKey = "secret"
const baseId = "app123xyz"

export const airtable = new Airtable({ apiKey })
export const myBase = airtable.base(baseId)

const records = await myBase("My table")
  .select({
    fields: ["Name", "Address", "Geocoder cache"],
  })
  .all()

const options = {
  geocodedFieldName: "Geocoder cache",
}
const features = transformRecordsToFeatureCollection(records, options)
```

This would result in `features` looking something like:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-73.932376, 40.772817]
      },
      "properties": {
        "Name": "Foo",
        "Address": "8-01 Astoria Blvd"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-73.914695, 40.7787318]
      },
      "properties": {
        "Name": "Bar",
        "Address": "24-20 Ditmars Blvd"
      }
    }
  ]
}
```
