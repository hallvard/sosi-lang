import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import type { Specification } from "sosi-language";
import { createSosiServices, isSpecification } from "sosi-language";
import type { Diagnostic } from "vscode-languageserver-types";

let services: ReturnType<typeof createSosiServices>;
let parse:    ReturnType<typeof parseHelper<Specification>>;
let document: LangiumDocument<Specification> | undefined;

beforeAll(async () => {
    services = createSosiServices(EmptyFileSystem);
    parse = parseHelper<Specification>(services.Sosi);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Parsing tests', () => {

    test('parse Specification', async () => {
        document = await parse(`
            specification "Datamodell for NADAG"
            ngu.nadag
            $version=1.0

            builtin "Native String" string as java java.lang.String
            builtin long as java long

            builtin Posisjon as java geo.Geometry
            builtin Areal as java geo.Geometry
            builtin DateTime as java java.time.LocalDateTime
            builtin Date as java java.time.LocalDate
            builtin UUID as java java.util.UUID

            codelist Kode {
                UKJENT = 0
                AKTIV = 1
                INAKTIV = 2
            }

            data type
                "Identifikasjon"
                Id
                $version=1.0 $versionDate=2025-01-01 $versionTime=12:40:02.007
            {
                "Unik innen navnerom"
                lokalId: UUID // velger likevel UUID

                "Gjør navnet unikt"
                namespace: string
                "Versjonen er monotont økende, f.eks. et tidsstempel"
                version: long
            }

            type Entitet {
              # id: Id
              opprettetDato: DateTime
              sistEndretDato: DateTime
            }

            type StedfestetEntitet extends Entitet {
              @ posisjon: Posisjon
            }

            type GU extends Entitet{
              Entitet.id
              @ "område": Areal
              status: Kode
              borehull*: type GB {
                Entitet.id
                Entitet.opprettetDato
                StedfestetEntitet.Posisjon
              }
            }
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the diagnostics by converting them into human readable strings;
            // note that 'toHaveLength()' works for arrays and strings alike ;-)
            checkDocumentValid(document) || document?.diagnostics?.map(diagnosticToString)?.join('\n')
        ).toBeUndefined();

        expect(document.parseResult.value?.name).toBe('ngu.nadag');
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

function diagnosticToString(d: Diagnostic) {
    return `[${d.range.start.line}:${d.range.start.character}..${d.range.end.line}:${d.range.end.character}]: ${d.message}`;
}
