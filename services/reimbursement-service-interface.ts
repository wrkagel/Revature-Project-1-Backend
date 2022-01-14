import Employee from "../entities/employee";
import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import Statistics from "../entities/stats-interface";


export default interface ReimbursementService {
    
    getEmployeeById(id:string) : Promise<Employee>

    getEmployeeByLogin(user:string, pass:string): Promise<Employee>

    getManagedEmployees(id:string): Promise<Employee[]>

    getReimbursementsForEmployee(id:string): Promise<ReimbursementItem[]>

    createReimbursement(item:ReimbursementItem): Promise<ReimbursementItem>

    updateReimbursement(id:string, status:ReimbursementStatus): Promise<ReimbursementItem>

    uploadFiles(id:string, fd: { [fieldname: string]: Express.Multer.File[]; } | Express.Multer.File[]): Promise<boolean>;

    getStats(id:string): Promise<{companyStats:Statistics, managedStats:Statistics}>;
}