const { notFoundError, dbError } = require('../utils/error/error');
const { getMyDocuments, getReceivedDocuments } = require("../services/documents.service");

module.exports.renderDashboard = async (req, res, next) => {
    const username = req.session_username;
    const result = await Promise.all([getMyDocuments(username), getReceivedDocuments(username)]);

    const data = {
        myDocuments: result[0],
        receivedDocuments: result[1]
    }
    res.render("dashboard.ejs", { title: "Document Management System", data });
};
