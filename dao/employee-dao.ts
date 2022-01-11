import { CosmosClient } from "@azure/cosmos";
import Employee from "../entities/employee";
import NotFoundError from "../errors/not-found-error";


export default interface EmployeeDao {
    
    getEmployeeById(id:string): Promise<Employee>;

    getEmployeeByLogin(user:string, pass:string): Promise<Employee>;

}

export class EmployeeDaoImpl implements EmployeeDao {

    private client:CosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION ?? "");
    private database = this.client.database('wk-revature-db');
    private container = this.database.container('Employees');

    async getEmployeeById(id:string): Promise<Employee> {
        const response = await this.container.item(id, id).read<Employee>();
        if(!response.resource) {
            throw new NotFoundError(`Employee with id: ${id} not found in database`, 'Employee');
        }
        const employee:Employee = response.resource;
        const {id:returnedId, fname, mname, lname, manages} = employee;
        return {id:returnedId, fname, mname, lname, manages};
    }

    async getEmployeeByLogin(user: string, pass: string): Promise<Employee> {
        const querySpec = {
            query: `SELECT * FROM Employees e WHERE e.username = '${user}' AND e.password = '${pass}'`
        }
        const response = await this.container.items.query<Employee>(querySpec).fetchAll();
        const employees:Employee[] =  response.resources;
        if(employees.length < 1) throw new NotFoundError('No matching username and password found', 'Login');
        const {id:returnedId, fname, mname, lname, manages} = employees[0];
        return {id:returnedId, fname, mname, lname, manages};
    }

}