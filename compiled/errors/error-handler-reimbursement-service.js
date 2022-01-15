"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reimbursement_item_1 = require("../entities/reimbursement-item");
const invalid_property_error_1 = __importDefault(require("./invalid-property-error"));
class ReimbursementServicesErrorHandler {
    static checkValidReimbursement(item) {
        let valid = true;
        let message = "";
        let keyValuePair = [];
        const { type, desc, amount, date, status } = item;
        if (!type) {
            valid = false;
            message += 'Type must have a name.\n';
            keyValuePair.push(`type: ${item.type}`);
        }
        if (!desc) {
            valid = false;
            message += 'There must be a description.\n';
            keyValuePair.push(`desc: ${item.desc}`);
        }
        if (!amount || amount <= 0) {
            valid = false;
            message += 'Amount must be greater than 0.\n';
            keyValuePair.push(`amount: ${item.amount}`);
        }
        if (!date || date <= 0) {
            valid = false;
            message += 'Date must be a number greater than 0.\n';
            keyValuePair.push(`date: ${date}`);
        }
        if (!status || !(reimbursement_item_1.ReimbursementStatus[item.status])) {
            valid = false;
            message += 'Reimbursement has an illegal or missing status';
            keyValuePair.push(`status: ${item.status}`);
        }
        if (!valid)
            throw new invalid_property_error_1.default(message, 'Reimbursement', keyValuePair);
    }
}
exports.default = ReimbursementServicesErrorHandler;
