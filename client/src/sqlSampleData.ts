// One shared sample database (employees + departments) used by every SQL playground
// tool, the same "one canned sample, reused across a track" approach every other
// visualizer/tool in this app already uses -- so a learner's mental model of the data
// carries over from lesson to lesson instead of resetting each time.
export const SQL_SAMPLE_SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER NOT NULL,
  salary INTEGER NOT NULL,
  hire_date TEXT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

INSERT INTO departments (id, name, location) VALUES
  (1, 'Engineering', 'Remote'),
  (2, 'Sales', 'Chicago'),
  (3, 'Support', 'Austin');

INSERT INTO employees (id, name, department_id, salary, hire_date) VALUES
  (1, 'Ava Chen', 1, 118000, '2021-03-14'),
  (2, 'Marcus Lee', 1, 105000, '2022-07-01'),
  (3, 'Priya Patel', 1, 132000, '2019-11-20'),
  (4, 'Diego Ruiz', 2, 78000, '2023-01-09'),
  (5, 'Sofia Novak', 2, 82000, '2020-06-17'),
  (6, 'Ethan Brooks', 2, 76000, '2022-09-05'),
  (7, 'Grace Kim', 3, 61000, '2023-04-22'),
  (8, 'Liam O''Connor', 3, 64000, '2021-12-01'),
  (9, 'Nora Haddad', 3, 59000, '2024-02-14'),
  (10, 'Owen Fischer', 1, 97000, '2023-08-30');
`;
