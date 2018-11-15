BEGIN TRANSACTION;
INSERT INTO demotable (name, title) VALUES ('John', 'manager');
INSERT INTO demotable (name, title) VALUES ('Mary', 'director');
INSERT INTO demotable (name, title) VALUES ('Kirk', 'messanger');
INSERT INTO demotable (name, title) VALUES ('Eugene', 'doorman');
INSERT INTO demotable (name, title) VALUES ('Anna', 'underwriter');
INSERT INTO demotable (name, title) VALUES ('Allen', 'csr');
INSERT INTO demotable (name, title) VALUES ('Dan', 'region manager');
COMMIT;