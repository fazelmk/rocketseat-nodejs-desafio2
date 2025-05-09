import { appRoutes } from "@/routes";
import fastify from "fastify";
import cookie from "@fastify/cookie";

export const app = fastify();

app.setErrorHandler( ( error, request, reply ) => {
  console.log(request.body, request.params, request.user, error );
  return reply.status( 500 ).send( { error: 'Internal Server Error' } );
})

app.register( cookie );

app.register( appRoutes );
