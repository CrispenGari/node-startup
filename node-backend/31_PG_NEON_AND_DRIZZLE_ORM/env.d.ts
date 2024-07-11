
  // types for your environmental variables
  declare namespace NodeJS {
    export interface ProcessEnv {
      PORT : string;
			PGHOST : string;
			PGDATABASE : string;
			PGUSER : string;
			PGPASSWORD : string;
			ENDPOINT_ID : string;

    }
  }
  