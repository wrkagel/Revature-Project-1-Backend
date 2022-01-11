"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cosmos_1 = require("@azure/cosmos");
const reimbursement_dao_1 = require("../dao/reimbursement-dao");
const reimbursement_item_1 = require("../entities/reimbursement-item");
const not_found_error_1 = __importDefault(require("../errors/not-found-error"));
describe("Test Reimbursement Dao", () => {
    var _a;
    const reimbursementDao = new reimbursement_dao_1.ReimbursementDaoImpl();
    const client = new cosmos_1.CosmosClient((_a = process.env.COSMOS_CONNECTION) !== null && _a !== void 0 ? _a : "");
    const database = client.database('wk-revature-db');
    const container = database.container('Reimbursements');
    let dummyReimbursement = {
        id: "",
        employeeId: "c6493f17-8eb8-4b79-b2bf-449406495916",
        type: "Yodeling Class",
        desc: "Training for landing the yodelers association as clients.",
        amount: 1000000000000000,
        date: Date.now() - 10000000000,
        status: reimbursement_item_1.ReimbursementStatus.pending
    };
    it("should get all reimbursement items for Harvey", () => __awaiter(void 0, void 0, void 0, function* () {
        const reimbursements = yield reimbursementDao.getAllReimbursementsForEmployee("c6493f17-8eb8-4b79-b2bf-449406495916");
        //Harvey has at least 2 reimbursements. Maybe make new client and populate for more accurate tests.
        expect(reimbursements[1]).toHaveProperty('employeeId', "c6493f17-8eb8-4b79-b2bf-449406495916");
    }));
    it("should create a new reimbursement item in the database", () => __awaiter(void 0, void 0, void 0, function* () {
        const returnResult = yield reimbursementDao.createReimbursement(dummyReimbursement);
        dummyReimbursement.id = returnResult.id;
        expect(returnResult).toEqual(dummyReimbursement);
        dummyReimbursement = returnResult;
    }));
    it("should update the status of the reimbursement created earlier to denied", () => __awaiter(void 0, void 0, void 0, function* () {
        const reimbursement = yield reimbursementDao.updateReimbursementStatus(dummyReimbursement.id, reimbursement_item_1.ReimbursementStatus.denied);
        expect(reimbursement).toHaveProperty("status", reimbursement_item_1.ReimbursementStatus.denied);
    }));
    it("should throw a 404 error if the reimbursement doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield reimbursementDao.updateReimbursementStatus("NotARealID", reimbursement_item_1.ReimbursementStatus.approved);
        }
        catch (error) {
            expect(error).toBeInstanceOf(not_found_error_1.default);
        }
    }));
    it("should return all reimbursements in the database", () => __awaiter(void 0, void 0, void 0, function* () {
        const reimbursements = yield reimbursementDao.getAllReimbursements();
        expect(reimbursements).toBeTruthy();
        expect(reimbursements.length).toBeGreaterThan(5);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield container.item(dummyReimbursement.id, dummyReimbursement.id).delete();
        }
        catch (error) {
            console.log('failed to delete dummyReimbursement after end of test');
            throw (error);
        }
    }));
});
