const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

module.exports.createDocumentReviewFiles = async (data, dbTransaction) => {
	const { review_id, files, session_user } = data;

	const query = `INSERT INTO document_review_files (review_id, created_by, file_id)
        SELECT $1, $2, value::INT FROM jsonb_array_elements_text($3::jsonb) AS file_ids(value);`;
	const values = [review_id, session_user, JSON.stringify(files)];
	
	console.log(">>>>> QUERY", query, values);

	//throw new Error(">>> SLEF MADE NEW ERROR");

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

module.exports.getDocumentReviewFilesByReviewId = async (
	review_id,
	dbTransaction
) => {
	const query = `SELECT fv.file_id AS file_ids FROM document_review_files drf
    INNER JOIN file_versions fv ON drf.file_id = fv.file_id
    WHERE drf.review_id = $1 
	AND drf.active = true
	AND fv.active = true;`;
	const values = [review_id];

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows || [];
};
