import fastify from 'fastify'

declare module 'fastify' {
   interface FastifyRequest<
   HttpRequest,
   Query = fastify.DefaultQuery,
   Params = fastify.DefaultParams,
   Headers = fastify.DefaultHeaders,
   Body = any
 >  {
    user: any
  }
}