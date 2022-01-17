BEGIN;

DROP TABLE IF EXISTS protocols_surveys,questions,questions_language,matrix,matrix_languages,surveys,protocols,clients,clients_surveys,questions_surveys,answers,treatment CASCADE;
DROP TYPE IF EXISTS treatment_status CASCADE;

CREATE TYPE treatment_status AS ENUM ('on-going', 'finished');

CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    name varchar(50),
    created_at timestamp default CURRENT_TIMESTAMP not null
);

CREATE TABLE protocols (
    id SERIAL PRIMARY KEY,
    name varchar(50),
    condition varchar(50),
    created_at timestamp default CURRENT_TIMESTAMP not null
);

CREATE TABLE protocols_surveys (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id),
    protocol_id INTEGER REFERENCES protocols(id),
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

CREATE TABLE matrix_languages(
    id SERIAL PRIMARY KEY,
    matrix_id INTEGER REFERENCES matrix(id),
    title varchar(255),
    columns json,
    instructions varchar(255),
    language varchar(2)
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    matrix_id INTEGER REFERENCES matrix(id),
    type varchar(36),
    "group" varchar(60),
    question varchar(255),
    extra_data json
);

CREATE TABLE questions_language (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    matrix_id INTEGER REFERENCES matrix(id),
    question varchar(255),
    type varchar(36),
    "group" varchar(60),
    extra_data json,
    language varchar(2)
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    passcode text,
    time_passcode text,
    time_passcode_expiry timestamp default '12/12/2012 12:12:12',
    gov_id varchar(12) UNIQUE not null,
    condition varchar(50),
    deleted boolean,
    phone varchar(13) UNIQUE,
    email varchar(100) UNIQUE,
    name varchar(36),
    gender varchar(50)
);

CREATE TABLE treatment(
    id SERIAL PRIMARY KEY,
    client_id INTEGER,
    protocol_id INTEGER REFERENCES protocols(id),
    start_date DATE,
    status treatment_status DEFAULT 'on-going',
    reminders json
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
    is_done BOOLEAN DEFAULT 'false',
    is_partially_done BOOLEAN DEFAULT 'false',
    has_missed BOOLEAN DEFAULT 'false',
    survey_snapshot json,
    survey_date DATE
);

CREATE TABLE questions_surveys(
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    survey_id INTEGER REFERENCES surveys(id)
);

INSERT INTO matrix (title,columns,answers,instructions) VALUES(
    
    'How much have you been bothered by:',
    '["Poorly","Semi-Poorly","Average","Semi-Strongly","Strongly"]',
    '["0", "1", "2", "3", "4"]',
'Below is a list of problems that people sometimes have in response to a very stressful experience. Please read each problem carefully and then circle one of the numbers to indicate how much you have been bothered by that problem in the past month.'
),
( 
'How much have you been bothered by:', 
'["Poorly","Semi-Poorly","Average","Semi-Strongly","Strongly"]',
'["0", "1", "2", "3", "4"]',
'Below is a list of problems that people sometimes have in response to a very stressful experience. Please read each problem carefully and then circle one of the numbers to indicate how much you have been bothered by that problem in the past month.'
);

INSERT INTO matrix_languages (matrix_id,title,columns,instructions,language) VALUES
(
    1,
    'האם אתה מוטרד מ:',
    '["אף פעם לא","לעיתים רחוקות","לפעמים","לעיתים תכופות","לעיתים תכופות מאוד"]',
    'להלן רשימה של בעיות ותלונות שאנשים לפעמים חוים בתגובה לחיים מלחיצות. עד כמה הוטרדת מהבעיה הזו בחודש האחרון.',
    'he'
),
(
    1,
    'هل تشعر بالضيق من:',
    '["نادرًا","قليلًا","بشكل متوسط","غالبًا","دائمًا"]',
    'فيما يلي قائمة بالمشكلات والشكاوي التي يواجهها الأشخاص أحيانًا بسبب تجارب حياتية مرهقة. ما مدى انزعاجك من كل مشكلة على حِدَةٍ في الشهر الماضي.',
    'ar'
),(
    2,
    'כמה הפריע לך',
    '["אף פעם לא","לעיתים רחוקות","לפעמים","לעיתים תכופות","לעיתים תכופות מאוד"]',
    'להלן רשימה של בעיות שיש לאנשים לפעמים בתגובה לחוויה מלחיצה מאוד. אנא קרא כל בעיה בעיון ולאחר מכן הקף את אחד המספרים כדי לציין עד כמה הוטרדת מהבעיה הזו בחודש האחרון.',
    'he'
),(
    2,
    'كم ازعجتك',
    '["نادرًا","قليلًا","بشكل متوسط","غالبًا","دائمًا"]',
    'فيما يلي قائمة بالمشكلات التي يواجهها الأشخاص أحيانًا استجابة لتجربة مرهقة للغاية. الرجاء قراءة كل مشكلة بعناية ثم قم بتحويط أحد الأرقام للإشارة إلى مدى إزعاجك بهذه المشكلة في الشهر الماضي.',
    'ar'
);

