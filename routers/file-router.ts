import express from 'express';
import multer from 'multer';
import InvalidPropertyError from '../errors/invalid-property-error';
import ReimbursementService from '../services/reimbursement-service-interface';

export default function createFileRouter(reimbursementService:ReimbursementService) {

    const router = express.Router();

    const upload = multer({
        limits:{
            fileSize:8000000
        }
    });

    router.route('/reimbursements/:id/upload')
    .post(upload.array('uploads'), async (req, res, next) => {
    try {
        const {id} = req.params;
        const fd = req.files;
        if(!fd) throw new InvalidPropertyError("No files found to upload", 'Upload File', []);
        const result:boolean = await reimbursementService.uploadFiles(id, fd);
        res.send(result)
    } catch (error) {
        next(error);
    }})

    return router;
}

