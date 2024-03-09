package main

import (
	"fmt"

	"team411.jp/osansaku/geoutils/geocoding"
	"team411.jp/osansaku/geoutils/geotypes"

	// "golang.org/x/text/language"
	// "team411.jp/osansaku/geoutils/i18n"
	"team411.jp/osansaku/geoutils/listener"
)

func listen() {
	r := listener.NewRouter()
	r.Listen()
}

func test() {
	geocoder := new(geocoding.Nominatim)
	ret := geocoder.ReverseGeocode(&geotypes.Coordinate{Latitude: 35.657267000000004, Longitude: 139.54256266471194}, "ja")

	fmt.Println(ret)
}

func main() {
	listen()
	// test()
}
