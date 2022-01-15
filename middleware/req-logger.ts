import { Handler } from 'express';
import { createLogger, transports } from 'winston';
import expressWinston from 'express-winston'

const logger = createLogger({
    transports: [
        new transports.File({filename:'./Logs/req.log', level:'info'})
    ]
})

const reqLogger:Handler = expressWinston.logger({
    winstonInstance: logger,
    expressFormat: true,
});

export default reqLogger;