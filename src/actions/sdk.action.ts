import * as logSymbols from 'log-symbols'
import ora, { Ora } from 'ora'

import { AbstractAction } from './abstract.action'
import { MethodDeclaration, Project, ScriptTarget, SourceFile } from 'ts-morph'
import * as path from 'path'
import * as _ from 'lodash'
const chalk = require('chalk')
let spinner: Ora // loading animate

export const generateRouterPath = (name: string): string =>
    _.chain(`/${name}`)
        .toLower()
        .value()

export const generateWebApi = async ({
    controllersFile,
    sourceFile,
}: {
    controllersFile: SourceFile
    sourceFile: SourceFile
}) => {
    const classDeclaration = controllersFile.getClasses()?.[0]
    const className = classDeclaration.getName() as string
    const demoMethod = classDeclaration.getInstanceMethod(
        'index',
    ) as MethodDeclaration
    const parameter = demoMethod.getParameters()
    const parameterType = parameter[0].getType()
    const functionDeclaration = sourceFile.addFunction({
        name: className,
        isAsync: true,
    })
    functionDeclaration.insertParameter(0, {
        name: 'params',
        type: parameterType.getText(),
    })
    functionDeclaration.setBodyText(writer =>
        writer
            .writeLine(
                `const response = await axios.post("http://localhost:8080${generateRouterPath(
                    className,
                )}", params)`,
            )
            .writeLine('return response?.data'),
    )
    functionDeclaration.setIsExported(true)
}

export class SdkAction extends AbstractAction {
    public async handle() {
        spinner = ora({
            text: 'start generate sdk',
            spinner: 'dots',
        }).start()
        spinner.text = chalk.yellow('loading...')
        try {
            const project = new Project({
                compilerOptions: {
                    outDir: 'dist',
                    target: ScriptTarget.ES2017,
                    declaration: true,
                },
            })
            project.addSourceFilesAtPaths([
                `${process.cwd()}/src/**/*{.d.ts,.ts}`,
                '!**/*.d.ts',
                '!**/node_modules',
            ])
            const data = project.getSourceFiles()
            const sourceFile = project.createSourceFile('./cirrusSdk.ts', '', {
                overwrite: true,
            })
            const controllersFiles = _.filter(data, sourceFile => {
                return sourceFile.getClass(c => {
                    return c?.getImplements()?.[0]?.getText() === 'IController'
                })
            })
            for (const controllersFile of controllersFiles) {
                await generateWebApi({
                    sourceFile,
                    controllersFile: controllersFile as SourceFile,
                })
            }

            await sourceFile.save()
            const newProject = new Project()
            const emitOutput = sourceFile.getEmitOutput()
            emitOutput.getEmitSkipped() // returns: boolean
            for (const outputFile of emitOutput.getOutputFiles()) {
                const data = path.basename(outputFile.getFilePath())
                newProject.createSourceFile(
                    `${process.cwd()}/sdk/${data}`,
                    outputFile.getText(),
                    {
                        overwrite: true,
                    },
                )
            }
            await newProject.save()
            spinner.succeed(chalk.green('generate sdk success!'))
        } catch (e) {
            console.log(logSymbols.error, chalk.red(e?.message || e))
            spinner.fail(chalk.red('generate sdk fail'))
        }
    }
}
