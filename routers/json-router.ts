import express from 'express';
import Employee from '../entities/employee';
import ReimbursementItem from '../entities/reimbursement-item';
import Statistics from '../entities/stats-interface';
import NotFoundError from '../errors/not-found-error';
import ReimbursementService from '../services/reimbursement-service-interface';

export default function createJsonRouter(reimbursementService:ReimbursementService) {

    const router = express.Router();

    router.use(express.json());

    router.route('/employees/:id')
    .get(async (req, res, next) => {
        try {
            const {id} = req.params;
            const employee:Employee = await reimbursementService.getEmployeeById(id);
            res.send(employee);
        } catch (error) {
            next(error);
        }
    })

    router.route('/employees/managed/:id')
    .get(async (req, res, next) => {
        try {
            const {id} = req.params;
            const employees = await reimbursementService.getManagedEmployees(id);
            res.send(employees);
        } catch (error) {
            next(error);
        }
    })

    router.route('/login')
    .patch(async (req, res, next) => {
        try {
            const {user, pass} = req.body;
            const employee = await reimbursementService.getEmployeeByLogin(String(user), String(pass));
            res.send(employee);
        } catch (error) {
            next(error);
        }
    });

    router.route('/loginMobile')
    .patch(async (req, res, next) => {
        try {
            const {user, pass} = req.body;
            const employee = await reimbursementService.getMobileLogin(String(user), String(pass));
            res.send(employee);
        } catch (error) {
            next(error);
        }
    })

    router.route('/reimbursements')
    .post(async (req, res, next) => {
        try {
            const reimbursement:ReimbursementItem = req.body;
            const newReimbursement:ReimbursementItem = await reimbursementService.createReimbursement(reimbursement);
            res.status(201);
            res.send(newReimbursement);
        } catch (error) {
            next(error);
        }
    })

    router.route('/reimbursements/:id')
    .get(async (req, res, next) => {
        try {
            const {id} = req.params;
            const reimbursements:ReimbursementItem[] = await reimbursementService.getReimbursementsForEmployee(id);
            res.send(reimbursements);
        } catch (error) {
            next(error);
        }
    })

    router.route('/reimbursements/update')
    .patch(async (req, res, next) => {
        try {
            const {id, status} = req.body;
            const reimbursement:ReimbursementItem = await reimbursementService.updateReimbursement(id, status);
            res.send(reimbursement);
        } catch (error) {
            next(error);
        }
    })

    router.route('/stats/:id')
    .get(async (req, res, next) => {
        const {id} = req.params;
        const stats:{companyStats:Statistics, managedStats:Statistics} = await reimbursementService.getStats(id);
        res.send(stats);
    })

    router.route('/')
    .get((req, res) => {
        res.send("");
    })

    router.all('*', (req, res, next) => {
        throw new NotFoundError(`The path you are trying to find does not exist. path: ${req.originalUrl}`, 'Unknown Route')
    })

    return router;
}