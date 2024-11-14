const express = require("express");
const router = express.Router();
const { asyncErrorHandler } = require("../middleware/error.middleware");

const dashboardRoute = require("./dashboard.route");
const documentStagesRoute = require("./document-stages.route");
const statusTypesRoute = require("./status-types.route");
const entityTypesRoute = require("./entity-types.route");
const entitiesRoute = require("./entities.route");
const documentsRoute = require("./documents.route");
const filesRoute = require("./files.route");
const fileVersionsRoute = require("./file-versions.route");
const authRoute = require("./auth.route");

router.use("/dashboard", asyncErrorHandler(dashboardRoute));
router.use("/document-stages", asyncErrorHandler(documentStagesRoute));
router.use("/status-types", asyncErrorHandler(statusTypesRoute));
router.use("/entity-types", asyncErrorHandler(entityTypesRoute));
router.use("/entities", asyncErrorHandler(entitiesRoute));
router.use("documents", asyncErrorHandler(documentsRoute));
router.use("/files", asyncErrorHandler(filesRoute));
router.use("/file-versions", asyncErrorHandler(fileVersionsRoute));
router.use("/", asyncErrorHandler(authRoute));

module.exports = router;
