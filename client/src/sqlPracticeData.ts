// The shop database and the SQL practice problems (components/tools/SqlPractice.tsx). Each
// problem is checked by running the learner's query and `solution` on a fresh copy of SHOP_SCHEMA
// and comparing the rows: as a multiset unless `ordered` is set, numbers compared to 2 decimal
// places, column names ignored. scripts/check-sql-practice.mjs runs every solution and every
// `alsoAccepted` query (they must return the same rows) and every playground query in the
// Databases lessons.
//
// The data is small on purpose so a learner can check an answer by eye, and it has the awkward
// cases interview questions lean on: a customer with no orders, a product nobody bought, a
// cancelled order, two customers sharing an email, tied salaries and gaps in the login dates.

export const SHOP_SCHEMA = `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  manager_id INTEGER REFERENCES employees(id),
  salary INTEGER NOT NULL
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  signup_date TEXT NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE order_items (
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE logins (
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  login_date TEXT NOT NULL,
  PRIMARY KEY (customer_id, login_date)
);

INSERT INTO departments (id, name) VALUES
  (1, 'Engineering'), (2, 'Sales'), (3, 'Support');

INSERT INTO employees (id, name, department_id, manager_id, salary) VALUES
  (1, 'Priya Patel', 1, NULL, 150000),
  (2, 'Ava Chen', 1, 1, 118000),
  (3, 'Marcus Lee', 1, 1, 105000),
  (4, 'Owen Fischer', 1, 2, 121000),
  (5, 'Sofia Novak', 2, NULL, 90000),
  (6, 'Diego Ruiz', 2, 5, 78000),
  (7, 'Ethan Brooks', 2, 5, 95000),
  (8, 'Grace Kim', 3, NULL, 70000),
  (9, 'Liam O''Connor', 3, 8, 64000),
  (10, 'Nora Haddad', 3, 8, 64000);

INSERT INTO customers (id, name, email, city, signup_date) VALUES
  (1, 'Alice Martin', 'alice@example.com', 'Chicago', '2025-01-05'),
  (2, 'Ben Okafor', 'ben@example.com', 'Austin', '2025-01-18'),
  (3, 'Chloe Dubois', 'chloe@example.com', 'Chicago', '2025-02-02'),
  (4, 'Dev Sharma', 'dev@example.com', 'Denver', '2025-02-20'),
  (5, 'Emma Rossi', 'emma@example.com', 'Austin', '2025-03-11'),
  (6, 'Felix Wagner', 'felix@example.com', 'Chicago', '2025-03-30'),
  (7, 'Alice M.', 'alice@example.com', 'Chicago', '2025-04-02'),
  (8, 'Hana Sato', 'hana@example.com', 'Denver', '2025-04-15');

INSERT INTO products (id, name, category, price) VALUES
  (1, 'Laptop stand', 'Office', 45.00),
  (2, 'Desk lamp', 'Office', 30.00),
  (3, 'USB-C hub', 'Electronics', 60.00),
  (4, 'Noise-cancelling headphones', 'Electronics', 200.00),
  (5, 'Notebook pack', 'Stationery', 12.50),
  (6, 'Fountain pen', 'Stationery', 80.00),
  (7, 'Webcam', 'Electronics', 90.00);

INSERT INTO orders (id, customer_id, order_date, status) VALUES
  (1, 1, '2025-01-10', 'shipped'),
  (2, 2, '2025-01-22', 'shipped'),
  (3, 1, '2025-02-03', 'shipped'),
  (4, 3, '2025-02-14', 'cancelled'),
  (5, 4, '2025-02-25', 'shipped'),
  (6, 1, '2025-03-02', 'shipped'),
  (7, 5, '2025-03-15', 'shipped'),
  (8, 2, '2025-03-15', 'shipped'),
  (9, 3, '2025-04-01', 'shipped'),
  (10, 5, '2025-04-09', 'pending');

INSERT INTO order_items (order_id, product_id, quantity) VALUES
  (1, 1, 1), (1, 5, 4),
  (2, 4, 1),
  (3, 3, 2), (3, 2, 1),
  (4, 6, 1),
  (5, 4, 1), (5, 3, 1),
  (6, 5, 10),
  (7, 1, 2), (7, 2, 2),
  (8, 3, 1),
  (9, 4, 2), (9, 5, 2),
  (10, 1, 1);

INSERT INTO logins (customer_id, login_date) VALUES
  (1, '2025-03-01'), (1, '2025-03-02'), (1, '2025-03-03'), (1, '2025-03-05'),
  (2, '2025-03-01'), (2, '2025-03-03'), (2, '2025-03-04'),
  (3, '2025-03-02'), (3, '2025-03-03'), (3, '2025-03-04'), (3, '2025-03-05'), (3, '2025-03-07'),
  (5, '2025-03-06');
`;

