package listener

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"team411.jp/osansaku/geoutils/geocoding"
)

type GinRouter struct {
	router *gin.Engine
}

func NewRouter() *GinRouter {
	router := gin.Default()
	// TODO: turst proxiesを設定
	return &GinRouter{router: router}
}

func (r *GinRouter) Listen() {
	r.router.GET("/greet", greet)
	r.router.GET("/coding", coding)

	r.router.Run()
}

func greet(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Hello, World!",
	})
}

var acceptableVersionSet = map[string]struct{} {
	"1": {},
}

func coding(c *gin.Context) {
	v := c.Query("format_version")
	if _, ok := acceptableVersionSet[v]; !ok {
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
		"lat": coord.Latitude,
		"lng": coord.Longitude,
		"format_version": "1",
	})
}
