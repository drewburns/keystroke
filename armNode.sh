mv node_modules/sqlite3/lib/binding/napi-v6-darwin-unknown-x64 node_modules/sqlite3/lib/binding/napi-v6-darwin-unknown-arm64
curl https://storage.googleapis.com/jmr/node_sqlite3.node >> node_sqlite3.node
cp ./node_sqlite3.node node_modules/sqlite3/lib/binding/napi-v6-darwin-unknown-arm64/node_sqlite3.node 