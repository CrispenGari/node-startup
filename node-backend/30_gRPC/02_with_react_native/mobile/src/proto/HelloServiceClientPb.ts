/**
 * @fileoverview gRPC-Web generated client stub for helloPackage
 * @enhanceable
 * @public
 */

// Code generated by protoc-gen-grpc-web. DO NOT EDIT.
// versions:
// 	protoc-gen-grpc-web v1.4.1
// 	protoc              v4.23.2
// source: hello.proto


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as hello_pb from './hello_pb';


export class HelloClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: any; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname.replace(/\/+$/, '');
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodDescriptorhello = new grpcWeb.MethodDescriptor(
    '/helloPackage.Hello/hello',
    grpcWeb.MethodType.UNARY,
    hello_pb.HelloRequest,
    hello_pb.HelloResponse,
    (request: hello_pb.HelloRequest) => {
      return request.serializeBinary();
    },
    hello_pb.HelloResponse.deserializeBinary
  );

  hello(
    request: hello_pb.HelloRequest,
    metadata: grpcWeb.Metadata | null): Promise<hello_pb.HelloResponse>;

  hello(
    request: hello_pb.HelloRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: hello_pb.HelloResponse) => void): grpcWeb.ClientReadableStream<hello_pb.HelloResponse>;

  hello(
    request: hello_pb.HelloRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: hello_pb.HelloResponse) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/helloPackage.Hello/hello',
        request,
        metadata || {},
        this.methodDescriptorhello,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/helloPackage.Hello/hello',
    request,
    metadata || {},
    this.methodDescriptorhello);
  }

}

