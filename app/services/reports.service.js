const reportsModel = require("../models/reports.model");
const { dbError } = require("../utils/error/error");

module.exports.docsCreatedCount = async (data, dbTransaction = null) => {
	const count = await reportsModel.docsCreatedCount(data, dbTransaction);
	if (isNaN(count)) {
		throw dbError({
			message: "Error fetching document created count.",
			moduleName: "reports.service.js",
			data: result,
		});
	}
	return count;
};

module.exports.docsReceivedCount = async (data, dbTransaction = null) => {
    const count = await reportsModel.docsReceivedCount(data, dbTransaction);
    if (isNaN(count)) {
        throw dbError({
            message: "Error fetching document received count.",
            moduleName: "reports.service.js",
            data: result,
        });
    }
    return count;
};

module.exports.docsPendingCount = async (data, dbTransaction = null) => {
    const count = await reportsModel.docsPendingCount(data, dbTransaction);
    if (isNaN(count)) {
        throw dbError({
            message: "Error fetching pending document count.",
            moduleName: "reports.service.js",
            data: result,
        });
    }
    return count;
};

module.exports.docsApprovedCount = async (data, dbTransaction = null) => {
    const count = await reportsModel.docsApprovedCount(data, dbTransaction);
    if (isNaN(count)) {
        throw dbError({
            message: "Error fetching approved document count.",
            moduleName: "reports.service.js",
            data: result,
        });
    }
    return count;
}

module.exports.docsRejectedCount = async (data, dbTransaction = null) => {
    const count = await reportsModel.docsRejectedCount(data, dbTransaction);
    if (isNaN(count)) {
        throw dbError({
            message: "Error fetching rejected document count.",
            moduleName: "reports.service.js",
            data: result,
        });
    }
    return count;
}

module.exports.docsApprovalTimeStats = async (data, dbTransaction = null) => {
    const result = await reportsModel.docsApprovalTimeStats(data, dbTransaction);
    return result;
}

