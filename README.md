# osansaku-back
## 環境構築
必要な環境は次の通りです。
* Docker
* (ba)sh
* wget
* osmupate

### Docker
`docker`と`docker-compose`が`sudo`なしで動く状態にしてください。

### (ba)sh
`update_osm.sh`が動く環境であれば大丈夫です。

### osmupdate
`osmupdate`コマンド( https://wiki.openstreetmap.org/wiki/Osmupdate )が動くようにしてください。

## 開発環境の起動
### 地理情報のダウンロード
開始前に、
```bash
$ mkdir geographic
$ ./update_osm.sh
```
を実行して日本の地図データのダウンロードと前処理を行います。数時間かかるので注意してください。

### 起動
```bash
$ docker-compose up
```
を実行して開発環境を起動します。nominatimのデータが入っていない状態だと、地図データを利用したインデックス化が始まりますが、こちらも数時間かかるので、開発環境を構築したいだけなら[`docker-compose.yml`](docker-compose.yml)内の`nomiatim`サービス部分をコメントアウトすることをおすすめします。

