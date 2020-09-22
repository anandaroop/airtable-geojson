/* eslint-disable @typescript-eslint/no-explicit-any */

import { AirtableCachedGeocode } from "./types"

/**
 * Pull the lat/lng out of the base64-encoded geocoder result cached by Airtable
 */
export const decodeGeodata = (value: string): AirtableCachedGeocode => {
  if (!value?.length) {
    throw new MissingGeocodeException()
  }

  const encodedData = value.substring(3) // lop off leading status indicator emoji
  const buffer = Buffer.from(encodedData, "base64")
  const text = buffer.toString("ascii").replace(/\\"/g, "")
  const geodata = JSON.parse(text)

  if (geodata.o.lat === undefined || geodata.o.lng === undefined) {
    throw new InvalidGeocodeException(geodata)
  }

  return geodata
}

export class MissingGeocodeException {
  private name: string
  private message: string
  public record: Airtable.Record<any> | undefined

  constructor(record?: Airtable.Record<any>) {
    this.name = "MissingGeocodeExecption"
    this.message = "The cached geocoded field was found to be empty."
    this.record = record
  }
}

export class InvalidGeocodeException {
  private name: string
  private message: string
  public geocode: AirtableCachedGeocode
  public record: Airtable.Record<any> | undefined

  constructor(field: AirtableCachedGeocode, record?: Airtable.Record<any>) {
    this.name = "InvalidGeocodeExecption"
    this.message =
      "The cached geocoded field contained null or otherwise invalid data."
    this.geocode = field
    this.record = record
  }
}
