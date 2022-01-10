import { CosmosClient, SqlQuerySpec } from "@azure/cosmos";
import { v4 } from "uuid";
import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import NotFoundError from "../errors/not-found-error";


export default interface ReimbursementDao {

    getAllReimbursementsForEmployee(id:String): Promise<ReimbursementItem[]>;

    createReimbursement(item:ReimbursementItem): Promise<ReimbursementItem>;

    updateReimbursementStatus(id:string, status:ReimbursementStatus): Promise<ReimbursementItem>

    getHighest(): Promise<ReimbursementItem>;
    
    getEmployeeWithHighestAverage(): Promise<string>;
}

export class ReimbursementDaoImpl implements ReimbursementDao {

    private client:CosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION ?? "");
    private database = this.client.database('wk-revature-db');
    private container = this.database.container('Reimbursements');

    async getAllReimbursementsForEmployee(id: String): Promise<ReimbursementItem[]> {
        const querySpec = {
            query: `SELECT * FROM Reimbursements r WHERE r.employeeId = '${id}'`
        }
        const response =  await this.container.items.query<ReimbursementItem>(querySpec).fetchAll();
        const reimbursements:ReimbursementItem[] = response.resources;
        return reimbursements.map((r) => {return {
            id:r.id, 
            employeeId:r.employeeId, 
            type:r.type, 
            desc:r.desc, 
            amount:r.amount, 
            date:r.date, 
            status:r.status
        }});
    }

    async createReimbursement(item: ReimbursementItem): Promise<ReimbursementItem> {
        item.id = v4();
        const response = await this.container.items.create(item);
        const reimbursement:ReimbursementItem | undefined = response.resource;
        if(!reimbursement) throw new Error('Failed to create reimbursement.');
        const {id, employeeId, type, desc, amount, date, status} = reimbursement;
        return {id, employeeId, type, desc, amount, date, status};
    }

    async getHighest(): Promise<ReimbursementItem> {
        const querySpec:SqlQuerySpec = {
            query:'SELECT * FROM Reimbursements r ORDER BY r.amount DESC'
        }
        const response = await this.container.items.query<ReimbursementItem>(querySpec).fetchNext();
        const reimbursement:ReimbursementItem = response.resources[0];
        return reimbursement;
    }

    async getEmployeeWithHighestAverage(): Promise<string> {
        const querySpec:SqlQuerySpec = {
            query:'SELECT r.employeeId, avg(r.amount) AS average FROM Reimbursements r GROUP BY r.employeeId'
        }
        const response = await this.container.items.query<{average:number, employeeId:string}>(querySpec).fetchAll();
        const results = response.resources;
        results.sort((r1, r2) => r2.average - r1.average);
        return results[0].employeeId;
    }

    async updateReimbursementStatus(id:string, status:ReimbursementStatus): Promise<ReimbursementItem> {
        try {
            const response = await this.container.item(id, id).patch<ReimbursementItem>([{
                op:"replace",
                path:"/status",
                value:status
            }])
            if(!(response.resource)) throw {code:404};
            const result:ReimbursementItem = response.resource;
            return result;            
        } catch (error:any) {
            if(error.code === 404) error =  new NotFoundError(`There is no matching reimbursement in the database to update. id: ${id}`,
            'Reimbursement Update');
            throw(error);
        }

    }

}
