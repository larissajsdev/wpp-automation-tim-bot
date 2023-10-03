import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable()
export class BlockingInterceptor implements NestInterceptor {
  private isProcessing: boolean = false;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (this.isProcessing) {
      throw new HttpException(
        'Aguarde o processamento da primeira planilha.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.isProcessing = true;

    return next.handle().pipe(
      catchError((err) => {
        return throwError(err);
      }),
      finalize(() => {
        this.isProcessing = false;
      }),
    );
  }
}
