import express from 'express';
import EmployeeDao, { EmployeeDaoImpl } from './dao/employee-dao';
import Employee from './entities/employee';
import NotFoundError from './errors/not-found-error';
import cors, { CorsOptions } from 'cors';
import ReimbursementDao, { ReimbursementDaoImpl } from './dao/reimbursement-dao';
import ReimbursementItem from './entities/reimbursement-item';
import InvalidPropertyError from './errors/invalid-property-error';
import https from 'https'
import http from 'http';
import fs from 'fs'
import ReimbursementService from './services/reimbursement-service-interface';
import ReimbursementServiceImpl from './services/reimbursement-services';
import Statistics from './entities/stats-interface';
import multer from 'multer'
import expressErrorHandler from './middleware/express-error-handler';
import reqLogger from './middleware/req-logger';
import errLogger from './middleware/error-logger';

const app = express();

const employeeDao:EmployeeDao = new EmployeeDaoImpl();
const reimbursementDao:ReimbursementDao = new ReimbursementDaoImpl();
const reimbursementService:ReimbursementService = new ReimbursementServiceImpl(employeeDao, reimbursementDao);

const origin = "https://white-meadow-0ceb2eb0f.azurestaticapps.net";
//const origin = "http://localhost:3000"

const corsOptions:CorsOptions = {
    origin
}

app.use(cors(corsOptions));

app.use(reqLogger);

const upload = multer({
    limits:{
        fileSize:8000000
    }
});

app.route('/reimbursements/:id/upload')
.post(upload.array('uploads'), async (req, res, next) => {
    try {
        const {id} = req.params;
        const fd = req.files;
        if(!fd) throw new InvalidPropertyError("No files found to upload", 'Upload File', []);
        const result:boolean = await reimbursementService.uploadFiles(id, fd);
        res.send(result)
    } catch (error) {
        next(error);
    }
})

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

app.route('/employees/managed/:id')
.get(async (req, res, next) => {
    try {
        const {id} = req.params;
        const employees = await reimbursementService.getManagedEmployees(id);
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

app.route('/stats/:id')
.get(async (req, res, next) => {
    const {id} = req.params;
    const stats:{companyStats:Statistics, managedStats:Statistics} = await reimbursementService.getStats(id);
    res.send(stats);
})

app.all('*', (req, res, next) => {
    throw new NotFoundError(`The path you are trying to find does not exist. path: ${req.originalUrl}`, 'Unknown Route')
})

app.use(errLogger);
app.use(expressErrorHandler);

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key:fs.readFileSync("privkey.pem"),
    cert:fs.readFileSync("cert.pem")
},app);

httpServer.listen(80, ()=>console.log("HTTPServer listening on port 80"));
httpsServer.listen(443, () => console.log("HTTPSServer listening on port 443"));