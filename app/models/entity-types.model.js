const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

// Query to create a new entity type
module.exports.createEntityType = async (entityType, dbTransaction = null) => {
	const { entity_type, description, created_by } = entityType;

	const query = `INSERT INTO entity_types (entity_type, description, created_by)
	VALUES ($1, $2, $3);`;
	const values = [entity_type, description, created_by];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

// Query to get all entity types
module.exports.getEntityTypes = async (dbTransaction = null) => {
	const query = `SELECT entity_type, description, created_at, updated_at, created_by, updated_by, active FROM entity_types WHERE active = true;`;

	const client = dbTransaction || sqlRead;
	const result = await client.query(query);
	return result.rows;
};

// Query to delete an entity type by ID
module.exports.deleteEntityType = async (id, dbTransaction = null) => {
	const query = `DELETE FROM entity_types WHERE entity_type = $1;`;
	const values = [id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

