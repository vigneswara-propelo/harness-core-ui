## Modules

Modules are containers for independent features/products.

### Layering

All modules should start with a number, indicating it's layer.

- Higher numbers _can_ depend on (import from) lower numbers.
- Lower numbers **cannot** import from higher numbers.
- Modules on the same layer **cannot** import from each other.

(eg. `45-project-orgs` can import from `27-platform`, but it cannot import from `70-pipeline`)

This ensures:

- One-way dependencies
- Avoid cyclic dependencies

This is enforced by ESLint rules, which prevent importing components from higher-numbered layers.

### Creating a new module

Criteria for creating a new module:

- If your feature is highly re-usable and multiple other modules might need to depend on it
- If your feature might need to be deployed/built independently in the future

How to create a new module:

- Create a new folder with correct number in the name (eg. `27-platform`)
- Try to leave some space above and below your module layer. i.e. avoid putting modules on consecutive layers.
  This allows for inserting new modules in the future. (eg. `30-secrets` and `31-connectors` would not be future-friendly.)
- Run the script `scripts/generate-eslint-config-for-imports` to automatically generate/update all the required ESLint rules.

### Future Goals / Benefits

With this layering system, in the future we can:

- Move modules to their own repos
- Build/Bundle/Deploy modules on their own
- Load modules dynamically as needed
- Load only those modules which the customer is licensed to use
