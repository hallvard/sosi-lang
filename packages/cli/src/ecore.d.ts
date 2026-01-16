// https://github.com/emfjson/ecore.js

declare module 'ecore' {

  export namespace Ecore {
    
    function create(eClass: EObject, attributes: any): EObject;

    interface ResourceSet {
      create(resource: IResource): Resource;
      getEObject(uri: string): EObject | null;
    }

    const ResourceSet: {
      create(): ResourceSet;
    }
  
    const EClass: {
      create(eClass: IClass): EClass
    }

    const EPackage: {
      create(ePackage: IPackage): EPackage
    }

    const EDataType: {
      create(eDataType: IDataType): EDataType
    }

    const EEnum: {
      create(eEnum: IEnum): EEnum
    }

    const EEnumLiteral: {
      create(eEnumLiteral: IEnumLiteral): EEnumLiteral
    }

    const EAttribute: {
      create(eAttribute: IAttribute): EAttribute
    }

    const EReference: {
      create(eReference: IReference): EReference
    }

    const EOperation: {
      create(eOperation: IOperation): EOperation
    }

    const EParameter: {
      create(eParameter: IParameter): EParameter
    }

    const EAnnotation: {
      create(eAnnotation: IAnnotation): EAnnotation
    }

    const EPackage: {
      create(ePackage: IPackage): EPackage
      Registry: {
        getEPackage(nsURI: string): EPackage | undefined;
        register(ePackage: EPackage): void;
        ePackages(): EPackage[];
      };
    }

    const EcorePackage: EPackage; // EPackage
    const EObject: EClass; // EClass
    const EString: EDataType; // EDataType
    const EInt: EDataType; // EDataType
    const EBoolean: EDataType; // EDataType
    const ELong: EDataType; // EDataType
    const EDouble: EDataType; // EDataType
    const EFloat: EDataType; // EDataType
    const EDate: EDataType; // EDataType
  }

  export class Resource {
    add(value: EObject): void;
    addAll(values: EList<EObject>): void;
    clear(): void;
    toJSON(): Object
    getEObject(fragment: string): EObject | undefined;
  }

  export class EObject<T = any> {
    has(property: string): boolean;
    isSet(property: keyof T): boolean;
    get(property: keyof T): any;
    set(property: keyof T, value: any): void;
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
  export type EClass = EObject<IClass>;

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