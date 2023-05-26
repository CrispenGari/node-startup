// Original file: proto/hello.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { ChatRequest as _helloPackage_ChatRequest, ChatRequest__Output as _helloPackage_ChatRequest__Output } from '../helloPackage/ChatRequest';
import type { ChatResponse as _helloPackage_ChatResponse, ChatResponse__Output as _helloPackage_ChatResponse__Output } from '../helloPackage/ChatResponse';
import type { HelloRequest as _helloPackage_HelloRequest, HelloRequest__Output as _helloPackage_HelloRequest__Output } from '../helloPackage/HelloRequest';
import type { HelloResponse as _helloPackage_HelloResponse, HelloResponse__Output as _helloPackage_HelloResponse__Output } from '../helloPackage/HelloResponse';
import type { NumberRequest as _helloPackage_NumberRequest, NumberRequest__Output as _helloPackage_NumberRequest__Output } from '../helloPackage/NumberRequest';
import type { NumberResponse as _helloPackage_NumberResponse, NumberResponse__Output as _helloPackage_NumberResponse__Output } from '../helloPackage/NumberResponse';
import type { TodoRequest as _helloPackage_TodoRequest, TodoRequest__Output as _helloPackage_TodoRequest__Output } from '../helloPackage/TodoRequest';
import type { TodoResponse as _helloPackage_TodoResponse, TodoResponse__Output as _helloPackage_TodoResponse__Output } from '../helloPackage/TodoResponse';

export interface HelloClient extends grpc.Client {
  chat(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_helloPackage_ChatRequest, _helloPackage_ChatResponse__Output>;
  chat(options?: grpc.CallOptions): grpc.ClientDuplexStream<_helloPackage_ChatRequest, _helloPackage_ChatResponse__Output>;
  chat(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_helloPackage_ChatRequest, _helloPackage_ChatResponse__Output>;
  chat(options?: grpc.CallOptions): grpc.ClientDuplexStream<_helloPackage_ChatRequest, _helloPackage_ChatResponse__Output>;
  
  hello(argument: _helloPackage_HelloRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_helloPackage_HelloResponse__Output>): grpc.ClientUnaryCall;
  hello(argument: _helloPackage_HelloRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_helloPackage_HelloResponse__Output>): grpc.ClientUnaryCall;
  hello(argument: _helloPackage_HelloRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_helloPackage_HelloResponse__Output>): grpc.ClientUnaryCall;
  hello(argument: _helloPackage_HelloRequest, callback: grpc.requestCallback<_helloPackage_HelloResponse__Output>): grpc.ClientUnaryCall;
  hello(argument: _helloPackage_HelloRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_helloPackage_HelloResponse__Output>): grpc.ClientUnaryCall;
  hello(argument: _helloPackage_HelloRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_helloPackage_HelloResponse__Output>): grpc.ClientUnaryCall;
  hello(argument: _helloPackage_HelloRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_helloPackage_HelloResponse__Output>): grpc.ClientUnaryCall;
  hello(argument: _helloPackage_HelloRequest, callback: grpc.requestCallback<_helloPackage_HelloResponse__Output>): grpc.ClientUnaryCall;
  
  randomNumber(argument: _helloPackage_NumberRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_helloPackage_NumberResponse__Output>;
  randomNumber(argument: _helloPackage_NumberRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_helloPackage_NumberResponse__Output>;
  randomNumber(argument: _helloPackage_NumberRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_helloPackage_NumberResponse__Output>;
  randomNumber(argument: _helloPackage_NumberRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_helloPackage_NumberResponse__Output>;
  
  todos(metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_helloPackage_TodoResponse__Output>): grpc.ClientWritableStream<_helloPackage_TodoRequest>;
  todos(metadata: grpc.Metadata, callback: grpc.requestCallback<_helloPackage_TodoResponse__Output>): grpc.ClientWritableStream<_helloPackage_TodoRequest>;
  todos(options: grpc.CallOptions, callback: grpc.requestCallback<_helloPackage_TodoResponse__Output>): grpc.ClientWritableStream<_helloPackage_TodoRequest>;
  todos(callback: grpc.requestCallback<_helloPackage_TodoResponse__Output>): grpc.ClientWritableStream<_helloPackage_TodoRequest>;
  todos(metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_helloPackage_TodoResponse__Output>): grpc.ClientWritableStream<_helloPackage_TodoRequest>;
  todos(metadata: grpc.Metadata, callback: grpc.requestCallback<_helloPackage_TodoResponse__Output>): grpc.ClientWritableStream<_helloPackage_TodoRequest>;
  todos(options: grpc.CallOptions, callback: grpc.requestCallback<_helloPackage_TodoResponse__Output>): grpc.ClientWritableStream<_helloPackage_TodoRequest>;
  todos(callback: grpc.requestCallback<_helloPackage_TodoResponse__Output>): grpc.ClientWritableStream<_helloPackage_TodoRequest>;
  
}

export interface HelloHandlers extends grpc.UntypedServiceImplementation {
  chat: grpc.handleBidiStreamingCall<_helloPackage_ChatRequest__Output, _helloPackage_ChatResponse>;
  
  hello: grpc.handleUnaryCall<_helloPackage_HelloRequest__Output, _helloPackage_HelloResponse>;
  
  randomNumber: grpc.handleServerStreamingCall<_helloPackage_NumberRequest__Output, _helloPackage_NumberResponse>;
  
  todos: grpc.handleClientStreamingCall<_helloPackage_TodoRequest__Output, _helloPackage_TodoResponse>;
  
}

export interface HelloDefinition extends grpc.ServiceDefinition {
  chat: MethodDefinition<_helloPackage_ChatRequest, _helloPackage_ChatResponse, _helloPackage_ChatRequest__Output, _helloPackage_ChatResponse__Output>
  hello: MethodDefinition<_helloPackage_HelloRequest, _helloPackage_HelloResponse, _helloPackage_HelloRequest__Output, _helloPackage_HelloResponse__Output>
  randomNumber: MethodDefinition<_helloPackage_NumberRequest, _helloPackage_NumberResponse, _helloPackage_NumberRequest__Output, _helloPackage_NumberResponse__Output>
  todos: MethodDefinition<_helloPackage_TodoRequest, _helloPackage_TodoResponse, _helloPackage_TodoRequest__Output, _helloPackage_TodoResponse__Output>
}
