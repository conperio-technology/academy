import { SQL_SAMPLE_SCHEMA } from "../../sqlSampleData";
import { SqlPlayground } from "./SqlPlayground";

const STARTER_QUERY = `SELECT name, salary
FROM employees
WHERE salary > 70000
ORDER BY salary DESC
LIMIT 5;`;

export function SqlBasics() {
  return <SqlPlayground schemaSql={SQL_SAMPLE_SCHEMA} starterQuery={STARTER_QUERY} />;
}
