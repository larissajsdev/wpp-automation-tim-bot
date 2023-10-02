import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule , utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
const path = require("path")

@Module({
  imports: [ConfigModule.forRoot(), WinstonModule.forRoot({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('Api TIM_BOT', {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
      new winston.transports.File({
        dirname: path.join(__dirname, './../log/debug/'), //path to where save loggin result 
        filename: 'debug.log', //name of file where will be saved logging result
        level: 'debug',
      }),
      new winston.transports.File({
        dirname: path.join(__dirname, './../log/info/'),
        filename: 'info.log',
        level: 'info',
      }),
      new winston.transports.File({
        dirname: path.join(__dirname, './../log/warn/'),
        filename: 'warn.log',
        level: 'warn',
      }),
    ],
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
