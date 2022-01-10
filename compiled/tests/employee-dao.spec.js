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
const employee_dao_1 = require("../dao/employee-dao");
const not_found_error_1 = __importDefault(require("../errors/not-found-error"));
describe("Test employee DAO", () => {
    const employeeDao = new employee_dao_1.EmployeeDaoImpl();
    it("should get employee Harvey The Ghost.", () => __awaiter(void 0, void 0, void 0, function* () {
        const employee = yield employeeDao.getEmployeeById("c6493f17-8eb8-4b79-b2bf-449406495916");
        expect(employee.fname).toBe("Harvey");
    }));
    it("should throw NotFoundError if employee doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield employeeDao.getEmployeeById("Doesn't Exist");
            fail();
        }
        catch (error) {
            expect(error).toBeInstanceOf(not_found_error_1.default);
        }
    }));
    it("it should get Harvey The Ghost", () => __awaiter(void 0, void 0, void 0, function* () {
        const employee = yield employeeDao.getEmployeeByLogin("HarveyGhost", "ghost");
        expect(employee.fname).toBe("Harvey");
    }));
    it("should throw NotFoundError if no matching credentials found", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield employeeDao.getEmployeeByLogin("HarveyGhost", "Ghost");
        }
        catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    }));
});
