/// <reference path="./ecore.xmi.d.ts" />
import { Ecore } from 'ecore/dist/ecore.xmi.js';
import { toString } from 'langium/generate';
import { NodeFileSystem } from 'langium/node';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Specification } from 'sosi-language';
import { createSosiServices } from 'sosi-language';
import { buildSpecification } from './builder.js';
import { buildEcoreResource } from './ecore-builder.js';
import { generatePlantuml as generatePlantumlFromSosiSpecification } from './plantuml-generator.js';
import { extractAstNode, extractDestinationAndName } from './util.js';

export type GeneratorOptions = {
    destination?: string;
}

export type PlantumlGenerateOptions = GeneratorOptions & {
}

export type EcoreGenerateOptions = GeneratorOptions & {
  format?: 'xmi' | 'json';
}

export const generatePlantumlAction = async (fileName: string, options: PlantumlGenerateOptions): Promise<void> => {
    const services = createSosiServices(NodeFileSystem).Sosi;
    const spec = await extractAstNode<Specification>(fileName, services);
    generatePlantuml(spec, fileName, options);
};

export function generatePlantuml(spec: Specification, filePath: string, options: PlantumlGenerateOptions): string {
  const sosiSpec = buildSpecification(spec); // ensure that all types are built before generating UML
  console.dir(sosiSpec, { depth: 6 });
  
  const data = extractDestinationAndName(filePath, options.destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.$puml`;    

  generatePlantumlFromSosiSpecification(sosiSpec, (fileNode) => {
    if (!fs.existsSync(data.destination)) {
      fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
  });
  return generatedFilePath;
}

export const generateEcoreAction = async (fileName: string, options: EcoreGenerateOptions): Promise<void> => {
    const services = createSosiServices(NodeFileSystem).Sosi;
    const spec = await extractAstNode<Specification>(fileName, services);
    generateEcore(spec, fileName, options);
};

export function generateEcore(spec: Specification, filePath: string, options: EcoreGenerateOptions): string {
  console.dir(options, { depth: 6 });
  const resource = buildEcoreResource(spec);
  console.log(resource.to());
  const format = options.format ?? 'json';
  console.log("Format: " + format);
  const content = format === 'xmi' ? resource.to(Ecore.XMI, true) : resource.to();
  console.log(content);

  const data = extractDestinationAndName(filePath, options.destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.${options.format ?? 'json'}`;

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }
  fs.writeFileSync(generatedFilePath, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  return generatedFilePath;
}
