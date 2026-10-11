import { SQL_SAMPLE_SCHEMA } from "../../sqlSampleData";
import { SqlPlayground } from "./SqlPlayground";

const STARTER_QUERY = `SELECT employees.name, departments.name AS department, employees.salary
FROM employees
JOIN departments ON employees.department_id = departments.id
ORDER BY employees.salary DESC;`;

export function SqlJoins() {
  return <SqlPlayground schemaSql={SQL_SAMPLE_SCHEMA} starterQuery={STARTER_QUERY} />;
}
