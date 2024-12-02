const { read_db_config, write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

const sqlRead = dbPoolManager.get("sqlRead", read_db_config);
const sqlWrite = dbPoolManager.get("sqlWrite", write_db_config);

module.exports.createDocumentReview = async (data, dbTransaction) => {
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
		session_user,
		created_status,
	} = data;

	const query = `
    INSERT INTO document_reviews (
      to_be_reviewed_by, document_id, document_uuid, reviewed_by, reviewed_at, 
      document_stage, forwarded_to, status, comments, 
      created_by, created_status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    ) RETURNING review_id, document_id;
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
		session_user,
		created_status,
	];

	//throw new Error(">>> SLEF MADE NEW ERROR");

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rows[0]; // Return the created row
};

module.exports.getDocumentReviewById = async (review_id, dbTransaction) => {
	const query = `SELECT * FROM document_reviews WHERE review_id = $1 AND active = true;`;
	const values = [review_id];

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows[0];
};

module.exports.getLatestReviewByDocumentId = async (
	document_id,
	dbTransaction
) => {
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

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows[0];
};

module.exports.getReviewsByDocId = async (document_id, dbTransaction) => {
	const query = `SELECT * FROM document_reviews 
	WHERE active = true 
		AND document_id = $1
	ORDER BY reviewed_at DESC NULLS FIRST
	;`;
	const values = [document_id];

	const client = dbTransaction ?? sqlRead;
	const result = await client.query(query, values);
	return result.rows;
};

module.exports.updateDocumentReview = async (reviewData, dbTransaction) => {
	const {
		review_id,
		status,
		comments,
		forwarded_to,
		reviewed_at,
		is_final_approval,
		session_user,
	} = reviewData;

	const query = `
    UPDATE document_reviews
    SET status = $1, comments = $2, reviewed_at = $3, reviewed_by = $4, forwarded_to = $5, is_final_approval = $6, updated_at = NOW(), updated_by = $4
	WHERE review_id = $7 RETURNING review_id, document_id, document_uuid, status;`;

	const values = [
		status,
		comments,
		reviewed_at,
		session_user,
		forwarded_to,
		is_final_approval,
		review_id,
	];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rows[0]; // Return the updated row
};

module.exports.deleteDocumentReview = async (review_id, dbTransaction) => {
	const query = `UPDATE document_reviews SET active = false WHERE review_id = $1 RETURNING *;`;
	const values = [review_id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rows[0]; // Return the deleted row
};

module.exports.softDeleteByDocumentId = async (document_id, dbTransaction) => {
	const query = `UPDATE document_reviews SET active = false WHERE document_id = $1;`;
	const values = [document_id];

	const client = dbTransaction || sqlWrite;
	const result = await client.query(query, values);
	return result.rowCount > 0;
};

module.exports.checkIsDocumentReviewed = async (
	document_id,
	username,
	dbTransaction
) => {
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

	const client = dbTransaction || sqlRead;
	const result = await client.query(query, values);
	return result.rows[0];
};
