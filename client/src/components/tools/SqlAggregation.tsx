import { SQL_SAMPLE_SCHEMA } from "../../sqlSampleData";
import { SqlPlayground } from "./SqlPlayground";

const STARTER_QUERY = `SELECT departments.name AS department, COUNT(*) AS headcount, AVG(employees.salary) AS avg_salary
FROM employees
JOIN departments ON employees.department_id = departments.id
GROUP BY departments.name
ORDER BY avg_salary DESC;`;

export function SqlAggregation() {
  return <SqlPlayground schemaSql={SQL_SAMPLE_SCHEMA} starterQuery={STARTER_QUERY} />;
}
