import { knex } from "@/database";
import { checkSessionIdExists, idParamSchema } from "@/middlewares/check-session-id-exists";
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export async function mealsRoutes( app: FastifyInstance ) {
  const bodySchemma = z.object( {
    name: z.string(),
    description: z.string(),
    date: z.string().datetime().transform( date => new Date( date ).getTime() ),
    isOnDiet: z.boolean()
  } );

  app.get( "/", { preHandler: [ checkSessionIdExists ] },
    async( request, reply ) => {
      const meals = await knex( "meals" ).where( { user_id: request.user!.id } ).orderBy( "date", "desc" );

      return reply.send( { meals } );
    } );

  app.get( "/:id", { preHandler: [ checkSessionIdExists ] },
    async( request, reply ) => {
      const { id } = idParamSchema.parse( request.params );

      const meal = await knex( "meals" ).where( { id, user_id: request.user!.id } ).first();

      if ( !meal ) return reply.status( 404 ).send();
      return reply.send( { meal } );
    } );

  app.post( "/", { preHandler: [ checkSessionIdExists ] },
    async( request, reply ) => {

      const parsed = bodySchemma.parse( request.body );
      await knex( "meals" ).insert( {
        id: randomUUID(),
        user_id: request.user!.id,
        ...parsed
      } );
      return reply.status( 201 ).send();
    } );

  app.put( "/:id", { preHandler: [ checkSessionIdExists ] },
    async( request, reply ) => {
      const { id } = idParamSchema.parse( request.params );
      let updatedFields = bodySchemma.parse( request.body );

      const res = await knex( "meals" ).where( { id, user_id: request.user!.id } ).update( updatedFields );

      if ( res === 0 ) return reply.status( 404 ).send();
      return reply.status( 204 ).send();
    } );

  app.delete( "/:id", { preHandler: [ checkSessionIdExists ] },
    async( request, reply ) => {
      const { id } = idParamSchema.parse( request.params );

      const res = await knex( "meals" ).where( { id, user_id: request.user!.id } ).delete();

      if ( res === 0 ) return reply.status( 404 ).send();
      return reply.status( 204 ).send();
    } );

  app.get( "/metrics", { preHandler: [ checkSessionIdExists ] },
    async( request, reply ) => {
      const meals = await knex( "meals" ).where( { user_id: request.user!.id } );
      return reply.send( {
        totalMeals: meals.length,
        totalMealsOnDiet: meals.filter( meal => meal.isOnDiet ).length,
        totalMealsOffDiet: meals.filter( meal => !meal.isOnDiet ).length,
        bestOnDietSequence: meals.reduce( ( acc, meal ) => {
          if ( meal.isOnDiet ) {
            acc.current++;
            if ( acc.current > acc.best )
              acc.best = acc.current;
          } else {
            acc.current = 0;
          }

          return acc;
        }, { best: 0, current: 0 } ).best
      } );
    } );
}