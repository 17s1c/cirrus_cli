import { AppConfig } from 'cirri/lib'
import * as dotenv from 'dotenv'
const result = dotenv.config()
if (result.error) {
    throw result.error
}

export const config: AppConfig = {
    port: Number(process.env.PORT),
    dbOptions: {
        type: 'mysql',
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DBNAME,
        logging: true,
        synchronize: true,
    },
}
