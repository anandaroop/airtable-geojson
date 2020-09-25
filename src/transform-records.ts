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
interface Errors {
  missingGeocodes: Airtable.Record<any>[]
  invalidGeocodes: Airtable.Record<any>[]
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
): [FeatureCollection<Point, any>, Errors] => {
  const geocodedFieldName = options?.geocodedFieldName || "Geocode cache"

  const validFeatures: Feature<Point, any>[] = []
  const missingGeocodes: Airtable.Record<any>[] = []
  const invalidGeocodes: Airtable.Record<any>[] = []

  records.forEach((r) => {
    try {
      const f = transformRecordToFeature(r, geocodedFieldName)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      validFeatures.push(f!)
    } catch (e) {
      if (e instanceof InvalidGeocodeException) {
        invalidGeocodes.push(r)
      } else if (e instanceof MissingGeocodeException) {
        missingGeocodes.push(r)
      }
    }
  })

  const featureCollection: FeatureCollection<Point, any> = {
    type: "FeatureCollection",
    features: validFeatures,
  }

  const errors: Errors = {
    missingGeocodes,
    invalidGeocodes,
  }

  return [featureCollection, errors]
}

/**
 * Converts a single Airtable record into a corresponding GeoJSON Feature.
 *
 * The feature will have:
 * - an `id` matching the Airtable record
 * - a Point `geometry` that matches the cached geocode field from the Airtable record
 * - and `properties` that match the remainder of the Airtable fields.
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
      throw new MissingGeocodeException(record)
    } else if (e instanceof InvalidGeocodeException) {
      console.error(
        "Skipping feature where LatLng appears to be undefined. Showing geodata and record:",
        e.geocode,
        record
      )
      throw new InvalidGeocodeException(e.geocode, record)
    }
  }
}
