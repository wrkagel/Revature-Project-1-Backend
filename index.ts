import express from 'express';
import EmployeeDao, { EmployeeDaoImpl } from './dao/employee-dao';
import cors, { CorsOptions } from 'cors';
import ReimbursementDao, { ReimbursementDaoImpl } from './dao/reimbursement-dao';
import https from 'https'
import http from 'http';
import fs from 'fs'
import ReimbursementService from './services/reimbursement-service-interface';
import ReimbursementServiceImpl from './services/reimbursement-services';
import expressErrorHandler from './middleware/express-error-handler';
import reqLogger from './middleware/req-logger';
import errLogger from './middleware/error-logger';
import createFileRouter from './routers/file-router';
import createJsonRouter from './routers/json-router';

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

app.use(createFileRouter(reimbursementService));

app.use(createJsonRouter(reimbursementService));

app.use(errLogger);
app.use(expressErrorHandler);

const httpServer = http.createServer(app);
// const httpsServer = https.createServer({
//     key:fs.readFileSync("privkey.pem"),
//     cert:fs.readFileSync("cert.pem")
// },app);

httpServer.listen(80, ()=>console.log("HTTPServer listening on port 80"));
// httpsServer.listen(443, () => console.log("HTTPSServer listening on port 443"));