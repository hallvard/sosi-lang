import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { clearDocuments, parseHelper } from "langium/test";
import type { CompositeType, BuiltinType, Property, Specification, Type } from "sosi-language";
import { createSosiServices, isCompositeType, isBuiltinType, isSpecification, isTypeRef, isInlineType } from "sosi-language";
import { fail } from "node:assert";

let services: ReturnType<typeof createSosiServices>;
let parse:    ReturnType<typeof parseHelper<Specification>>;
let document: LangiumDocument<Specification> | undefined;

beforeAll(async () => {
    services = createSosiServices(EmptyFileSystem);
    parse = parseHelper<Specification>(services.Sosi);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

afterEach(async () => {
    document && clearDocuments(services.shared, [ document ]);
});
describe('Linking tests', () => {

    test('linking of Specification', async () => {
        document = await parse(`
            specification ngu.nadag

            builtin String as java String
            builtin Timestamp as java long
            builtin Posisjon as java geo.Geometry
            builtin Areal as java geo.Geometry

            data type Id {
              name: String
              namespace: String
              version: Timestamp
            }

            type GU {
              # id: Id
              @ "område": Areal
              borehull*: type GB {
                # id: Id
                @ posisjon: Posisjon 
              }
            }
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the cross references we're interested in by checking
            //  the referenced AST element as well as for a potential error message;
            checkDocumentValid(document)
        ).toBeUndefined();

        const spec = document.parseResult.value;
        const idType = findType('Id', isCompositeType, spec) as CompositeType;
        const arealType = findType('Areal', isBuiltinType, spec) as BuiltinType;
        const posisjonType = findType('Posisjon', isBuiltinType, spec) as BuiltinType;

        const guType = findType('GU', isCompositeType, spec) as CompositeType;
        const gbType = findInlineType('GB', isCompositeType, guType) as CompositeType;

        expect(idType).toBeDefined();
        expect(arealType).toBeDefined();
        expect(posisjonType).toBeDefined();
        expect(guType).toBeDefined();
        expect(gbType).toBeDefined();

        checkPropertyWithTypeRef('id', guType, idType);
        checkPropertyWithTypeRef('område', guType, arealType);
        checkPropertyWithTypeRef('posisjon', gbType, posisjonType);
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !isSpecification(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a Specification'.`
        || undefined;
}

function findType(name: string, predicate: (item:any ) => boolean, spec: Specification): Type | undefined {
    return spec.types.find(type => type.name == name);
}

function checkPropertyWithTypeRef(name: string, type: CompositeType, expectedType: Type): undefined {
    const prop = findProperty(name, type);
    if (! prop) {
        fail(`Expected a ${name} property in ${type.name}`);
    }
    const propType = prop.type
    if (! isTypeRef(propType)) {
        fail(`Expected ${prop?.name} had a TypeRef`);
    }
    expect(propType.typeRef.ref).toBe(expectedType);
}

function findInlineType(name: string, predicate: (item:any ) => boolean, type: CompositeType): Type | undefined {
  for (const prop of type.properties) {
    if (isInlineType(prop.type) && prop.type.typeDef.name == name) {
      return prop.type.typeDef;
    }
  }
  return undefined;
}

function findProperty(name: string, type: CompositeType): Property | undefined {
    return type.properties.find(prop => prop.name == name);
}