// The SQL Join Ladder: SELECT questions generated from templates over the ladder database
// (sqlLadderData.ts), in eight rungs of rising join difficulty. Each template is filled with
// values from the data (a city, a category, a month...), and the question text and the
// reference query are built from the same values, so every answer comes from running real SQL.
//
// Not every combination makes a good question (customers in Boston who never ordered may be
// nobody). usableQuestions() runs each reference query and keeps a question only when it returns
// rows and, when the template names a tempting wrong query (`trap`), only when that wrong query
// gives a different answer, so the trap the question teaches is really there. The lesson and
// scripts/check-sql-practice.mjs both use it, and the check script makes sure every rung keeps
// enough questions.

import { compareResults, type RowsResult } from "./sqlCompare.ts";

export interface LadderQuestion {
  id: string; // template id plus its values, stable across visits
  rung: number;
  title: string;
  prompt: string;
  columns: string;
  solution: string;
  // A common wrong answer. When set, the question is only used if this returns different rows.
  trap?: string;
  hint: string;
  why: string;
}

export interface LadderRung {
  rung: number;
  name: string;
  blurb: string;
}

export const LADDER_RUNGS: LadderRung[] = [
  { rung: 1, name: "One table", blurb: "Filter a single table with WHERE. No joins yet." },
  { rung: 2, name: "Two tables", blurb: "An inner join on a foreign key, then filter on either side." },
  { rung: 3, name: "Three tables", blurb: "Chain two joins, including through a bridge table." },
  { rung: 4, name: "Four or more tables", blurb: "Long join paths, DISTINCT, and SUM over the joined rows." },
  { rung: 5, name: "Outer joins", blurb: "LEFT JOIN to keep rows with no match: missing rows, zero counts, ON versus WHERE." },
  { rung: 6, name: "Self joins", blurb: "Join a table to itself: managers, referrals, pairs." },
  { rung: 7, name: "Aggregates over joins", blurb: "GROUP BY and HAVING across joins, and the double counting a join causes." },
  { rung: 8, name: "Mixed", blurb: "Anti-joins, EXISTS and CTEs combined with everything above." },
];

// How many different questions a learner passes on a rung to clear it.
export const PASSES_TO_CLEAR = 3;

const CITIES = ["Atlanta", "Austin", "Boston", "Chicago", "Denver", "Phoenix", "Portland", "Seattle"];
const CATEGORIES = ["Electronics", "Furniture", "Kitchen", "Office", "Outdoor", "Stationery", "Toys"];
const DEPARTMENTS = ["Engineering", "Finance", "Marketing", "Sales", "Support"];
const COUNTRIES = ["Canada", "Germany", "Japan", "Norway", "Portugal", "USA"];
const STATUSES = ["shipped", "pending", "cancelled"];
const REPS = ["Diego Ruiz", "Ethan Brooks", "Fatima Zahra"];
const SIGNUP_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((name, i) => ({
  key: `2024-${String(i + 1).padStart(2, "0")}`,
  label: `${name} 2024`,
}));
const MONTHS: { key: string; label: string }[] = [
  { key: "2025-01", label: "January 2025" },
  { key: "2025-02", label: "February 2025" },
  { key: "2025-03", label: "March 2025" },
  { key: "2025-04", label: "April 2025" },
  { key: "2025-05", label: "May 2025" },
  { key: "2025-06", label: "June 2025" },
];

type Built = Omit<LadderQuestion, "id" | "rung">;

interface Template<P> {
  id: string;
  rung: number;
  params: P[];
  key: (p: P) => string;
  build: (p: P) => Built;
}

