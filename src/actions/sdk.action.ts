import * as logSymbols from 'log-symbols'
import ora, { Ora } from 'ora'

import { AbstractAction } from './abstract.action'
import {
    ClassDeclaration,
    MethodDeclaration,
    Project,
    ScriptTarget,
    SourceFile,
} from 'ts-morph'
import * as path from 'path'
import * as _ from 'lodash'
import * as dotenv from 'dotenv'
const chalk = require('chalk')
let spinner: Ora // loading animate

export const generateRouterPath = (name: string): string =>
    _.chain(`/${name}`)
        .toLower()
        .value()

export const generateWebApi = async ({
    controllerClass,
    sourceFile,
}: {
    controllerClass: ClassDeclaration
    sourceFile: SourceFile
}) => {
    const className = controllerClass.getName() as string
    const indexMethod = controllerClass.getInstanceMethod(
        'index',
    ) as MethodDeclaration
    const parameter = indexMethod.getParameters()
    const parameterType = parameter[0].getType()
    const returnType = indexMethod.getReturnType()
    const functionDeclaration = sourceFile.addFunction({
        name: className,
        isAsync: true,
    })
    functionDeclaration.insertParameter(0, {
        name: 'params',
        type: parameterType.getText(indexMethod),
    })
    functionDeclaration.setReturnType(returnType.getText(indexMethod))
    functionDeclaration.setBodyText(writer =>
        writer
            .writeLine(
                `const response = await axios.post("${
                    process.env.SERVICE_URL
                }${generateRouterPath(className)}", params)`,
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
        const result = dotenv.config()
        if (result.error) {
            throw result.error
        }
        if (!process.env.SERVICE_URL) {
            spinner.fail(chalk.red('.env file missing "SERVICE_URL" parameter'))
            return
        }
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
            const controllerClassList: ClassDeclaration[] = []
            _.each(data, sourceFile => {
                const data = sourceFile.getClass(c => {
                    const ImpController = _.find(
                        c?.getImplements(),
                        imp => imp?.getText() === 'IController',
                    )
                    return !_.isEmpty(ImpController)
                }) as ClassDeclaration
                if (!_.isEmpty(data)) controllerClassList.push(data)
            })
            for (const controllerClass of controllerClassList) {
                await generateWebApi({
                    sourceFile,
                    controllerClass,
                })
            }
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
