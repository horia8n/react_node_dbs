BEGIN TRANSACTION;
CREATE TABLE demotable (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100),
  title    VARCHAR(100)
);
COMMIT;