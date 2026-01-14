import { toString } from 'langium/generate';
import { NodeFileSystem } from 'langium/node';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Specification } from 'sosi-language';
import { createSosiServices } from 'sosi-language';
import { buildSpecification } from './builder.js';
import { generatePlantuml as generatePlantumlFromSosiSpecification } from './plantuml-generator.js';
import { extractAstNode, extractDestinationAndName } from './util.js';

export type PlantumlGenerateOptions = {
    destination?: string;
}

export const generatePlantumlAction = async (fileName: string, opts: PlantumlGenerateOptions): Promise<void> => {
    const services = createSosiServices(NodeFileSystem).Sosi;
    const spec = await extractAstNode<Specification>(fileName, services);
    generatePlantuml(spec, fileName, opts.destination);
};

export function generatePlantuml(spec: Specification, filePath: string, destination: string | undefined): string {
  const sosiSpec = buildSpecification(spec); // ensure that all types are built before generating UML
  console.dir(sosiSpec, { depth: 6 });
  
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.puml`;    

  generatePlantumlFromSosiSpecification(sosiSpec, (fileNode) => {
    if (!fs.existsSync(data.destination)) {
      fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
  });
  return generatedFilePath;
}
