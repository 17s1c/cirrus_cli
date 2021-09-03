import { CommanderStatic } from 'commander'
import * as inquirer from 'inquirer'
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
                inquirer
                    .prompt([
                        {
                            type: 'input',
                            name: 'port',
                            message: 'port:',
                            default() {
                                return 8080
                            },
                            validate(value: any) {
                                if (Number.isInteger(value)) {
                                    return true
                                }

                                return 'port is integer type'
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
