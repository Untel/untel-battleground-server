import { Get, Controller } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, WsResponse, OnGatewayConnection, WebSocketServer, WebSocketServerData, } from '@nestjs/websockets';
import { Character } from './character.class';

@WebSocketGateway({ port: 81 })
export class SocketComponent implements OnGatewayConnection {
class WebSocketAdapter
  implements NestWebSocketAdapter {
  private readonly logger = this.loggingService.create(WebSocketAdapter.name);

  constructor(
    private readonly server: http.Server,
    private readonly path: string,
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService
  ) {}

  public create() {
    return new WebSocket.Server({
      server: this.server,
      path: this.path,
      verifyClient: ({ req }: { req: http.IncomingMessage }) => {
        const jwt = this.getJwtFromRequest(req);
        return (
          jwt && !(this.authService.verifyAndDecode(jwt) instanceof Error)
        );
      }
    });
  }

  public bindClientConnect(
    server: WebSocket.Server,
    callback: (client: Client) => void
  ) {
    server.on("connection", (socket, req) => {
      // Coercion to nonnull and Claims is possible because we provide
      // `verifyClient` to WebSocket.Server.
      const jwt = this.getJwtFromRequest(req);
      const claims = this.authService.skipVerifyAndDecode(jwt!) as Claims;
      const client = new Client(socket, claims);
      callback(client);
    });
  }

  // Explicit `this` preservation due to https://github.com/kamilmysliwiec/nest/issues/150
  public bindClientDisconnect = (
    client: Client,
    callback: (client: Client) => void
  ) => {
    client.ws.on("close", () => {
      callback(client);
    });
  };

  public bindMessageHandlers(
    client: Client,
    handlers: MessageMappingProperties[]
  ) {
    client.ws.on("message", async data => {
      if (typeof data !== "string") {
        this.logger.warn(
          `Received "${typeof data}" message, expected: "string"`
        );
        return;
      }

      let json: { [k: string]: any };

      // Parse
      try {
        json = JSON.parse(data);
      } catch (e) {
        this.logger.error(
          `Error while JSON decoding message`,
          e instanceof Error ? e.stack : undefined
        );
        return;
      }

      // Verify shape
      const type = json["type"];
      if (typeof type !== "string") {
        this.logger.error(
          `Invalid "type" field ("${typeof type}"), expected: "string"`
        );
        return;
      }

      // Find a message handler
      const handler = handlers.find(h => h.message === type);
      if (!handler) {
        this.logger.warn(`Received unknown message "${type}"`);
        return;
      }

      // Execute handler
      try {
        await handler.callback(json);
      } catch (e) {
        this.logger.error(
          `Error occurred during "${type}" handler`,
          e instanceof Error ? (e.stack ? e.stack : e.message) : undefined
        );
        return;
      }
    });
  }

  private getJwtFromRequest(req: http.IncomingMessage): string | null {
    if (req.url) {
      const { query } = url.parse(req.url, true);
      if (query && typeof query.jwt === "string") {
        return query.jwt;
      }
    }
    return null;
  }
}

/**
 * A wrapper to associate claims (from the URL) with a WebSocket. This allows us
 * to know who is connected to each socket.
 */
class Client {
  constructor(public readonly ws: WebSocket, public readonly claims: Claims) {}

  public send(message) {
    this.ws.send(JSON.stringify(message));
  }
}

};

export interface Character {
    id: string;
    name?: string;
    spriteName?: string;
    hp?: number;
    hpMax?: number;
    x?: number;
    y?: number;
    velocity?: number;
    isMe?: boolean;
    lastAction?: any;
    lastDirection?: any;
}

export interface GameState {
    characters: any;
}