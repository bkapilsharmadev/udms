DROP TYPE IF EXISTS document_categories;
CREATE TABLE document_categories (
	category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_category VARCHAR(50) UNIQUE,
	category_abbr VARCHAR(10) UNIQUE,
    description TEXT,
	parent_id INT REFERENCES document_categories (category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS document_stages;
CREATE TABLE document_stages (
    document_stage VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS document_stage_users;
CREATE TABLE document_stage_users (
    username VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    document_stage VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS status_types;
CREATE TABLE status_types (
    status_type VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
	created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS entity_types;
CREATE TABLE entity_types (
    entity_type VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS entities;
CREATE TABLE entities (
    entity_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL REFERENCES entity_types (entity_type),
    parent_id INT REFERENCES entities (entity_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS _enum_mentor_sign_status;
CREATE TYPE _enum_mentor_sign_status AS ENUM ('NOT REQUIRED', 'YES', 'NO', 'ON LEAVE');


DROP TABLE IF EXISTS documents CASCADE;
CREATE TABLE documents (
    document_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
	category_id INT REFERENCES document_categories(category_id),
    ref_no VARCHAR(50) UNIQUE,
    description TEXT,
    received_from INT REFERENCES entities (entity_id),
    university_entt_id INT REFERENCES entities (entity_id),
    campus_entt_id INT REFERENCES entities (entity_id),
    school_entt_id INT REFERENCES entities (entity_id),
    department_entt_id INT REFERENCES entities (entity_id),
    mentor_sign _enum_mentor_sign_status DEFAULT 'NOT REQUIRED',
    document_stage VARCHAR(50) REFERENCES document_stages (document_stage),
    status VARCHAR(50) REFERENCES status_types (status_type),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
	active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS files CASCADE;
CREATE TABLE files (
    file_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    latest_version_id INT,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS file_versions;
CREATE TABLE file_versions (
    version_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_id INT NOT NULL REFERENCES files (file_id),
    file_name VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    hash VARCHAR(255),
    file_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS document_reviews;
CREATE TABLE document_reviews (
    review_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    to_be_reviewed_by VARCHAR(20),
    reviewed_by VARCHAR(20),
    reviewed_at TIMESTAMP,
    document_stage VARCHAR(50),
    forwarded_to VARCHAR(20),
    status VARCHAR(50) REFERENCES status_types (status_type),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(20) NOT NULL,
    updated_by VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);


CREATE OR REPLACE FUNCTION increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there is an existing version for the same file_id
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
  FROM file_versions
  WHERE file_id = NEW.file_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_increment_version_number
BEFORE INSERT ON file_versions
FOR EACH ROW
EXECUTE FUNCTION increment_version_number();


-- get all documents with their latest version and file details and other details
SELECT 
    d.document_id, 
    d.document_uuid, 
    d.ref_no, 
    d.description,
    d.category_id,
    dc.document_category, 
    d.received_from,
    ef.name AS entity_from,
    d.university_entt_id,
    eu.name AS entity_university,
    d.campus_entt_id,
    ec.name AS entity_campus,
    d.school_entt_id,
    es.name AS entity_school,
    d.department_entt_id,
    ed.name AS entity_department,
    d.mentor_sign, 
    d.document_stage, 
    d.status, 
    d.created_at, 
    d.updated_at, 
    d.created_by,

    -- Latest review details
    dr.review_id,
    dr.to_be_reviewed_by,
	dr.to_be_reviewed_by_name,
    dr.reviewed_by,
    dr.reviewed_at,
    dr.forwarded_to,
    dr.review_status,
    dr.comments,
    dr.review_created_at,
    dr.review_updated_at
    dr.review_created_by
FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id

-- Left join LATERAL to get the latest review for each document
LEFT JOIN LATERAL (
    SELECT 
        dr.review_id,
        dr.to_be_reviewed_by,
		e.name AS to_be_reviewed_by_name,
        dr.reviewed_by,
        dr.reviewed_at,
        dr.forwarded_to, 
        dr.status AS review_status,
        dr.comments,
        dr.created_at AS review_created_at,
        dr.updated_at AS review_updated_at,
        dr.created_by AS review_created_by
    FROM document_reviews dr
    INNER JOIN entities e ON (dr.to_be_reviewed_by::INT = e.entity_id)
    INNER JOIN document_stage_users dsu ON dr.created_by = dsu.username
    WHERE dr.document_id = d.document_id
    ORDER BY dr.reviewed_at DESC
    LIMIT 1
) dr ON true

WHERE d.active = TRUE
	AND (
    -- Check if the current user is the creator of the document
    d.created_by = '50583955' 
    OR 
    -- Check if the document has been forwarded to the current user at any point
    EXISTS (
      SELECT 1 
      FROM document_reviews dr
      WHERE dr.document_id = d.document_id
      AND dr.forwarded_to::INT = '50583955'::INT
    )
  );

-- get all self created documents with their latest version and file details and other detail
SELECT 
    d.document_id, 
    d.document_uuid, 
    d.ref_no, 
    d.description,
	d.category_id,
	dc.document_category,
    d.received_from,
    ef.name AS entity_from,
    d.university_entt_id,
    eu.name AS entity_university,
    d.campus_entt_id,
    ec.name AS entity_campus,
    d.school_entt_id,
    es.name AS entity_school,
    d.department_entt_id,
    ed.name AS entity_department,
    d.mentor_sign, 
    d.document_stage, 
    d.status, 
    d.created_at, 
    d.updated_at, 
    d.created_by,

    -- Latest review details
    dr.review_id,
    dr.to_be_reviewed_by,
	dr.to_be_reviewed_by_name,
    dr.reviewed_by,
    dr.reviewed_at,
    dr.forwarded_to,
    dr.review_status,
    dr.comments,
    dr.review_created_at,
    dr.review_updated_at,
    dr.review_created_by,
    dr.review_created_by_name
FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id

-- Left join LATERAL to get the latest review for each document
LEFT JOIN LATERAL (
    SELECT 
        dr.review_id,
        dr.to_be_reviewed_by,
		CONCAT(dsur.first_name, ' ', dsur.last_name, '-', dsur.document_stage) AS to_be_reviewed_by_name,
        dr.reviewed_by,
        dr.reviewed_at,
        dr.forwarded_to, 
        dr.status AS review_status,
        dr.comments,
        dr.created_at AS review_created_at,
        dr.updated_at AS review_updated_at,
        dr.created_by AS review_created_by,
        CONCAT(dsu.first_name, ' ', dsu.last_name, '-', dsu.document_stage) AS review_created_by_name
    FROM document_reviews dr
    INNER JOIN document_stage_users dsur ON dr.to_be_reviewed_by = dsur.username
    INNER JOIN document_stage_users dsu ON dr.created_by = dsu.username
    WHERE dr.document_id = d.document_id
    ORDER BY dr.reviewed_at DESC
    LIMIT 1
) dr ON true
WHERE d.active = TRUE AND d.created_by = '50583955';


--received documents
SELECT 
    d.document_id, 
    d.document_uuid, 
    d.ref_no, 
    d.description,
	d.category_id,
	dc.document_category,
    d.received_from,
    ef.name AS entity_from,
    d.university_entt_id,
    eu.name AS entity_university,
    d.campus_entt_id,
    ec.name AS entity_campus,
    d.school_entt_id,
    es.name AS entity_school,
    d.department_entt_id,
    ed.name AS entity_department,
    d.mentor_sign, 
    d.document_stage, 
    d.status, 
    d.created_at, 
    d.updated_at, 
    d.created_by,

    -- Latest review details
    dr.review_id,
    dr.to_be_reviewed_by,
	dr.to_be_reviewed_by_name,
    dr.reviewed_by,
    dr.reviewed_at,
    dr.forwarded_to,
    dr.review_status,
    dr.comments,
    dr.review_created_at,
    dr.review_updated_at,
    dr.review_created_by,
    dr.review_created_by_name
FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id

-- Left join LATERAL to get the latest review for each document
LEFT JOIN LATERAL (
    SELECT 
        dr.review_id,
        dr.to_be_reviewed_by,
		CONCAT(dsur.first_name, ' ', dsur.last_name, '-', dsur.document_stage) AS to_be_reviewed_by_name,
        dr.reviewed_by,
        dr.reviewed_at,
        dr.forwarded_to, 
        dr.status AS review_status,
        dr.comments,
        dr.created_at AS review_created_at,
        dr.updated_at AS review_updated_at,
        dr.created_by AS review_created_by,
        CONCAT(dsu.first_name, ' ', dsu.last_name, '-', dsu.document_stage) AS review_created_by_name
    FROM document_reviews dr
    INNER JOIN document_stage_users dsur ON dr.to_be_reviewed_by = dsur.username
    INNER JOIN document_stage_users dsu ON dr.created_by = dsu.username
    WHERE dr.document_id = d.document_id
    ORDER BY dr.reviewed_at DESC
    LIMIT 1
) dr ON true
WHERE d.active = TRUE
    AND (
    -- Check if the document has been forwarded to the current user at any point
    EXISTS (
        SELECT 1 
        FROM document_reviews dr
        WHERE dr.document_id = d.document_id
        AND dr.forwarded_to::INT = '50583955'::INT
    )
    );


-- fetch single document details
SELECT 
    d.document_id, 
    d.document_uuid, 
    d.ref_no, 
    d.description,
	d.category_id,
	dc.document_category,
    d.received_from,
    ef.name AS entity_from,
    d.university_entt_id,
    eu.name AS entity_university,
    d.campus_entt_id,
    ec.name AS entity_campus,
    d.school_entt_id,
    es.name AS entity_school,
    d.department_entt_id,
    ed.name AS entity_department,
    d.mentor_sign, 
    d.document_stage, 
    d.status, 
    d.created_at, 
    d.updated_at, 
    d.created_by
FROM documents d
INNER JOIN document_categories dc ON d.category_id = dc.category_id
-- Join with entities table for document-related entity information
INNER JOIN entities ef ON d.received_from = ef.entity_id
INNER JOIN entities eu ON d.university_entt_id = eu.entity_id
INNER JOIN entities ec ON d.campus_entt_id = ec.entity_id
INNER JOIN entities es ON d.school_entt_id = es.entity_id
INNER JOIN entities ed ON d.department_entt_id = ed.entity_id
WHERE d.document_id = 1;

-- document files
SELECT fv.* FROM files f 
INNER JOIN file_versions fv ON f.latest_version_id = fv.version_id
WHERE f.document_id = 1;

-- document reviews
SELECT * FROM document_reviews
WHERE document_id = 1
ORDER BY reviewed_at DESC NULLS FIRST
LIMIT 1