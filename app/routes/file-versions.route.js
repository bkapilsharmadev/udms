const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const fileVersionController = require('../controllers/file-versions.controller');

router.get("/fetch", asyncErrorHandler(fileVersionController.getFileVersions));
router.get("/fetch/:document_id", asyncErrorHandler(fileVersionController.getFileVersionsByDocumentId));
router.post("/create", asyncErrorHandler(fileVersionController.createFileVersion));
router.post("/delete", asyncErrorHandler(fileVersionController.deleteFileVersion));
router.post("/update", asyncErrorHandler(fileVersionController.updateFileVersion));
router.get("/download-file/:version_id",asyncErrorHandler(fileVersionController.downloadFile));
router.get("/", asyncErrorHandler(fileVersionController.renderFileVersions));

module.exports = router;
