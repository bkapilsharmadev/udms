const router = require("express").Router();

const { asyncErrorHandler } = require("../middleware/error.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get("/", asyncErrorHandler(dashboardController.renderDashboard));

module.exports = router;
