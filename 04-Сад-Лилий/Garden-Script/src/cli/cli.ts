#!/usr/bin/env node
import { Command } from "commander";
import { loadGardenConfig } from "../core/configLoader.js";
import { validateAndBuildTree, renderGardenTree, getSortedMethods } from "../core/gardenTaxonomy.js";
import { Project } from "ts-morph";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

const program = new Command();
program
  .name("garden-keeper")
  .description("GardenScript validator and renormalizer")
  .version("0.1.0");

program
  .command("validate")
  .argument("<file>", ".ts or .gs file to validate")
  .option("-c, --config <path>", "Path to garden.config.yaml", "garden.config.yaml")
  .action(async (file: string, options: { config: string }) => {
    try {
      const config = await loadGardenConfig(options.config);
      const project = new Project();
      const sourceFile = project.addSourceFileAtPath(file);

      const methods = sourceFile
        .getClasses()
        .flatMap((cls) => cls.getMethods())
        .map((method) => method.getName());

      validateAndBuildTree(methods, config);

      console.log(chalk.green(`✅ ${file} passed GardenScript validation.`));
    } catch (error) {
      console.error(chalk.red("Validation failed:"));
      console.error(error);
      process.exitCode = 1;
    }
  });

program
  .command("print-tree")
  .argument("<file>", "File to inspect")
  .option("-c, --config <path>", "Path to garden.config.yaml", "garden.config.yaml")
  .action(async (file: string, options: { config: string }) => {
    try {
      const config = await loadGardenConfig(options.config);
      const project = new Project();
      const sourceFile = project.addSourceFileAtPath(file);

      const methods = sourceFile
        .getClasses()
        .flatMap((cls) => cls.getMethods())
        .map((method) => method.getName());

      const tree = validateAndBuildTree(methods, config);
      const lines = renderGardenTree(tree);

      console.log(lines.join("\n"));
    } catch (error) {
      console.error(chalk.red("Failed to render tree:"));
      console.error(error);
      process.exitCode = 1;
    }
  });

program
  .command("reorder")
  .argument("<file>", ".ts or .gs file to reorder methods")
  .option("-c, --config <path>", "Path to garden.config.yaml", "garden.config.yaml")
  .action(async (file: string, options: { config: string }) => {
    try {
      const config = await loadGardenConfig(options.config);
      const project = new Project();
      const sourceFile = project.addSourceFileAtPath(file);

      const classes = sourceFile.getClasses();
      if (classes.length === 0) {
        throw new Error("No classes found in the file.");
      }

      const cls = classes[0]; // Assume single class
      const methods = cls.getMethods();

      const methodNames = methods.map((m) => m.getName());
      const tree = validateAndBuildTree(methodNames, config);
      const sortedMethods = getSortedMethods(tree);

      // Collect method details before removing
      const methodDetails = methods.map((method) => ({
        name: method.getName(),
        parameters: method.getParameters().map((p) => ({
          name: p.getName(),
          type: p.getType().getText(),
        })),
        returnType: method.getReturnType().getText(),
        statements: method.getBodyText(),
      }));

      const methodDetailsMap = new Map(methodDetails.map((d) => [d.name, d]));

      // Remove all methods
      cls.getMethods().forEach((m) => m.remove());

      // Re-add in sorted order
      sortedMethods.forEach((name) => {
        const details = methodDetailsMap.get(name)!;
        cls.addMethod({
          name: details.name,
          parameters: details.parameters,
          returnType: details.returnType,
          statements: details.statements,
        });
      });

      // Save the file
      await sourceFile.save();

      console.log(chalk.green(`✅ ${file} methods reordered according to Garden taxonomy.`));
    } catch (error) {
      console.error(chalk.red("Reorder failed:"));
      console.error(error);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
