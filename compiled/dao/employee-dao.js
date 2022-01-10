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
exports.EmployeeDaoImpl = void 0;
const cosmos_1 = require("@azure/cosmos");
const not_found_error_1 = __importDefault(require("../errors/not-found-error"));
class EmployeeDaoImpl {
    constructor() {
        var _a;
        this.client = new cosmos_1.CosmosClient((_a = process.env.COSMOS_CONNECTION) !== null && _a !== void 0 ? _a : "");
        this.database = this.client.database('wk-revature-db');
        this.container = this.database.container('Employees');
    }
    getEmployeeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.container.item(id, id).read();
            if (!response.resource) {
                throw new not_found_error_1.default(`Employee with id: ${id} not found in database`, 'Employee');
            }
            const employee = response.resource;
            const { id: returnedId, fname, mname, lname, manages } = employee;
            return { id: returnedId, fname, mname, lname, manages };
        });
    }
    getEmployeeByLogin(user, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const querySpec = {
                query: `SELECT * FROM Employees e WHERE e.username = '${user}' AND e.password = '${pass}'`
            };
            const response = yield this.container.items.query(querySpec).fetchAll();
            const employees = response.resources;
            if (employees.length < 1)
                throw new not_found_error_1.default('No matching username and password found', 'Login');
            const { id: returnedId, fname, mname, lname, manages } = employees[0];
            return { id: returnedId, fname, mname, lname, manages };
        });
    }
}
exports.EmployeeDaoImpl = EmployeeDaoImpl;
