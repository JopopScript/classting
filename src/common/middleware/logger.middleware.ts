import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: Logger = new Logger();

  use(req: Request, res: Response, next: NextFunction) {
    this.requestLog(req);

    res.on('close', () => this.responseLog(res));
    next();
  }

  private requestLog(req: Request) {
    const { body, params, query } = req;
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    this.logger.debug(`---------------------------------------------------------------------------`);
    this.logger.debug(`request x-forwarded-for: ${req.headers['x-forwarded-for']}`);
    this.logger.debug(`request socket.remoteAddress: ${req.socket.remoteAddress}`);
    this.logger.debug(`request user-agent: ${req.get('User-Agent')}`);
    this.logger.debug(`request [${req.method}] ${requestUrl}`);
    this.logger.debug(`request body: `, JSON.stringify(body));
    this.logger.debug(`request query: `, JSON.stringify(query));
    this.logger.debug(`request params: `, JSON.stringify(params));
    this.logger.debug(`---------------------------------------------------------------------------`);
  }

  private responseLog(res: Response) {
    const { statusCode, req } = res;
    const contentLength = res.get('content-length')
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    this.logger.debug(`---------------------------------------------------------------------------`);
    this.logger.debug(`response [${req.method}] ${requestUrl}`);
    this.logger.debug(`response status: `, JSON.stringify(statusCode));
    this.logger.debug(`response content-length: ${contentLength}`);
    this.logger.debug(`---------------------------------------------------------------------------`);
  }
}
