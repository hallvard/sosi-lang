export type QName = string[];

interface ModelElement {
  entityType: string;
  name: QName;
  description?: string;
  tags: Tag[];
}

export function isA(element: ModelElement, entityType: string): boolean {
  return element.entityType === entityType;
}

export function isCompositeType(element?: ModelElement): element is CompositeType {
  return element !== undefined && isA(element, 'compositeType');
}

export function isBuiltinType(element?: ModelElement): element is BuiltinType {
  return element !== undefined && isA(element, 'builtinType');
}

export function isEnumType(element?: ModelElement): element is EnumType {
  return element !== undefined && isA(element, 'enumType');
}

export function nameString(name: QName): string {
  return name.join('.');
}

export function name(modelElement: ModelElement): string {
  return nameString(modelElement.name);
}

export function simpleName(modelElement: ModelElement): string {
  return modelElement.name[modelElement.name.length - 1];
}

export interface Tag {
  name: QName;
  value?: string | Date | number | boolean;
}

interface Namespace extends ModelElement {
  types: SosiType[];
}

export interface SosiSpecification extends Namespace {
  entityType: 'specification';
}

export interface SosiPackage extends Namespace {
  entityType: 'package';
}

export interface SosiType extends ModelElement {
}

export type CompositeTypeKind = 'data' | 'feature';

export interface CompositeType extends SosiType {
  entityType: 'compositeType';
  isAbstract: boolean;
  kind: CompositeTypeKind;
  superTypes: TypeRef<CompositeType>[];
  properties: CompositeTypeProperty[];
}

export type PropertyKind = 'id' | 'geometry' | 'association' | 'containment' | 'container';

export interface CompositeTypeProperty extends ModelElement {
  entityType: 'compositeTypeProperty';
  kind: PropertyKind;
  type: TypeRef<SosiType>;
  multiplicity: Multiplicity;
  defaultValue?: string | number | Date | boolean;
}

export interface Ref<T extends ModelElement = ModelElement> {
  qname: QName;
  element: T | undefined;
}

export interface TypeRef<T extends SosiType = SosiType> extends Ref<T> {
}

export interface Multiplicity {
  lower: number;
  upper: number;
}

export interface BuiltinType extends SosiType {
  entityType: 'builtinType';
  mappings: DomainMapping[];
}

export interface DomainMapping {
  domain: QName;
  target: QName;
}

export interface EnumType extends SosiType {
  entityType: 'enumType';
  properties: EnumProperty[];
  mappings: DomainMapping[];
}

export interface EnumProperty extends ModelElement {
  entityType: 'enumProperty';
  value: string | number | undefined;
}