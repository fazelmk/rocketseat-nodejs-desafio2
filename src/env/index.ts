import { z } from "zod";

let data = require( "./.env.json" );
if ( process.env.NODE_ENV === "test" ) {
  data = Object.assign( data, require( "./.env.test.json" ) );
} else if ( process.env.NODE_ENV === "production" ) {
  data = Object.assign( data, require( ".env.production.json" ) );
} else {
  data = Object.assign( data, require( "./.env.development.json" ) );
}

const envSchema = z.object( {
  NODE_ENV: z.enum( [ "development", "test", "production" ] ).default( "production" ),
  DATABASE_CLIENT: z.enum( [ "sqlite", "pg" ] ).default( "sqlite" ),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default( 3333 )
} );

const _env = envSchema.safeParse( data );

if ( _env.success === false ) {
  console.error( "⚠️ Invalid environment variables", _env.error.format() );

  throw new Error( "Invalid environment variables." );
}

export const env = _env.data;
