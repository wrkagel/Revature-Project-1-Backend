import Employee from "../entities/employee";
import ReimbursementItem from "../entities/reimbursement-item";


export default interface Stats {
    highest:{employee:Employee, reimbursement:ReimbursementItem}
    highestAvgByEmployee:{employee:Employee, amount:number}
    lowestAvgByEmployee:{employee:Employee, amount:number}
    avgAmount:number
}