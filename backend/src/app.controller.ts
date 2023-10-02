import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
// import { sendMessage } from './utils/message.utils';
import { diskStorage } from 'multer';
import { BlockingInterceptor } from './interceptors/blocking.interception';
@Controller()
@UseInterceptors(BlockingInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${file.originalname}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      return await this.appService.upload(file);
    } catch (error1) {
      throw new HttpException(
        { error: 'Erro interno do servidor', error1 },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/robo/stop-process')
  async stopProcess() {
    try {
      // const result = await sendMessage('----PARAR ROBÔ----');
      // return result;
    } catch (error) {
      console.log(error);
      return { message: 'Não foi possível pausar o robô', error };
    }
  }

  @Get()
  async startBot(): Promise<any> {
    return {
      message: 'API RUNNING...',
      timestamp: new Date().getTime(),
    };
  }
}
