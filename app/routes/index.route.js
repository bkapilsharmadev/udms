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
const authmiddleware = require("../middleware/auth.middleware");
const documentCategoriesRoute = require("./document-categories.route");
const documentStagesUserRoute = require("./document-stage-users.route");
const documentReviewesRoute = require("./document-reviews.route");

router.use(
    "/dashboard",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(dashboardRoute)
);

router.use(
    "/document-stages",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(documentStagesRoute)
);

router.use(
    "/status-types",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(statusTypesRoute)
);

router.use(
    "/entity-types",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(entityTypesRoute)
);

router.use(
    "/entities",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(entitiesRoute)
);

router.use(
    "/documents",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(documentsRoute)
);

router.use(
    "/files",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(filesRoute)
);

router.use(
    "/file-versions",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(fileVersionsRoute)
);

router.use(
    "/document-categories",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(documentCategoriesRoute)
);

router.use(
    "/document-stage-users",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(documentStagesUserRoute)
);

router.use(
    "/document-reviews",
    asyncErrorHandler(authmiddleware.validateUserSession),
    asyncErrorHandler(documentReviewesRoute)
);

router.use("/dashboard", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(dashboardRoute));
router.use("/document-stages", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(documentStagesRoute));
router.use("/status-types", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(statusTypesRoute));
router.use("/entity-types", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(entityTypesRoute));
router.use("/entities", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(entitiesRoute));
router.use("/documents", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(documentsRoute));
router.use("/files", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(filesRoute));
router.use("/file-versions", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(fileVersionsRoute));
router.use("/document-categories", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(documentCategoriesRoute));
router.use("/document-stage-users", asyncErrorHandler(authmiddleware.validateUserSession), asyncErrorHandler(documentStagesUserRoute));
router.use("/", asyncErrorHandler(authRoute));
module.exports = router;
