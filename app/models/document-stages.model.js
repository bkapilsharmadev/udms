const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

// Query to create a new document stage
module.exports.createDocumentStage = async (documentStage, dbTransaction = null) => {
	const { document_stage, description, created_by } = documentStage;

	const query = `INSERT INTO document_stages (document_stage, description, created_by)
  VALUES ($1, $2, $3);`;
	const values = [document_stage, description, created_by];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

// Query to get all document stages
module.exports.getDocumentStages = async (dbTransaction = null) => {
	const query = `SELECT document_stage, description, created_at, updated_at, created_by, updated_by, active FROM document_stages WHERE active = true;`;

	const client = dbTransaction || sqlRead;
	const result = await client.query(query);
	return result.rows;
};

// Query to delete a document stage by ID
module.exports.deleteDocumentStage = async (id, dbTransaction = null) => {
	const query = `DELETE FROM document_stages WHERE document_stage = $1;`;
	const values = [id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

