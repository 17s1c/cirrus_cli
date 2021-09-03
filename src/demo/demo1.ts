const program = require('commander')
const inquirer = require('inquirer')
const ora = require('ora')

program
    .version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name: any) => {
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: "What's your first name",
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: "What's your last name",
                    default() {
                        return 'Doe'
                    },
                },
                {
                    type: 'input',
                    name: 'phone',
                    message: "What's your phone number",
                    validate(value: string) {
                        const pass = value.match(
                            /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i,
                        )
                        if (pass) {
                            return true
                        }

                        return 'Please enter a valid phone number'
                    },
                },
            ])
            .then((answers: any) => {
                const spinner = ora(JSON.stringify(answers))
                spinner.start()
            })
    })
program.parse(process.argv)
