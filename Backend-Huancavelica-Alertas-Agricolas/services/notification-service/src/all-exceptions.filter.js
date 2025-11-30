const { ArgumentsHost, Catch, ExceptionFilter, HttpException } = require('@nestjs/common');
const { RpcException } = require('@nestjs/microservices');
const logger = require('./logger');

class AllExceptionsFilter {
  constructor(log = logger) {
    this.log = log;
  }

  catch(exception, host) {
    const ctxType = host.getType();
    let message = '';
    if (exception instanceof HttpException) {
      message = JSON.stringify(exception.getResponse());
    } else if (exception instanceof RpcException) {
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    } else {
      message = String(exception);
    }
    this.log.error('Exception capturada', { type: ctxType, message, stack: exception?.stack });
  }
}

module.exports = { AllExceptionsFilter };