export interface SqlProblem {
  id: string;
  title: string;
  prompt: string;
  // What the result should look like, e.g. "name, total".
  columns: string;
  starter: string;
  solution: string;
  // Other correct queries in a different style; the check script makes sure they agree.
  alsoAccepted?: string[];
  ordered?: boolean;
  hint: string;
  // Shown with the solution: why it works and the usual wrong turn.
  why: string;
}

export interface SqlProblemSet {
  lessonId: string;
  problems: SqlProblem[];
}

const JOINS: SqlProblem[] = [
  {
    id: "sqlp-chicago-customers",
    title: "Customers in one city",
    prompt: "List the names of every customer in Chicago, in alphabetical order.",
    columns: "name",
    starter: "SELECT name\nFROM customers\n",
    solution: "SELECT name\nFROM customers\nWHERE city = 'Chicago'\nORDER BY name;",
    ordered: true,
    hint: "WHERE filters the rows; ORDER BY sorts what is left. Text comparisons in SQL use single quotes.",
    why: "Four customers live in Chicago. Without ORDER BY the database may return rows in any order, so a question that says \"in order\" always needs it.",
  },
  {
    id: "sqlp-customers-no-orders",
    title: "Customers who never ordered",
    prompt: "Return the name of every customer who has never placed an order.",
    columns: "name",
    starter: "SELECT c.name\nFROM customers c\n",
    solution: "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;",
    alsoAccepted: [
      "SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);",
      "SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);",
    ],
    hint: "Keep every customer with a LEFT JOIN, then keep only the rows where the order side came back empty.",
    why: "A LEFT JOIN keeps customers with no matching order and fills the order columns with NULL, so `WHERE o.id IS NULL` keeps exactly those. NOT EXISTS says the same thing directly. Careful with NOT IN: if the subquery ever returns a NULL, NOT IN returns no rows at all.",
  },
  {
    id: "sqlp-products-never-sold",
    title: "Products nobody bought",
    prompt: "Return the name of every product that appears in no order at all.",
    columns: "name",
    starter: "SELECT p.name\nFROM products p\n",
    solution: "SELECT p.name\nFROM products p\nWHERE NOT EXISTS (\n  SELECT 1 FROM order_items i WHERE i.product_id = p.id\n);",
    alsoAccepted: ["SELECT p.name FROM products p LEFT JOIN order_items i ON i.product_id = p.id WHERE i.order_id IS NULL;"],
    hint: "Products link to orders through order_items. Look for products with no row there.",
    why: "This is the same anti-join as the customers question, one table further along. An inner join can never answer it, because an inner join only returns matches.",
  },
  {
    id: "sqlp-order-totals",
    title: "Order totals with the customer's name",
    prompt: "For every order, return the order id, the customer's name and the order total (quantity times price, summed over its items), ordered by order id.",
    columns: "order id, customer name, total",
    starter: "SELECT o.id, c.name, ...\nFROM orders o\n",
    solution: "SELECT o.id, c.name, SUM(i.quantity * p.price) AS total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN order_items i ON i.order_id = o.id\nJOIN products p ON p.id = i.product_id\nGROUP BY o.id, c.name\nORDER BY o.id;",
    ordered: true,
    hint: "Join four tables: orders to customers, orders to order_items, order_items to products. Then GROUP BY the order.",
    why: "Each order has one row per item after the joins, so the total needs SUM and GROUP BY. Order 9 is the biggest at 425 (two headphones and two notebook packs).",
  },
  {
    id: "sqlp-earn-more-than-manager",
    title: "Earning more than their manager",
    prompt: "Return the name of every employee whose salary is higher than their manager's salary.",
    columns: "name",
    starter: "SELECT e.name\nFROM employees e\n",
    solution: "SELECT e.name\nFROM employees e\nJOIN employees m ON m.id = e.manager_id\nWHERE e.salary > m.salary;",
    hint: "Join the employees table to itself: one copy for the employee, one for the manager.",
    why: "A self join gives each copy its own alias, so `e.salary > m.salary` compares a person with their manager on one row. Owen earns more than Ava, and Ethan more than Sofia. People with no manager drop out of the inner join, which is what we want.",
  },
];

