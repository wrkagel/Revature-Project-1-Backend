
import { ErrorRequestHandler } from 'express';
import expressWinston from 'express-winston';
import { createLogger, transports } from 'winston';

const logger = createLogger({
    transports: new transports.File({filename:'./Logs/error.log', level:'error'})
});

const errLogger:ErrorRequestHandler = expressWinston.errorLogger({
    winstonInstance: logger});

export default errLogger;