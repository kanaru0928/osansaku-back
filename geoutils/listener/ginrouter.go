package listener

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"team411.jp/osansaku/geoutils/geocoding"
	"team411.jp/osansaku/geoutils/geotypes"
)

const _kListenPath = "/geoutils"

type GinRouter struct {
	router *gin.Engine
}

func NewRouter() *GinRouter {
	router := gin.Default()
	// TODO: turst proxiesを設定
	return &GinRouter{router: router}
}

func (r *GinRouter) Listen() {
	r.router.GET(fmt.Sprintf("%s/greet", _kListenPath), greet)
	r.router.GET(fmt.Sprintf("%s/coding", _kListenPath), coding)
	r.router.GET(fmt.Sprintf("%s/reverse", _kListenPath), reverse)

	r.router.Run()
}

func greet(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Hello, World!",
	})
}

var acceptableCodingVersionSet = map[string]struct{}{
	"1": {},
}

var acceptableReverseVersionSet = map[string]struct{}{
	"1": {},
}

func coding(c *gin.Context) {
	v := c.Query("format_version")
	if _, ok := acceptableCodingVersionSet[v]; !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid format_version",
		})
		return
	}

	q := c.Query("q")
	lang := c.Query("lang")

	geocoder := new(geocoding.Nominatim)
	coord := geocoder.Geocode(q, lang)

	c.JSON(http.StatusOK, gin.H{
		"lat":            coord.Latitude,
		"lng":            coord.Longitude,
		"format_version": "1",
	})
}

func reverse(c *gin.Context) {
	v := c.Query("format_version")
	if _, ok := acceptableReverseVersionSet[v]; !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid format_version",
		})
		return
	}

	lat := c.Query("lat")
	lng := c.Query("lng")
	lang := c.Query("lang")

	latf, _ := strconv.ParseFloat(lat, 64)
	lngf, _ := strconv.ParseFloat(lng, 64)

	geocoder := new(geocoding.Nominatim)
	ret := geocoder.ReverseGeocode(&geotypes.Coordinate{Latitude: latf, Longitude: lngf}, lang)

	c.JSON(http.StatusOK, gin.H{
		"message":        ret,
		"format_version": "1",
	})
}
