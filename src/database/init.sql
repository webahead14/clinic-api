BEGIN;

DROP TABLE IF EXISTS survey_snapshot,protocols_surveys,clinics,questions,matrix,surveys,protocols,clients,clients_surveys,questions_surveys,answers,treatment CASCADE;
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
    answers json,
    instructions varchar(255)
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    matrix_id INTEGER REFERENCES matrix(id),
    type varchar(36),
    "group" varchar(60),
    question varchar(255),
    extra_data json
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    passcode text,
    time_passcode text,
    time_passcode_expiry DATE,
    client_id INTEGER,
    condition json,
    deleted boolean,
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

CREATE TABLE survey_snapshot(
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    survey_id INTEGER REFERENCES surveys(id),
    survey json
);

INSERT INTO matrix (id,title,columns,answers,instructions) VALUES(
    1,
    'do you feel bothered from:',
    '["Poorly","Semi-Poorly","Avarage","Semi-Strongly","Strongly"]',
    '["0", "1", "2", "3", "4"]',
    'Below is a list of problems and complaints that people sometimes have in response to stressful life experiences. How much you have been bothered by that problem IN THE LAST MONTH.'
);

INSERT INTO questions (id,question,type,"group",matrix_id,extra_data) VALUES
    (1,'Feeling very upset when something reminds you of the stressful experience?','matrix','group_xyz',1,'{}'),
    (2,'Trouble remembering important parts of the stressful experience?','matrix','group_xyz',1,'{}'),
    (3,'Loss of interest in activities that you used to enjoy?','matrix','group_xyz',1,'{}'),
    (4,'Irritable behaviour, angry outbursts, or acting aggressively?','matrix','group_xyz',1,'{}'),
    (5,'Which choice of the choices below you think it will impact you stress the most?','multiple_choice','group_xyz_multi1',null,'{"multipleChoice":{"choiceType": "Radio","answers": [{"text": "Smoke"},{"text": "Exercise"},{"text": "Drink alcohol"},{"text": "Eat"}]}}'),
    (6,'Mark the type of pains you''ve encountered lately:','multiple_choice','group_xyz_multi2',null,'{"multipleChoice": {"choiceType": "Checkbox","answers": [{"text": "Physical Pain"},{"text": "Mental Pain"},{"text": "Spiritual Pain"}]}}'),
    (7,'Anything else?','open_text','group_xyz_open',null,'{"openText": {"inputPlaceholder": "Please write the answer here"}}'
);

INSERT INTO clinics VALUES (
    1,'admin','admin'
);

INSERT INTO surveys VALUES (
    1,1,'GrayMatters Haifa'
);

INSERT INTO questions_surveys (id,question_id,survey_id) VALUES
    (1,1,1),
    (2,2,1),
    (3,3,1),
    (4,4,1),
    (5,5,1),
    (6,6,1),
    (7,7,1
);

COMMIT;