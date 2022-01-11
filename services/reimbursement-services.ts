import EmployeeDao from "../dao/employee-dao";
import ReimbursementDao from "../dao/reimbursement-dao";
import Employee from "../entities/employee";
import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import errorHandler from "../errors/error-handler-reimbursement-service";
import InvalidPropertyError from "../errors/invalid-property-error";
import NotFoundError from "../errors/not-found-error";
import ReimbursementService from "./reimbursement-service-interface";
import Stats from "./stats-interface";

export default class ReimbursementServiceImpl implements ReimbursementService {

    constructor(private employeeDao:EmployeeDao, private reimbursementDao:ReimbursementDao){}
    
    async getEmployeeById(id: string): Promise<Employee> {
        const employee:Employee = await this.employeeDao.getEmployeeById(id);
        return employee;
    }

    async getEmployeeByLogin(user: string, pass: string): Promise<Employee> {
        const employee:Employee = await this.employeeDao.getEmployeeByLogin(user, pass);
        return employee;
    }

    async getManagedEmployees(id:string): Promise<Employee[]> {
        let result:Employee[] = [];
        const manages:string[] | undefined = (await this.getEmployeeById(id)).manages;
        for(const id of manages ?? []) {
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

    async getStats(): Promise<Stats> {
        const reimbursements:ReimbursementItem[] = await this.reimbursementDao.getAllReimbursements();
        reimbursements.sort((r1, r2) => r2.amount - r1.amount);
        const highestItem:ReimbursementItem = reimbursements[0];
        const highest = {employee:(await this.employeeDao.getEmployeeById(highestItem.employeeId)), reimbursement:highestItem};
        const average:number = reimbursements.reduce((n, r2) => n + r2.amount, 0) / reimbursements.length;
        const reimbursementsByEmployee:{employeeId:string, total:number, length:number}[] = [];
        reimbursements.forEach(r => {
            const index = reimbursementsByEmployee.findIndex(e => e.employeeId === r.employeeId);
            if(index !== -1) {
                reimbursementsByEmployee[index].total += r.amount;
                reimbursementsByEmployee[index].length++;
            } else {
                reimbursementsByEmployee.push({employeeId:r.employeeId, total:r.amount, length:1});
            }
        });
        reimbursementsByEmployee.sort((e1, e2) => e2.total / e2.length - e1.total / e1.length);
        const highestAvg = reimbursementsByEmployee[0];
        const lowestAvg = reimbursementsByEmployee[reimbursementsByEmployee.length - 1];
        const highestAvgByEmployee = {employee:await this.getEmployeeById(highestAvg.employeeId), amount:highestAvg.total/highestAvg.length};
        const lowestAvgByEmployee = {employee:await this.getEmployeeById(lowestAvg.employeeId), amount:lowestAvg.total/lowestAvg.length};
        return {highest, avgAmount:average, highestAvgByEmployee, lowestAvgByEmployee};
    }

}