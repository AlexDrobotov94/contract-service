// tooling/generate-types.ts
import { compileFromFile } from "json-schema-to-typescript";
import fs from "fs";
import path from "path";

async function main() {
  const root = process.cwd();

  const jobs = [
    {
      schema: "tooling/schemas/service.schema.json",
      output: "apps/contracts-ui/src/shared/types/service.generated.ts",
      banner:
        "/* AUTO-GENERATED — не редактировать руками. Источник: tooling/schemas/service.schema.json */",
      unreachableDefinitions: false,
    },
    {
      schema: "tooling/schemas/quality.schema.json",
      output: "apps/contracts-ui/src/shared/types/quality.generated.ts",
      banner:
        "/* AUTO-GENERATED — не редактировать руками. Источник: tooling/schemas/quality.schema.json */",
      unreachableDefinitions: true,
    },
  ];

  for (const job of jobs) {
    const schemaPath = path.join(root, job.schema);
    const outputPath = path.join(root, job.output);

    const ts = await compileFromFile(schemaPath, {
      bannerComment: job.banner,
      style: { singleQuote: true },
      additionalProperties: false,
      unreachableDefinitions: job.unreachableDefinitions,
    });

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, ts);
    console.log("✓ types generated →", outputPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
