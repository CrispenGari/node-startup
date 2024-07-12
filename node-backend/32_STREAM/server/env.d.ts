
  // types for your environmental variables
  declare namespace NodeJS {
    export interface ProcessEnv {
      PORT : string;
			STREAM_API_KEY : string;
			STREAM_API_SECRET : string;

    }
  }
  