INSERT INTO questions (question,type,"group",matrix_id,extra_data) VALUES
    ('Feeling very upset when something reminds you of the stressful experience?','matrix','group_xyz',1,'{}'),
    ('Trouble remembering important parts of the stressful experience?','matrix','group_xyz',1,'{}'),
    ('Loss of interest in activities that you used to enjoy?','matrix','group_xyz',1,'{}'),
    ('Irritable behaviour, angry outbursts, or acting aggressively?','matrix','group_xyz',1,'{}'),
    ('In your opinion, which of the following choices impact your stress the most?','multiple_choice','group_xyz_multi1',null,'{"multipleChoice":{"choiceType": "Radio","answers": [{"text": "Smoking"},{"text": "Exercising"},{"text": "Drinking alcohol"},{"text": "Eating"}]}}'),
    ('Mark the type of pain you''ve experienced lately:','multiple_choice','group_xyz_multi2',null,'{"multipleChoice": {"choiceType": "Checkbox","answers": [{"text": "Physical Pain"},{"text": "Mental Pain"},{"text": "Spiritual Pain"}]}}'),
    ('Would you like to tell us anything else?','open_text','group_xyz_open',null,'{"openText": {"inputPlaceholder": "Please write the answer here"}}'),
    ('Repeated, disturbing, and unwanted memories of the stressful experience?','matrix','group_wyz',2,'{}'),
    ('Having difficulty concentrating?','matrix','group_wyz',2,'{}'),
    ('Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: "I am bad", "there is something seriously wrong with me", "no one can be trusted", "the world is completely dangerous")?','matrix','group_wyz',2,'{}'),
    ('Trouble falling or staying asleep?','matrix','group_wyz',2,'{}'
);
INSERT INTO questions_language (question_id, question,type,"group",matrix_id, extra_data,language) VALUES
    (1,'מרגישים מוטרדים מאוד כשמשהו מזכיר לכם את החוויה המלחיצה?','matrix','group_xyz',1,'{}','he'),
    (2,'מתקשים לזכור חלקים חשובים מהחוויה המלחיצה?','matrix','group_xyz',1,'{}','he'),
    (3,'אובדן עניין בפעילויות שנהניתם מהן?','matrix','group_xyz',1,'{}','he'),
    (4,'התנהגות עצבנית, התפרצויות כעס או התנהגות אגרסיבית?','matrix','group_xyz',1,'{}','he'),
    (5,'איזו בחירה מבין האפשרויות למטה לדעתך תשפיע הכי הרבה עליך מבחנת לחץ?','multiple_choice','group_xyz_multi1',null,'{"multipleChoice":{"choiceType": "Radio","answers": [{"text": "עישון"},{"text": "ספורט"},{"text": "אלכוהול"},{"text": "אוכל"}]}}','he'),
    (6,'סמן את סוג הכאבים שנתקלת בהם לאחרונה:','multiple_choice','group_xyz_multi2',null,'{"multipleChoice": {"choiceType": "Checkbox","answers": [{"text": "כאב פיזי"},{"text": "כאב נפשי"},{"text": "כאב רוחני"}]}}','he'),
    (7,'עוד משהו להוסיף?','open_text','group_xyz_open',null,'{"openText": {"inputPlaceholder": "נא לכתוב כאן את התשובה"}}','he'),
    (8,'זיכרונות חוזרים, מטרידים ולא רצויים מהחוויה המלחיצה?','matrix','group_wyz',2,'{}','he'),
    (9,'מתקשים להתרכז?','matrix','group_wyz',2,'{}','he'),
    (10,'בעל אמונות שליליות חזקות לגבי עצמך, אנשים אחרים או העולם לדוגמה, מחשבות כגון: "אני רע", "יש משהו לא בסדר איתי", "אי אפשר לסמוך על אף אחד", "העולם הוא מסוכן לחלוטין"?','matrix','group_wyz',2,'{}','he'),
    (11,'קשיי נפילה או שמירה על שינה?','matrix','group_wyz',2,'{}','he'
),
    (1,'هل تشعر بالضيق الشديد عندما تتذكر معاناة الضغوطات الحياتية؟','matrix','group_xyz',1,'{}','ar'),
    (2,'هل تواجه صعوبة في تذكر أجزاء مهمة من معاناة الضغوطات الحياتية التي خضتها؟','matrix','group_xyz',1,'{}','ar'),
    (3,'فقدان الاهتمام بالفعاليات التي كنت تستمتع بها؟','matrix','group_xyz',1,'{}','ar'),
    (4,'سلوك عصبي ، نوبات غضب ، أو التصرف بعدوانية؟','matrix','group_xyz',1,'{}','ar'),
    (5,'أي اختيار من الخيارات أدناه تعتقد أنه سيؤثر عليك أكثر؟','multiple_choice','group_xyz_multi1',null,'{"multipleChoice":{"choiceType": "Radio","answers": [{"text": "التدخين"},{"text": "التمارين الرياضية"},{"text": "المشروبات الروحية"},{"text": "الأكل"}]}}','ar'),
    (6,'حدد نوع الآلام التي واجهتها مؤخرًا:','multiple_choice','group_xyz_multi2',null,'{"multipleChoice": {"choiceType": "Checkbox","answers": [{"text": "ألم جسدي"},{"text": "ألم نفسي"},{"text": "ألم روحاني"}]}}','ar'),
    (7,'أي شيء آخر؟','open_text','group_xyz_open',null,'{"openText": {"inputPlaceholder": "من فضلك اكتب الجواب هنا"}}','ar'),
    (8,'ذكريات متكررة, مزعجة وغير مرغوب فيها للتجربة المرهقة؟','matrix','group_wyz',2,'{}','ar'),
    (9,'تجدون صعوبة في التركيز؟','matrix','group_wyz',2,'{}','ar'),
    (10,'امتلاك معتقدات سلبية قوية عن نفسك, عن الآخرين أو العالم؟ (على سبيل المثال ، وجود أفكار مثل: "أنا سيء" ، "يوجد خطأ بيي" ، "لا يمكنني الوثوق بأي شخص" ، "العالم خطير جدا"','matrix','group_wyz',2,'{}','ar'),
    (11,'مشكلة في النوم أو البقاء في النوم','matrix','group_wyz',2,'{}', 'ar'
);

