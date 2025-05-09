import { FastifyInstance } from "fastify";
import { mealsRoutes } from "./mealsRoutes";
import { usersRoutes } from "./usersRoutes";

export async function appRoutes(app: FastifyInstance) {
  app.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  app.register(usersRoutes, { prefix: 'users' });
  app.register(mealsRoutes, { prefix: 'meals' });
}