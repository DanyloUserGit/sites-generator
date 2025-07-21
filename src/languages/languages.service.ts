import { Injectable } from '@nestjs/common';
import ISO6391 from 'iso-639-1';

@Injectable()
export class LanguagesService {
  constructor() {}

  async codeToName(code: string) {
    try {
      const name = ISO6391.getName(code);
      if (!name) throw Error('Invalid language code' + code);

      return name;
    } catch (error) {
      throw error;
    }
  }

  async nameToCode(name: string) {
    try {
      const code = ISO6391.getCode(name);
      if (!code) throw Error('Invalid language name' + name);

      return code;
    } catch (error) {
      throw error;
    }
  }

  async getThreeLangs(query: string) {
    try {
      const languageNames = ISO6391.getAllNames();

      const filtered = languageNames
        .filter((l) => l.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map((l) => ({
          lname: l,
          lcode: ISO6391.getCode(l),
        }));

      return filtered;
    } catch (error) {
      throw error;
    }
  }
}
