import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { formattedDate } from './utils/date.utils';
import moment = require("moment");

describe('Utils Test', () => {

  describe('root', () => {
    it('should return 05-26-2023', () => {
      expect(moment(new Date()).format("DD/MM/YYYY")).toBe("20/08/2023");
    });
  });
});
