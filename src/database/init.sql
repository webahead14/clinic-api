BEGIN;

DROP TABLE IF EXISTS protocols_surveys,clinics,questions,matrix,surveys,protocols,clients,clients_surveys,questions_surveys,answers,treatment CASCADE;
DROP TYPE IF EXISTS treatment_status CASCADE;

CREATE TYPE treatment_status AS ENUM ('on-going', 'finished');

CREATE TABLE clinics (
    id SERIAL PRIMARY KEY,
    username varchar(255),
    password varchar(255)
);

CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id),
    name varchar(50)
);

CREATE TABLE protocols (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id),
    name varchar(50),
    condition varchar(50)
);

CREATE TABLE protocols_surveys (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id),
    protocols_id INTEGER REFERENCES protocols(id),
    day varchar(20),
    time varchar(20),
    -- How many weeks after the treatment has started
    week INTEGER,
    "order" INTEGER,
    -- How many hours after the survey has started
    expiry varchar(20)
);

CREATE TABLE matrix(
    id SERIAL PRIMARY KEY,
    title varchar(255),
    columns json,
    instructions varchar(255)
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    matrix_id INTEGER REFERENCES matrix(id),
    type varchar(36),
    question varchar(255),
    "group" varchar(60),
    extra_data json
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    passcode text,
    time_passcode text,
    time_passcode_expiry DATE,
    client_id INTEGER,
    conditions json,
    show boolean,
    phone INTEGER,
    email varchar(100),
    name varchar(36),
    gender varchar(50)
);

CREATE TABLE treatment(
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    protocol_id INTEGER REFERENCES protocols(id),
    start_date DATE,
    status treatment_status
);

CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    answer json,
    question_id INTEGER REFERENCES questions(id),
    created_at DATE
);

CREATE TABLE clients_surveys(
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    treatment_id INTEGER REFERENCES treatment(id),
    is_done BOOLEAN,
    is_partially_done BOOLEAN,
    has_missed BOOLEAN,
    finished_time DATE
);

CREATE TABLE questions_surveys(
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    survey_id INTEGER REFERENCES surveys(id)
);

COMMIT;