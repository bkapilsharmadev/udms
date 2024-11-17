const { notFoundError, dbError } = require("../utils/error/error");
const statusTypeService = require("../services/status-types.service");

module.exports.renderStatusTypes = async (req, res, next) => {
	const statusTypes = await statusTypeService.getStatusTypes();
	res.render("status-types.ejs",{statusTypes});
};

module.exports.createStatusType = async (req, res, next) => {
	const { status_type, description } = req.body;
	const result = await statusTypeService.createStatusType({
		status_type,
		description,
		created_by: req.session_username,
	});
	res.status(201).json(result);
};

module.exports.getStatusTypes = async (req, res, next) => {
	const result = await statusTypeService.getStatusTypes();
	res.status(200).json(result);
};

module.exports.deleteStatusType = async (req, res, next) => {
	const { statusType } = req.body;
	const result = await statusTypeService.deleteStatusType(statusType);
	res.status(200).json(result);
};
