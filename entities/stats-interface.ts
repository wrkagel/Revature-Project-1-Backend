import Employee from "./employee";
import ReimbursementItem from "./reimbursement-item";


export default interface Statistics {
    highest:{employee:Employee, reimbursement:ReimbursementItem}
    highestAvgByEmployee:{employee:Employee, amount:string}
    lowestAvgByEmployee:{employee:Employee, amount:string}
    avgAmount:string
}