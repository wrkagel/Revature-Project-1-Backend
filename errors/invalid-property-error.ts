
export default class InvalidPropertyError extends Error {

    constructor(message:string, public type:string, public keyValuePairs: string[]) {
        super(message);
    }
}