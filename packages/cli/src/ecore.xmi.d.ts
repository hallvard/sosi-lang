// https://github.com/emfjson/ecore.js

declare module 'ecore/dist/ecore.xmi.js' {

  export namespace Ecore {
    
    function create(eClass: EObject, attributes: any): EObject;

    interface ResourceSet {
      create(resource: IResource): Resource;
      getEObject(uri: string): EObject | null;
    }

    const ResourceSet: {
      create(): ResourceSet;
    }
  
    const XMI: Serializer;

    export type EObjectFactory<T = IClass> = {
      create(eClass: T): EObject<T>;
    };

    const EPackage: EObjectFactory<IPackage> & {
      Registry: {
        getEPackage(nsURI: string): EPackage | undefined;
        register(ePackage: EPackage): void;
        ePackages(): EPackage[];
      };
    }
    const EClass: EObjectFactory<IClass>
    const EDataType: EObjectFactory<IDataType>
    const EEnum: EObjectFactory<IEnum>
    const EEnumLiteral: EObjectFactory<IEnumLiteral>
    const EAttribute: EObjectFactory<IAttribute>
    const EReference: EObjectFactory<IReference>
    const EOperation: EObjectFactory<IOperation>
    const EParameter: EObjectFactory<IParameter>
    const EAnnotation: EObjectFactory<IAnnotation>

    const EcorePackage: EPackage; // EPackage
    const EString: EDataType; // EDataType
    const EInt: EDataType; // EDataType
    const EBoolean: EDataType; // EDataType
    const ELong: EDataType; // EDataType
    const EDouble: EDataType; // EDataType
    const EFloat: EDataType; // EDataType
    const EDate: EDataType; // EDataType
  }

  export class Resource extends RObject<IResource> {
    add(value: EObject): void;
    addAll(values: EList<EObject>): void;
    clear(): void;
    to(serializer?: Serializer, encode?: boolean): JSON | string;
    getEObject(fragment: string): EObject | undefined;
  }

  interface Serializer {}

  class RObject<T = any> {
    has(property: string): boolean;
    isSet(property: keyof T): boolean;
    get(property: keyof T): any;
    set(property: keyof T, value: any): void;
  }

  export class EObject<T = any> extends RObject<T> {
    isTypeOf(type: EClassifier): boolean;
    isKindOf(type: EClassifier): boolean;
    eContents(): EList<EObject>;
    eAllContents(): EList<EObject>;
    eContainer(): EObject | null;
    eResource(): Resource | null;
    eURI(): string;
    fragment(): string;
  }

  export class EList<T extends EObject> {
    add(element: T): EList<T>;
    addAll(elements: T[]): EList<T>;
    remove(element: T): EList<T>;
    clear(): EList<T>;
    size(): number;
    at(index: number): T;
    array(): T[];
    first(): T | undefined;
    last(): T | undefined;
    contains(element: T): boolean;
    indexOf(element: T): number;
    find(callback: (element: T) => boolean): T | undefined;
    each(callback: (element: T) => void): void;
    map<R>(callback: (element: T) => R): EList<R>;
    filter(callback: (element: T) => boolean): EList<T>;
    reject(callback: (element: T) => boolean): EList<T>;
  }

  interface IResource {
    uri: string;
    contents?: EList<EObject>;
  }

  interface IObject {
    eClass?: EClass;
  }

  interface IModelElement extends IObject {
    eAnnotations?: EAnnotation[];
  }
  export type EModelElement = EObject<IModelElement>;

  interface IAnnotation extends IModelElement {
    source: string;
    details: {
      key: string;
      value: string;
    }[];
    references: EObject[];
  }
  export type EAnnotation = EObject<IAnnotation>;

  interface INamedElement extends IModelElement {
    name: string;
  }
  export type ENamedElement = EObject<INamedElement>;
  
  interface ITypedElement extends INamedElement {
    ordered: boolean;
    unique: boolean;
    lowerBound: number;
    upperBound: number; // -1 for unbounded
    eType: EClassifier | (() => EClassifier);
  }
  export type ETypedElement = EObject<ITypedElement>;
  
  interface IPackage extends INamedElement {
    nsURI: string;
    nsPrefix: string;
    eClassifiers: EClassifier[];
    eSubPackages?: EPackage[];
  }
  export type EPackage = EObject<IPackage>;
  
  interface IClassifier extends INamedElement {
  }
  export type EClassifier = EObject<IClassifier>;

  interface IClass extends IClassifier {
    abstract: boolean;
    'interface': boolean;
    eSuperTypes: EClass[];
    eStructuralFeatures: EStructuralFeature[];
    eOperations: EOperation[];
  }

  interface IDataType extends IClassifier {
  }
  export type EDataType = EObject<IDataType>;

  interface IEnum extends IDataType {
    eLiterals: EEnumLiteral[];
  }
  export type EEnum = EObject<IEnum>;

  interface IEnumLiteral extends INamedElement {
    value: number;
    literal: string;
  }
  export type EEnumLiteral = EObject<IEnumLiteral>;

  interface IStructuralFeature extends ITypedElement {
    changeable: boolean;
    transient: boolean;
    volatile: boolean;
    unsettable: boolean;
    derived: boolean;
  }
  export type EStructuralFeature = EObject<IStructuralFeature>;

  interface IAttribute extends IStructuralFeature {
  }
  export type EAttribute = EObject<IAttribute>;

  interface IReference extends IStructuralFeature {
    containment: boolean;
    container: boolean;
    eOpposite: EReference | null;
  }
  export type EReference = EObject<IReference>;

  interface IOperation extends ITypedElement {
    eParameters: EParameter[];
  }
  export type EOperation = EObject<IOperation>;

  interface IParameter extends ITypedElement {
  }
  export type EParameter = EObject<IParameter>;
}