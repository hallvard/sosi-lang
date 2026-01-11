import type { Property, TypeDef} from "sosi-language"
import { isPropertyDef, isTypeDef } from "sosi-language"

export function typeName(type: TypeDef): string {
  if (type.name) {
    return type.name
  }
  const typeOwner = type.$container
  if (isPropertyDef(typeOwner)) {
    if (isPropertyDef(typeOwner)) {
      return `${typeName(typeOwner.$container)}_${typeOwner.name}`
    }
  }
  return "unknown"
}

export function propertyName(prop: Property): string {
  if (isPropertyDef(prop)) {
    return prop.name;
  } else {
    return propertyName(prop.propertyRef.ref!);
  }
}

export function propertyType(prop: Property): TypeDef {
  if (isPropertyDef(prop)) {
    if (isTypeDef(prop.type)) {
      return prop.type;
    } else {
      return prop.type.typeRef.ref!;
    }
  } else {
    return propertyType(prop.propertyRef.ref!);
  }
}

export function propertyTypeName(prop: Property): string {
    return propertyType(prop)?.name ?? "unknown";
}
