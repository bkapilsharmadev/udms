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
	SELECT dr.*,
	CONCAT(dsu.first_name, ' ', dsu.last_name, '-', dsu.document_stage) AS to_be_reviewed_by_name
	FROM document_reviews dr
	INNER JOIN document_stage_users dsu
	ON dr.to_be_reviewed_by = dsu.username
	WHERE document_id = $1 AND dr.active = true 
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

module.exports.updateDocumentReview = async (reviewData) => {
	const {
		review_id,
		status,
		comments,
		forwarded_to,
		reviewed_at,
		is_final_approval,
		session_username,
	} = reviewData;

	const query = `
    UPDATE document_reviews
    SET status = $1, comments = $2, reviewed_at = $3, reviewed_by = $4, forwarded_to = $5, is_final_approval = $6, updated_at = NOW(), updated_by = $4
	WHERE review_id = $7 RETURNING review_id, document_id, document_uuid;`;

	const values = [
		status,
		comments,
		reviewed_at,
		session_username,
		forwarded_to,
		is_final_approval,
		review_id,
	];

	const result = await sqlWrite.query(query, values);
	return result.rows[0]; // Return the updated row
};

module.exports.deleteDocumentReview = async (review_id) => {
	const query = `UPDATE document_reviews SET active = false WHERE review_id = $1 RETURNING *;`;
	const values = [review_id];

	const result = await sqlWrite.query(query, values);
	return result.rows[0]; // Return the deleted row
};

module.exports.checkIsDocumentReviewed = async (document_id, username) => {
	const query = `SELECT 
					CASE 
						WHEN EXISTS (
							SELECT 1 
							FROM document_reviews
							WHERE document_id = $1 
							AND to_be_reviewed_by = $2
							AND reviewed_by IS NOT NULL
						) THEN TRUE
						ELSE FALSE
					END AS review_status;`;
	const values = [document_id, username];

	const result = await sqlWrite.query(query, values);
	return result.rows[0];
}
