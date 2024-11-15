const { notFoundError, dbError } = require("../utils/error/error");
const entityTypeService = require("../services/entity-types.service");

module.exports.renderEntityTypes = async (req, res, next) => {
	const entityTypes = await entityTypeService.getEntityTypes();
	res.render("entity-types.ejs",{entityTypes});
};

module.exports.createEntityType = async (req, res, next) => {
	const { entity_type, description } = req.body;
	const created_by = res.locals.username;
	const result = await entityTypeService.createEntityType({
		entity_type,
		description,
		created_by,
	});
	res.status(201).json(result);
};

module.exports.getEntityTypes = async (req, res, next) => {
	const result = await entityTypeService.getEntityTypes();
	res.status(200).json(result);
};

module.exports.deleteEntityType = async (req, res, next) => {
	const { entityType } = req.body;
	const result = await entityTypeService.deleteEntityType(entityType);
	res.status(200).json(result);
};

