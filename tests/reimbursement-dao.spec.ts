import { CosmosClient } from "@azure/cosmos";
import ReimbursementDao, { ReimbursementDaoImpl } from "../dao/reimbursement-dao";
import ReimbursementItem, { ReimbursementStatus } from "../entities/reimbursement-item";
import NotFoundError from "../errors/not-found-error";


describe("Test Reimbursement Dao", () => {

    const reimbursementDao:ReimbursementDao = new ReimbursementDaoImpl();

    const client:CosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION ?? "");
    const database = client.database('wk-revature-db');
    const container = database.container('Reimbursements');
    let dummyReimbursement:ReimbursementItem = {
        id:"", 
        employeeId:"c6493f17-8eb8-4b79-b2bf-449406495916", 
        type:"Yodeling Class",
        desc:"Training for landing the yodelers association as clients.",
        amount:1000000000000000,
        date:Date.now() - 10000000000,
        status:ReimbursementStatus.pending
    };

    it("should get all reimbursement items for Harvey", async () => {

        const reimbursements = await reimbursementDao.getAllReimbursementsForEmployee("c6493f17-8eb8-4b79-b2bf-449406495916");
        //Harvey has at least 2 reimbursements. Maybe make new client and populate for more accurate tests.
        expect(reimbursements[1]).toHaveProperty('employeeId', "c6493f17-8eb8-4b79-b2bf-449406495916");
    });

    it("should create a new reimbursement item in the database", async () => {


        const returnResult = await reimbursementDao.createReimbursement(dummyReimbursement);
        dummyReimbursement.id = returnResult.id;
        expect(returnResult).toEqual(dummyReimbursement);
        dummyReimbursement = returnResult;
    })

    it("should update the status of the reimbursement created earlier to denied", async () => {
        const reimbursement:ReimbursementItem = await reimbursementDao.updateReimbursementStatus(dummyReimbursement.id, ReimbursementStatus.denied);
        expect(reimbursement).toHaveProperty("status", ReimbursementStatus.denied);
    })

    it("should throw a 404 error if the reimbursement doesn't exist", async () => {
        try {
            await reimbursementDao.updateReimbursementStatus("NotARealID", ReimbursementStatus.approved);
            fail();
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    });

    it("should return all reimbursements in the database", async () => {
        const reimbursements:ReimbursementItem[] = await reimbursementDao.getAllReimbursements();
        expect(reimbursements).toBeTruthy();
        expect(reimbursements.length).toBeGreaterThan(5);
    })

    afterAll(async () => {
        try {
            await container.item(dummyReimbursement.id, dummyReimbursement.id).delete();          
        } catch (error) {
            console.log('failed to delete dummyReimbursement after end of test');
            throw(error);
        }
    })

})