import * as logSymbols from 'log-symbols'
import ora, { Ora } from 'ora'
import * as shell from 'shelljs'
import * as fs from 'fs'
import * as _ from 'lodash'
import { generateFcYamlFile } from '../utils/generateYamlFile'

import { AbstractAction } from './abstract.action'

import * as path from 'path'
import * as dotenv from 'dotenv'
const chalk = require('chalk')
let spinner: Ora // loading animate

export class DeployAction extends AbstractAction {
    public async handle() {
        spinner = ora({
            text: 'start Deploy',
            spinner: 'dots',
        }).start()
        const result = dotenv.config()
        const cwd = process.cwd()
        const projectName = path.basename(cwd)
        const aliasName = 'default'
        if (result.error) {
            throw result.error
        }
        try {
            spinner.text = chalk.yellow('loading...')
            const {
                FC_ADAPTER,
                ACCOUNT_ID,
                REGION,
                ACCESS_KEY_ID,
                ACCESS_KEY_SECRET,
                LOG_PROJECT,
                LOG_STORE,
                DOMAIN_NAME,
            }: any = process.env
            if (LOG_PROJECT === projectName) {
                spinner.fail(
                    chalk.red(
                        `.env "LOG_PROJECT":${LOG_PROJECT}  不能和项目名: ${projectName} 相同`,
                    ),
                )
                return
            }
            if (
                !/^((?!_|[A-Z]).)*$/.test(LOG_PROJECT) ||
                !/^((?!_|[A-Z]).)*$/.test(LOG_STORE)
            ) {
                spinner.fail(
                    chalk.red(
                        "'LOG_PROJECT','LOG_STORE' 日志项目名称仅支持小写字母、数字和连字符（-），且必须以小写字母和数字开头和结尾",
                    ),
                )
                return
            }
            if (_.isNil(FC_ADAPTER)) {
                spinner.fail(chalk.red('.env 文件 缺少"FC_ADAPTER" 参数'))
                return
            }
            switch (FC_ADAPTER) {
                case 'Alibaba':
                    if (
                        _.isNil(ACCOUNT_ID) ||
                        _.isNil(REGION) ||
                        _.isNil(ACCESS_KEY_ID) ||
                        _.isNil(ACCESS_KEY_SECRET)
                    ) {
                        spinner.fail(
                            chalk.red(
                                '.env 文件 缺少 "ACCOUNT_ID","REGION","ACCESS_KEY_ID","ACCESS_KEY_SECRET" 参数',
                            ),
                        )
                        return
                    }
                    await shell.exec(`s config delete -a ${aliasName}`, { cwd })
                    await shell.exec(
                        `s config add --AccessKeyID ${ACCESS_KEY_ID} --AccessKeySecret  ${ACCESS_KEY_SECRET} --AccountID ${ACCOUNT_ID} --aliasName ${aliasName}`,
                        { cwd },
                    )
                    break
                default:
                    break
            }
            await shell.exec('mkdir -p alibaba_fc_temp/dist', {
                cwd: `${cwd}/.cirrus`,
            })
            fs.writeFileSync(
                `${cwd}/.cirrus/alibaba_fc_temp/bootstrap`,
                '#!/usr/bin/env bash\n' +
                    'export PORT=9000\n' +
                    'npm run start:prod',
                'utf8',
            )
            generateFcYamlFile(
                {
                    aliasName,
                    region: REGION,
                    projectName,
                    logProject: LOG_PROJECT,
                    logStore: LOG_STORE,
                    actions: {
                        'pre-deploy': [
                            {
                                run: 'yarn build',
                                path: cwd,
                            },
                            {
                                run:
                                    'cp -rf ./{public,package.json} ./.cirrus/alibaba_fc_temp/ & cp -rf ./dist/server.js ./.cirrus/alibaba_fc_temp/dist',
                                path: cwd,
                            },
                            {
                                run: 'yarn install --production',
                                path: `${cwd}/.cirrus/alibaba_fc_temp`,
                            },
                        ],
                    },
                    environmentVariables: {
                        ..._.omit(result?.parsed, [
                            'ACCOUNT_ID',
                            'REGION',
                            'ACCESS_KEY_ID',
                            'ACCESS_KEY_SECRET',
                            'FC_ADAPTER',
                            'LOG_PROJECT',
                            'LOG_STORE',
                            'DOMAIN_NAME',
                        ]),
                        PORT: 9000,
                    },
                    codeUri: `${cwd}/.cirrus/alibaba_fc_temp`,
                    domainName: 'Auto',
                },
                `${cwd}/.cirrus/alibaba_fc.yaml`,
            )
            // 部署日志服务
            if (!_.isEmpty(LOG_PROJECT) && !_.isEmpty(LOG_STORE)) {
                await shell.exec(
                    `s ${LOG_PROJECT} create --template ${cwd}/.cirrus/alibaba_fc.yaml`,
                    {
                        cwd: `${cwd}/.cirrus`,
                    },
                )
            }
            // 部署项目
            await shell.exec(
                `s ${projectName} deploy --template ${cwd}/.cirrus/alibaba_fc.yaml`,
                {
                    cwd: `${cwd}/.cirrus`,
                },
            )
            spinner.succeed(chalk.green('Deploy success!'))
        } catch (e) {
            console.log(logSymbols.error, chalk.red(e?.message || e))
            spinner.fail(chalk.red('Deploy fail'))
        }
    }
}
