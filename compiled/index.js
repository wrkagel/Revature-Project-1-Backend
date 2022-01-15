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
const express_1 = __importDefault(require("express"));
const employee_dao_1 = require("./dao/employee-dao");
const not_found_error_1 = __importDefault(require("./errors/not-found-error"));
const cors_1 = __importDefault(require("cors"));
const reimbursement_dao_1 = require("./dao/reimbursement-dao");
const invalid_property_error_1 = __importDefault(require("./errors/invalid-property-error"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const reimbursement_services_1 = __importDefault(require("./services/reimbursement-services"));
const multer_1 = __importDefault(require("multer"));
const express_error_handler_1 = __importDefault(require("./middleware/express-error-handler"));
const app = (0, express_1.default)();
const employeeDao = new employee_dao_1.EmployeeDaoImpl();
const reimbursementDao = new reimbursement_dao_1.ReimbursementDaoImpl();
const reimbursementService = new reimbursement_services_1.default(employeeDao, reimbursementDao);
const allowed = ["https://white-meadow-0ceb2eb0f.azurestaticapps.net", "http://localhost:3000"];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowed.indexOf(origin !== null && origin !== void 0 ? origin : "") !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Origin not allowed by CORS'));
        }
    }
};
app.use((0, cors_1.default)(corsOptions));
const upload = (0, multer_1.default)({
    limits: {
        fileSize: 8000000
    }
});
app.route('/reimbursements/:id/upload')
    .post(upload.array('uploads'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const fd = req.files;
        if (!fd)
            throw new invalid_property_error_1.default("No files found to upload", 'Upload File', []);
        const result = yield reimbursementService.uploadFiles(id, fd);
        res.send(result);
    }
    catch (error) {
        next(error);
    }
}));
app.use(express_1.default.json());
app.route('/employees/:id')
    .get((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const employee = yield reimbursementService.getEmployeeById(id);
        res.send(employee);
    }
    catch (error) {
        next(error);
    }
}));
app.route('/employees/managed/:id')
    .get((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const employees = yield reimbursementService.getManagedEmployees(id);
        res.send(employees);
    }
    catch (error) {
        next(error);
    }
}));
app.route('/login')
    .patch((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, pass } = req.body;
        const employee = yield reimbursementService.getEmployeeByLogin(String(user), String(pass));
        res.send(employee);
    }
    catch (error) {
        next(error);
    }
}));
app.route('/reimbursements')
    .post((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reimbursement = req.body;
        const newReimbursement = yield reimbursementService.createReimbursement(reimbursement);
        res.send(newReimbursement);
    }
    catch (error) {
        next(error);
    }
}));
app.route('/reimbursements/:id')
    .get((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const reimbursements = yield reimbursementService.getReimbursementsForEmployee(id);
        res.send(reimbursements);
    }
    catch (error) {
        next(error);
    }
}));
app.route('/reimbursements/update')
    .patch((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, status } = req.body;
        const reimbursement = yield reimbursementService.updateReimbursement(id, status);
        res.send(reimbursement);
    }
    catch (error) {
        next(error);
    }
}));
app.route('/stats/:id')
    .get((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const stats = yield reimbursementService.getStats(id);
    res.send(stats);
}));
app.all('*', (req, res, next) => {
    throw new not_found_error_1.default(`The path you are trying to find does not exist. path: ${req.originalUrl}`, 'Unknown Route');
});
app.use(express_error_handler_1.default);
const httpServer = http_1.default.createServer(app);
const httpsServer = https_1.default.createServer({
    key: fs_1.default.readFileSync("privkey.pem"),
    cert: fs_1.default.readFileSync("cert.pem")
}, app);
httpServer.listen(80, () => console.log("HTTPServer listening on port 80"));
httpsServer.listen(443, () => console.log("HTTPSServer listening on port 443"));
