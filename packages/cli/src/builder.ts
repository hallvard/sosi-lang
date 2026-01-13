import { BuiltinType, CompositeType, DomainMapping, EnumType, isBuiltinType, isCompositeType, isEnumType, isOneOrMoreMultiplicity, isPropertyDef, isPropertyRef, isSomeMultiplicity, isTypeDef, isZeroOrOneMultiplicity, Multiplicity, Property, Specification, Tag, TypeDef } from "sosi-language";
import {
  BuiltinType as BuiltinSosiType,
  CompositeType as CompositeSosiType,
  CompositeTypeProperty,
  EnumType as EnumSosiType,
  isA,
  nameString,
  PropertyKind,
  DomainMapping as SosiDomainMapping,
  Multiplicity as SosiMultiplicity,
  SosiSpecification,
  Tag as SosiTag,
  SosiType
} from "./model.js";

interface BuilderContext {
  typeMap: Map<string, SosiType>;
}

function typeQname(type: TypeDef): string[] {
  return type.name.split('.');
}

export function buildSpecification(spec: Specification): SosiSpecification {
  const typeMap = new Map<string, SosiType>();
  return {
    entityType: 'specification',
    name: string2Qname(spec.name),
    description: spec.description,
    tags: buildTags(spec.tags),
    types: spec.types.map(type => buildType(type, { typeMap }))
  };
}

function string2Qname(str: string): string[] {
  return str.split('.');
}

function buildTags(tags: Tag[]): SosiTag[] {
  return tags.map(tag => ({
    name: string2Qname(tag.name),
    value: tag.value ? tag.value.value : true
  }));
}

function buildType(type: TypeDef, context: BuilderContext): SosiType {
  if (isBuiltinType(type)) {
    return buildBuiltinType(type);
  } else if (isEnumType(type)) {
    return buildEnumType(type);
  } else if (isCompositeType(type)) {
    return buildCompositeType(type, context);
  }
  throw new Error("Unsupported type: " + type);
}

function buildReferencedType<T extends TypeDef>(type: TypeDef, context: BuilderContext): SosiType {
  const qnameString = nameString(typeQname(type));
  if (! context.typeMap.has(qnameString)) {
    const sosiType = buildType(type, context);
    context.typeMap.set(qnameString, sosiType);
  }
  return context.typeMap.get(qnameString)!;
}

function buildCompositeType(type: CompositeType, context: BuilderContext): CompositeSosiType {
  const superTypes = new Array<CompositeSosiType>
  for (const ref of type.extends) {
    if (isTypeDef(ref.$refNode)) {
      const sosiType = buildReferencedType(ref.$refNode, context);
      if (isA(sosiType, 'compositeType')) {
        superTypes.push(sosiType as CompositeSosiType);
      }
    }
  }
  const compositeType: CompositeSosiType = {
    entityType: 'compositeType',
    name: string2Qname(type.name),
    description: type.description,
    tags: buildTags(type.tags),
    isAbstract: type.isAbstract ?? false,
    kind: type.kind ?? 'feature',
    superTypes: superTypes.map(superType => ({
      qname: superType.name,
      element: superType
    })),
    properties: type.properties.map(prop => buildCompositeTypeProperty(prop, context))
  };
  context.typeMap.set(type.name, compositeType);
  return compositeType;
}

function buildCompositeTypeProperty(prop: Property, context: BuilderContext): CompositeTypeProperty {
  if (isPropertyRef(prop)) {
    const refType = prop.propertyRef.ref!;
    return buildCompositeTypeProperty(refType, context);
  } else if (isPropertyDef(prop)) {
    var propType: SosiType | null = null;
    if (isTypeDef(prop.type)) {
      propType = buildReferencedType(prop.type, context);
    } else if (isTypeDef(prop.type)) {
      propType = buildType(prop.type, context);
    }
    var kind: PropertyKind = 'containment';
    if (prop.kind == '@') {
      kind = 'geometry';
    } else if (prop.kind == '#') {
      kind = 'id';
    } else if (prop.kind == '^') {
      kind = 'container';
    } else if (prop.kind == '>') {
      kind = 'association';
    }
    return {
      entityType: 'compositeTypeProperty',
      name: string2Qname(prop.name),
      description: prop.description,
      tags: buildTags(prop.tags),
      kind: kind,
      type: {
        qname: propType!.name,
        element: propType!
      },
      multiplicity: buildMultiplicity(prop.multiplicity)
    };
  }
  throw new Error("Unsupported property: " + prop);
}

function buildMultiplicity(multiplicity: Multiplicity | undefined): SosiMultiplicity {
  var sosiMultiplicity = { lower: 0, upper: -1 };
  if (isOneOrMoreMultiplicity(multiplicity)) {
    sosiMultiplicity.lower = 1;
  }
  if (isZeroOrOneMultiplicity(multiplicity)) {
    sosiMultiplicity.upper = 1;
  }
  if (isSomeMultiplicity(multiplicity)) {
    sosiMultiplicity.lower = multiplicity.lower;
    if (multiplicity.upper) {
      sosiMultiplicity.upper = multiplicity.upper;
    }
  }
  return sosiMultiplicity;
}

function buildBuiltinType(type: BuiltinType): BuiltinSosiType {
  const sosiType: BuiltinSosiType = {
    entityType: 'builtinType',
    name: [type.name],
    description: type.description,
    tags: buildTags(type.tags),
    mappings: type.mappings.map(mapping => ({
      domain: string2Qname(mapping.domain),
      target: string2Qname(mapping.target)
    }))
  }
  return sosiType;
}

function buildDomainMappings(mappings: DomainMapping[]): SosiDomainMapping[] {
  return mappings.map(mapping => ({
      domain: string2Qname(mapping.domain),
      target: string2Qname(mapping.target)
  }));
}

function buildEnumType(type: EnumType): EnumSosiType {
  const sosiType: EnumSosiType = {
    entityType: 'enumType',
    name: [type.name],
    description: type.description,
    tags: buildTags(type.tags),
    properties: type.properties.map(prop => ({
      entityType: 'enumProperty',
      name: [prop.name],
      description: prop.description,
      tags: buildTags(prop.tags),
      value: prop.value?.value
    })),
    mappings: buildDomainMappings(type.mappings)
  };
  return sosiType;
}