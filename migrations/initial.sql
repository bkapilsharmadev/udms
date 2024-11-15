DROP TYPE IF EXISTS document_categories;
CREATE TABLE document_categories (
	category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_category VARCHAR(50) UNIQUE,
	category_abbr VARCHAR(10) UNIQUE,
    description TEXT,
	parent_id INT REFERENCES document_categories (category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT,
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS document_stages;
CREATE TABLE document_stages (
    document_stage VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT,
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
    created_by INT NOT NULL,
    updated_by INT,
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS status_types;
CREATE TABLE status_types (
    status_type VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
	created_by INT NOT NULL,
    updated_by INT,
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS entity_types;
CREATE TABLE entity_types (
    entity_type VARCHAR(50) PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT,
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
    created_by INT NOT NULL,
    updated_by INT,
    active BOOLEAN DEFAULT TRUE
);

DROP TYPE IF EXISTS _enum_mentor_sign_status;
CREATE TYPE _enum_mentor_sign_status AS ENUM ('NOT REQUIRED', 'YES', 'NO', 'ON LEAVE');

DROP TABLE IF EXISTS documents;
CREATE TABLE documents (
    document_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
	category_id INT REFERENCES document_categories(category_id),
    ref_no VARCHAR(50) UNIQUE,
    description TEXT,
    received_from VARCHAR(100),
    university_entt_id INT REFERENCES entities (entity_id),
    campus_entt_id INT REFERENCES entities (entity_id),
    school_entt_id INT REFERENCES entities (entity_id),
    department_entt_id INT REFERENCES entities (entity_id),
    mentor_sign _enum_mentor_sign_status DEFAULT 'NOT REQUIRED',
    document_stage VARCHAR(50) REFERENCES document_stages (document_stage),
    status VARCHAR(50) REFERENCES status_types (status_type),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT,
	active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS files;
CREATE TABLE files (
    file_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    latest_version_id INT,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT,
    active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS file_versions;
CREATE TABLE file_versions (
    version_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_id INT NOT NULL REFERENCES files (file_id),
    file_name INT,
    version_number INT NOT NULL,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    hash VARCHAR(255),
    document_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT,
    active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS document_reviews;
CREATE TABLE document_reviews (
    review_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id INT NOT NULL REFERENCES documents (document_id),
    document_uuid UUID NOT NULL REFERENCES documents (document_uuid),
    reviewed_by INT NOT NULL,
    reviewed_at TIMESTAMP NOT NULL,
    document_stage VARCHAR(50),
    forwarded_to INT NOT NULL,
    status VARCHAR(50),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by INT,
    updated_by INT,
    active BOOLEAN DEFAULT TRUE
);


