import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { HelloClient as _helloPackage_HelloClient, HelloDefinition as _helloPackage_HelloDefinition } from './helloPackage/Hello';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  helloPackage: {
    Hello: SubtypeConstructor<typeof grpc.Client, _helloPackage_HelloClient> & { service: _helloPackage_HelloDefinition }
    HelloRequest: MessageTypeDefinition
    HelloResponse: MessageTypeDefinition
  }
}

