import type { Property, Type, Specification } from 'sosi-language';
import { isBuiltinType, isCompositeType, isInlineType } from 'sosi-language';
import { expandToNode, Generated, joinToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractDestinationAndName } from './util.js';
import { typeName } from '../../language/src/sosi-utils.js';

export function generatePlantuml(spec: Specification, filePath: string, destination: string | undefined): string {
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.puml`;

  const allTypes = new Map<string, Type>();
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

function addTypes(type: Type, allTypes: Map<string, Type>): void {
  allTypes.set(typeName(type), type);
  if (isCompositeType(type)) {
    for (const prop of type.properties) {
      if (isInlineType(prop.type)) {
        addTypes(prop.type.typeDef, allTypes);
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

function plantumlClassForType(type: Type): PlantumlClass | undefined {
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
      name: prop.name,
      type: propertyTypeName(prop)
    }
  }
  return undefined
}

function plantumRelationsForType(type: Type): PlantumlRelation[] | undefined {
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
      label: prop.name
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

function propertyType(prop: Property): Type | undefined {
  if (isInlineType(prop.type)) {
    return prop.type.typeDef;
  }
  return prop.type.typeRef.ref!;
}

function propertyTypeName(prop: Property): string {
    return propertyType(prop)?.name ?? "unknown";
}
