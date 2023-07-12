import { XMLParser } from 'fast-xml-parser';

export const parser = new XMLParser({
  attributeNamePrefix: '',
  ignoreAttributes: false,
  updateTag(_tagName, _jPath, attrs) {
    delete attrs['name'];
    delete attrs['id'];
  },
});
