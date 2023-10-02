import { HttpException, HttpStatus } from '@nestjs/common';
import moment = require('moment');
export function validarDadoPlanilha(inputValue) {
  if (typeof inputValue === 'object' && !Array.isArray(inputValue) && Object.keys(inputValue).length > 0) {
    return 'FORMATO NÃO RECONHECIDO';
  } else{
    return inputValue
  }
}