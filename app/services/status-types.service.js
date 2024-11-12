const { invalidRequestError, dbError } = require("../utils/error/error");
const statusTypeModel = require("../models/status-types.model");

module.exports.createStatusType = async (statusType) => {
	const result = await statusTypeModel.createStatusType(statusType);

	if (!result) {
		throw dbError({
			moduleName: "status-types.service.js",
			message: "Error creating status type",
			data: result,
		});
	}

	return { message: "Status type created successfully" };
};

module.exports.getStatusTypes = async () => {
	const result = await statusTypeModel.getStatusTypes();
	return result || [];
};

module.exports.deleteStatusType = async (statusType) => {
	const result = await statusTypeModel.deleteStatusType(statusType);

	if (!result) {
		throw dbError({
			moduleName: "status-types.service.js",
			message: "Error deleting status type",
			data: result,
		});
	}

	return { message: "Status type deleted successfully" };
};
