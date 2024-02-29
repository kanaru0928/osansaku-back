package geocoding

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"team411.jp/osansaku/geoutils/geotypes"
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
	Name    string           `json:"name"`
	Address nominatimAddress `json:"address"`
}

const ENDPOINT string = "http://nominatim.openstreetmap.org/reverse"

func (n *Nominatim) Geocodes(q string, lim int, lang string) []*geotypes.Coordinate {
	u, err := url.Parse(ENDPOINT)

	if err != nil {
		fmt.Println("URL Parse Error", ENDPOINT)
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

func (n *Nominatim) ReverseGeocode(c *geotypes.Coordinate) []string {
	u, err := url.Parse(ENDPOINT)

	if err != nil {
		fmt.Println("URL Parse Error", ENDPOINT)
		panic(err)
	}

	query := u.Query()
	query.Set("format", "json")
	query.Set("lat", fmt.Sprintf("%f", c.Latitude))
	query.Set("lon", fmt.Sprintf("%f", c.Longitude))
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

	var resBody []nominatimCoding

	err = json.Unmarshal(resBodyStream, &resBody)
	if err != nil {
		fmt.Println("JSON Unmarshal Error")
		panic(err)
	}

	defer res.Body.Close()

	ret := make([]string, len(resBody))

	for i, c := range resBody {
		if c.Name != "" {
			ret[i] = fmt.Sprintf("%s (%s)", c.Name, c.Address.City)
		} else {
			ret[i] = fmt.Sprintf("%s%s周辺", c.Address.City, c.Address.Neighbourhood)
		}
	}

	return []string{}
}
