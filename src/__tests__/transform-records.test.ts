import { Feature, Point } from "geojson"

import { transformRecordsToFeatureCollection } from "../transform-records"
import { fixture as validRecordsFixture } from "../__fixtures__/valid-records"
import { fixture as customColumnsFixture } from "../__fixtures__/custom-column"
import { fixture as invalidGeocodeFixture } from "../__fixtures__/invalid-geocode"
import { fixture as missingGeocodeFixture } from "../__fixtures__/missing-geocode"

interface FixtureFields {
  Name: string
  "Zip Code": string
}

const deepRecreate = (obj: unknown) => JSON.parse(JSON.stringify(obj))

let records: Airtable.Records<FixtureFields>

describe(transformRecordsToFeatureCollection, () => {
  beforeEach(() => {
    records = deepRecreate(validRecordsFixture)
  })

  it("returns a FeatureCollection object", () => {
    const result = transformRecordsToFeatureCollection(records)

    expect(result).toEqual(
      expect.objectContaining({
        type: "FeatureCollection",
        features: expect.any(Array),
      })
    )
  })

  it("transforms the Airtable records & fields into GeoJSON features & properties", () => {
    const result = transformRecordsToFeatureCollection(records)

    expect(result.features).toHaveLength(3)

    result.features.forEach((feature) => {
      expect(feature.type).toEqual("Feature")
      expect(feature.geometry.type).toEqual("Point")
      expect(feature.properties).toEqual(
        expect.objectContaining({
          Name: expect.any(String),
          "Zip Code": expect.any(String),
        })
      )
    })
  })

  it("decodes the Airtable cached geocode field into a GeoJSON geometry", () => {
    const result = transformRecordsToFeatureCollection(records)

    const feature0 = result.features[0] as Feature<Point>
    expect(feature0.geometry.coordinates[0]).toBeCloseTo(-73.932376, 6)
    expect(feature0.geometry.coordinates[1]).toBeCloseTo(+40.772817, 6)

    const feature1 = result.features[1] as Feature<Point>
    expect(feature1.geometry.coordinates[0]).toBeCloseTo(-73.914695, 6)
    expect(feature1.geometry.coordinates[1]).toBeCloseTo(+40.778732, 6)

    const feature2 = result.features[2] as Feature<Point>
    expect(feature2.geometry.coordinates[0]).toBeCloseTo(-73.872447, 6)
    expect(feature2.geometry.coordinates[1]).toBeCloseTo(+40.742257, 6)
  })

  it("removes the encoded geodata field", () => {
    const result = transformRecordsToFeatureCollection(records)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = result.features[0] as Feature<Point, any>

    const propertyNames = Object.keys(f.properties)
    expect(propertyNames).not.toContain("Geocode cache")
  })

  it("renders the correct json", () => {
    expect(transformRecordsToFeatureCollection(records)).toMatchInlineSnapshot(`
      Object {
        "features": Array [
          Object {
            "geometry": Object {
              "coordinates": Array [
                -73.93237599999999,
                40.772817,
              ],
              "type": "Point",
            },
            "properties": Object {
              "Name": "First location",
              "Zip Code": "11111",
            },
            "type": "Feature",
          },
          Object {
            "geometry": Object {
              "coordinates": Array [
                -73.914695,
                40.7787318,
              ],
              "type": "Point",
            },
            "properties": Object {
              "Name": "Second location",
              "Zip Code": "11112",
            },
            "type": "Feature",
          },
          Object {
            "geometry": Object {
              "coordinates": Array [
                -73.8724469,
                40.742257,
              ],
              "type": "Point",
            },
            "properties": Object {
              "Name": "Third location",
              "Zip Code": "11113",
            },
            "type": "Feature",
          },
        ],
        "type": "FeatureCollection",
      }
    `)
  })

  describe("with a custom field name for the cached geocode data", () => {
    beforeEach(() => {
      records = deepRecreate(customColumnsFixture)
    })

    it("decodes the geodata", () => {
      const result = transformRecordsToFeatureCollection(records, {
        geocodedFieldName: "Geocodez",
      })

      const feature0 = result.features[0] as Feature<Point>
      expect(feature0.geometry.coordinates[0]).toBeCloseTo(-73.932376, 6)
      expect(feature0.geometry.coordinates[1]).toBeCloseTo(+40.772817, 6)
    })

    it("removes the encoded geodata field", () => {
      const result = transformRecordsToFeatureCollection(records, {
        geocodedFieldName: "Geocodez",
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f = result.features[0] as Feature<Point, any>

      const propertyNames = Object.keys(f.properties)
      expect(propertyNames).not.toContain("Geocode cache")
    })
  })

  describe("with an invalid geocode in the result set", () => {
    let consoleError: () => void

    beforeEach(() => {
      records = deepRecreate(invalidGeocodeFixture)
      console.error = jest.fn()
    })

    afterEach(() => {
      console.error = consoleError
    })

    it("logs a message to the console", () => {
      transformRecordsToFeatureCollection(records)
      expect(console.error).toHaveBeenCalled()
      expect((console.error as jest.Mock).mock.calls[0][0]).toMatch(
        /LatLng appears to be undefined/
      )
    })

    it("returns other valid features", () => {
      const result = transformRecordsToFeatureCollection(records)
      expect(records).toHaveLength(2)
      expect(result.features).toHaveLength(1)
    })
  })

  describe("with a missing geocode in the result set", () => {
    let consoleError: () => void

    beforeEach(() => {
      records = deepRecreate(missingGeocodeFixture)
      console.error = jest.fn()
    })

    afterEach(() => {
      console.error = consoleError
    })

    it("logs a message to the console", () => {
      transformRecordsToFeatureCollection(records)
      expect(console.error).toHaveBeenCalled()
      expect((console.error as jest.Mock).mock.calls[0][0]).toMatch(
        /geocoded field value was missing/
      )
    })

    it("returns other valid features", () => {
      const result = transformRecordsToFeatureCollection(records)
      expect(records).toHaveLength(2)
      expect(result.features).toHaveLength(1)
    })
  })
})
