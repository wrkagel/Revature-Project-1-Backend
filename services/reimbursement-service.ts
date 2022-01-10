import EmployeeDao from "../dao/employee-dao";
import ReimbursementDao from "../dao/reimbursement-dao";
import Employee from "../entities/employee";
import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import errorHandler from "../errors/error-handler-reimbursement-service";
import InvalidPropertyError from "../errors/invalid-property-error";
import NotFoundError from "../errors/not-found-error";


export default interface ReimbursementService {
    
    getEmployeeById(id:string) : Promise<Employee>

    getEmployeeByLogin(user:string, pass:string): Promise<Employee>

    getManagedEmployees(ids:string[]): Promise<Employee[]>

    getReimbursementsForEmployee(id:string): Promise<ReimbursementItem[]>

    createReimbursement(item:ReimbursementItem): Promise<ReimbursementItem>

    updateReimbursement(id:string, status:ReimbursementStatus): Promise<ReimbursementItem>

}

export class ReimbursementServiceImpl implements ReimbursementService {

    constructor(private employeeDao:EmployeeDao, private reimbursementDao:ReimbursementDao){}
    
    async getEmployeeById(id: string): Promise<Employee> {
        const employee:Employee = await this.employeeDao.getEmployeeById(id);
        return employee;
    }

    async getEmployeeByLogin(user: string, pass: string): Promise<Employee> {
        const employee:Employee = await this.employeeDao.getEmployeeByLogin(user, pass);
        return employee;
    }

    async getManagedEmployees(ids:string[]): Promise<Employee[]> {
        let result:Employee[] = [];
        for(const id of ids) {
            result.push(await this.employeeDao.getEmployeeById(id));
        }
        return result;
    }

    async getReimbursementsForEmployee(id: string): Promise<ReimbursementItem[]> {
        await this.getEmployeeById(id);
        const reimbursements:ReimbursementItem[] = await this.reimbursementDao.getAllReimbursementsForEmployee(id);
        return reimbursements;
    }

    async createReimbursement(item: ReimbursementItem): Promise<ReimbursementItem> {
        try {
            errorHandler.checkValidReimbursement(item);
            await this.employeeDao.getEmployeeById(item.employeeId);
            const newItem:ReimbursementItem = await this.reimbursementDao.createReimbursement(item);
            return newItem;
        } catch (error) {
            if(error instanceof NotFoundError) {
                error.message = 
                    `Employee ID could not be matched to a valid employee in the database. employeeId: ${item.employeeId}`;
            }
            throw error;
        }
    }

    async updateReimbursement(id: string, status: ReimbursementStatus): Promise<ReimbursementItem> {
        if(!ReimbursementStatus[status]) {
            throw new InvalidPropertyError(`Status must be one of [pending, denied, or approved].`, 'ReimbursementUpdate',
            [`status: ${status}`]);
        }
        const reimbursement:ReimbursementItem = await this.reimbursementDao.updateReimbursementStatus(id, status);
        return reimbursement;
    }

}