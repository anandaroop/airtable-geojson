/* eslint-disable @typescript-eslint/no-explicit-any */

import { Feature, FeatureCollection, Point } from "geojson"
import {
  decodeGeodata,
  InvalidGeocodeException,
  MissingGeocodeException,
} from "./decode-geodata"

interface Options {
  /**
   * The name of the field in the Airtable base that has
   * been configured as the "Geocode cache" field in Airtable's Map App
   * (formerly known as Map Block) add-on. This field holds a base64 encoded
   * JSON string representing the result of a geocoder query.
   *
   * Defaults to "Geocode cache"
   */
  geocodedFieldName?: string
}

/**
 * Transform an array of Airtable records into a
 * GeoJSON FeatureCollection object, one feature per record.
 *
 * Records with missing or invalid geodata are omitted from the
 * resulting FeatureCollection
 *
 * @param records array of Airtable records
 * @param options configuration options, such as the geocoded field name
 */
export const transformRecordsToFeatureCollection = (
  records: Airtable.Records<any>,
  options?: Options
): FeatureCollection<Point, any> => {
  const geocodedFieldName = options?.geocodedFieldName || "Geocode cache"

  const validFeatures = records
    .map((r) => transformRecordToFeature(r, geocodedFieldName))
    .filter((f) => f !== undefined) as Feature<Point, any>[]

  return {
    type: "FeatureCollection",
    features: validFeatures,
  }
}

/**
 * Converts a single Airtable record into a corresponding GeoJSON Feature.
 *
 * The feature will have a Point `geometry` that matches the cached geocode
 * field from Airtable, and `properties` that match the remainder of the
 * Airtable fields.
 */
const transformRecordToFeature = (
  record: Airtable.Record<any>,
  geocodedFieldName: string
): Feature<Point, any> | undefined => {
  try {
    const geodata = decodeGeodata(record.fields[geocodedFieldName])
    const {
      o: { lat, lng },
    } = geodata

    delete record.fields[geocodedFieldName]

    return {
      type: "Feature",
      id: record.id,
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        ...record.fields,
      },
    }
  } catch (e) {
    if (e instanceof MissingGeocodeException) {
      console.error(
        "Skipping feature where cached geocoded field value was missing:",
        record
      )
    } else if (e instanceof InvalidGeocodeException) {
      console.error(
        "Skipping feature where LatLng appears to be undefined. Showing geodata and record:",
        e.geocode,
        record
      )
    }
  }
}
