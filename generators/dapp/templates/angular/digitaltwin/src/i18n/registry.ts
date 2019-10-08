import {
  Injectable,      // @angular/core
} from 'angular-libs';

import {
  EvanTranslationService
} from 'angular-core';

import { en } from './en';
import { de } from './de';

export const translations = {
  en, de
};

@Injectable()
export class Translations {
  constructor(translate: EvanTranslationService) {
    translate.setTranslation('en', en);
    translate.setTranslation('de', de);
  }
}
