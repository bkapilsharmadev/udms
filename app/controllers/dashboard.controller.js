const { notFoundError, dbError } = require('../utils/error/error');


module.exports.renderDashboard = async (req, res, next) => {
    res.render("dashboard.ejs", { title: "Document Management System" });
};
  