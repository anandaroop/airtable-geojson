import { Feature, FeatureCollection, Point } from "geojson"
import {
  decodeGeodata,
  InvalidGeocodeException,
  MissingGeocodeException,
} from "./geodata"
import { AirtableGeoJSONErrors } from "./types"

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
 * resulting FeatureCollection.
 */
export const createFeatureCollection = <F>(
  records: Airtable.Records<F>,
  options?: Options
): [FeatureCollection<Point, F>, AirtableGeoJSONErrors<F>] => {
  const geocodedFieldName = options?.geocodedFieldName || "Geocode cache"

  const validFeatures: Feature<Point, F>[] = []
  const missingGeocodes: Airtable.Record<F>[] = []
  const invalidGeocodes: Airtable.Record<F>[] = []

  records.forEach((r) => {
    try {
      const f = createFeature(r, geocodedFieldName)
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

  const featureCollection: FeatureCollection<Point, F> = {
    type: "FeatureCollection",
    features: validFeatures,
  }

  const errors: AirtableGeoJSONErrors<F> = {
    missingGeocodes,
    invalidGeocodes,
  }

  return [featureCollection, errors]
}

/**
 * Transform a single Airtable record into a corresponding GeoJSON Feature.
 *
 * The feature will have:
 * - an `id` matching the Airtable record
 * - a Point `geometry` that matches the cached geocode field from the Airtable record
 * - and `properties` that match the remainder of the Airtable fields.
 */
const createFeature = <F>(
  record: Airtable.Record<F>,
  geocodedFieldName: string
): Feature<Point, F> | undefined => {
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