const AGGREGATION: SqlProblem[] = [
  {
    id: "sqlp-revenue-by-category",
    title: "Revenue per category",
    prompt: "Return each product category with its revenue (quantity times price) from orders that were not cancelled, highest revenue first.",
    columns: "category, revenue",
    starter: "SELECT p.category, ...\nFROM order_items i\n",
    solution: "SELECT p.category, SUM(i.quantity * p.price) AS revenue\nFROM order_items i\nJOIN products p ON p.id = i.product_id\nJOIN orders o ON o.id = i.order_id\nWHERE o.status <> 'cancelled'\nGROUP BY p.category\nORDER BY revenue DESC;",
    ordered: true,
    hint: "Filter out cancelled orders with WHERE before grouping, then GROUP BY category.",
    why: "WHERE runs before GROUP BY, so the cancelled order's fountain pen never reaches the sum. Forgetting the status filter gives Stationery 280 instead of 200.",
  },
  {
    id: "sqlp-repeat-customers",
    title: "Repeat customers",
    prompt: "Return the name and number of orders of every customer with at least two orders, most orders first and then by name.",
    columns: "name, order count",
    starter: "SELECT c.name, COUNT(*)\nFROM customers c\n",
    solution: "SELECT c.name, COUNT(*) AS orders\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= 2\nORDER BY orders DESC, c.name;",
    ordered: true,
    hint: "A condition on a group's COUNT goes in HAVING, not WHERE.",
    why: "WHERE filters single rows before grouping and can't see COUNT(*); HAVING filters whole groups after it. Grouping by the id as well as the name keeps two different customers who share a name apart.",
  },
  {
    id: "sqlp-duplicate-emails",
    title: "Duplicate emails",
    prompt: "Return every email address that belongs to more than one customer, with how many customers share it.",
    columns: "email, count",
    starter: "SELECT email\nFROM customers\n",
    solution: "SELECT email, COUNT(*) AS customers\nFROM customers\nGROUP BY email\nHAVING COUNT(*) > 1;",
    hint: "Group by the value you suspect is duplicated and keep the groups bigger than one.",
    why: "GROUP BY email puts both alice@example.com rows into one group of size 2. This is the standard first step before cleaning duplicates, and a reason to put a UNIQUE constraint on the column.",
  },
  {
    id: "sqlp-second-highest-salary",
    title: "Second highest salary",
    prompt: "Return the second highest distinct salary in the company as a single value.",
    columns: "salary",
    starter: "SELECT ...\nFROM employees\n",
    solution: "SELECT MAX(salary) AS salary\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);",
    alsoAccepted: ["SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1;"],
    hint: "The second highest is the highest of everything below the highest.",
    why: "The subquery finds 150000; the outer MAX finds the largest salary under it, 121000. The MAX version returns NULL when there is no second salary, which many interviewers ask for; LIMIT 1 OFFSET 1 returns no row instead, and needs DISTINCT so that a tie at the top doesn't count twice.",
  },
  {
    id: "sqlp-orders-per-month",
    title: "Orders per month",
    prompt: "Return each month (as YYYY-MM) and how many orders were placed in it, in month order. Count cancelled orders too.",
    columns: "month, orders",
    starter: "SELECT ...\nFROM orders\n",
    solution: "SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders\nFROM orders\nGROUP BY month\nORDER BY month;",
    alsoAccepted: ["SELECT substr(order_date, 1, 7) AS month, COUNT(*) FROM orders GROUP BY 1 ORDER BY 1;"],
    ordered: true,
    hint: "Turn each date into its month first, then group by that. In SQLite, strftime('%Y-%m', date) does it.",
    why: "Grouping by a computed expression is common for reports. Other databases spell it differently: DATE_TRUNC('month', d) in PostgreSQL, FORMAT(d, 'yyyy-MM') in SQL Server.",
  },
];

