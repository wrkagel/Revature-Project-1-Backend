

export default class NotFoundError extends Error {

    constructor(message:string, public type:string) {
        super(message)
    }
}