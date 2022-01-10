"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidPropertyError extends Error {
    constructor(message, type, keyValuePairs) {
        super(message);
        this.type = type;
        this.keyValuePairs = keyValuePairs;
    }
}
exports.default = InvalidPropertyError;
