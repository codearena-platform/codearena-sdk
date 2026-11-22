// Original file: proto/v1/bot_api.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { BotIntent as _codearena_v1_BotIntent, BotIntent__Output as _codearena_v1_BotIntent__Output } from '../../codearena/v1/BotIntent';
import type { WorldState as _codearena_v1_WorldState, WorldState__Output as _codearena_v1_WorldState__Output } from '../../codearena/v1/WorldState';

export interface BotServiceClient extends grpc.Client {
  Connect(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_codearena_v1_BotIntent, _codearena_v1_WorldState__Output>;
  Connect(options?: grpc.CallOptions): grpc.ClientDuplexStream<_codearena_v1_BotIntent, _codearena_v1_WorldState__Output>;
  connect(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_codearena_v1_BotIntent, _codearena_v1_WorldState__Output>;
  connect(options?: grpc.CallOptions): grpc.ClientDuplexStream<_codearena_v1_BotIntent, _codearena_v1_WorldState__Output>;
  
}

export interface BotServiceHandlers extends grpc.UntypedServiceImplementation {
  Connect: grpc.handleBidiStreamingCall<_codearena_v1_BotIntent__Output, _codearena_v1_WorldState>;
  
}

export interface BotServiceDefinition extends grpc.ServiceDefinition {
  Connect: MethodDefinition<_codearena_v1_BotIntent, _codearena_v1_WorldState, _codearena_v1_BotIntent__Output, _codearena_v1_WorldState__Output>
}
