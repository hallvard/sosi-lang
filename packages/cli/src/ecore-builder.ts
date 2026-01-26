/// <reference path="./ecore.d.ts" />
import { Ecore, EObject, Resource } from "ecore";
import { BuiltinType, CompositeType, EnumType, isBuiltinType, isCompositeType, isEnumType, isNamespace, isOneOrMoreMultiplicity, isPropertyRef, isSomeMultiplicity, isTypeDef, isTypeRef, isZeroOrOneMultiplicity, Multiplicity, Property, Specification, TypeDef } from "sosi-language";
import { propertyName } from "sosi-language/sosi-utils";
import {
  nameString,
  PropertyKind,
  // DomainMapping as SosiDomainMapping
} from "./model.js";

interface BuilderContext {
  typeMap: Map<string, EObject>;
}

function typeQname(type: TypeDef): string[] {
  var parent = type.$container;
  while (! isNamespace(parent)) {
    parent = parent.$container.$container;
  }
  return [parent.name, type.name];
}

export function buildEcoreResource(spec: Specification): Resource {
  var resourceSet = Ecore.ResourceSet.create();
  var resource = resourceSet.create({ uri: spec.name });
  resource.get('contents').add(buildEcorePackage(spec));
  return resource;
}

export function buildEcorePackage(spec: Specification): EObject {
  const typeMap = new Map<string, EObject>();
  return Ecore.EPackage.create({
    nsURI: spec.name,
    nsPrefix: string2SimpleName(spec.name),
    name: string2SimpleName(spec.name),
    // description: spec.description,
    // tags: buildTags(spec.tags),
    eClassifiers: spec.types.map(type => buildType(type, { typeMap }))
  });
}

// function string2Qname(str: string): string[] {
//   return str.split('.');
// }

function string2SimpleName(str: string): string {
  const pos = str.lastIndexOf('.');
  return pos >= 0 ? str.substring(pos + 1) : str;
}

// function addTagAnnotations(tags: Tag[], elt: EModelElement): void {
//   return tags.map(tag => ({
//     name: string2Qname(tag.name),
//     value: tag.value ? tag.value.value : true
//   }));
// }

function buildType(type: TypeDef, context: BuilderContext): EObject {
  console.log("Processing type: " + nameString(typeQname(type)));
  if (isBuiltinType(type)) {
    return buildBuiltinType(type);
  } else if (isEnumType(type)) {
    return buildEnumType(type);
  } else if (isCompositeType(type)) {
    return buildCompositeType(type, context);
  }
  throw new Error("Unsupported type: " + type);
}

function buildReferencedType<T extends TypeDef>(type: TypeDef, context: BuilderContext): EObject {
  const qnameString = nameString(typeQname(type));
  console.log("Processing referenced type: " + qnameString);
  if (! context.typeMap.has(qnameString)) {
    const sosiType = buildType(type, context);
    context.typeMap.set(qnameString, sosiType);
  }
  return context.typeMap.get(qnameString)!;
}

function buildCompositeType(type: CompositeType, context: BuilderContext): EObject {
  const superTypes = new Array<EObject>
  for (const ref of type.extends) {
    if (isTypeDef(ref.ref)) {
      const sosiType = buildReferencedType(ref.ref, context);
      // if (isCompositeSosiType(sosiType)) {
        superTypes.push(sosiType);
      // }
    }
  }
  const eClass = Ecore.EClass.create({
    name: string2SimpleName(type.name),
    // description: type.description,
    // tags: buildTags(type.tags),
    abstract: type.isAbstract ?? false,
    interface: false,
    // kind: type.kind ?? 'feature',
    eSuperTypes: superTypes,
    eStructuralFeatures: type.properties.map(prop => buildCompositeTypeProperty(prop, context)),
    eOperations: []
  });
  context.typeMap.set(type.name, eClass);
  return eClass;
}

function buildCompositeTypeProperty(prop: Property, context: BuilderContext): EObject {
  console.log("...processing property: " + propertyName(prop));
  if (isPropertyRef(prop)) {
    const refType = prop.propertyRef.ref!;
    return buildCompositeTypeProperty(refType, context);
  } else {
    var propType: EObject | null = null;
    if (isTypeRef(prop.type)) {
      if (isTypeDef(prop.type.typeRef.ref)) {
        propType = buildReferencedType(prop.type.typeRef.ref, context);
      }
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
    console.log("......property " + prop.name + ": " + kind);
    return Ecore.EAttribute.create({
      name: string2SimpleName(prop.name),
      // description: prop.description,
      // tags: buildTags(prop.tags),
      // kind: kind,
      eType: propType!,
      ... buildMultiplicity(prop.multiplicity),
      changeable: true,
      transient: false,
      volatile: false,
      unsettable: false,
      derived: false,
      ordered: true,
      unique: false
    });
  }
  throw new Error("Unsupported property: " + prop);
}

function buildMultiplicity(multiplicity: Multiplicity | undefined): { lowerBound: number; upperBound: number } {
  var sosiMultiplicity = { lowerBound: 0, upperBound: -1 };
  if (isOneOrMoreMultiplicity(multiplicity)) {
    sosiMultiplicity.lowerBound = 1;
  }
  if (isZeroOrOneMultiplicity(multiplicity)) {
    sosiMultiplicity.upperBound = 1;
  }
  if (isSomeMultiplicity(multiplicity)) {
    sosiMultiplicity.lowerBound = multiplicity.lower;
    if (multiplicity.upper) {
      sosiMultiplicity.upperBound = multiplicity.upper;
    }
  }
  return sosiMultiplicity;
}

function buildBuiltinType(type: BuiltinType): EObject {
  const sosiType = Ecore.EDataType.create({
    name: type.name,
    // description: type.description,
    // tags: buildTags(type.tags),
    // mappings: type.mappings.map(mapping => ({
    //   domain: string2Qname(mapping.domain),
    //   target: string2Qname(mapping.target)
    // }))
  });
  return sosiType;
}

// function buildDomainMappings(mappings: DomainMapping[]): SosiDomainMapping[] {
//   return mappings.map(mapping => ({
//       domain: string2Qname(mapping.domain),
//       target: string2Qname(mapping.target)
//   }));
// }

function buildEnumType(type: EnumType): EObject {
  const sosiType = Ecore.EEnum.create({
    name: type.name,
    // description: type.description,
    // tags: buildTags(type.tags),
    eLiterals: type.properties.map(prop => (Ecore.EEnumLiteral.create({
      name: prop.name,
      // description: prop.description,
      // tags: buildTags(prop.tags),
      value: typeof prop.value?.value === 'number' ? prop.value.value as number : 0,
      literal: typeof prop.value?.value === 'string' ? prop.value.value as string : '',
    })))
    // mappings: buildDomainMappings(type.mappings)
  });
  return sosiType;
}