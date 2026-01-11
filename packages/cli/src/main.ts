import { Command } from 'commander';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';
import { SosiLanguageMetaData } from 'sosi-language';
import { generatePlantumlAction } from './generator.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

// export const generatePlantumlAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
//     const services = createSosiServices(NodeFileSystem).Sosi;
//     const spec = await extractAstNode<Specification>(fileName, services);
//     const generatedFilePath = generatePlantuml(spec, fileName, opts.destination);
//     console.log(chalk.green(`Plantuml generated to ${generatedFilePath}`));
// };

// export type GenerateOptions = {
//     destination?: string;
// }

export default function(): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    const fileExtensions = SosiLanguageMetaData.fileExtensions.join(', ');
    program
        .command('plantuml')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates Plantuml code corresponding to the types in our specification')
        .action(generatePlantumlAction);

    program.parse(process.argv);
}
