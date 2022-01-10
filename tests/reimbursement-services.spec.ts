import EmployeeDao from "../dao/employee-dao";
import ReimbursementDao from "../dao/reimbursement-dao";
import Employee from "../entities/employee";
import reimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import InvalidPropertyError from "../errors/invalid-property-error";
import NotFoundError from "../errors/not-found-error";
import ReimbursementService, { ReimbursementServiceImpl } from "../services/reimbursement-services"

const managedEmployees:string[] = ['c6493f17-8eb8-4b79-b2bf-449406495916', '11dfdd35-8d6e-4c2d-8903-ed9ceadb5d7e'];

class mockEmployeeDao implements EmployeeDao {

    async getEmployeeById(id: string): Promise<Employee> {

        if(id === 'testManger') {
            return {fname:"", id:"", manages:managedEmployees};
        }
    
        if(managedEmployees.find(str => str === id)) {
            return {id:"", fname:""};
        } else {
            throw new NotFoundError('Not Found', 'Test');
        }
    }
    getEmployeeByLogin(user: string, pass: string): Promise<Employee> {
        throw new Error("Method not implemented.");
    }
    
}

class mockReimbursementDao implements ReimbursementDao {
    updateReimbursementStatus(id:string, status:ReimbursementStatus): Promise<reimbursementItem> {
        throw new Error("Method not implemented.");
    }
    getEmployeeWithHighestAverage(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getHighest(): Promise<reimbursementItem> {
        throw new Error("Method not implemented.");
    }
    getAllReimbursementsForEmployee(id: String): Promise<reimbursementItem[]> {
        throw new Error("Method not implemented");
    }
    createReimbursement(item: reimbursementItem): Promise<reimbursementItem> {
        throw new Error("Method not implemented.");
    }
    
}

describe("Test business logic and non-passthrough methods", () => {

    const reimbursementService:ReimbursementService = new ReimbursementServiceImpl(new mockEmployeeDao(), new mockReimbursementDao());

    it("should return an array of employees", async ()=>{

        const employees:Employee[] = await reimbursementService.getManagedEmployees('testManger');
        expect(employees.length).toBe(2);
    })

    it("should throw a 404 error if the array contains an employee that doesn't exist", async () => {
        try {
            await reimbursementService.getManagedEmployees('invalid');
            fail();
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    });

    it("should throw a NotFoundError on invalid employeeId when creating a reimbursement", async () => {
        try {
            await reimbursementService.createReimbursement({
                id:"test", 
                employeeId:"test",
                type:'test',
                desc:'test',
                amount:1,
                date:1,
                status:ReimbursementStatus.denied
            })
            fail();
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
            expect(error).toHaveProperty("message", 
                `Employee ID could not be matched to a valid employee in the database. employeeId: test`);
        }
    })

    it("should throw an InvalidPropertyError that contains each missing or incorrect property on the reimbursement", async () => {
        try {
            const reimbursement = {
                id:"", 
                employeeId:"", 
                type:"",
                desc:"",
                amount:-1,
                date:-1,
                status:"testing"
            }
            //@ts-ignore
            await reimbursementService.createReimbursement(reimbursement);
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidPropertyError);
            expect(error).toHaveProperty("keyValuePairs", [
                'type: ',
                'desc: ',
                'amount: -1',
                'date: -1',
                'status: testing'
            ])
        }

    });

    it("should throw an InvalidPropertyError for an invalid status", async () => {
        try {
            //@ts-ignore
            await reimbursementService.updateReimbursement("test", "dave");
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidPropertyError);
            expect(error).toHaveProperty("keyValuePairs", ['status: dave']);
        }
    }) 
})