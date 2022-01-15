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
exports.ReimbursementDaoImpl = void 0;
const cosmos_1 = require("@azure/cosmos");
const storage_blob_1 = require("@azure/storage-blob");
const uuid_1 = require("uuid");
const not_found_error_1 = __importDefault(require("../errors/not-found-error"));
class ReimbursementDaoImpl {
    constructor() {
        var _a, _b;
        this.client = new cosmos_1.CosmosClient((_a = process.env.COSMOS_CONNECTION) !== null && _a !== void 0 ? _a : "");
        this.database = this.client.database('wk-revature-db');
        this.container = this.database.container('Reimbursements');
        this.blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString((_b = process.env.AZURE_STORAGE_CONNECTION_STRING) !== null && _b !== void 0 ? _b : "");
        this.blobContainerClient = this.blobServiceClient.getContainerClient('wk-project1');
    }
    getAllReimbursements() {
        return __awaiter(this, void 0, void 0, function* () {
            const querySpec = {
                query: `SELECT r.id, r.employeeId, r.type, r["desc"], r.date, r.status FROM Reimbursements r`
            };
            const response = yield this.container.items.query(querySpec).fetchAll();
            const reimbursements = response.resources;
            return reimbursements;
        });
    }
    getAllReimbursementsForEmployee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const querySpec = {
                query: `SELECT r.id, r.employeeId, r.type, r["desc"], r.date, r.status FROM Reimbursements r WHERE r.employeeId = '${id}'`
            };
            const response = yield this.container.items.query(querySpec).fetchAll();
            const reimbursements = response.resources;
            return reimbursements;
        });
    }
    createReimbursement(item) {
        return __awaiter(this, void 0, void 0, function* () {
            item.id = (0, uuid_1.v4)();
            const response = yield this.container.items.create(item);
            const reimbursement = response.resource;
            if (!reimbursement)
                throw new Error('Failed to create reimbursement.');
            const { id, employeeId, type, desc, amount, date, status } = reimbursement;
            return { id, employeeId, type, desc, amount, date, status };
        });
    }
    updateReimbursementStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.container.item(id, id).patch([{
                        op: "replace",
                        path: "/status",
                        value: status
                    }]);
                if (!(response.resource))
                    throw new not_found_error_1.default(`There is no matching reimbursement in the database to update. id: ${id}`, 'Reimbursement Update');
                const result = response.resource;
                return result;
            }
            catch (error) {
                if (error.code === 404)
                    error = new not_found_error_1.default(`There is no matching reimbursement in the database to update. id: ${id}`, 'Reimbursement Update');
                throw (error);
            }
        });
    }
    uploadFiles(id, fd) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.container.item(id, id).read();
            if (!response || !response.resource)
                throw new not_found_error_1.default(`There is no matching reimbursement in the database to update. id: ${id}`, 'Reimbursement Update');
            const reimbursement = response.resource;
            for (const file of fd) {
                const blockBlobClient = this.blobContainerClient.getBlockBlobClient(file.originalname);
                const uploadResponse = yield blockBlobClient.uploadData(file.buffer, {
                    blobHTTPHeaders: {
                        blobContentType: file.mimetype
                    }
                });
                if (uploadResponse.errorCode)
                    throw new Error('Error uploading to blob storage.');
                if (reimbursement.files) {
                    if (!reimbursement.files.includes(blockBlobClient.name)) {
                        reimbursement.files.push(blockBlobClient.name);
                    }
                }
                else {
                    reimbursement.files = [blockBlobClient.name];
                }
            }
            const response2 = yield this.container.item(id, id).replace(reimbursement);
            if (!response2 || !response2.resource)
                throw new not_found_error_1.default(`There is no matching reimbursement in the database to update. id: ${id}`, 'Reimbursement Update');
            return true;
        });
    }
}
exports.ReimbursementDaoImpl = ReimbursementDaoImpl;
