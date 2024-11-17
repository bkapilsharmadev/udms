const { dbError } = require("../utils/error/error");
const documentStagesUsersModel = require("../models/document-stage-users.model");

module.exports.getDocumentStagesUsers = async() => {
    const result = await documentStagesUsersModel.getDocumentStagesUsers();
    return result || [];
}

module.exports.createDocumentStagesUsers = async(documentStagesUsers) => {
    const result = await documentStagesUsersModel.createDocumentStagesUsers(documentStagesUsers);
    if(!result){
        throw dbError({
			moduleName: "document-stages-users.service.js",
			message: "Error creating document stages users",
			data: result,
		});
    }
    return {message : "Document Stages Users Created Successfully !"};
}

module.exports.deleteDocumentStageUsers = async (username) => {
    const result = await documentStagesUsersModel.deleteDocumentStageUsers(username);

	if (!result) {
		throw dbError({
			moduleName: "document-stages-users.service.js",
			message: "Error deleting document stage",
			data: result,
		});
	}

	return { message: "Document stages users deleted successfully" };
}