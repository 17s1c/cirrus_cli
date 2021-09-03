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
                inquirer
                    .prompt([
                        {
                            type: 'input',
                            name: 'port',
                            message: 'port:',
                            default() {
                                return 8080
                            },
                        },
                        {
                            type: 'input',
                            name: 'mysql_host',
                            message: 'mysql host:',
                            default() {
                                return 'localhost'
                            },
                        },
                        {
                            type: 'input',
                            name: 'mysql_port',
                            message: 'mysql port:',
                            default() {
                                return 3306
                            },
                        },
                        {
                            type: 'input',
                            name: 'mysql_username',
                            message: 'mysql username:',
                            default() {
                                return 'root'
                            },
                        },
                        {
                            type: 'input',
                            name: 'mysql_password',
                            message: 'mysql password:',
                            default() {
                                return '12345678'
                            },
                        },
                        {
                            type: 'input',
                            name: 'mysql_database',
                            message: 'mysql database:',
                            default() {
                                return 'demo'
                            },
                        },
                    ])
                    .then(
                        async (answers: {
                            port: number
                            mysql_host: string
                            mysql_port: number
                            mysql_username: string
                            mysql_password: string
                            mysql_database: string
                        }) => {
                            await this.action.handle({
                                ...answers,
                                projectName,
                            })
                        },
                    )
            })
    }
}
