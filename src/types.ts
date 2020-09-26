/**
 * Represents the result of an Airtable Map block's cached geocoding value.
 *
 * This is base64 encoded and stored in a designated column on the table,
 * configured via the Map block's settings. That column name corresponds
 * to the `geocodedFieldName` required by this library.
 */
export interface AirtableCachedGeocode {
  /** geocoder query string */
  i: string

  /** geocoder cached result */
  o: {
    /** status */
    status: string

    /** canonical address string */
    formattedAddress: string

    /** geocoded latitude */
    lat: number

    /** geocoded latitude */
    lng: number
  }

  /** cache expiry, in epoch milliseconds */
  e: number
}

export interface AirtableGeoJSONErrors<F> {
  missingGeocodes: Airtable.Record<F>[]
  invalidGeocodes: Airtable.Record<F>[]
}

/**
 * Used to assert that our generic types are key-value maps
 * that contain at least one string -> string mapping, namely
 * the one for the geocoded field name -> geocoder cache value
 */
export interface StringMap {
  [key: string]: string
}
