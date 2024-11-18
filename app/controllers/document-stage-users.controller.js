const documentStagesUsersService = require("../services/document-stage-users.service");
const { getDocumentStages } = require("../services/document-stages.service");

module.exports.renderDocumentStageUsers = async (req, res, next) => {
	const result = await Promise.all([documentStagesUsersService.getDocumentStagesUsers(), getDocumentStages()]);
	res.render("document-stage-users.ejs", { users: result[0], documentStages: result[1] });
};

module.exports.createDocumentStagesUsers = async (req, res, next) => {
	const { first_name, last_name, email, username, document_stage, description } = req.body;
	const result = await documentStagesUsersService.createDocumentStagesUsers({
		first_name,
		last_name,
		email,
		username,
		document_stage,
		description,
		created_by : req.session_username
	});
	res.status(201).json(result);
}

module.exports.deleteDocumentStageUsers = async (req, res, next) => {
	const { username } = req.body;
	const result = await documentStagesUsersService.deleteDocumentStageUsers(username);

	res.status(200).json(result);
}