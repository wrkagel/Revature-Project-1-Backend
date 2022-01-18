import { CosmosClient} from "@azure/cosmos";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 } from "uuid";
import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import NotFoundError from "../errors/not-found-error";


export default interface ReimbursementDao {

    getAllReimbursements(): Promise<ReimbursementItem[]>

    getAllReimbursementsForEmployee(id:string): Promise<ReimbursementItem[]>

    createReimbursement(item:ReimbursementItem): Promise<ReimbursementItem>

    updateReimbursementStatus(id:string, status:ReimbursementStatus): Promise<ReimbursementItem>

    uploadFiles(id:string, fd: Express.Multer.File[]): Promise<boolean>

    downloadFiles(id:string): Promise<{name:string, buffer:Buffer}[]>

}

export class ReimbursementDaoImpl implements ReimbursementDao {

    private client:CosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION ?? "");
    private database = this.client.database('wk-revature-db');
    private container = this.database.container('Reimbursements');
    private blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING ?? "");
    private blobContainerClient = this.blobServiceClient.getContainerClient('wk-project1');

    async getAllReimbursements(): Promise<ReimbursementItem[]> {
        const querySpec = {
            query:`SELECT r.id, r.employeeId, r.amount, r.type, r["desc"], r.date, r.status FROM Reimbursements r`
        }
        const response = await this.container.items.query(querySpec).fetchAll();
        const reimbursements:ReimbursementItem[] = response.resources;
        return reimbursements;
    }

    async getAllReimbursementsForEmployee(id: string): Promise<ReimbursementItem[]> {
        const querySpec = {
            query: `SELECT r.id, r.employeeId, r.amount, r.type, r["desc"], r.date, r.status FROM Reimbursements r WHERE r.employeeId = '${id}'`
        }
        const response =  await this.container.items.query<ReimbursementItem>(querySpec).fetchAll();
        const reimbursements:ReimbursementItem[] = response.resources;
        return reimbursements;
    }

    async createReimbursement(item: ReimbursementItem): Promise<ReimbursementItem> {
        item.id = v4();
        const response = await this.container.items.create(item);
        const reimbursement:ReimbursementItem | undefined = response.resource;
        if(!reimbursement) throw new Error('Failed to create reimbursement.');
        const {id, employeeId, type, desc, amount, date, status} = reimbursement;
        return {id, employeeId, type, desc, amount, date, status};
    }

    async updateReimbursementStatus(id:string, status:ReimbursementStatus): Promise<ReimbursementItem> {
        try {
            const response = await this.container.item(id, id).patch<ReimbursementItem>([{
                op:"replace",
                path:"/status",
                value:status
            }])
            if(!(response.resource)) throw new NotFoundError(`There is no matching reimbursement in the database to update. id: ${id}`,
            'Reimbursement Update');
            const result:ReimbursementItem = response.resource;
            return result;
        } catch (error) {
            //necessary to fix compile issue on server.
            let anyError:any = error;
            if(anyError.code === 404) anyError =  new NotFoundError(`There is no matching reimbursement in the database to update. id: ${id}`,
            'Reimbursement Update');
            throw(anyError);
        }

    }

    async uploadFiles(id: string, fd: Express.Multer.File[]): Promise<boolean> {
        const response = await this.container.item(id, id).read<ReimbursementItem>();
        if(!response || !response.resource) throw  new NotFoundError(`There is no matching reimbursement in the database to update. id: ${id}`,
        'Reimbursement Update');
        const reimbursement:ReimbursementItem = response.resource;
        for(const file of fd) {
            const blockBlobClient = this.blobContainerClient.getBlockBlobClient(file.originalname);
            const uploadResponse = await blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders:{
                    blobContentType:file.mimetype
                }
            });
            if(uploadResponse.errorCode) throw new Error('Error uploading to blob storage.');
            if(reimbursement.files) {
                if(!reimbursement.files.includes(blockBlobClient.name)) {
                    reimbursement.files.push(blockBlobClient.name);
                }
            } else {
                reimbursement.files = [blockBlobClient.name];
            }
        }
        const response2 = await this.container.item(id, id).replace(reimbursement);
        if(!response2 || !response2.resource) throw  new NotFoundError(`There is no matching reimbursement in the database to update. id: ${id}`,
        'File Upload');
        return true;
    }

    async downloadFiles(id: string): Promise<{name:string, buffer:Buffer}[]> {
        const response = await this.container.item(id, id).read<ReimbursementItem>();
        if(!response || !response.resource) throw  new NotFoundError(`There is no matching reimbursement in the database to update. id: ${id}`,
        'Reimbursement Update');
        const reimbursement:ReimbursementItem = response.resource;
        if(!reimbursement.files) throw new NotFoundError(`There are no files associated with this reimbursement. id: ${id}`, 'File Download')
        const buffers:{name:string, buffer:Buffer}[] = []
        for(const name of reimbursement.files) {
            const blockBlobClient = this.blobContainerClient.getBlockBlobClient(name);
            const buffer:Buffer = await blockBlobClient.downloadToBuffer();
            buffers.push({name, buffer});
        }
        return buffers;
    }
}
