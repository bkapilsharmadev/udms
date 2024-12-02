const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

module.exports.getDocumentStagesUsers = async (dbTransaction = null) => {
	const query = `SELECT dsu.first_name, dsu.last_name, dsu.username, dsu.email, dsu.description, ds.document_stage, dsu.created_by, dsu.updated_by, dsu.active FROM document_stage_users dsu
	INNER JOIN document_stages ds ON ds.document_stage = dsu.document_stage WHERE dsu.active = true AND ds.active = TRUE;`;

	const client = dbTransaction || sqlRead;
	const result = await client.query(query);
	return result.rows;
};

module.exports.createDocumentStagesUsers = async (documentStage, dbTransaction = null) => {
	const { first_name, last_name, email, username, document_stage, description, created_by } = documentStage;

	const query = `INSERT INTO document_stage_users (first_name, last_name, email, username, document_stage, description, created_by)
  VALUES ($1, $2, $3, $4, $5, $6, $7);`;
	const values = [first_name, last_name, email, username, document_stage, description, created_by];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

module.exports.deleteDocumentStageUsers = async (username, dbTransaction = null) => {
	const query = `UPDATE document_stage_users SET active = FALSE WHERE username = $1;`;
	const values = [username];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

module.exports.getDocumentStageUsersExcludingUser = async (username, dbTransaction = null) => {
	const query = `SELECT dsu.first_name, dsu.last_name, dsu.username, dsu.email, dsu.description, ds.document_stage, dsu.created_by, dsu.updated_by, dsu.active FROM document_stage_users dsu
	INNER JOIN document_stages ds ON ds.document_stage = dsu.document_stage WHERE dsu.username != $1 AND dsu.active = true AND ds.active = TRUE;`;
	const values = [username];

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows;
}

module.exports.getUserDocumentStage = async (username, dbTransaction = null) => {
	const query = `SELECT first_name, last_name, document_stage FROM document_stage_users WHERE username = $1 AND active = TRUE`;
	const values = [username];

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows;
}