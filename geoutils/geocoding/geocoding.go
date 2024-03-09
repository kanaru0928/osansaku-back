package geocoding

import (
	"team411.jp/osansaku/geoutils/geotypes"
)

type Geocoding interface {
	// クエリ文字列から座標を検索
	Geocode(q string, lim int) []*geotypes.Coordinate
	// 座標を表す簡単な文字列を取得
	ReverseGeocode(c geotypes.Coordinate) string
}
