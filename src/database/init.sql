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
    -- How many weeks after the treatment has started
    week INTEGER
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
    gov_id INTEGER UNIQUE,
    condition varchar(50),
    deleted boolean,
    phone varchar(13),
    email varchar(100),
    name varchar(36),
    gender varchar(50)
);

CREATE TABLE treatment(
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    protocol_id INTEGER REFERENCES protocols(id),
    start_date DATE,
    status treatment_status DEFAULT 'on-going'
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
    survey_id INTEGER REFERENCES surveys(id),
    treatment_id INTEGER REFERENCES treatment(id),
    is_done BOOLEAN,
    is_partially_done BOOLEAN,
    has_missed BOOLEAN,
    survey_snapshot json
);

CREATE TABLE questions_surveys(
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    survey_id INTEGER REFERENCES surveys(id)
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
    (3, 'Loss of interest in activities that you used to enjoy?','matrix','group_xyz',1,'{}'),
    (4,'Irritable behaviour, angry outbursts, or acting aggressively?','matrix','group_xyz',1,'{}'),
    (5,'Which choice of the choices below you think it will impact you stress the most?','multiple_choice','group_xyz_multi1',null,'{"multipleChoice":{"choiceType": "Radio","answers": [{"text": "Smoke"},{"text": "Exercise"},{"text": "Drink alcohol"},{"text": "Eat"}]}}'),
    (6,'Mark the type of pains you''ve encountered lately:','multiple_choice','group_xyz_multi2',null,'{"multipleChoice": {"choiceType": "Checkbox","answers": [{"text": "Physical Pain"},{"text": "Mental Pain"},{"text": "Spiritual Pain"}]}}'),
    (7,'Anything else?','open_text','group_xyz_open',null,'{"openText": {"inputPlaceholder": "Please write the answer here"}}'
);

INSERT INTO clinics VALUES (
    1,'admin','admin'
);

INSERT INTO surveys VALUES 
    (1,1,'PCL-5'),
    (2,1,'PSG-1'),
    (3,1,'ELB-3'),
    (4,1,'SGN-2'),
    (5,1,'LMB-1'),
    (6,1,'RMB-1'
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

INSERT INTO protocols(id,clinic_id,name,condition) VALUES
    (1,1,'PTSD','PTSD'),
    (2,1,'Depression','DP'),
    (3,1,'Anxiety','ANX'),
    (4,1,'ADHD','ADHD'
);

INSERT INTO clients (id,passcode,time_passcode,time_passcode_expiry,gov_id,condition,deleted,phone,email,name,gender)
VALUES
(1,'M4R70','M4R70', '2022-01-16','211622600','PTSD',false,'0525080784','durd2001@gmail.com','George Joubran', 'male'),
(2,'$2a$10$xl6RQwCyucfYs85hF/JdBuoHctXf5trwl8E3S8.EL0fSQt7p7yYU.','M4R70', '2022-01-16','212771406','PTSD',false,'0525080784','durd2001@gmail.com','George Joubran', 'male');


INSERT INTO treatment(id,client_id,protocol_id,start_date,status) VALUES
(1,1,1,'2022-01-16','on-going');

INSERT INTO clients_surveys(id,client_id,survey_id,treatment_id,is_done,is_partially_done,has_missed,survey_snapshot)
VALUES
(1,1,1,1,false,false,false,'[{"type":"matrix","title":"Do you feel bothered from:","columns":["Poorly","Semi-Poorly","Avarage","Semi-Strongly","Strongly"],"answers":["0","1","2","3","4"],"instructions":"Below is a list of problems and complaints that people sometimes have in response to stressful life experiences. How much you have been bothered by that problem IN THE LAST MONTH.","questions":[{"id":"1","question":"Feeling very upset when something reminds you of the stressful experience?"},{"id":"2","question":"Trouble remembering important parts of the stressful experience?"},{"id":"3","question":"Loss of interest in activities that you used to enjoy?"},{"id":"4","question":"Irritable behaviour, angry outbursts, or acting aggressively??"}]},{"id":"5","type":"multiple_choice","choice_type":"Radio","question":"Which choice of the choices below you think it will impact you stress the most?","answers":[{"text":"Smoke"},{"text":"Exercide"},{"text":"Drink"},{"text":"Eat"}]},{"id":"6","type":"multiple_choice","choice_type":"Checkbox","question":"Mark the type of injuries you''ve encountered lately:","answers":[{"text":"Physical Pain"},{"text":"Mental Pain"},{"text":"Spiritual Pain"}]},{"type":"open_text","id":"7","question":"Anything else?","placeholder":"Enter your answer here"}]');

COMMIT;
