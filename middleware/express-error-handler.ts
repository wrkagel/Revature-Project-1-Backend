import express from 'express'
import InvalidPropertyError from '../errors/invalid-property-error';
import NotFoundError from '../errors/not-found-error';

export default function expressErrorHandler (err:Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    let message = '';
    if(err instanceof NotFoundError) {
        res.status(404);
        message += err.message
    } else if (err instanceof InvalidPropertyError) {
        res.status(422);
        message += err.message;
        message += '\n' + err.keyValuePairs.join('\n');
    } else {
        res.status(500);
        message += 'Unknown Server Error Occurred.';
    }
    console.log(err);
    res.send(message);
}

