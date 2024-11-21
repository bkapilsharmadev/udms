const { write_db_config, read_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

// Create a new file
module.exports.createFile = async (file, dbTransaction = null) => {
	const { document_id, document_uuid, created_by } = file;
	const query = `INSERT INTO files (document_id, document_uuid, created_by) VALUES ($1, $2, $3) RETURNING file_id, document_id, document_uuid;`;
	const values = [document_id, document_uuid, created_by];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rows[0];
};

// Get all files
module.exports.getFiles = async (dbTransaction = null) => {
	const query = `SELECT * FROM files WHERE active = true;`;

	const client = dbTransaction || sqlRead;
	const result = await client.query(query);
	return result.rows;
};

// Delete a file by ID
module.exports.deleteFile = async (file_id, dbTransaction = null) => {
	const query = `UPDATE files SET active = false WHERE file_id = $1;`;
	const values = [file_id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

// Update a file
module.exports.updateFile = async (file, dbTransaction = null) => {
	const { file_id, latest_version_id, updated_by } = file;
	const query = `UPDATE files SET latest_version_id = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP WHERE file_id = $3;`;
	const values = [latest_version_id, updated_by, file_id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};
