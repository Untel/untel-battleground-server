import { AppController } from './app.controller';
import { SocketComponent } from './socket.component';
import {
  Module,
  MiddlewaresConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { graphqlExpress } from 'apollo-server-express';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';

@Module({
  imports: [GraphQLModule],
  controllers: [AppController],
  components: [],
  exports: []
})
export class ApplicationModule implements NestModule {

  constructor(private readonly graphQLFactory: GraphQLFactory) { }

  configure(consumer: MiddlewaresConsumer) {
    // const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
    // const schema = this.graphQLFactory.createSchema({ typeDefs });

    consumer
      .apply(graphqlExpress(req => ({ schema: {}, rootValue: req })))
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
