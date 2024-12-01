const { invalidRequestError, dbError } = require("../utils/error/error");
const entityModel = require("../models/entities.model");

module.exports.createEntity = async (entity) => {
	const result = await entityModel.createEntity(entity);

	if (!result) {
		throw dbError({
			moduleName: "entities.service.js",
			message: "Error creating entity",
			data: result,
		});
	}

	return result;
};

module.exports.getEntities = async () => {
	const result = await entityModel.getEntities();
	return result || [];
};

module.exports.getEntity = async (entity_id) => {
	const entity = await entityModel.getEntity(entity_id);

	if (!entity?.entity_id) {
		throw dbError({
			moduleName: "entities.service.js",
			message: "Entity not found",
			data: result,
		});
	}

	return entity;
};

module.exports.deleteEntity = async (entity_id) => {
	const result = await entityModel.deleteEntity(entity_id);

	if (!result) {
		throw dbError({
			moduleName: "entities.service.js",
			message: "Error deleting entity",
			data: result,
		});
	}

	return { message: "Entity deleted successfully" };
};

module.exports.updateEntity = async (entity) => {  // New function
	const result = await entityModel.updateEntity(entity);

	if (!result) {
		throw dbError({
			moduleName: "entities.service.js",
			message: "Error updating entity",
			data: result,
		});
	}

	return { message: "Entity updated successfully" };
};

module.exports.getEnitityTypes = async () => {
	const result = await entityModel.getEnitityTypes();
	return result || [];
};