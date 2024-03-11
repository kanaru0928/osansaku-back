package geocoding

import (
	"testing"
)

func GeocodeTest(t *testing.T) {
	geocoder := new(Nominatim)
	query := []string{
		"電気通信大学",
		"東京農工大学",
		"調布駅",
	}

	for _, q := range query {
		coord := geocoder.Geocodes(q, 1, "ja")[0]
		ret := geocoder.ReverseGeocode(coord, "ja")[0]
		if ret != q {
			t.Errorf("GeocodeTest failed: %s", q)
		}
	}
}
