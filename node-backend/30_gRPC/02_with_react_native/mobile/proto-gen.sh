mkdir -p ./src/proto
protoc --proto_path=../server/proto ../server/proto/*.proto  --js_out=import_style=commonjs:./src/proto --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src/proto