function cross<A, B>(as: A[], bs: B[]): [A, B][] {
  return as.flatMap((a) => bs.map((b): [A, B] => [a, b]));
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const REVENUE = "SUM(oi.quantity * p.price)";
const MONTH_NOTE = "Dates are `YYYY-MM-DD` text, so `order_date LIKE '2025-03%'` picks a month (or `strftime('%Y-%m', order_date) = '2025-03'`).";

// Each template is generic in its own parameter type; the list only needs to call key/build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TEMPLATES: Template<any>[] = [
  // ---------- Rung 1: one table ----------
  {
    id: "r1-city-customers",
    rung: 1,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Customers in ${city}`,
      prompt: `List the name of every customer who lives in ${city}.`,
      columns: "name",
      solution: `SELECT name\nFROM customers\nWHERE city = '${city}';`,
      hint: "One table, one condition: `SELECT ... FROM customers WHERE city = ...`. Text values go in single quotes.",
      why: "WHERE keeps only the rows where the condition is true. String literals are single quoted in SQL; double quotes are for identifiers.",
    }),
  },
  {
    id: "r1-price-at-least",
    rung: 1,
    params: [40, 80, 100, 150],
    key: String,
    build: (min: number) => ({
      title: `Products costing ${min} or more`,
      prompt: `List the name and price of every product priced at ${min} or more.`,
      columns: "name, price",
      solution: `SELECT name, price\nFROM products\nWHERE price >= ${min};`,
      hint: "`>=` includes the boundary value itself.",
      why: `"${min} or more" includes ${min}, so the comparison is >=, not >. Off by one on a boundary is the usual slip here.`,
    }),
  },
  {
    id: "r1-status-month-orders",
    rung: 1,
    params: cross(["pending", "cancelled"], MONTHS),
    key: ([s, m]: [string, { key: string }]) => `${s}-${m.key}`,
    build: ([status, m]: [string, { key: string; label: string }]) => ({
      title: `${status[0].toUpperCase()}${status.slice(1)} orders in ${m.label}`,
      prompt: `List the id and order date of every order with status '${status}' placed in ${m.label}.`,
      columns: "id, order_date",
      solution: `SELECT id, order_date\nFROM orders\nWHERE status = '${status}'\n  AND order_date LIKE '${m.key}%';`,
      hint: `Two conditions joined with AND. ${MONTH_NOTE}`,
      why: "Both conditions must hold, so AND. Because the dates are ISO text, a prefix match or a range (`>= '2025-03-01' AND < '2025-04-01'`) both pick the month; the range is the form that can use an index on order_date.",
    }),
  },

  {
    id: "r1-signup-month",
    rung: 1,
    params: SIGNUP_MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Signed up in ${m.label}`,
      prompt: `List the name and signup date of every customer who signed up in ${m.label}.`,
      columns: "name, signup_date",
      solution: `SELECT name, signup_date\nFROM customers\nWHERE signup_date LIKE '${m.key}%';`,
      hint: `Dates are \`YYYY-MM-DD\` text, so a month is a prefix: \`LIKE '${m.key}%'\`.`,
      why: "`%` in LIKE matches any run of characters, so the pattern matches every day of the month. A range on the text (`>= '2024-03-01' AND < '2024-04-01'`) does the same job.",
    }),
  },

  // ---------- Rung 2: two tables ----------
  {
    id: "r2-city-orders",
    rung: 2,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Orders from ${city}`,
      prompt: `List every order placed by a customer who lives in ${city}: the order id and the customer's name.`,
      columns: "order id, customer name",
      solution: `SELECT o.id, c.name\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.city = '${city}';`,
      hint: "orders.customer_id points at customers.id. Join on that, then filter on the customer's city.",
      why: "The city lives on customers and the order id on orders, so the two tables are joined on the foreign key orders.customer_id = customers.id. An inner join is right here: an order always has a customer.",
    }),
  },
  {
    id: "r2-category-products",
    rung: 2,
    params: CATEGORIES,
    key: slug,
    build: (cat: string) => ({
      title: `${cat} products`,
      prompt: `List the name and price of every product in the ${cat} category.`,
      columns: "name, price",
      solution: `SELECT p.name, p.price\nFROM products p\nJOIN categories cat ON cat.id = p.category_id\nWHERE cat.name = '${cat}';`,
      hint: "products only stores category_id. Join categories to filter by the category's name.",
      why: "Filtering on the name rather than a hard-coded id keeps the query right if ids change. The join is products.category_id = categories.id.",
    }),
  },
  {
    id: "r2-department-staff",
    rung: 2,
    params: DEPARTMENTS,
    key: slug,
    build: (dept: string) => ({
      title: `Who works in ${dept}`,
      prompt: `List the name and salary of every employee in the ${dept} department.`,
      columns: "name, salary",
      solution: `SELECT e.name, e.salary\nFROM employees e\nJOIN departments d ON d.id = e.department_id\nWHERE d.name = '${dept}';`,
      hint: "Join employees to departments on department_id and filter on the department name.",
      why: "A two-table inner join on the foreign key, then a filter on the joined table's column.",
    }),
  },
  {
    id: "r2-country-products",
    rung: 2,
    params: COUNTRIES,
    key: slug,
    build: (country: string) => ({
      title: `Products from ${country}`,
      prompt: `List every product made by a supplier based in ${country}: the product name and the supplier name.`,
      columns: "product, supplier",
      solution: `SELECT p.name, s.name\nFROM products p\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE s.country = '${country}';`,
      hint: "products.supplier_id points at suppliers.id.",
      why: "Both tables have a `name` column, so aliases (p, s) say which one you mean; without them the query is ambiguous.",
    }),
  },

  {
    id: "r2-rep-month-orders",
    rung: 2,
    params: cross(REPS, MONTHS),
    key: ([r, m]: [string, { key: string }]) => `${slug(r)}-${m.key}`,
    build: ([rep, m]: [string, { key: string; label: string }]) => ({
      title: `${rep}'s orders in ${m.label}`,
      prompt: `List the id and status of every order that ${rep} handled as sales rep in ${m.label}.`,
      columns: "id, status",
      solution: `SELECT o.id, o.status\nFROM orders o\nJOIN employees e ON e.id = o.employee_id\nWHERE e.name = '${rep}'\n  AND o.order_date LIKE '${m.key}%';`,
      hint: `orders.employee_id is the sales rep. Join employees to filter by name. ${MONTH_NOTE}`,
      why: "Filter by the person's name through the join rather than looking up their id by hand: the query then says what it means and survives new data.",
    }),
  },
  {
    id: "r2-rating-products",
    rung: 2,
    params: [2, 3, 4, 5],
    key: String,
    build: (stars: number) => ({
      title: `Products with a ${stars} star review`,
      prompt: `List the name of every product that has received at least one ${stars} star review. Each product once.`,
      columns: "name",
      solution: `SELECT DISTINCT p.name\nFROM products p\nJOIN reviews r ON r.product_id = p.id\nWHERE r.rating = ${stars};`,
      trap: `SELECT p.name\nFROM products p\nJOIN reviews r ON r.product_id = p.id\nWHERE r.rating = ${stars};`,
      hint: "A product can have several reviews with the same rating. How many times does it come out of the join?",
      why: "A join returns one row per matching pair, so a product with two such reviews appears twice. DISTINCT (or EXISTS) gives each product once.",
    }),
  },

  // ---------- Rung 3: three tables ----------
  {
    id: "r3-month-products",
    rung: 3,
    params: MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Products ordered in ${m.label}`,
      prompt: `List the name of every product that appears in at least one order placed in ${m.label}, whatever the order's status. Each product once.`,
      columns: "name",
      solution: `SELECT DISTINCT p.name\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.order_date LIKE '${m.key}%';`,
      trap: `SELECT p.name\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.order_date LIKE '${m.key}%';`,
      hint: `order_items is the bridge between orders and products: one row per product per order. ${MONTH_NOTE}`,
      why: "Going through a bridge table gives one row per order line, so a product ordered three times shows up three times. \"Each product once\" needs DISTINCT (or GROUP BY p.id).",
    }),
  },
  {
    id: "r3-month-order-reps",
    rung: 3,
    params: MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Who sold what in ${m.label}`,
      prompt: `For every order placed in ${m.label} that has a sales rep, list the order id, the customer's name and the sales rep's name. Orders with no rep are left out.`,
      columns: "order id, customer, rep",
      solution: `SELECT o.id, c.name, e.name\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nJOIN employees e ON e.id = o.employee_id\nWHERE o.order_date LIKE '${m.key}%';`,
      hint: "orders has two foreign keys here: customer_id and employee_id. Join each table on its own key.",
      why: "One fact table joined to two lookup tables. An inner join to employees drops orders whose employee_id is NULL, which is exactly what this question wants; rung 5 is about keeping them.",
    }),
  },
  {
    id: "r3-category-suppliers",
    rung: 3,
    params: CATEGORIES,
    key: slug,
    build: (cat: string) => ({
      title: `${cat} products and their suppliers`,
      prompt: `List every product in the ${cat} category with the name of its supplier.`,
      columns: "product, supplier",
      solution: `SELECT p.name, s.name\nFROM products p\nJOIN categories cat ON cat.id = p.category_id\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE cat.name = '${cat}';`,
      hint: "Start from products: it holds both foreign keys, category_id and supplier_id.",
      why: "When one table holds the keys to two others, start from it and join outwards. Each join adds the columns of one more table to every row.",
    }),
  },

  {
    id: "r3-city-reviews",
    rung: 3,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `What ${city} reviewed`,
      prompt: `List every review written by a customer in ${city}: the customer's name, the product's name and the rating.`,
      columns: "customer, product, rating",
      solution: `SELECT c.name, p.name, r.rating\nFROM reviews r\nJOIN customers c ON c.id = r.customer_id\nJOIN products p ON p.id = r.product_id\nWHERE c.city = '${city}';`,
      hint: "reviews is a bridge between customers and products: it holds a key to each.",
      why: "A bridge table with two foreign keys joins to both sides. Starting from reviews makes that shape easy to see.",
    }),
  },
  {
    id: "r3-category-month-orders",
    rung: 3,
    params: cross(CATEGORIES, MONTHS),
    key: ([c, m]: [string, { key: string }]) => `${slug(c)}-${m.key}`,
    build: ([cat, m]: [string, { key: string; label: string }]) => ({
      title: `${cat} orders in ${m.label}`,
      prompt: `List the id of every order placed in ${m.label} that contains at least one ${cat} product. Each order once.`,
      columns: "order id",
      solution: `SELECT DISTINCT oi.order_id\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nJOIN orders o ON o.id = oi.order_id\nWHERE cat.name = '${cat}'\n  AND o.order_date LIKE '${m.key}%';`,
      hint: `Start from order_items: it links orders to products. ${MONTH_NOTE}`,
      why: "Three hops from the line to the category, plus orders for the date. An order with two products from the category would come out twice, so DISTINCT.",
    }),
  },

  // ---------- Rung 4: four or more tables ----------
  {
    id: "r4-category-buyers",
    rung: 4,
    params: CATEGORIES,
    key: slug,
    build: (cat: string) => ({
      title: `Who bought ${cat}`,
      prompt: `List the name of every customer who has ordered at least one ${cat} product, whatever the order's status. Each customer once.`,
      columns: "name",
      solution: `SELECT DISTINCT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nWHERE cat.name = '${cat}';`,
      trap: `SELECT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nWHERE cat.name = '${cat}';`,
      hint: "The path is customers, orders, order_items, products, categories. Write the joins in that order, one foreign key at a time.",
      why: "Five tables, but each join is the same move: follow one foreign key. A customer who bought two such products, or bought in two orders, comes out once per line, so DISTINCT is needed. `WHERE c.id IN (subquery)` or EXISTS also work and avoid the duplicates in the first place.",
    }),
  },
  {
    id: "r4-city-revenue",
    rung: 4,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Spend per customer in ${city}`,
      prompt: `For every customer in ${city} who has at least one shipped order, give their name and their total spend on shipped orders (quantity times product price, summed).`,
      columns: "name, total",
      solution: `SELECT c.name, ${REVENUE}\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE c.city = '${city}'\n  AND o.status = 'shipped'\nGROUP BY c.id, c.name;`,
      hint: "Join down to order_items and products so each row is one order line, then GROUP BY the customer and SUM(quantity * price).",
      why: "The amount lives on the line (quantity) and the product (price), so the join has to reach both before SUM can work. Group by the customer's id as well as the name: two customers can share a name.",
    }),
  },
  {
    id: "r4-category-units",
    rung: 4,
    params: CATEGORIES,
    key: slug,
    build: (cat: string) => ({
      title: `Units sold in ${cat}`,
      prompt: `For every ${cat} product that appears in a shipped order, give its name and the total quantity shipped.`,
      columns: "name, units",
      solution: `SELECT p.name, SUM(oi.quantity)\nFROM products p\nJOIN categories cat ON cat.id = p.category_id\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = oi.order_id\nWHERE cat.name = '${cat}'\n  AND o.status = 'shipped'\nGROUP BY p.id, p.name;`,
      hint: "The status is on orders, so the join has to reach orders even though no column from it is shown.",
      why: "A table can be joined only to filter on it. Here orders contributes nothing to the output but its status decides which lines count.",
    }),
  },
  {
    id: "r4-month-category-revenue",
    rung: 4,
    params: MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Revenue by category, ${m.label}`,
      prompt: `For shipped orders placed in ${m.label}, give each category's revenue (quantity times price). Only categories that sold something.`,
      columns: "category, revenue",
      solution: `SELECT cat.name, ${REVENUE}\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nWHERE o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY cat.id, cat.name;`,
      hint: `orders, order_items, products, categories, then GROUP BY the category. ${MONTH_NOTE}`,
      why: "Filter first (WHERE on status and month), then group what is left. Grouping by category rolls every line of every matching order into its category's total.",
    }),
  },
  {
    id: "r4-month-country-revenue",
    rung: 4,
    params: MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Revenue by supplier country, ${m.label}`,
      prompt: `For shipped orders placed in ${m.label}, give the revenue (quantity times price) for each supplier country.`,
      columns: "country, revenue",
      solution: `SELECT s.country, ${REVENUE}\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY s.country;`,
      hint: "Group by a column that is not a key: s.country. Two suppliers in the same country add up together.",
      why: "GROUP BY can use any column, not just ids. Grouping by country merges the USA's two suppliers into one row, which is what the question asks.",
    }),
  },

  {
    id: "r4-country-month-products",
    rung: 4,
    params: cross(COUNTRIES, MONTHS),
    key: ([c, m]: [string, { key: string }]) => `${slug(c)}-${m.key}`,
    build: ([country, m]: [string, { key: string; label: string }]) => ({
      title: `${country} products sold in ${m.label}`,
      prompt: `List the name of every product from a supplier in ${country} that appears in a shipped order placed in ${m.label}. Each product once.`,
      columns: "name",
      solution: `SELECT DISTINCT p.name\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE s.country = '${country}'\n  AND o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%';`,
      hint: `orders, order_items, products, suppliers. Three conditions in WHERE. ${MONTH_NOTE}`,
      why: "A long join path is still just one foreign key per join. Conditions can sit on any table in the chain.",
    }),
  },
  {
    id: "r4-city-categories",
    rung: 4,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Categories ${city} buys`,
      prompt: `List every category that customers in ${city} have ordered from (any status). Each category once.`,
      columns: "category",
      solution: `SELECT DISTINCT cat.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nWHERE c.city = '${city}';`,
      trap: `SELECT cat.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nWHERE c.city = '${city}';`,
      hint: "Five tables from the customer to the category. Then make each category appear once.",
      why: "Every order line becomes a row, so a popular category repeats many times. DISTINCT collapses them; GROUP BY cat.id, cat.name would too.",
    }),
  },

  // ---------- Rung 5: outer joins ----------
  {
    id: "r5-city-never-ordered",
    rung: 5,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `${city} customers who never ordered`,
      prompt: `List the name of every customer in ${city} who has never placed an order.`,
      columns: "name",
      solution: `SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE c.city = '${city}'\n  AND o.id IS NULL;`,
      hint: "An inner join can only return customers who have orders. Keep every customer with LEFT JOIN, then look for the rows where the order side is NULL.",
      why: "LEFT JOIN keeps every customer and fills the order columns with NULL when there is no match, so `o.id IS NULL` finds exactly the customers with no orders. `NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)` is the other standard answer.",
    }),
  },
  {
    id: "r5-category-never-sold",
    rung: 5,
    params: CATEGORIES,
    key: slug,
    build: (cat: string) => ({
      title: `${cat} products nobody ordered`,
      prompt: `List every product in the ${cat} category that has never appeared in any order.`,
      columns: "name",
      solution: `SELECT p.name\nFROM products p\nJOIN categories cat ON cat.id = p.category_id\nLEFT JOIN order_items oi ON oi.product_id = p.id\nWHERE cat.name = '${cat}'\n  AND oi.order_id IS NULL;`,
      hint: "Inner join to categories (every product has one), LEFT JOIN to order_items, then keep the rows with no order line.",
      why: "Inner and outer joins mix freely: the join to categories must match, the join to order_items is allowed to miss. Test a column that can't be NULL in a real match, such as order_id.",
    }),
  },
  {
    id: "r5-city-order-counts",
    rung: 5,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Order counts in ${city}, zeros included`,
      prompt: `For every customer in ${city}, give their name and how many orders they have placed. Customers with no orders must appear with 0.`,
      columns: "name, orders",
      solution: `SELECT c.name, COUNT(o.id)\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE c.city = '${city}'\nGROUP BY c.id, c.name;`,
      trap: `SELECT c.name, COUNT(*)\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE c.city = '${city}'\nGROUP BY c.id, c.name;`,
      hint: "LEFT JOIN keeps the customers with no orders. Then think about what COUNT(*) counts for them.",
      why: "A customer with no orders still gets one row from the LEFT JOIN, with NULLs on the order side. COUNT(*) counts that row and reports 1; COUNT(o.id) skips NULLs and reports 0.",
    }),
  },
  {
    id: "r5-city-status-counts",
    rung: 5,
    params: cross(CITIES, STATUSES),
    key: ([c, s]: [string, string]) => `${slug(c)}-${s}`,
    build: ([city, status]: [string, string]) => ({
      title: `${status[0].toUpperCase()}${status.slice(1)} orders per ${city} customer`,
      prompt: `For every customer in ${city}, give their name and the number of their orders with status '${status}'. Every ${city} customer must appear, with 0 if they have none.`,
      columns: "name, orders",
      solution: `SELECT c.name, COUNT(o.id)\nFROM customers c\nLEFT JOIN orders o\n  ON o.customer_id = c.id AND o.status = '${status}'\nWHERE c.city = '${city}'\nGROUP BY c.id, c.name;`,
      trap: `SELECT c.name, COUNT(o.id)\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE c.city = '${city}'\n  AND o.status = '${status}'\nGROUP BY c.id, c.name;`,
      hint: "Where does the status condition go? Try it in WHERE first and see who disappears.",
      why: "A condition on the right-hand table belongs in the ON clause of a LEFT JOIN. In WHERE it runs after the join, the NULL rows fail `o.status = ...`, and the customers you meant to keep with 0 vanish: the LEFT JOIN has quietly become an inner join.",
    }),
  },
  {
    id: "r5-month-rep-counts",
    rung: 5,
    params: MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Sales team orders in ${m.label}`,
      prompt: `For every employee in the Sales department, give their name and the number of orders they handled in ${m.label}, with 0 for anyone who handled none.`,
      columns: "name, orders",
      solution: `SELECT e.name, COUNT(o.id)\nFROM employees e\nJOIN departments d ON d.id = e.department_id\nLEFT JOIN orders o\n  ON o.employee_id = e.id AND o.order_date LIKE '${m.key}%'\nWHERE d.name = 'Sales'\nGROUP BY e.id, e.name;`,
      trap: `SELECT e.name, COUNT(o.id)\nFROM employees e\nJOIN departments d ON d.id = e.department_id\nLEFT JOIN orders o ON o.employee_id = e.id\nWHERE d.name = 'Sales'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY e.id, e.name;`,
      hint: "Start from employees so nobody is lost, and put the month condition where it can't remove an employee.",
      why: "The filter on departments is about which employees to show, so it goes in WHERE. The month filter is about which orders to count, so it goes in the LEFT JOIN's ON. Mixing those up is the most common outer join bug.",
    }),
  },
  {
    id: "r5-lookup-counts",
    rung: 5,
    params: ["categories", "suppliers"],
    key: String,
    build: (table: string) => {
      const fk = table === "categories" ? "category_id" : "supplier_id";
      const one = table === "categories" ? "category" : "supplier";
      return {
        title: `Products per ${one}, empty ones included`,
        prompt: `For every ${one}, give its name and how many products it has. A ${one} with no products must appear with 0.`,
        columns: `${one}, products`,
        solution: `SELECT t.name, COUNT(p.id)\nFROM ${table} t\nLEFT JOIN products p ON p.${fk} = t.id\nGROUP BY t.id, t.name;`,
        trap: `SELECT t.name, COUNT(p.id)\nFROM ${table} t\nJOIN products p ON p.${fk} = t.id\nGROUP BY t.id, t.name;`,
        hint: `Start from ${table}, not products, and keep the ones with no match.`,
        why: `Starting from the table whose every row must appear, then LEFT JOIN, is what keeps the empty ${one}. An inner join silently drops it.`,
      };
    },
  },

  {
    id: "r5-city-never-reviewed",
    rung: 5,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `${city} customers with no reviews`,
      prompt: `List the name of every customer in ${city} who has never written a review.`,
      columns: "name",
      solution: `SELECT c.name\nFROM customers c\nLEFT JOIN reviews r ON r.customer_id = c.id\nWHERE c.city = '${city}'\n  AND r.customer_id IS NULL;`,
      hint: "LEFT JOIN reviews, then keep the customers where the review side is empty.",
      why: "The anti-join pattern again: LEFT JOIN, then `IS NULL` on a column that is never NULL in a real match. NOT EXISTS is the equivalent.",
    }),
  },
  {
    id: "r5-category-review-counts",
    rung: 5,
    params: CATEGORIES,
    key: slug,
    build: (cat: string) => ({
      title: `Reviews per ${cat} product`,
      prompt: `For every product in the ${cat} category, give its name and its number of reviews, with 0 for products nobody reviewed.`,
      columns: "name, reviews",
      solution: `SELECT p.name, COUNT(r.product_id)\nFROM products p\nJOIN categories cat ON cat.id = p.category_id\nLEFT JOIN reviews r ON r.product_id = p.id\nWHERE cat.name = '${cat}'\nGROUP BY p.id, p.name;`,
      trap: `SELECT p.name, COUNT(*)\nFROM products p\nJOIN categories cat ON cat.id = p.category_id\nLEFT JOIN reviews r ON r.product_id = p.id\nWHERE cat.name = '${cat}'\nGROUP BY p.id, p.name;`,
      hint: "Count a column from the reviews side, not every row.",
      why: "COUNT(column) skips NULLs and COUNT(*) does not. After a LEFT JOIN, a product with no reviews has one row of NULLs: COUNT(*) says 1, COUNT(r.product_id) says 0.",
    }),
  },

  // ---------- Rung 6: self joins ----------
  {
    id: "r6-department-managers",
    rung: 6,
    params: DEPARTMENTS,
    key: slug,
    build: (dept: string) => ({
      title: `${dept} and their managers`,
      prompt: `For every employee in ${dept}, give their name and their manager's name. Someone with no manager still appears, with NULL as the manager.`,
      columns: "employee, manager",
      solution: `SELECT e.name, m.name\nFROM employees e\nJOIN departments d ON d.id = e.department_id\nLEFT JOIN employees m ON m.id = e.manager_id\nWHERE d.name = '${dept}';`,
      trap: `SELECT e.name, m.name\nFROM employees e\nJOIN departments d ON d.id = e.department_id\nJOIN employees m ON m.id = e.manager_id\nWHERE d.name = '${dept}';`,
      hint: "Use employees twice with two aliases: e for the employee and m for the manager. The head of the department has manager_id NULL.",
      why: "A self join is an ordinary join where both sides happen to be the same table; the aliases keep them apart. It has to be a LEFT JOIN or the department head, whose manager_id is NULL, drops out.",
    }),
  },
  {
    id: "r6-earns-more-than-manager",
    rung: 6,
    params: DEPARTMENTS,
    key: slug,
    build: (dept: string) => ({
      title: `Out-earning the boss in ${dept}`,
      prompt: `List every employee in ${dept} who earns more than their own manager: the employee's name, their salary and the manager's salary.`,
      columns: "name, salary, manager salary",
      solution: `SELECT e.name, e.salary, m.salary\nFROM employees e\nJOIN employees m ON m.id = e.manager_id\nJOIN departments d ON d.id = e.department_id\nWHERE d.name = '${dept}'\n  AND e.salary > m.salary;`,
      hint: "Join employees to itself on e.manager_id = m.id, then compare the two salary columns in WHERE.",
      why: "Once both rows are side by side in one result row, comparing them is a plain WHERE. An inner join is fine here: someone with no manager can't out-earn one.",
    }),
  },
  {
    id: "r6-referrals-from-city",
    rung: 6,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Referred by someone in ${city}`,
      prompt: `customers.referred_by holds the id of the customer who referred them. List every customer whose referrer lives in ${city}: the customer's name and the referrer's name.`,
      columns: "customer, referrer",
      solution: `SELECT c.name, r.name\nFROM customers c\nJOIN customers r ON r.id = c.referred_by\nWHERE r.city = '${city}';`,
      hint: "Two copies of customers: c for the customer and r for the referrer. The city condition is on r.",
      why: "The filter has to name the right copy of the table. `c.city` would ask where the referred customer lives, a different question.",
    }),
  },
  {
    id: "r6-city-referred-customers",
    rung: 6,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `How ${city} customers were referred`,
      prompt: `For every customer in ${city}, give their name, the name of the customer who referred them and that referrer's city. Customers nobody referred still appear, with NULLs.`,
      columns: "customer, referrer, referrer city",
      solution: `SELECT c.name, r.name, r.city\nFROM customers c\nLEFT JOIN customers r ON r.id = c.referred_by\nWHERE c.city = '${city}';`,
      trap: `SELECT c.name, r.name, r.city\nFROM customers c\nJOIN customers r ON r.id = c.referred_by\nWHERE c.city = '${city}';`,
      hint: "Most customers have referred_by NULL. Which join keeps them?",
      why: "A self join is still a join: an inner join drops the rows with no match, here everyone nobody referred. LEFT JOIN keeps them with NULLs for the referrer's columns.",
    }),
  },
  {
    id: "r6-shared-manager-pairs",
    rung: 6,
    params: DEPARTMENTS,
    key: slug,
    build: (dept: string) => ({
      title: `Teammates in ${dept}`,
      prompt: `List every pair of employees in ${dept} who report to the same manager. Show each pair once, with the employee with the smaller id first.`,
      columns: "employee, teammate",
      solution: `SELECT a.name, b.name\nFROM employees a\nJOIN employees b\n  ON b.manager_id = a.manager_id AND a.id < b.id\nJOIN departments d ON d.id = a.department_id\nWHERE d.name = '${dept}';`,
      trap: `SELECT a.name, b.name\nFROM employees a\nJOIN employees b\n  ON b.manager_id = a.manager_id AND a.id <> b.id\nJOIN departments d ON d.id = a.department_id\nWHERE d.name = '${dept}';`,
      hint: "Join employees to itself on the same manager_id. Then stop a person pairing with themselves, and stop each pair appearing twice.",
      why: "`a.id <> b.id` removes self pairs but still gives (Ava, Marcus) and (Marcus, Ava). `a.id < b.id` keeps exactly one order of each pair. NULL manager ids never match each other, so the heads don't pair up.",
    }),
  },

  {
    id: "r6-skip-level",
    rung: 6,
    params: DEPARTMENTS,
    key: slug,
    build: (dept: string) => ({
      title: `Skip-level managers in ${dept}`,
      prompt: `For every employee in ${dept} whose manager also has a manager, give the employee's name, their manager's name and their manager's manager's name.`,
      columns: "employee, manager, manager's manager",
      solution: `SELECT e.name, m.name, mm.name\nFROM employees e\nJOIN employees m ON m.id = e.manager_id\nJOIN employees mm ON mm.id = m.manager_id\nJOIN departments d ON d.id = e.department_id\nWHERE d.name = '${dept}';`,
      hint: "Three copies of employees: e, m and mm. Each join goes one level up.",
      why: "A self join can repeat: each extra copy climbs one level. Inner joins drop anyone without two levels above them, which is what the question asks. For any depth you'd use a recursive CTE.",
    }),
  },
  {
    id: "r6-referral-counts",
    rung: 6,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Who in ${city} refers people`,
      prompt: `For every customer in ${city} who has referred at least one other customer, give their name and how many customers they referred.`,
      columns: "name, referred",
      solution: `SELECT r.name, COUNT(*)\nFROM customers r\nJOIN customers c ON c.referred_by = r.id\nWHERE r.city = '${city}'\nGROUP BY r.id, r.name;`,
      hint: "Join customers to itself on c.referred_by = r.id, then group by the referrer.",
      why: "A self join followed by GROUP BY on one side counts the matches on the other side, the same as any one-to-many join.",
    }),
  },

  // ---------- Rung 7: aggregates over joins ----------
  {
    id: "r7-repeat-shippers",
    rung: 7,
    params: [3, 4, 5],
    key: String,
    build: (n: number) => ({
      title: `Customers with ${n} or more shipped orders`,
      prompt: `List every customer with at least ${n} shipped orders: their name and how many shipped orders they have.`,
      columns: "name, orders",
      solution: `SELECT c.name, COUNT(*)\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= ${n};`,
      hint: "WHERE filters rows before grouping; HAVING filters groups after. Which one can see COUNT?",
      why: "The status test is about single rows, so WHERE. The count test is about a whole group, so HAVING. An aggregate in WHERE is an error because the groups don't exist yet.",
    }),
  },
  {
    id: "r7-city-orders-and-units",
    rung: 7,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Orders and units per ${city} customer`,
      prompt: `For every customer in ${city} who has ordered, give their name, the number of orders they placed (any status) and the total number of units across those orders.`,
      columns: "name, orders, units",
      solution: `SELECT c.name, COUNT(DISTINCT o.id), SUM(oi.quantity)\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nWHERE c.city = '${city}'\nGROUP BY c.id, c.name;`,
      trap: `SELECT c.name, COUNT(o.id), SUM(oi.quantity)\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nWHERE c.city = '${city}'\nGROUP BY c.id, c.name;`,
      hint: "After joining order_items there is one row per order line, not per order. What does COUNT(o.id) count then?",
      why: "Joining to a child table multiplies the parent's rows: an order with three lines appears three times. SUM(quantity) wants every line, but the order count must be COUNT(DISTINCT o.id). This fan-out is the most common wrong total in real reports.",
    }),
  },
  {
    id: "r7-month-big-categories",
    rung: 7,
    params: cross(MONTHS, [300, 600]),
    key: ([m, v]: [{ key: string }, number]) => `${m.key}-${v}`,
    build: ([m, v]: [{ key: string; label: string }, number]) => ({
      title: `Categories over ${v} in ${m.label}`,
      prompt: `For shipped orders placed in ${m.label}, list each category whose revenue (quantity times price) was more than ${v}, with that revenue.`,
      columns: "category, revenue",
      solution: `SELECT cat.name, ${REVENUE}\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nWHERE o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY cat.id, cat.name\nHAVING ${REVENUE} > ${v};`,
      trap: `SELECT cat.name, ${REVENUE}\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nWHERE o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY cat.id, cat.name;`,
      hint: `Build the revenue per category first (rung 4), then filter the groups. ${MONTH_NOTE}`,
      why: "HAVING can repeat the aggregate expression (or use its alias in SQLite and MySQL). The month and status filters stay in WHERE so they run before grouping.",
    }),
  },
  {
    id: "r7-well-reviewed",
    rung: 7,
    params: [3.5, 4, 4.5],
    key: (r: number) => String(r).replace(".", "p"),
    build: (r: number) => ({
      title: `Products rated ${r} or better`,
      prompt: `List every product with at least two reviews and an average rating of ${r} or more: the product name and its average rating.`,
      columns: "name, average rating",
      solution: `SELECT p.name, AVG(r.rating)\nFROM products p\nJOIN reviews r ON r.product_id = p.id\nGROUP BY p.id, p.name\nHAVING COUNT(*) >= 2 AND AVG(r.rating) >= ${r};`,
      trap: `SELECT p.name, AVG(r.rating)\nFROM products p\nJOIN reviews r ON r.product_id = p.id\nGROUP BY p.id, p.name\nHAVING AVG(r.rating) >= ${r};`,
      hint: "Two conditions on the group: how many reviews, and their average. Both go in HAVING.",
      why: "One five star review is a perfect average, which is why real rankings demand a minimum count. HAVING takes any number of aggregate conditions joined with AND.",
    }),
  },

  {
    id: "r7-month-rep-orders-revenue",
    rung: 7,
    params: MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Sales rep results, ${m.label}`,
      prompt: `For each sales rep with shipped orders placed in ${m.label}, give their name, the number of those orders and their revenue (quantity times price).`,
      columns: "name, orders, revenue",
      solution: `SELECT e.name, COUNT(DISTINCT o.id), ${REVENUE}\nFROM employees e\nJOIN orders o ON o.employee_id = e.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY e.id, e.name;`,
      trap: `SELECT e.name, COUNT(o.id), ${REVENUE}\nFROM employees e\nJOIN orders o ON o.employee_id = e.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY e.id, e.name;`,
      hint: "The revenue needs the order lines, but the order count must not count lines.",
      why: "Once order_items is joined, each order appears once per line. SUM over lines is right for revenue; the order count needs COUNT(DISTINCT o.id).",
    }),
  },
  {
    id: "r7-month-big-cities",
    rung: 7,
    params: cross(MONTHS, [300, 700]),
    key: ([m, v]: [{ key: string }, number]) => `${m.key}-${v}`,
    build: ([m, v]: [{ key: string; label: string }, number]) => ({
      title: `Cities spending over ${v} in ${m.label}`,
      prompt: `For shipped orders placed in ${m.label}, list each customer city whose total spend (quantity times price) was more than ${v}, with that total.`,
      columns: "city, total",
      solution: `SELECT c.city, ${REVENUE}\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY c.city\nHAVING ${REVENUE} > ${v};`,
      trap: `SELECT c.city, ${REVENUE}\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status = 'shipped'\n  AND o.order_date LIKE '${m.key}%'\nGROUP BY c.city;`,
      hint: "Group by the city, then filter the groups with HAVING.",
      why: "Rows are filtered by WHERE before grouping and groups by HAVING after. The threshold is on a total, so it can only be HAVING.",
    }),
  },

  // ---------- Rung 8: mixed ----------
  {
    id: "r8-city-never-category",
    rung: 8,
    params: cross(CITIES, CATEGORIES.filter((c) => c !== "Toys")),
    key: ([c, cat]: [string, string]) => `${slug(c)}-${slug(cat)}`,
    build: ([city, cat]: [string, string]) => ({
      title: `${city} shoppers who skip ${cat}`,
      prompt: `List every customer in ${city} who has placed at least one order but has never ordered a ${cat} product (any status).`,
      columns: "name",
      solution: `SELECT c.name\nFROM customers c\nWHERE c.city = '${city}'\n  AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)\n  AND NOT EXISTS (\n    SELECT 1\n    FROM orders o\n    JOIN order_items oi ON oi.order_id = o.id\n    JOIN products p ON p.id = oi.product_id\n    JOIN categories cat ON cat.id = p.category_id\n    WHERE o.customer_id = c.id AND cat.name = '${cat}'\n  );`,
      trap: `SELECT DISTINCT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN categories cat ON cat.id = p.category_id\nWHERE c.city = '${city}'\n  AND cat.name <> '${cat}';`,
      hint: "\"Never ordered X\" is a question about all of a customer's rows at once. A join with `<> 'X'` only looks at one row at a time.",
      why: "Joining and filtering `cat.name <> ...` finds customers who bought something else, which includes people who also bought the category. \"Never\" needs NOT EXISTS (or NOT IN, or LEFT JOIN ... IS NULL against the set of buyers), and \"has ordered\" is a separate EXISTS.",
    }),
  },
  {
    id: "r8-bought-not-reviewed",
    rung: 8,
    params: CATEGORIES,
    key: slug,
    build: (cat: string) => ({
      title: `${cat}: bought but never reviewed`,
      prompt: `List every ${cat} product that has been ordered at least once but has no reviews at all.`,
      columns: "name",
      solution: `SELECT p.name\nFROM products p\nJOIN categories cat ON cat.id = p.category_id\nWHERE cat.name = '${cat}'\n  AND EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)\n  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.product_id = p.id);`,
      hint: "One condition that must match (EXISTS) and one that must not (NOT EXISTS), side by side.",
      why: "EXISTS and NOT EXISTS answer yes or no questions about related rows without multiplying the outer rows, so there is nothing to DISTINCT away. A LEFT JOIN to reviews with `IS NULL` plus a join to order_items works too, but needs DISTINCT.",
    }),
  },
  {
    id: "r8-city-unused-suppliers",
    rung: 8,
    params: CITIES,
    key: slug,
    build: (city: string) => ({
      title: `Suppliers ${city} never buys from`,
      prompt: `List every supplier that has at least one product, but none of whose products has ever been ordered by a customer in ${city}.`,
      columns: "supplier",
      solution: `SELECT s.name\nFROM suppliers s\nWHERE EXISTS (SELECT 1 FROM products p WHERE p.supplier_id = s.id)\n  AND NOT EXISTS (\n    SELECT 1\n    FROM products p\n    JOIN order_items oi ON oi.product_id = p.id\n    JOIN orders o ON o.id = oi.order_id\n    JOIN customers c ON c.id = o.customer_id\n    WHERE p.supplier_id = s.id AND c.city = '${city}'\n  );`,
      hint: "Inside NOT EXISTS, walk from the supplier's products all the way to the customer's city.",
      why: "The subquery is a four-table join correlated on `p.supplier_id = s.id`. The EXISTS on products rules out the supplier with no products at all, which would otherwise pass trivially.",
    }),
  },
  {
    id: "r8-month-top-product-per-category",
    rung: 8,
    params: MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Best seller per category, ${m.label}`,
      prompt: `For shipped orders placed in ${m.label}, find the product with the most units sold in each category: the category, the product and its units. If two products tie, show both.`,
      columns: "category, product, units",
      solution: `WITH units AS (\n  SELECT p.id, p.name, p.category_id, SUM(oi.quantity) AS units\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE o.status = 'shipped' AND o.order_date LIKE '${m.key}%'\n  GROUP BY p.id, p.name, p.category_id\n)\nSELECT cat.name, u.name, u.units\nFROM units u\nJOIN categories cat ON cat.id = u.category_id\nWHERE u.units = (\n  SELECT MAX(u2.units) FROM units u2 WHERE u2.category_id = u.category_id\n);`,
      hint: "First a CTE with units per product, then keep the rows that equal their category's maximum.",
      why: "Top N per group: aggregate in a CTE, then compare each row with the best in its group (a correlated MAX, or `RANK() OVER (PARTITION BY category_id ORDER BY units DESC) = 1`). Comparing with the max keeps ties, which LIMIT 1 would not.",
    }),
  },
  {
    id: "r8-month-idle-suppliers",
    rung: 8,
    params: MONTHS,
    key: (m: { key: string }) => m.key,
    build: (m: { key: string; label: string }) => ({
      title: `Suppliers with no sales in ${m.label}`,
      prompt: `List every supplier that has at least one product, but none of whose products appears in an order placed in ${m.label} (any status).`,
      columns: "supplier",
      solution: `SELECT s.name\nFROM suppliers s\nWHERE EXISTS (SELECT 1 FROM products p WHERE p.supplier_id = s.id)\n  AND NOT EXISTS (\n    SELECT 1\n    FROM products p\n    JOIN order_items oi ON oi.product_id = p.id\n    JOIN orders o ON o.id = oi.order_id\n    WHERE p.supplier_id = s.id AND o.order_date LIKE '${m.key}%'\n  );`,
      hint: "NOT EXISTS with a correlated join from the supplier's products to the orders of that month.",
      why: "The month condition belongs inside the subquery: it narrows which sales count, not which suppliers are listed. The outer EXISTS rules out the supplier with no products at all.",
    }),
  },
  {
    id: "r8-ordered-both-months",
    rung: 8,
    params: MONTHS.flatMap((a, i) => MONTHS.slice(i + 1).map((b): [typeof a, typeof b] => [a, b])),
    key: ([a, b]: [{ key: string }, { key: string }]) => `${a.key}-${b.key}`,
    build: ([a, b]: [{ key: string; label: string }, { key: string; label: string }]) => ({
      title: `Ordered in both ${a.label.split(" ")[0]} and ${b.label.split(" ")[0]}`,
      prompt: `List the name of every customer who placed at least one order in ${a.label} and at least one order in ${b.label} (any status).`,
      columns: "name",
      solution: `SELECT c.name\nFROM customers c\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.order_date LIKE '${a.key}%')\n  AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.order_date LIKE '${b.key}%');`,
      trap: `SELECT DISTINCT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.order_date LIKE '${a.key}%'\n   OR o.order_date LIKE '${b.key}%';`,
      hint: "One order can't be in two months. You need two separate checks against a customer's orders.",
      why: "A single WHERE looks at one order row at a time, so `AND` across two months matches nothing and `OR` gives either month. Two EXISTS (or INTERSECT of two queries, or joining orders twice) check the customer's orders twice.",
    }),
  },
];

// Every question the templates can make, before checking which ones are usable.
export function allQuestions(): LadderQuestion[] {
  return TEMPLATES.flatMap((t) => t.params.map((p) => ({ id: `${t.id}:${t.key(p)}`, rung: t.rung, ...t.build(p) })));
}

// Keeps the questions whose reference query returns rows and whose trap, if any, gives a
// different answer. `run` executes SQL on the ladder database (sql.js in the browser,
// node:sqlite in the check script); reference queries only read, so one database will do.
export function usableQuestions(run: (sql: string) => RowsResult): LadderQuestion[] {
  return allQuestions().filter((q) => {
    const want = run(q.solution);
    if (want.values.length === 0) return false;
    if (q.trap && compareResults(run(q.trap), want, false) === null) return false;
    return true;
  });
}
