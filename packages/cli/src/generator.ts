import type { Property, TypeDef, Specification } from 'sosi-language';
import { createSosiServices, isBuiltinType, isCompositeType, isPropertyDef, isTypeDef } from 'sosi-language';
import { expandToNode, Generated, joinToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractAstNode, extractDestinationAndName } from './util.js';
import { NodeFileSystem } from 'langium/node';
import { propertyName, propertyType, propertyTypeName, typeName } from 'sosi-language/sosi-utils';
import { buildSpecification } from './builder.js';

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
  console.log(sosiSpec);

  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.puml`;

  const allTypes = new Map<string, TypeDef>();
  for (const type of spec.types) {
    addTypes(type, allTypes);
  }

  const plantumlClasses = Array.from(allTypes.values())
      .map(type => plantumlClassForType(type))
      .filter(clazz => clazz !== undefined) as PlantumlClass[];

  const plantumlRelations = Array.from(allTypes.values())
      .flatMap(type => plantumRelationsForType(type))
      .filter(rel => rel !== undefined) as PlantumlRelation[];

  const fileNode = expandToNode`
      @startuml "${spec.name}"
      ${joinToNode(plantumlClasses, plantumlForClass, { appendNewLineIfNotEmpty: true })}
      ${joinToNode(plantumlRelations, plantumlForRelation, { appendNewLineIfNotEmpty: true })}
      @enduml
  `.appendNewLineIfNotEmpty();

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }
  fs.writeFileSync(generatedFilePath, toString(fileNode));
  return generatedFilePath;
}

function addTypes(type: TypeDef, allTypes: Map<string, TypeDef>): void {
  allTypes.set(typeName(type), type);
  if (isCompositeType(type)) {
    for (const prop of type.properties) {
      if (isPropertyDef(prop) && isTypeDef(prop.type)) {
        addTypes(prop.type, allTypes);
      }
    }
  }
}

interface PlantumlClass {
  name: string;
  isAbstract: boolean;
  stereotype?: string;
  properties: PlantumlProperty[];
}

interface PlantumlProperty {
  name: string;
  type: string;
}

interface PlantumlRelation {
  source: string;
  sourceLabel?: string;
  target: string;
  targetLabel?: string;
  label: string;
}

function plantumlClassForType(type: TypeDef): PlantumlClass | undefined {
  if (isCompositeType(type)) {
    return {
      name: typeName(type),
      isAbstract: type.isAbstract,
      stereotype: isCompositeType(type) ? type.kind : undefined,
      properties: type.properties
          .map(plantumlPropertyForProperty)
          .filter(p => p !== undefined) as PlantumlProperty[],
    }
  }
  return undefined;
}

function plantumlPropertyForProperty(prop: Property): PlantumlProperty | undefined {
  const propType = propertyType(prop);
  if (isBuiltinType(propType) || (isCompositeType(propType) && 'data' == propType.kind)) {
    return {
      name: propertyName(prop),
      type: propertyTypeName(prop)
    }
  }
  return undefined
}

function plantumRelationsForType(type: TypeDef): PlantumlRelation[] | undefined {
  if (isCompositeType(type)) {
    return type.properties
        .map(plantumlRelationForProperty)
        .filter(p => p !== undefined) as PlantumlRelation[]
  }
  return undefined;
}

function plantumlRelationForProperty(prop: Property): PlantumlRelation | undefined {
  const propType = propertyType(prop);
  if (isCompositeType(propType) && 'data' !== propType.kind) {
    return {
      source: typeName(prop.$container),
      sourceLabel: undefined,
      target: propertyTypeName(prop),
      targetLabel: undefined,
      label: propertyName(prop)
    }
  }
  return undefined
}

function plantumlForClass(clazz: PlantumlClass): Generated {
  return expandToNode`
    class ${clazz.name} {
        ${joinToNode(clazz.properties, plantumlForProperty, { appendNewLineIfNotEmpty: true })}
    }`;
}

function plantumlForProperty(prop: PlantumlProperty): Generated {
  return `${prop.name}: ${prop.type}`;
}

function plantumlForRelation(rel: PlantumlRelation): Generated {
  return expandToNode`${rel.source} ${rel.sourceLabel} *-> ${rel.targetLabel} ${rel.target}: ${rel.label}`
}
