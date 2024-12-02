const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

// Query to create a new status type
module.exports.createStatusType = async (statusType, dbTransaction = null) => {
	const { status_type, description, created_by } = statusType;

	const query = `INSERT INTO status_types (status_type, description, created_by)
	VALUES ($1, $2, $3);`;
	const values = [status_type, description, created_by];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

// Query to get all status types
module.exports.getStatusTypes = async (dbTransaction = null) => {
	const query = `SELECT status_type, description, created_at, updated_at, created_by, updated_by, active FROM status_types WHERE active = true;`;

	const client = dbTransaction || sqlRead;
	const result = await client.query(query);
	return result.rows;
};

// Query to delete a status type by ID
module.exports.deleteStatusType = async (id, dbTransaction = null) => {
	const query = `DELETE FROM status_types WHERE status_type = $1;`;
	const values = [id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};
