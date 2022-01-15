import EmployeeDao from "../dao/employee-dao";
import ReimbursementDao from "../dao/reimbursement-dao";
import Employee from "../entities/employee";
import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import InvalidPropertyError from "../errors/invalid-property-error";
import NotFoundError from "../errors/not-found-error";
import ReimbursementServiceImpl from "../services/reimbursement-services";
import ReimbursementService from "../services/reimbursement-services"

const managedEmployees:string[] = ['Harvey1', 'Harvey2',
    "Steve1", "Steve2"];

class MockEmployeeDao implements EmployeeDao {

    async getEmployeeById(id: string): Promise<Employee> {

        if(id === 'testManager') {
            return {fname:"", id:"", manages:managedEmployees};
        }
    
        if(managedEmployees.find(str => str === id)) {
            return {id, fname:""};
        } else {
            throw new NotFoundError('Not Found', 'Test');
        }
    }
    getEmployeeByLogin(user: string, pass: string): Promise<Employee> {
        throw new Error("Method not implemented.");
    }
    
}

class MockReimbursementDao implements ReimbursementDao {
    downloadFiles(id: string): Promise<File[]> {
        throw new Error("Method not implemented.");
    }
    uploadFiles(id: string, fd: Express.Multer.File[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async getAllReimbursements(): Promise<ReimbursementItem[]> {
        return mockReimbursements;
    }
    updateReimbursementStatus(id:string, status:ReimbursementStatus): Promise<ReimbursementItem> {
        throw new Error("Method not implemented.");
    }
    getEmployeeWithHighestAverage(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getHighest(): Promise<ReimbursementItem> {
        throw new Error("Method not implemented.");
    }
    getAllReimbursementsForEmployee(id: string): Promise<ReimbursementItem[]> {
        throw new Error("Method not implemented");
    }
    createReimbursement(item: ReimbursementItem): Promise<ReimbursementItem> {
        throw new Error("Method not implemented.");
    }
    
}

const mockReimbursement:ReimbursementItem = {
    id:"",
    employeeId:"Steve1",
    type:"",
    desc:"",
    amount:20,
    date:0,
    status:ReimbursementStatus.denied
}
const mockReimbursements:ReimbursementItem[] = [
    mockReimbursement,
    mockReimbursement,
    mockReimbursement,
    {...mockReimbursement, employeeId:"Steve2", amount:5.47},
    {...mockReimbursement, employeeId:"Steve2", amount:20.55}
]

describe("Test business logic and non-passthrough methods", () => {

    const reimbursementService:ReimbursementService = new ReimbursementServiceImpl(new MockEmployeeDao(), new MockReimbursementDao());

    it("should return an array of employees", async ()=>{

        const employees:Employee[] = await reimbursementService.getManagedEmployees('testManager');
        expect(employees.length).toBe(4);
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
            ]);
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
    });

    it("should return a set of statistics based on the current set of reimbursements in the db", async () => {
        const {companyStats, managedStats} = await reimbursementService.getStats("testManager");
        expect(companyStats.highest.employee.id).toBe("Steve2");
        expect(companyStats.highestAvgByEmployee.amount).toBe("20.00");
        expect(companyStats.highestAvgByEmployee.employee.id).toBe("Steve1");
        expect(companyStats.lowestAvgByEmployee.employee.id).toBe("Steve2");
        expect(companyStats.lowestAvgByEmployee.amount).toBe(((5.47 + 20.55)/2).toFixed(2));
        expect(companyStats.avgAmount).toBe(((20+20+20+5.47+20.55)/5).toFixed(2));
        expect(companyStats).toEqual(managedStats);
    });
})