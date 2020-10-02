import { decodeGeodata } from "../geodata"

describe("decodeGeodata", () => {
  it("decodes correctly", () => {
    const encodedValue =
      "🔵 eyJpIjoiODktNzAgQ29vcGVyIEF2ZSwgUXVlZW5zLCBOWSIsIm8iOnsic3RhdHVzIjoiT0siLCJmb3JtYXR0ZWRBZGRyZXNzIjoiODktNzAgQ29vcGVyIEF2ZSwgRmx1c2hpbmcsIE5ZIDExMzc0LCBVU0EiLCJsYXQiOjQwLjcxMjQ3NCwibG5nIjotNzMuODYwNzk1fSwiZSI6MTYwNDE5NzY5MDcxNH0="

    const decodedValue = decodeGeodata(encodedValue)

    expect(decodedValue).toEqual({
      e: 1604197690714,
      i: "89-70 Cooper Ave, Queens, NY",
      o: {
        formattedAddress: "89-70 Cooper Ave, Flushing, NY 11374, USA",
        lat: 40.712474,
        lng: -73.860795,
        status: "OK",
      },
    })
  })
})
