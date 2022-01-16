import EmployeeDao, { EmployeeDaoImpl } from "../dao/employee-dao"
import Employee from "../entities/employee";
import NotFoundError from "../errors/not-found-error";


describe("Test employee DAO", () => {

    const employeeDao:EmployeeDao = new EmployeeDaoImpl();

    it("should get employee Harvey The Ghost.", async () => {

        const employee:Employee = await employeeDao.getEmployeeById("c6493f17-8eb8-4b79-b2bf-449406495916");
        expect(employee.fname).toBe("Harvey");

    })

    it("should throw NotFoundError if employee doesn't exist", async () => {
        try {
            await employeeDao.getEmployeeById("Doesn't Exist");
            fail();
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }

    })

    it("it should get Harvey The Ghost", async () => {
        const employee:Employee = await employeeDao.getEmployeeByLogin("HarveyGhost", "ghost");
        expect(employee.fname).toBe("Harvey")
    })

    it("should throw NotFoundError if no matching credentials found", async () => {
        try {
            await employeeDao.getEmployeeByLogin("HarveyGhost", "Ghost");
            fail();
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    })

})