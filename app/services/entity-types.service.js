const { invalidRequestError, dbError } = require("../utils/error/error");
const entityTypeModel = require("../models/entity-types.model");

module.exports.createEntityType = async (entityType) => {
	const result = await entityTypeModel.createEntityType(entityType);

	if (!result) {
		throw dbError({
			moduleName: "entity-types.service.js",
			message: "Error creating entity type",
			data: result,
		});
	}

	return { message: "Entity type created successfully" };
};

module.exports.getEntityTypes = async () => {
	const result = await entityTypeModel.getEntityTypes();
	return result || [];
};

module.exports.deleteEntityType = async (entityType) => {
	const result = await entityTypeModel.deleteEntityType(entityType);

	if (!result) {
		throw dbError({
			moduleName: "entity-types.service.js",
			message: "Error deleting entity type",
			data: result,
		});
	}

	return { message: "Entity type deleted successfully" };
};
