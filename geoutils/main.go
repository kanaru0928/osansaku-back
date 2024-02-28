package main

import (
	"team411.jp/osansaku/geoutils/router"
)

func main() {
	r := router.NewRouter()
	r.Listen()
}
