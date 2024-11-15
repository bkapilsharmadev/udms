const router = require("express").Router();
const { asyncErrorHandler } = require('../middleware/error.middleware');
const fileController = require('../controllers/files.controller');

router.get("/fetch", asyncErrorHandler(fileController.getFiles));
router.post("/create", asyncErrorHandler(fileController.createFile));
router.post("/delete", asyncErrorHandler(fileController.deleteFile));
router.post("/update", asyncErrorHandler(fileController.updateFile));
router.get("/", asyncErrorHandler(fileController.renderFiles));

module.exports = router;
