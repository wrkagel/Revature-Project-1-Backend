
export enum ReimbursementStatus {
    pending = "pending", approved = "approved", denied = "denied", paid = "paid"
}

/** 
 * @property {string} type what the reimbursement falls under, such as gas, lunch, skydiving, etc.
 * @property {string} desc short description of what is to be reimbursed
 * @property {number} date the date of the expense expressed as unix time
*/
export default interface ReimbursementItem {
    id:string,
    employeeId:string,
    type:string,
    desc:string,
    amount:number,
    date:number, 
    status:ReimbursementStatus
    //file uploads if possible
    files?:string[]
}