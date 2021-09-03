import { AppConfig } from 'cirri/lib'

export const config: AppConfig = {
    port: {{ port }},
    dbOptions: {
        type: 'mysql',
        host: '{{ mysql_host }}',
        port: {{ mysql_port }},
        username: '{{ mysql_username }}',
        password: '{{ mysql_password }}',
        database: '{{ mysql_database }}',
        logging: true,
        synchronize: true,
    },
}
