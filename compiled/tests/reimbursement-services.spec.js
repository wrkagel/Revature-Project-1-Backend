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
const invalid_property_error_1 = __importDefault(require("../errors/invalid-property-error"));
const not_found_error_1 = __importDefault(require("../errors/not-found-error"));
const reimbursement_services_1 = require("../services/reimbursement-services");
const managedEmployees = ['c6493f17-8eb8-4b79-b2bf-449406495916', '11dfdd35-8d6e-4c2d-8903-ed9ceadb5d7e'];
class mockEmployeeDao {
    getEmployeeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (id === 'testManger') {
                return { fname: "", id: "", manages: managedEmployees };
            }
            if (managedEmployees.find(str => str === id)) {
                return { id: "", fname: "" };
            }
            else {
                throw new not_found_error_1.default('Not Found', 'Test');
            }
        });
    }
    getEmployeeByLogin(user, pass) {
        throw new Error("Method not implemented.");
    }
}
class mockReimbursementDao {
    updateReimbursementStatus(id, status) {
        throw new Error("Method not implemented.");
    }
    getEmployeeWithHighestAverage() {
        throw new Error("Method not implemented.");
    }
    getHighest() {
        throw new Error("Method not implemented.");
    }
    getAllReimbursementsForEmployee(id) {
        throw new Error("Method not implemented");
    }
    createReimbursement(item) {
        throw new Error("Method not implemented.");
    }
}
describe("Test business logic and non-passthrough methods", () => {
    const reimbursementService = new reimbursement_services_1.ReimbursementServiceImpl(new mockEmployeeDao(), new mockReimbursementDao());
    it("should return an array of employees", () => __awaiter(void 0, void 0, void 0, function* () {
        const employees = yield reimbursementService.getManagedEmployees('testManger');
        expect(employees.length).toBe(2);
    }));
    it("should throw a 404 error if the array contains an employee that doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield reimbursementService.getManagedEmployees('invalid');
            fail();
        }
        catch (error) {
            expect(error).toBeInstanceOf(not_found_error_1.default);
        }
    }));
    it("should throw a NotFoundError on invalid employeeId when creating a reimbursement", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield reimbursementService.createReimbursement({
                id: "test",
                employeeId: "test",
                type: 'test',
                desc: 'test',
                amount: 1,
                date: 1,
                status: reimbursement_item_1.ReimbursementStatus.denied
            });
            fail();
        }
        catch (error) {
            expect(error).toBeInstanceOf(not_found_error_1.default);
            expect(error).toHaveProperty("message", `Employee ID could not be matched to a valid employee in the database. employeeId: test`);
        }
    }));
    it("should throw an InvalidPropertyError that contains each missing or incorrect property on the reimbursement", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const reimbursement = {
                id: "",
                employeeId: "",
                type: "",
                desc: "",
                amount: -1,
                date: -1,
                status: "testing"
            };
            //@ts-ignore
            yield reimbursementService.createReimbursement(reimbursement);
        }
        catch (error) {
            expect(error).toBeInstanceOf(invalid_property_error_1.default);
            expect(error).toHaveProperty("keyValuePairs", [
                'type: ',
                'desc: ',
                'amount: -1',
                'date: -1',
                'status: testing'
            ]);
        }
    }));
    it("should throw an InvalidPropertyError for an invalid status", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            //@ts-ignore
            yield reimbursementService.updateReimbursement("test", "dave");
        }
        catch (error) {
            expect(error).toBeInstanceOf(invalid_property_error_1.default);
            expect(error).toHaveProperty("keyValuePairs", ['status: dave']);
        }
    }));
});
