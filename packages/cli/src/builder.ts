import { BuiltinType, isBuiltinType, isCompositeType, isEnumType, Specification, Tag, TypeDef } from "sosi-language";
import { SosiSpecification, SosiType,
  Tag as SosiTag,
  BuiltinType as BuiltinSosiType
 } from "./model.js";

export function buildSpecification(spec: Specification): SosiSpecification {
  const typeMap = new Map<string, SosiType>();
  return {
    name: string2Qname(spec.name),
    description: spec.description,
    tags: buildTags(spec.tags),
    types: spec.types.map(type => buildType(type, typeMap))
  };
}

function string2Qname(str: string): string[] {
  return str.split('::');
}

function buildTags(tags: Tag[]): SosiTag[] {
  return tags.map(tag => ({
    name: string2Qname(tag.name),
    value: tag.value ? tag.value.value : true
  }));
}

function buildType(type: TypeDef, typeMap: Map<string, SosiType>): SosiType {
  if (isBuiltinType(type)) {
    return buildEnumType(type);
  } else if (isEnumType(type)) {
  } else if (isCompositeType(type)) {
  }
  throw new Error("Unsupported type: " + type);
}

function buildEnumType(type: BuiltinType): BuiltinSosiType {
  return {
    name: [type.name],
    description: type.description,
    tags: buildTags(type.tags),
    mappings: type.mappings.map(mapping => ({
      domain: string2Qname(mapping.domain),
      target: string2Qname(mapping.target)
    }))
  }
}