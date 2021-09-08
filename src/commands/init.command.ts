const chalk = require('chalk')
import { CommanderStatic } from 'commander'
import * as inquirer from 'inquirer'
import * as logSymbols from 'log-symbols'
import { AbstractCommand } from './abstract.command'

export class InitCommand extends AbstractCommand {
    public load(program: CommanderStatic) {
        program
            .command('init [name]')
            .alias('i')
            .description(
                'Generate backEnd project, example: cirrus init myProject',
            )
            .action(async (projectName: string) => {
                if (!projectName) {
                    console.log(
                        logSymbols.error,
                        chalk.red('please input project name!!'),
                    )
                    return
                } else if (
                    !/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
                        projectName,
                    )
                ) {
                    console.log(
                        logSymbols.error,
                        chalk.red(
                            "project name violates the pattern: '^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$' ",
                        ),
                    )
                    return
                }
                await this.action.handle({
                    projectName,
                })
            })
    }
}
