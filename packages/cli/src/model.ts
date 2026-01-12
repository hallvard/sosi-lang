export type QName = string[];

interface ModelElement {
  name: QName;
  description?: string;
  tags: Tag[];
}

export interface Tag {
  name: QName;
  value?: string | Date | number | boolean;
}

interface Namespace extends ModelElement {
  types: SosiType[];
}

export interface SosiSpecification extends Namespace {
}

export interface SosiPackage extends Namespace {
}

export interface SosiType extends ModelElement {
}

export interface CompositeType extends SosiType {
  isAbstract: boolean;
  isFeature: boolean;
  superTypes: TypeRef<CompositeType>[];
  properties: Property[];
}

export type PropertyKind = 'id' | 'geometry' | 'association' | 'containment' | 'container';

export interface Property extends ModelElement {
  kind: PropertyKind;
  type: TypeRef<SosiType>;
  multiplicity: Multiplicity;
  defaultValue?: string | number | Date | boolean;
}

export interface Ref<T extends ModelElement = ModelElement> {
  qname: QName;
  type: T;
}

export interface TypeRef<T extends SosiType = SosiType> extends Ref<T> {
}

export interface Multiplicity {
  lower: number;
  upper: number;
}

export interface BuiltinType extends SosiType {
  mappings: DomainMapping[];
}

export interface DomainMapping {
  domain: QName;
  target: QName;
}

export interface EnumType extends SosiType {
  properties: EnumProperty[];
}

export interface EnumProperty extends ModelElement {
  value: string | number;
}