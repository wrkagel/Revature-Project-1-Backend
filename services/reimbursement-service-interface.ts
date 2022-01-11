import Employee from "../entities/employee";
import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import Stats from "./stats-interface";


export default interface ReimbursementService {
    
    getEmployeeById(id:string) : Promise<Employee>

    getEmployeeByLogin(user:string, pass:string): Promise<Employee>

    getManagedEmployees(id:string): Promise<Employee[]>

    getReimbursementsForEmployee(id:string): Promise<ReimbursementItem[]>

    createReimbursement(item:ReimbursementItem): Promise<ReimbursementItem>

    updateReimbursement(id:string, status:ReimbursementStatus): Promise<ReimbursementItem>

    getStats(): Promise<Stats>;
}