const WINDOWS: SqlProblem[] = [
  {
    id: "sqlp-top-two-per-department",
    title: "Top two salaries per department",
    prompt: "For each department, return the employees whose salary is one of that department's two highest distinct salaries. Return department name, employee name and salary. Ties both count.",
    columns: "department, name, salary",
    starter: "WITH ranked AS (\n  SELECT ...\n)\nSELECT ...\n",
    solution: "WITH ranked AS (\n  SELECT d.name AS department, e.name, e.salary,\n         DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS rnk\n  FROM employees e\n  JOIN departments d ON d.id = e.department_id\n)\nSELECT department, name, salary\nFROM ranked\nWHERE rnk <= 2;",
    hint: "Rank inside each department with a window function, then filter on the rank in an outer query. You can't use a window function in WHERE directly.",
    why: "PARTITION BY restarts the ranking per department. DENSE_RANK gives Liam and Nora the same rank 2, so Support returns three people; ROW_NUMBER would drop one of them at random, and RANK would behave the same here but skip rank 3 after a tie.",
  },
  {
    id: "sqlp-running-revenue",
    title: "Running total of revenue",
    prompt: "For each date with orders that were not cancelled, return the date, that day's revenue and the running total of revenue up to and including that day, in date order.",
    columns: "date, day revenue, running total",
    starter: "WITH daily AS (\n  SELECT ...\n)\nSELECT ...\n",
    solution: "WITH daily AS (\n  SELECT o.order_date, SUM(i.quantity * p.price) AS revenue\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status <> 'cancelled'\n  GROUP BY o.order_date\n)\nSELECT order_date, revenue,\n       SUM(revenue) OVER (ORDER BY order_date) AS running_total\nFROM daily\nORDER BY order_date;",
    ordered: true,
    hint: "First add up each day in a CTE (two orders share 2025-03-15), then use SUM(...) OVER (ORDER BY date).",
    why: "A window SUM with ORDER BY adds up every row up to the current one without collapsing the rows the way GROUP BY does. Totalling per day first matters: with ties in the ORDER BY, the default window frame includes every row with the same date.",
  },
  {
    id: "sqlp-month-over-month",
    title: "Month-over-month change",
    prompt: "For each month, return the month (YYYY-MM), its revenue from orders that were not cancelled, and the change from the previous month (NULL for the first month), in month order.",
    columns: "month, revenue, change",
    starter: "WITH monthly AS (\n  SELECT ...\n)\nSELECT ...\n",
    solution: "WITH monthly AS (\n  SELECT strftime('%Y-%m', o.order_date) AS month, SUM(i.quantity * p.price) AS revenue\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p ON p.id = i.product_id\n  WHERE o.status <> 'cancelled'\n  GROUP BY month\n)\nSELECT month, revenue,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly\nORDER BY month;",
    ordered: true,
    hint: "LAG(x) OVER (ORDER BY month) reads x from the previous row.",
    why: "LAG and LEAD look at neighbouring rows, which a plain GROUP BY can't do without a self join. The first month has no previous row, so LAG returns NULL and the subtraction stays NULL.",
  },
  {
    id: "sqlp-first-order",
    title: "Each customer's first order",
    prompt: "For every customer who has ordered, return their name, the id of their first order and its date. Assume a customer never places two orders on the same day.",
    columns: "name, order id, order date",
    starter: "SELECT ...\n",
    solution: "WITH numbered AS (\n  SELECT c.name, o.id AS order_id, o.order_date,\n         ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.order_date) AS n\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n)\nSELECT name, order_id, order_date\nFROM numbered\nWHERE n = 1;",
    alsoAccepted: ["SELECT c.name, o.id, o.order_date FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.order_date = (SELECT MIN(order_date) FROM orders o2 WHERE o2.customer_id = o.customer_id);"],
    hint: "Number each customer's orders by date and keep number 1, or compare each order with the customer's MIN(order_date).",
    why: "\"First, latest or top N per group\" is the ROW_NUMBER pattern. The correlated subquery works too, but runs once per row unless the database rewrites it.",
  },
  {
    id: "sqlp-salary-vs-average",
    title: "Salary against the department average",
    prompt: "For every employee, return their name, salary, their department's average salary rounded to the nearest whole number, and the difference (salary minus that rounded average).",
    columns: "name, salary, department average, difference",
    starter: "SELECT name, salary, ...\nFROM employees\n",
    solution: "SELECT name, salary,\n       ROUND(AVG(salary) OVER (PARTITION BY department_id)) AS dept_avg,\n       salary - ROUND(AVG(salary) OVER (PARTITION BY department_id)) AS diff\nFROM employees;",
    hint: "AVG(salary) OVER (PARTITION BY department_id) puts the group's average on every row.",
    why: "An aggregate with OVER keeps every row and adds the group's value beside it. Without windows you would compute the averages in a subquery and join back to it.",
  },
  {
    id: "sqlp-longest-login-streak",
    title: "Longest login streak",
    prompt: "For each customer with logins, return the customer id and the length of their longest run of consecutive login days, longest first and then by customer id.",
    columns: "customer id, longest streak",
    starter: "WITH numbered AS (\n  SELECT customer_id, login_date,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY login_date) AS n\n  FROM logins\n)\nSELECT ...\n",
    solution: "WITH numbered AS (\n  SELECT customer_id, login_date,\n         julianday(login_date) - ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY login_date) AS grp\n  FROM logins\n),\nstreaks AS (\n  SELECT customer_id, COUNT(*) AS len\n  FROM numbered\n  GROUP BY customer_id, grp\n)\nSELECT customer_id, MAX(len) AS longest\nFROM streaks\nGROUP BY customer_id\nORDER BY longest DESC, customer_id;",
    ordered: true,
    hint: "Within a run of consecutive days, the date minus the row number stays the same. Group by that difference.",
    why: "This is the gaps-and-islands trick. Customer 3 logs in on the 2nd, 3rd, 4th and 5th (row numbers 1 to 4), so date minus row number is the same for all four and they form one group; the 7th starts a new group.",
  },
];

export const SQL_PROBLEM_SETS: Record<string, SqlProblemSet> = {
  joins: { lessonId: "sql-practice-joins", problems: JOINS },
  aggregation: { lessonId: "sql-practice-aggregation", problems: AGGREGATION },
  windows: { lessonId: "sql-practice-windows", problems: WINDOWS },
};
