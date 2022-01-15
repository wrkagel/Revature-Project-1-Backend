"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const invalid_property_error_1 = __importDefault(require("../errors/invalid-property-error"));
const not_found_error_1 = __importDefault(require("../errors/not-found-error"));
function expressErrorHandler(err, req, res, next) {
    let message = '';
    if (err instanceof not_found_error_1.default) {
        res.status(404);
        message += err.message;
    }
    else if (err instanceof invalid_property_error_1.default) {
        res.status(422);
        message += err.message;
        message += '\n' + err.keyValuePairs.join('\n');
    }
    else {
        res.status(500);
        message += 'Unknown Server Error Occurred.';
    }
    console.log(err);
    res.send(message);
}
exports.default = expressErrorHandler;
;
