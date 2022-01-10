import express from 'express';
import EmployeeDao, { EmployeeDaoImpl } from './dao/employee-dao';
import Employee from './entities/employee';
import NotFoundError from './errors/not-found-error';
import ReimbursementService, { ReimbursementServiceImpl } from './services/reimbursement-service';
import cors from 'cors';
import ReimbursementDao, { ReimbursementDaoImpl } from './dao/reimbursement-dao';
import ReimbursementItem from './entities/reimbursement-item';
import InvalidPropertyError from './errors/invalid-property-error';
import https from 'https'
import http from 'http';
import fs from 'fs'

const app = express();

const employeeDao:EmployeeDao = new EmployeeDaoImpl();
const reimbursementDao:ReimbursementDao = new ReimbursementDaoImpl();
const reimbursementService:ReimbursementService = new ReimbursementServiceImpl(employeeDao, reimbursementDao);

app.use(cors());
app.use(express.json());

app.route('/employees/:id')
.get(async (req, res, next) => {
    try {
        const {id} = req.params;
        const employee:Employee = await reimbursementService.getEmployeeById(id);
        res.send(employee);
    } catch (error) {
        next(error);
    }
})

app.route('/employees/managed')
.patch(async (req, res, next) => {
    try {
        const ids:string[] = req.body;
        const employees = await reimbursementService.getManagedEmployees(ids);
        res.send(employees);
     } catch (error) {
        next(error);
    }
})

app.route('/login')
.patch(async (req, res, next) => {
    try {
        const {user, pass} = req.body;
        const employee = await reimbursementService.getEmployeeByLogin(String(user), String(pass));
        res.send(employee);
    } catch (error) {
        next(error);
    }
});

app.route('/reimbursements')
.post(async (req, res, next) => {
    try {
        const reimbursement:ReimbursementItem = req.body;
        const newReimbursement:ReimbursementItem = await reimbursementService.createReimbursement(reimbursement);
        res.send(newReimbursement);
    } catch (error) {
        next(error);
    }
})

app.route('/reimbursements/:id')
.get(async (req, res, next) => {
    try {
        const {id} = req.params;
        const reimbursements:ReimbursementItem[] = await reimbursementService.getReimbursementsForEmployee(id);
        res.send(reimbursements);
    } catch (error) {
        next(error);
    }
})

app.route('/reimbursements/update')
.patch(async (req, res, next) => {
    try {
        const {id, status} = req.body;
        const reimbursement:ReimbursementItem = await reimbursementService.updateReimbursement(id, status);
        res.send(reimbursement);
    } catch (error) {
        next(error);
    }
})

app.all('*', (req, res, next) => {
    throw new NotFoundError(`The path you are trying to find does not exist. path: ${req.originalUrl}`, 'Unknown Route')
})

app.use((err:Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    let message = '';
    if(err instanceof NotFoundError) {
        res.status(404);
        message += err.message
    } else if (err instanceof InvalidPropertyError) {
        res.status(422);
        message += err.message;
        message += '\n' + err.keyValuePairs.join('\n');
    } else {
        res.status(500);
        message += 'Unknown Server Error Occurred.';
    }
    console.log(err);
    res.send(message);
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key:fs.readFileSync("privkey.pem"),
    cert:fs.readFileSync("cert.pem")
},app);

httpServer.listen(80, ()=>console.log("HTTPServer listening on port 80"));
httpsServer.listen(443, () => console.log("HTTPSServer listening on port 443"));