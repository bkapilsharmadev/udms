const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

// Query to create a new entity
module.exports.createEntity = async (entity, dbTransaction = null) => {
	const { name, entity_type, parent_id, created_by } = entity;

	const query = `INSERT INTO entities (name, entity_type, parent_id, created_by)
	VALUES ($1, $2, $3, $4) RETURNING entity_id;`;
	const values = [name, entity_type, parent_id, created_by];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rows[0];
};

// Query to get all entities
module.exports.getEntities = async (dbTransaction = null) => {
	const query = `SELECT entity_id, name, entity_type, parent_id, created_at, updated_at, created_by, updated_by, active FROM entities WHERE active = true;`;

	const client = dbTransaction || sqlRead;
	const result = await client.query(query);
	return result.rows;
};

// Query to get an entity by ID
module.exports.getEntity = async (entity_id, dbTransaction = null) => {
	const query = `SELECT entity_id, name, entity_type, parent_id, created_at, updated_at, created_by, updated_by, active FROM entities WHERE entity_id = $1 AND active = true;`;
	const values = [entity_id];

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows[0];
};

// Query to delete an entity by ID
module.exports.deleteEntity = async (entity_id, dbTransaction = null) => {
	const query = `UPDATE entities SET active = false WHERE entity_id = $1;`;
	const values = [entity_id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

// Query to update an entity
module.exports.updateEntity = async (entity, dbTransaction = null) => {
	const { entity_id, name, entity_type, parent_id, updated_by } = entity;

	const query = `UPDATE entities
	SET name = $1, entity_type = $2, parent_id = $3, updated_by = $4, updated_at = NOW()
	WHERE entity_id = $5;`;
	const values = [name, entity_type, parent_id, updated_by, entity_id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

// Query to get all entity types
module.exports.getEnitityTypes = async (dbTransaction = null) => {
	const query = `SELECT entity_type, description, created_at, updated_at, created_by, updated_by, active FROM entity_types WHERE active = true;`;

	const client = dbTransaction || sqlRead;
	const result = await client.query(query);
	return result.rows;
};