import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import InvalidPropertyError from "./invalid-property-error";

export default class ReimbursementServicesErrorHandler {

    public static checkValidReimbursement(item:ReimbursementItem):void {
        let valid = true;
        let message = "";
        let keyValuePair:string[] = [];
        const {type, desc, amount, date, status} = item;
        if(!type) {
            valid = false;
            message += 'Type must have a name.\n';
            keyValuePair.push(`type: ${item.type}`)
        }
        if(!desc) {
            valid = false;
            message += 'There must be a description.\n';
            keyValuePair.push(`desc: ${item.desc}`);
        }
        if(!amount || amount <= 0) {
            valid = false;
            message += 'Amount must be greater than 0.\n';
            keyValuePair.push(`amount: ${item.amount}`)
        }
        if(!date || date <= 0) {
            valid = false;
            message += 'Date must be a number greater than 0.\n';
            keyValuePair.push(`date: ${date}`)
        }
        if(!status || !(ReimbursementStatus[item.status])) {
            valid = false;
            message += 'Reimbursement has an illegal or missing status',
            keyValuePair.push(`status: ${item.status}`);
        }
        if(!valid) throw new InvalidPropertyError(message, 'Reimbursement', keyValuePair)
    }

}
