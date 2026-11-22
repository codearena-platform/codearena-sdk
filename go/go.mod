module github.com/codearena-platform/codearena-sdk/go

go 1.25.5

replace github.com/codearena-platform/codearena-core => ../../codearena-core

require (
	github.com/codearena-platform/codearena-core v0.0.0-00010101000000-000000000000
	google.golang.org/grpc v1.79.1
	google.golang.org/protobuf v1.36.11
)

require (
	golang.org/x/net v0.49.0 // indirect
	golang.org/x/sys v0.40.0 // indirect
	golang.org/x/text v0.33.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20260128011058-8636f8732409 // indirect
)
