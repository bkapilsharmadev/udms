const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

module.exports.getDocumentStagesUsers = async (req, res) => {
	const query = `SELECT dsu.first_name, dsu.last_name, dsu.username, dsu.email, ds.document_stage, dsu.created_by, dsu.updated_by, dsu.active FROM document_stage_users dsu
	INNER JOIN document_stages ds ON ds.document_stage = dsu.document_stage WHERE dsu.active = true AND ds.active = TRUE;`;

	const result = await sqlRead.query(query);
	return result.rows;
};

module.exports.createDocumentStagesUsers = async (documentStage) => {
	const { first_name, last_name, email, username, document_stage, description, created_by } = documentStage;

	const query = `INSERT INTO document_stage_users (first_name, last_name, email, username, document_stage, description, created_by)
  VALUES ($1, $2, $3, $4, $5, $6);`;
	const values = [first_name, last_name, email, username, document_stage, description, created_by];

	const result = await sqlWrite.query(query, values);
	return result.rowCount > 0;
};

module.exports.deleteDocumentStageUsers = async (username) => {
	const query = `UPDATE document_stage_users SET active = FALSE WHERE username = $1;`;
	const values = [username];

	const result = await sqlWrite.query(query, values);
	return result.rowCount > 0;
};
