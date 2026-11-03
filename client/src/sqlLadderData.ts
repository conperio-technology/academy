// The ladder database used by the SQL Join Ladder (sqlLadder.ts, components/tools/JoinLadder.tsx).
// It is separate from the shop database in sqlPracticeData.ts on purpose: the hand-written
// practice problems point at particular rows of that one, and it is kept tiny so answers can be
// checked by eye. This one is bigger so the generated questions have variety: 30 customers in
// 8 cities, 30 products in 7 categories from 7 suppliers, 90 orders over January to June 2025,
// 16 employees in 5 departments and 60 product reviews.
//
// The awkward cases are there on purpose: customers who never ordered, products nobody bought,
// a category and a supplier with no products, a department with nobody in it, orders with no
// sales rep (employee_id is NULL), a sales rep with no orders, bought products nobody reviewed,
// employees who earn more than their manager and customers referred by other customers.
//
// The rows were produced once by a seeded script and pasted in; they don't change at run time,
// so a question's answer is the same every time. Change a row and run
// scripts/check-sql-practice.mjs, which runs every generated question.

export const LADDER_SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  manager_id INTEGER REFERENCES employees(id),
  salary INTEGER NOT NULL,
  hire_date TEXT NOT NULL
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  signup_date TEXT NOT NULL,
  referred_by INTEGER REFERENCES customers(id)
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  price REAL NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  employee_id INTEGER REFERENCES employees(id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE order_items (
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE reviews (
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  rating INTEGER NOT NULL,
  PRIMARY KEY (customer_id, product_id)
);

INSERT INTO departments (id, name) VALUES
  (1, 'Engineering'),
  (2, 'Sales'),
  (3, 'Support'),
  (4, 'Marketing'),
  (5, 'Finance');

INSERT INTO employees (id, name, department_id, manager_id, salary, hire_date) VALUES
  (1, 'Priya Patel', 1, NULL, 165000, '2018-03-12'),
  (2, 'Ava Chen', 1, 1, 128000, '2019-07-01'),
  (3, 'Marcus Lee', 1, 1, 112000, '2020-01-15'),
  (4, 'Owen Fischer', 1, 2, 131000, '2021-05-03'),
  (5, 'Yuki Tanaka', 1, 2, 104000, '2022-09-19'),
  (6, 'Sofia Novak', 2, NULL, 98000, '2017-11-06'),
  (7, 'Diego Ruiz', 2, 6, 72000, '2021-02-22'),
  (8, 'Ethan Brooks', 2, 6, 101000, '2020-06-08'),
  (9, 'Fatima Zahra', 2, 6, 76000, '2022-03-14'),
  (10, 'Jonas Berg', 2, 8, 68000, '2023-08-28'),
  (11, 'Grace Kim', 3, NULL, 82000, '2019-04-01'),
  (12, 'Liam O''Connor', 3, 11, 61000, '2021-10-11'),
  (13, 'Nora Haddad', 3, 11, 61000, '2022-01-24'),
  (14, 'Mateo Silva', 3, 11, 85000, '2023-05-15'),
  (15, 'Chiara Bianchi', 4, NULL, 95000, '2020-09-07'),
  (16, 'Samuel Osei', 4, 15, 74000, '2024-02-05');

INSERT INTO customers (id, name, city, signup_date, referred_by) VALUES
  (1, 'Alice Martin', 'Chicago', '2024-01-08', NULL),
  (2, 'Ben Okafor', 'Austin', '2024-02-13', NULL),
  (3, 'Chloe Dubois', 'Denver', '2024-03-24', NULL),
  (4, 'Dev Sharma', 'Seattle', '2024-04-22', NULL),
  (5, 'Emma Rossi', 'Boston', '2024-05-21', NULL),
  (6, 'Felix Wagner', 'Atlanta', '2024-06-17', NULL),
  (7, 'Gina Lopez', 'Phoenix', '2024-07-28', 4),
  (8, 'Hana Sato', 'Portland', '2024-08-22', NULL),
  (9, 'Ivan Petrov', 'Chicago', '2024-09-25', 8),
  (10, 'Julia Costa', 'Austin', '2024-10-11', NULL),
  (11, 'Kofi Mensah', 'Denver', '2024-11-21', NULL),
  (12, 'Lena Holm', 'Seattle', '2024-12-02', 5),
  (13, 'Milo Novak', 'Boston', '2024-01-04', NULL),
  (14, 'Nadia Karim', 'Atlanta', '2024-02-01', 5),
  (15, 'Oscar Reyes', 'Phoenix', '2024-03-16', 1),
  (16, 'Paula Moreau', 'Portland', '2024-04-02', 4),
  (17, 'Quinn Walsh', 'Chicago', '2024-05-08', NULL),
  (18, 'Rosa Diaz', 'Austin', '2024-06-23', NULL),
  (19, 'Sam Clarke', 'Denver', '2024-07-20', NULL),
  (20, 'Tara Singh', 'Seattle', '2024-08-13', NULL),
  (21, 'Umar Farouk', 'Boston', '2024-09-24', NULL),
  (22, 'Vera Ilic', 'Atlanta', '2024-10-13', NULL),
  (23, 'Wes Grant', 'Phoenix', '2024-11-02', 1),
  (24, 'Xenia Volkova', 'Portland', '2024-12-24', NULL),
  (25, 'Yusuf Aydin', 'Phoenix', '2024-01-04', NULL),
  (26, 'Zoe Park', 'Austin', '2024-02-11', 18),
  (27, 'Arjun Rao', 'Austin', '2024-03-11', 15),
  (28, 'Bea Lund', 'Boston', '2024-04-05', 19),
  (29, 'Cyrus Amini', 'Austin', '2024-05-03', 10),
  (30, 'Dana Frey', 'Boston', '2024-06-17', 7);

INSERT INTO categories (id, name) VALUES
  (1, 'Office'),
  (2, 'Electronics'),
  (3, 'Stationery'),
  (4, 'Furniture'),
  (5, 'Kitchen'),
  (6, 'Outdoor'),
  (7, 'Toys');

INSERT INTO suppliers (id, name, country) VALUES
  (1, 'Northwind Supply', 'USA'),
  (2, 'Maple Goods', 'Canada'),
  (3, 'Rhein Werk', 'Germany'),
  (4, 'Kanto Trading', 'Japan'),
  (5, 'Lakeside Imports', 'USA'),
  (6, 'Tejo Crafts', 'Portugal'),
  (7, 'Fjord Works', 'Norway');

INSERT INTO products (id, name, category_id, supplier_id, price) VALUES
  (1, 'Laptop stand', 1, 1, 45.00),
  (2, 'Desk lamp', 1, 2, 30.00),
  (3, 'Monitor arm', 1, 3, 85.00),
  (4, 'Cable tray', 1, 5, 22.50),
  (5, 'Desk mat', 1, 4, 18.00),
  (6, 'USB-C hub', 2, 4, 60.00),
  (7, 'Noise-cancelling headphones', 2, 3, 200.00),
  (8, 'Webcam', 2, 1, 90.00),
  (9, 'Mechanical keyboard', 2, 4, 120.00),
  (10, 'Portable SSD', 2, 5, 110.00),
  (11, 'Smart plug', 2, 1, 25.00),
  (12, 'Notebook pack', 3, 6, 12.50),
  (13, 'Fountain pen', 3, 3, 80.00),
  (14, 'Sticky notes', 3, 1, 6.00),
  (15, 'Gel pens', 3, 6, 9.50),
  (16, 'Office chair', 4, 2, 240.00),
  (17, 'Standing desk', 4, 3, 480.00),
  (18, 'Bookshelf', 4, 2, 150.00),
  (19, 'Filing cabinet', 4, 5, 175.00),
  (20, 'Coffee grinder', 5, 4, 65.00),
  (21, 'Kettle', 5, 3, 40.00),
  (22, 'Water bottle', 5, 6, 20.00),
  (23, 'Lunch box', 5, 2, 15.00),
  (24, 'Camping lantern', 6, 1, 35.00),
  (25, 'Hiking backpack', 6, 2, 95.00),
  (26, 'Folding chair', 6, 5, 28.00),
  (27, 'Picnic blanket', 6, 6, 32.00),
  (28, 'Ergonomic footrest', 1, 2, 38.00),
  (29, 'Label maker', 3, 4, 55.00),
  (30, 'Bike lock', 6, 5, 42.00);

INSERT INTO orders (id, customer_id, employee_id, order_date, status) VALUES
  (1, 4, 8, '2025-01-02', 'shipped'),
  (2, 3, 7, '2025-01-05', 'shipped'),
  (3, 20, 9, '2025-01-08', 'shipped'),
  (4, 13, 9, '2025-01-10', 'shipped'),
  (5, 23, 9, '2025-01-10', 'shipped'),
  (6, 15, 9, '2025-01-10', 'cancelled'),
  (7, 2, NULL, '2025-01-14', 'shipped'),
  (8, 1, 8, '2025-01-16', 'shipped'),
  (9, 4, 7, '2025-01-22', 'shipped'),
  (10, 12, 8, '2025-01-22', 'shipped'),
  (11, 1, 9, '2025-01-23', 'shipped'),
  (12, 7, NULL, '2025-01-24', 'shipped'),
  (13, 10, 9, '2025-01-24', 'shipped'),
  (14, 12, NULL, '2025-01-25', 'shipped'),
  (15, 13, 7, '2025-01-28', 'shipped'),
  (16, 2, 8, '2025-02-03', 'shipped'),
  (17, 21, NULL, '2025-02-05', 'shipped'),
  (18, 4, NULL, '2025-02-07', 'pending'),
  (19, 3, 9, '2025-02-07', 'shipped'),
  (20, 28, 7, '2025-02-08', 'cancelled'),
  (21, 3, 9, '2025-02-11', 'shipped'),
  (22, 19, 8, '2025-02-12', 'pending'),
  (23, 26, 7, '2025-02-13', 'shipped'),
  (24, 7, 7, '2025-02-13', 'shipped'),
  (25, 4, 8, '2025-02-15', 'shipped'),
  (26, 18, 7, '2025-02-18', 'cancelled'),
  (27, 20, 8, '2025-02-26', 'cancelled'),
  (28, 23, 8, '2025-02-28', 'shipped'),
  (29, 20, 8, '2025-02-28', 'pending'),
  (30, 8, 8, '2025-02-28', 'shipped'),
  (31, 28, NULL, '2025-03-02', 'pending'),
  (32, 3, 8, '2025-03-06', 'shipped'),
  (33, 24, 7, '2025-03-08', 'shipped'),
  (34, 2, 8, '2025-03-09', 'cancelled'),
  (35, 18, 7, '2025-03-10', 'pending'),
  (36, 16, 8, '2025-03-12', 'shipped'),
  (37, 29, 8, '2025-03-14', 'shipped'),
  (38, 17, 7, '2025-03-16', 'shipped'),
  (39, 25, NULL, '2025-03-16', 'shipped'),
  (40, 29, 7, '2025-03-18', 'shipped'),
  (41, 10, 8, '2025-03-21', 'shipped'),
  (42, 2, 8, '2025-03-21', 'shipped'),
  (43, 2, 7, '2025-03-21', 'shipped'),
  (44, 20, NULL, '2025-03-28', 'shipped'),
  (45, 25, 8, '2025-03-28', 'cancelled'),
  (46, 25, 7, '2025-04-01', 'shipped'),
  (47, 26, 7, '2025-04-05', 'shipped'),
  (48, 11, 7, '2025-04-05', 'shipped'),
  (49, 13, 7, '2025-04-07', 'pending'),
  (50, 6, NULL, '2025-04-09', 'shipped'),
  (51, 5, 9, '2025-04-09', 'shipped'),
  (52, 3, NULL, '2025-04-10', 'shipped'),
  (53, 3, NULL, '2025-04-12', 'shipped'),
  (54, 20, 7, '2025-04-14', 'pending'),
  (55, 11, NULL, '2025-04-15', 'shipped'),
  (56, 21, NULL, '2025-04-16', 'cancelled'),
  (57, 1, 8, '2025-04-17', 'shipped'),
  (58, 10, NULL, '2025-04-19', 'pending'),
  (59, 7, 7, '2025-04-25', 'shipped'),
  (60, 16, 7, '2025-04-25', 'cancelled'),
  (61, 3, 8, '2025-05-01', 'shipped'),
  (62, 4, 8, '2025-05-02', 'shipped'),
  (63, 28, 9, '2025-05-06', 'shipped'),
  (64, 20, 7, '2025-05-06', 'shipped'),
  (65, 13, 7, '2025-05-11', 'shipped'),
  (66, 18, 9, '2025-05-11', 'shipped'),
  (67, 3, 8, '2025-05-12', 'shipped'),
  (68, 7, 9, '2025-05-12', 'shipped'),
  (69, 8, NULL, '2025-05-14', 'shipped'),
  (70, 20, 8, '2025-05-15', 'shipped'),
  (71, 1, 8, '2025-05-16', 'shipped'),
  (72, 4, 9, '2025-05-17', 'pending'),
  (73, 5, NULL, '2025-05-17', 'shipped'),
  (74, 2, 9, '2025-05-18', 'shipped'),
  (75, 11, 8, '2025-05-23', 'shipped'),
  (76, 4, 7, '2025-06-01', 'shipped'),
  (77, 1, 7, '2025-06-02', 'shipped'),
  (78, 13, NULL, '2025-06-04', 'shipped'),
  (79, 17, NULL, '2025-06-05', 'pending'),
  (80, 19, 8, '2025-06-06', 'shipped'),
  (81, 20, NULL, '2025-06-08', 'pending'),
  (82, 10, 7, '2025-06-08', 'pending'),
  (83, 2, NULL, '2025-06-09', 'pending'),
  (84, 25, NULL, '2025-06-09', 'shipped'),
  (85, 28, 8, '2025-06-13', 'pending'),
  (86, 18, 8, '2025-06-15', 'pending'),
  (87, 6, 8, '2025-06-26', 'pending'),
  (88, 4, 7, '2025-06-26', 'shipped'),
  (89, 13, NULL, '2025-06-27', 'pending'),
  (90, 11, 9, '2025-06-28', 'shipped');

INSERT INTO order_items (order_id, product_id, quantity) VALUES
  (1, 14, 5), (2, 8, 1), (2, 14, 1), (2, 23, 1), (3, 25, 1), (3, 26, 1), (4, 12, 1), (5, 8, 1),
  (6, 3, 2), (6, 12, 2), (6, 16, 2), (6, 25, 1), (7, 5, 5), (7, 25, 2), (8, 1, 5), (8, 20, 1),
  (9, 21, 3), (10, 9, 3), (10, 18, 5), (11, 8, 1), (11, 10, 1), (12, 18, 3), (12, 20, 5), (13, 2, 2),
  (13, 27, 2), (14, 1, 2), (15, 5, 5), (15, 21, 5), (16, 12, 5), (17, 15, 5), (18, 12, 2), (18, 20, 1),
  (18, 24, 1), (19, 11, 3), (19, 20, 2), (19, 22, 1), (20, 16, 1), (20, 20, 1), (21, 11, 3), (21, 12, 1),
  (22, 1, 2), (22, 20, 2), (22, 23, 1), (22, 24, 3), (23, 15, 1), (24, 4, 3), (25, 18, 1), (25, 20, 2),
  (25, 25, 1), (26, 25, 2), (27, 10, 3), (28, 4, 1), (28, 6, 5), (28, 19, 1), (28, 27, 1), (29, 8, 3),
  (29, 10, 1), (29, 24, 5), (30, 3, 1), (30, 8, 1), (30, 15, 2), (30, 23, 1), (31, 2, 1), (31, 14, 3),
  (31, 23, 1), (32, 14, 2), (32, 15, 2), (32, 27, 3), (33, 5, 5), (33, 11, 2), (33, 21, 2), (33, 26, 2),
  (34, 11, 2), (34, 26, 2), (35, 20, 1), (35, 25, 3), (36, 11, 2), (36, 20, 1), (36, 23, 1), (36, 24, 2),
  (37, 24, 5), (38, 7, 2), (39, 4, 5), (39, 21, 5), (40, 9, 1), (40, 10, 1), (40, 12, 1), (40, 16, 5),
  (41, 25, 1), (42, 3, 3), (42, 24, 1), (42, 26, 2), (43, 12, 2), (43, 15, 1), (43, 19, 1), (43, 27, 1),
  (44, 10, 1), (44, 20, 1), (44, 23, 1), (44, 25, 1), (45, 12, 2), (45, 18, 2), (46, 3, 1), (46, 10, 3),
  (46, 11, 1), (46, 19, 5), (47, 10, 1), (47, 21, 1), (48, 14, 2), (49, 3, 1), (49, 15, 1), (49, 16, 1),
  (49, 26, 3), (50, 5, 2), (50, 11, 1), (50, 15, 1), (50, 21, 1), (51, 4, 5), (52, 5, 5), (52, 14, 5),
  (52, 15, 5), (53, 7, 1), (53, 12, 1), (54, 15, 1), (55, 21, 1), (56, 4, 5), (56, 6, 1), (57, 7, 2),
  (57, 15, 1), (57, 18, 1), (58, 16, 1), (58, 19, 5), (59, 4, 1), (59, 20, 2), (60, 6, 2), (60, 12, 1),
  (60, 16, 1), (60, 20, 3), (61, 6, 1), (61, 8, 2), (61, 19, 5), (61, 20, 2), (62, 2, 3), (62, 7, 2),
  (63, 7, 1), (63, 18, 5), (64, 1, 3), (65, 18, 1), (65, 23, 1), (66, 6, 1), (66, 11, 1), (66, 24, 2),
  (66, 25, 1), (67, 26, 1), (68, 1, 1), (68, 8, 1), (68, 18, 2), (68, 27, 2), (69, 12, 2), (69, 23, 2),
  (70, 19, 1), (71, 3, 1), (71, 6, 2), (72, 7, 5), (73, 1, 3), (74, 18, 3), (75, 3, 1), (75, 4, 1),
  (76, 7, 2), (76, 14, 1), (77, 9, 1), (77, 24, 5), (78, 9, 1), (78, 20, 5), (78, 21, 2), (78, 23, 2),
  (79, 20, 5), (79, 23, 1), (80, 9, 1), (80, 25, 1), (80, 26, 2), (81, 4, 1), (82, 5, 1), (82, 18, 5),
  (82, 22, 2), (83, 1, 2), (83, 4, 5), (84, 25, 1), (85, 8, 3), (85, 18, 2), (86, 1, 5), (87, 4, 3),
  (87, 14, 1), (88, 3, 2), (88, 25, 1), (89, 1, 1), (89, 3, 1), (89, 19, 1), (90, 6, 3), (90, 12, 1);

INSERT INTO reviews (customer_id, product_id, rating) VALUES
  (1, 9, 4), (1, 10, 5), (1, 20, 4), (1, 24, 4), (2, 4, 5), (2, 18, 5), (2, 19, 3), (3, 14, 5),
  (3, 19, 4), (3, 20, 4), (3, 26, 3), (3, 27, 2), (4, 12, 2), (4, 14, 4), (4, 25, 2), (5, 1, 3),
  (6, 4, 4), (6, 14, 4), (7, 4, 2), (7, 8, 2), (8, 8, 5), (8, 12, 2), (10, 18, 5), (10, 27, 4),
  (11, 6, 4), (11, 12, 4), (12, 9, 5), (13, 15, 3), (13, 19, 5), (13, 26, 5), (15, 16, 5), (16, 6, 4),
  (16, 20, 2), (16, 23, 4), (16, 24, 5), (18, 1, 4), (19, 20, 5), (19, 25, 3), (19, 26, 2), (20, 1, 3),
  (20, 4, 3), (20, 20, 4), (20, 26, 4), (21, 6, 3), (21, 15, 2), (23, 6, 5), (23, 8, 5), (23, 19, 2),
  (23, 27, 4), (25, 19, 2), (25, 25, 2), (26, 10, 5), (28, 7, 5), (28, 8, 5), (28, 14, 5), (28, 16, 5),
  (28, 18, 2), (28, 23, 2), (29, 9, 5), (29, 24, 4);
`;
