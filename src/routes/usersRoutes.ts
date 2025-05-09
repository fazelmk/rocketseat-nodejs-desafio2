import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { knex } from "@/database";

export async function usersRoutes( app: FastifyInstance ) {
  app.post( "/", async( request, reply ) => {
    const bodySchemma = z.object( {
      email: z.string().email(),
      name: z.string()
    } );

    let sessionId = request.cookies.sessionId;
    if ( !sessionId ) {
      sessionId = randomUUID();

      reply.setCookie( "sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      } );
    }

    const parsed = bodySchemma.parse( request.body );

    const user = await knex( "users" ).where( { email: parsed.email } ).first();
    if ( user ) {
      await knex( "users" ).where( { email: parsed.email } ).update( {
        name: parsed.name,
        session_id: sessionId
      } );
    } else {
      await knex( "users" ).insert( {
        id: randomUUID(),
        name: parsed.name,
        email: parsed.email,
        session_id: sessionId
      } );
    }
    return reply.status( 201 ).send();
  } );
}