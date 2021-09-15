import { App } from 'cirri/lib/application'
import Home from './controllers/home'
import Demo from './controllers/demo'
import { MyHttpExceptionFilter } from './filters/httpException.filter'
import { APICallLoggerMiddleware } from './middlewares/apiCallLogger.middleware'
import UserModel from './model/user.model'
import { MyValidationPipe } from './pipes/validation.pipe'
import DemoService from './service/demo.service'
import { config } from './config/config'

App.init(
    {
        controllers: [Home, Demo],
        validationPipe: MyValidationPipe,
        httpExceptionFilter: MyHttpExceptionFilter,
        middleware: [APICallLoggerMiddleware],
        providers: [DemoService],
        enableCors: true,
        model: [UserModel],
    },
    config,
).catch(err => console.error(err))
