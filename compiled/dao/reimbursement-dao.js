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
const uuid_1 = require("uuid");
const not_found_error_1 = __importDefault(require("../errors/not-found-error"));
class ReimbursementDaoImpl {
    constructor() {
        var _a;
        this.client = new cosmos_1.CosmosClient((_a = process.env.COSMOS_CONNECTION) !== null && _a !== void 0 ? _a : "");
        this.database = this.client.database('wk-revature-db');
        this.container = this.database.container('Reimbursements');
    }
    getAllReimbursementsForEmployee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const querySpec = {
                query: `SELECT * FROM Reimbursements r WHERE r.employeeId = '${id}'`
            };
            const response = yield this.container.items.query(querySpec).fetchAll();
            const reimbursements = response.resources;
            return reimbursements.map((r) => {
                return {
                    id: r.id,
                    employeeId: r.employeeId,
                    type: r.type,
                    desc: r.desc,
                    amount: r.amount,
                    date: r.date,
                    status: r.status
                };
            });
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
    getHighest() {
        return __awaiter(this, void 0, void 0, function* () {
            const querySpec = {
                query: 'SELECT * FROM Reimbursements r ORDER BY r.amount DESC'
            };
            const response = yield this.container.items.query(querySpec).fetchNext();
            const reimbursement = response.resources[0];
            return reimbursement;
        });
    }
    getEmployeeWithHighestAverage() {
        return __awaiter(this, void 0, void 0, function* () {
            const querySpec = {
                query: 'SELECT r.employeeId, avg(r.amount) AS average FROM Reimbursements r GROUP BY r.employeeId'
            };
            const response = yield this.container.items.query(querySpec).fetchAll();
            const results = response.resources;
            results.sort((r1, r2) => r2.average - r1.average);
            return results[0].employeeId;
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
                    throw { code: 404 };
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
}
exports.ReimbursementDaoImpl = ReimbursementDaoImpl;
