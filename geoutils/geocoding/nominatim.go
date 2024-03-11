package geocoding

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"team411.jp/osansaku/geoutils/geotypes"
	"team411.jp/osansaku/geoutils/i18n"
)

type Nominatim struct {
}

type nominatimCoordinate struct {
	Lat string `json:"lat"`
	Lon string `json:"lon"`
}

type nominatimAddress struct {
	City          string `json:"city"`
	Neighbourhood string `json:"neighbourhood"`
}

type nominatimCoding struct {
	Name        string           `json:"name"`
	AddressType string           `json:"addresstype"`
	Address     nominatimAddress `json:"address"`
}

const CODING_ENDPOINT string = "http://nominatim.openstreetmap.org/search"
const REVERSE_ENDPOINT string = "http://nominatim.openstreetmap.org/reverse"

func (n *Nominatim) Geocodes(q string, lim int, lang string) []*geotypes.Coordinate {
	u, err := url.Parse(CODING_ENDPOINT)

	if err != nil {
		fmt.Println("URL Parse Error", CODING_ENDPOINT)
		panic(err)
	}

	query := u.Query()
	query.Set("q", q)
	query.Set("format", "json")
	query.Set("limit", fmt.Sprintf("%d", lim))
	query.Set("accept-language", lang)
	u.RawQuery = query.Encode()

	fmt.Println("Requesting to", u.String())

	res, err := http.Get(u.String())
	if err != nil {
		fmt.Println("HTTP Get Error", u.String())
		panic(err)
	}

	resBodyStream, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println("ReadAll Error")
		panic(err)
	}

	resBodyStr := string(resBodyStream)
	fmt.Println(resBodyStr)

	var coordinates []nominatimCoordinate

	err = json.Unmarshal(resBodyStream, &coordinates)
	if err != nil {
		fmt.Println("JSON Unmarshal Error")
		panic(err)
	}

	defer res.Body.Close()

	ret := make([]*geotypes.Coordinate, len(coordinates))
	for i, c := range coordinates {
		lat, err1 := strconv.ParseFloat(c.Lat, 64)
		lon, err2 := strconv.ParseFloat(c.Lon, 64)
		if err1 != nil || err2 != nil {
			fmt.Println("ParseFloat Error")
			panic(err)
		}
		ret[i] = &geotypes.Coordinate{Latitude: lat, Longitude: lon}
	}

	return ret
}

func (n *Nominatim) Geocode(q string, lang string) *geotypes.Coordinate {
	return n.Geocodes(q, 1, lang)[0]
}

func (n *Nominatim) ReverseGeocode(c *geotypes.Coordinate, lang string) string {
	u, err := url.Parse(REVERSE_ENDPOINT)

	if err != nil {
		fmt.Println("URL Parse Error", REVERSE_ENDPOINT)
		panic(err)
	}

	query := u.Query()
	query.Set("format", "json")
	query.Set("lat", fmt.Sprintf("%f", c.Latitude))
	query.Set("lon", fmt.Sprintf("%f", c.Longitude))
	query.Set("accept-language", lang)
	u.RawQuery = query.Encode()

	fmt.Println("Requesting to", u.String())

	res, err := http.Get(u.String())
	if err != nil {
		fmt.Println("HTTP Get Error", u.String())
		panic(err)
	}

	resBodyStream, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println("ReadAll Error")
		panic(err)
	}

	resBodyStr := string(resBodyStream)
	fmt.Println(resBodyStr)

	var resBody nominatimCoding

	err = json.Unmarshal(resBodyStream, &resBody)
	if err != nil {
		fmt.Println("JSON Unmarshal Error")
		panic(err)
	}

	defer res.Body.Close()

	// ret := make([]string, len(resBody))
	var ret string

	// for i, c := range resBody {
	if resBody.Name != ""{
		if resBody.AddressType == "amenity" {
			ret = fmt.Sprintf("%s (%s)", resBody.Name, resBody.Address.City)
		} else {
			// ret = fmt.Sprintf("%s%s周辺", resBody.Address.City, resBody.Address.Neighbourhood)
			ret = i18n.Get(i18n.T.Strings.Address, lang, resBody.Address.Neighbourhood, resBody.Address.City)
		}
	} else {
		ret = i18n.Get(i18n.T.Strings.UnknownSpot, lang)
	}
	// }

	return ret
}
