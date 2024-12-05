const { write_db_config, read_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

// Create a new file version
module.exports.createFileVersion = async (
	fileVersionData,
	dbTransaction = null
) => {
	console.log("model fileversionData>>>> ", fileVersionData);
	const {
		file_id,
		file_name,
		document_id,
		document_uuid,
		hash,
		file_url,
		session_user,
	} = fileVersionData;
	const query = `INSERT INTO file_versions (file_id, file_name, document_id, document_uuid, hash, file_url, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING file_id, file_name, version_id, version_number, document_id, document_uuid, hash, file_url;`;
	const values = [
		file_id,
		file_name,
		document_id,
		document_uuid,
		hash,
		file_url,
		session_user,
	];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rows[0];
};

// Get all file versions
module.exports.getFileVersions = async (dbTransaction = null) => {
	const query = `SELECT * FROM file_versions WHERE active = true;`;

	const client = dbTransaction || sqlRead;
	const result = await client.query(query);
	return result.rows;
};

// Delete a file version by ID
module.exports.deleteFileVersion = async (version_id, dbTransaction = null) => {
	const query = `UPDATE file_versions SET active = false WHERE version_id = $1;`;
	const values = [version_id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

module.exports.getFileVersionsByDocumentId = async (
	document_id,
	dbTransaction = null
) => {
	const query = `SELECT fv.* FROM files f 
                    INNER JOIN file_versions fv ON f.latest_version_id = fv.version_id
                    WHERE f.document_id = $1 AND f.active = true AND fv.active = true;`;
	const values = [document_id];

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows;
};

module.exports.getFileByVersionId = async (
	version_id,
	dbTransaction = null
) => {
	const query = `SELECT file_url FROM file_versions WHERE version_id = $1`;
	const values = [version_id];

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows;
};

module.exports.softDelByDocumentId = async (
	data,
	dbTransaction = null
) => {
    const { document_id, session_user } = data;
	const query = `UPDATE file_versions SET 
    active = false,
    updated_at = NOW(),
    updated_by = $1
    WHERE document_id = $2 
    AND active = true;`;
	const values = [session_user, document_id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};
