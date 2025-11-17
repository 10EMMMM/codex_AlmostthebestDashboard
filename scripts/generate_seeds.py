import csv
from pathlib import Path

TEMPLATES_DIR = Path("docs/templates")
OUTPUT_SQL = Path("docs/generated_seed.sql")

TABLE_ORDER = [
    ("auth_users.csv", "auth.users"),
    ("profiles.csv", "public.profiles"),
    ("account_manager_cities.csv", "public.account_manager_cities"),
    ("requests.csv", "public.requests"),
    ("request_assignments.csv", "public.request_assignments"),
]


def literal(value: str) -> str:
    if value is None or value == "":
        return "NULL"
    clean = value.replace("'", "''")
    return f"'{clean}'"


def main() -> None:
    statements = ["BEGIN;"]
    for filename, table_name in TABLE_ORDER:
        filepath = TEMPLATES_DIR / filename
        if not filepath.exists():
            continue
        with filepath.open(encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cols = ", ".join(reader.fieldnames)
                values = ", ".join(literal(row[col]) for col in reader.fieldnames)
                statements.append(
                    f"INSERT INTO {table_name} ({cols}) VALUES ({values});"
                )
    statements.append("COMMIT;")
    OUTPUT_SQL.write_text("\n".join(statements) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
