// tooling/generate-types.ts
import { compileFromFile } from "json-schema-to-typescript";
import fs from "fs";
import path from "path";

async function main() {
  const root = process.cwd();

  const schema = path.join(root, "tooling/schemas/service.schema.json");
  const output = path.join(
    root,
    "apps/contracts-ui/src/shared/types/service.generated.ts",
  );

  const ts = await compileFromFile(schema, {
    bannerComment:
      "/* AUTO-GENERATED — не редактировать руками. Источник: tooling/schemas/service.schema.json */",
    style: { singleQuote: true },
    additionalProperties: false,
  });

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, ts);
  console.log("✓ types generated →", output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
