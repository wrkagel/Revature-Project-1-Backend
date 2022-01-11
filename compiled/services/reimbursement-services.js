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
const reimbursement_item_1 = require("../entities/reimbursement-item");
const error_handler_reimbursement_service_1 = __importDefault(require("../errors/error-handler-reimbursement-service"));
const invalid_property_error_1 = __importDefault(require("../errors/invalid-property-error"));
const not_found_error_1 = __importDefault(require("../errors/not-found-error"));
class ReimbursementServiceImpl {
    constructor(employeeDao, reimbursementDao) {
        this.employeeDao = employeeDao;
        this.reimbursementDao = reimbursementDao;
    }
    getEmployeeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield this.employeeDao.getEmployeeById(id);
            return employee;
        });
    }
    getEmployeeByLogin(user, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield this.employeeDao.getEmployeeByLogin(user, pass);
            return employee;
        });
    }
    getManagedEmployees(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            const manages = (yield this.getEmployeeById(id)).manages;
            for (const id of manages !== null && manages !== void 0 ? manages : []) {
                result.push(yield this.employeeDao.getEmployeeById(id));
            }
            return result;
        });
    }
    getReimbursementsForEmployee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getEmployeeById(id);
            const reimbursements = yield this.reimbursementDao.getAllReimbursementsForEmployee(id);
            return reimbursements;
        });
    }
    createReimbursement(item) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                error_handler_reimbursement_service_1.default.checkValidReimbursement(item);
                yield this.employeeDao.getEmployeeById(item.employeeId);
                const newItem = yield this.reimbursementDao.createReimbursement(item);
                return newItem;
            }
            catch (error) {
                if (error instanceof not_found_error_1.default) {
                    error.message =
                        `Employee ID could not be matched to a valid employee in the database. employeeId: ${item.employeeId}`;
                }
                throw error;
            }
        });
    }
    updateReimbursement(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!reimbursement_item_1.ReimbursementStatus[status]) {
                throw new invalid_property_error_1.default(`Status must be one of [pending, denied, or approved].`, 'ReimbursementUpdate', [`status: ${status}`]);
            }
            const reimbursement = yield this.reimbursementDao.updateReimbursementStatus(id, status);
            return reimbursement;
        });
    }
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const reimbursements = yield this.reimbursementDao.getAllReimbursements();
            reimbursements.sort((r1, r2) => r2.amount - r1.amount);
            const highestItem = reimbursements[0];
            const highest = { employee: (yield this.employeeDao.getEmployeeById(highestItem.employeeId)), reimbursement: highestItem };
            const average = reimbursements.reduce((n, r2) => n + r2.amount, 0) / reimbursements.length;
            const reimbursementsByEmployee = [];
            reimbursements.forEach(r => {
                const index = reimbursementsByEmployee.findIndex(e => e.employeeId === r.employeeId);
                if (index !== -1) {
                    reimbursementsByEmployee[index].total += r.amount;
                    reimbursementsByEmployee[index].length++;
                }
                else {
                    reimbursementsByEmployee.push({ employeeId: r.employeeId, total: r.amount, length: 1 });
                }
            });
            reimbursementsByEmployee.sort((e1, e2) => e2.total / e2.length - e1.total / e1.length);
            const highestAvg = reimbursementsByEmployee[0];
            const lowestAvg = reimbursementsByEmployee[reimbursementsByEmployee.length - 1];
            const highestAvgByEmployee = { employee: yield this.getEmployeeById(highestAvg.employeeId), amount: highestAvg.total / highestAvg.length };
            const lowestAvgByEmployee = { employee: yield this.getEmployeeById(lowestAvg.employeeId), amount: lowestAvg.total / lowestAvg.length };
            return { highest, avgAmount: average, highestAvgByEmployee, lowestAvgByEmployee };
        });
    }
}
exports.default = ReimbursementServiceImpl;
