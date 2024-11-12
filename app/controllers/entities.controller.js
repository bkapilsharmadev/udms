const { notFoundError, dbError } = require("../utils/error/error");
const entityService = require("../services/entities.service");

module.exports.renderEntities = async (req, res, next) => {
	res.render("entities.ejs");
};

module.exports.createEntity = async (req, res, next) => {
	const { name, entity_type, parent_id, created_by } = req.body;
	const result = await entityService.createEntity({
		name,
		entity_type,
		parent_id,
		created_by,
	});
	res.status(201).json(result);
};

module.exports.getEntities = async (req, res, next) => {
	const result = await entityService.getEntities();
	res.status(200).json(result);
};

module.exports.deleteEntity = async (req, res, next) => {
	const { entity_id } = req.body;
	const result = await entityService.deleteEntity(entity_id);
	res.status(200).json(result);
};

module.exports.updateEntity = async (req, res, next) => {  // New function
	const { entity_id, name, entity_type, parent_id, updated_by } = req.body;
	const result = await entityService.updateEntity({
		entity_id,
		name,
		entity_type,
		parent_id,
		updated_by,
	});
	res.status(200).json(result);
};
