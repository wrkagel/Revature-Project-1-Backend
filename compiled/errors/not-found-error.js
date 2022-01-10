"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotFoundError extends Error {
    constructor(message, type) {
        super(message);
        this.type = type;
    }
}
exports.default = NotFoundError;