INSERT INTO surveys(name) VALUES 
    ('PCL-5'),
    ('GAD'),
    ('PHQ'),
    ('PGI-S'),
    ('PGI-A'),
    ('PGI-T'
);

INSERT INTO questions_surveys (question_id, survey_id) VALUES
    (1, 1),
    (2, 1),
    (3, 1),
    (4, 1),
    (5, 1),
    (6, 1),
    (7, 1),
    (8, 1),
    (9, 1),
    (10, 1),
    (11, 1
);

-- INSERT INTO protocols(name,condition) VALUES
--     ('PCL-5','PTSD'),
--     ('GAD','Anxiety'),
--     ('PST','Stoner'),
--     ('THC','Hala'
-- );


-- INSERT INTO protocols_surveys(survey_id,protocol_id,week) VALUES
--     (1,1,1),
--     (1,2,2),
--     (1,3,3),
--     (1,1,3),
--     (1,4,4),
--     (2,4,4),
--     (1,4,5),
--     (1,4,6
-- );

-- INSERT INTO clients (passcode,time_passcode,gov_id,condition,deleted,phone,email,name,gender)
-- VALUES
-- ('$2a$10$xl6RQwCyucfYs85hF/JdBuoHctXf5trwl8E3S8.EL0fSQt7p7yYU.','M4R70','212771406','PTSD',false,'0525080784','durd2001@gmail.com','George Joubran', 'male');

-- -- Inserting into treatment, not needed for now, could use for later.
-- INSERT INTO treatment (client_id,protocol_id,start_date,status) VALUES
-- (1,1,'2022-01-16','on-going');

-- INSERT INTO clients_surveys(client_id, survey_id, treatment_id, is_done, is_partially_done, has_missed, survey_snapshot)
-- VALUES
-- (1, 1, 1, false, false, false, '[{"type":"matrix","title":"Do you feel bothered from:","columns":["Poorly","Semi-Poorly","Avarage","Semi-Strongly","Strongly"],"answers":["0","1","2","3","4"],"instructions":"Below is a list of problems and complaints that people sometimes have in response to stressful life experiences. How much you have been bothered by that problem IN THE LAST MONTH.","questions":[{"id":"1","question":"Feeling very upset when something reminds you of the stressful experience?"},{"id":"2","question":"Trouble remembering important parts of the stressful experience?"},{"id":"3","question":"Loss of interest in activities that you used to enjoy?"},{"id":"4","question":"Irritable behaviour, angry outbursts, or acting aggressively??"}]},{"id":"5","type":"multiple_choice","choice_type":"Radio","question":"Which choice of the choices below you think it will impact you stress the most?","answers":[{"text":"Smoke"},{"text":"Exercide"},{"text":"Drink"},{"text":"Eat"}]},{"id":"6","type":"multiple_choice","choice_type":"Checkbox","question":"Mark the type of injuries you''ve encountered lately:","answers":[{"text":"Physical Pain"},{"text":"Mental Pain"},{"text":"Spiritual Pain"}]},{"type":"open_text","id":"7","question":"Anything else?","placeholder":"Enter your answer here"}]');

COMMIT;
