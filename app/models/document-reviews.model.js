const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

module.exports.createDocumentReview = async (data) => {
	const {
		to_be_reviewed_by,
		document_id,
		document_uuid,
		reviewed_by,
		reviewed_at,
		document_stage,
		forwarded_to,
		status,
		comments,
		created_by,
	} = data;

	const query = `
    INSERT INTO document_reviews (
      to_be_reviewed_by, document_id, document_uuid, reviewed_by, reviewed_at, 
      document_stage, forwarded_to, status, comments, 
      created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    ) RETURNING review_id;
  `;
	const values = [
		to_be_reviewed_by,
		document_id,
		document_uuid,
		reviewed_by,
		reviewed_at,
		document_stage,
		forwarded_to,
		status,
		comments,
		created_by,
	];

	const result = await sqlWrite.query(query, values);
	return result.rows[0]; // Return the created row
};

module.exports.getDocumentReviewById = async (review_id) => {
	const query = `SELECT * FROM document_reviews WHERE review_id = $1 AND active = true;`;
	const values = [review_id];

	const result = await sqlRead.query(query, values);
	return result.rows[0];
};

module.exports.getLatestReviewByDocumentId = async (document_id) => {
	const query = `
	SELECT * FROM document_reviews 
	WHERE document_id = $1 AND active = true 
	ORDER BY reviewed_at DESC NULLS FIRST
	LIMIT 1;
  `;
	const values = [document_id];

	const result = await sqlRead.query(query, values);
	return result.rows[0];
};

module.exports.getAllDocumentReviews = async () => {
	const query = `SELECT * FROM document_reviews WHERE active = true;`;

	const result = await sqlRead(query);
	return result.rows;
};

module.exports.updateDocumentReview = async (review_id, updatedData) => {
	const { document_stage, status, comments, forwarded_to, reviewed_at } =
		updatedData;

	const query = `
    UPDATE document_reviews
    SET document_stage = $1, status = $2, comments = $3, forwarded_to = $4, reviewed_at = $5, updated_at = CURRENT_TIMESTAMP
    WHERE review_id = $6 AND active = true
    RETURNING *;
  `;

	const values = [
		document_stage,
		status,
		comments,
		forwarded_to,
		reviewed_at,
		review_id,
	];

	const result = await sqlWrite.query(query, value);
	return result.rows[0]; // Return the updated row
};

module.exports.deleteDocumentReview = async (review_id) => {
	const query = `UPDATE document_reviews SET active = false WHERE review_id = $1 RETURNING *;`;
	const values = [review_id];

	const result = await sqlWrite.query(query, values);
	return result.rows[0]; // Return the deleted row
};
