import { Feature, Point } from "geojson"

import { createFeatureCollection } from "../feature-collection"
import { fixture as validRecordsFixture } from "../__fixtures__/valid-records"
import { fixture as customColumnsFixture } from "../__fixtures__/custom-column"
import { fixture as invalidGeocodeFixture } from "../__fixtures__/invalid-geocode"
import { fixture as missingGeocodeFixture } from "../__fixtures__/missing-geocode"
import { StringMap } from "../types"

interface FixtureFields extends StringMap {
  Name: string
  "Zip Code": string
}

const deepRecreate = (obj: unknown) => JSON.parse(JSON.stringify(obj))

let records: Airtable.Records<FixtureFields>

describe(createFeatureCollection, () => {
  beforeEach(() => {
    records = deepRecreate(validRecordsFixture)
  })

  it("returns a FeatureCollection object and an errors object", () => {
    const result = createFeatureCollection(records)

    expect(result).toBeInstanceOf(Array)

    const [featureCollection, errors] = result

    expect(featureCollection).toEqual(
      expect.objectContaining({
        type: "FeatureCollection",
        features: expect.any(Array),
      })
    )

    expect(errors).toEqual(
      expect.objectContaining({
        missingGeocodes: expect.anything(),
        invalidGeocodes: expect.anything(),
      })
    )
  })

  it("transforms the Airtable records & fields into GeoJSON features & properties", () => {
    const [featureCollection, _errors] = createFeatureCollection(records)

    expect(featureCollection.features).toHaveLength(3)

    featureCollection.features.forEach((feature) => {
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
    const [featureCollection, _errors] = createFeatureCollection(records)

    const feature0 = featureCollection.features[0] as Feature<Point>
    expect(feature0.geometry.coordinates[0]).toBeCloseTo(-73.932376, 6)
    expect(feature0.geometry.coordinates[1]).toBeCloseTo(+40.772817, 6)

    const feature1 = featureCollection.features[1] as Feature<Point>
    expect(feature1.geometry.coordinates[0]).toBeCloseTo(-73.914695, 6)
    expect(feature1.geometry.coordinates[1]).toBeCloseTo(+40.778732, 6)

    const feature2 = featureCollection.features[2] as Feature<Point>
    expect(feature2.geometry.coordinates[0]).toBeCloseTo(-73.872447, 6)
    expect(feature2.geometry.coordinates[1]).toBeCloseTo(+40.742257, 6)
  })

  it("removes the encoded geodata field", () => {
    const [featureCollection, _errors] = createFeatureCollection(records)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = featureCollection.features[0] as Feature<Point, any>

    const propertyNames = Object.keys(f.properties)
    expect(propertyNames).not.toContain("Geocode cache")
  })

  it("treats the record id as the feature id", () => {
    const [featureCollection, _errors] = createFeatureCollection(records)

    records.map((record, i) => {
      expect(featureCollection.features[i].id).toEqual(record.id)
    })
  })

  it("renders the correct json", () => {
    expect(createFeatureCollection(records)).toMatchInlineSnapshot(`
      Array [
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
              "id": "rec1",
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
              "id": "rec2",
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
              "id": "rec3",
              "properties": Object {
                "Name": "Third location",
                "Zip Code": "11113",
              },
              "type": "Feature",
            },
          ],
          "type": "FeatureCollection",
        },
        Object {
          "invalidGeocodes": Array [],
          "missingGeocodes": Array [],
        },
      ]
    `)
  })

  describe("with a custom field name for the cached geocode data", () => {
    beforeEach(() => {
      records = deepRecreate(customColumnsFixture)
    })

    it("decodes the geodata", () => {
      const [featureCollection, _errors] = createFeatureCollection(records, {
        geocodedFieldName: "Geocodez",
      })

      const feature0 = featureCollection.features[0] as Feature<Point>
      expect(feature0.geometry.coordinates[0]).toBeCloseTo(-73.932376, 6)
      expect(feature0.geometry.coordinates[1]).toBeCloseTo(+40.772817, 6)
    })

    it("removes the encoded geodata field", () => {
      const [featureCollection, _errors] = createFeatureCollection(records, {
        geocodedFieldName: "Geocodez",
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f = featureCollection.features[0] as Feature<Point, any>

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
      createFeatureCollection(records)
      expect(console.error).toHaveBeenCalled()
      expect((console.error as jest.Mock).mock.calls[0][0]).toMatch(
        /LatLng appears to be undefined/
      )
    })

    it("returns the bad record in the errors object", () => {
      const [_featureCollection, errors] = createFeatureCollection(records)
      expect(errors.invalidGeocodes).toEqual([records[0]])
    })

    it("returns other valid features", () => {
      const [featureCollection, _errors] = createFeatureCollection(records)
      expect(records).toHaveLength(2)
      expect(featureCollection.features).toHaveLength(1)
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
      createFeatureCollection(records)
      expect(console.error).toHaveBeenCalled()
      expect((console.error as jest.Mock).mock.calls[0][0]).toMatch(
        /geocoded field value was missing/
      )
    })

    it("returns the bad record in the errors object", () => {
      const [_featureCollection, errors] = createFeatureCollection(records)
      expect(errors.missingGeocodes).toEqual([records[0]])
    })

    it("returns other valid features", () => {
      const [featureCollection, _errors] = createFeatureCollection(records)
      expect(records).toHaveLength(2)
      expect(featureCollection.features).toHaveLength(1)
    })
  })
})
