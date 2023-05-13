import * as cheerio from 'cheerio';
import debug from 'debug';
import path from 'path';
import axios from 'axios';

import srcList from './srcList.js';
import getCurrentLink from './getCurrentLink.js';
import getFileName from './getFileName.js';

const sourcesDebug = debug('page-loader:src');
const sourceFailLoad = debug('page-loader:src_fail_load');

const getLinks = (html, hostname) => {
  const $ = cheerio.load(html);

  return srcList().reduce((acc, src) => {
    $('html')
      .find(src.name)
      .toArray()
      .filter((link) => $(link).attr(src.src))
      .forEach((link) => {
        const currentLink = getCurrentLink(hostname, $(link).attr(src.src));
        if (currentLink && acc.indexOf(currentLink) === -1) {
          acc.push(currentLink);
        }
      });
    return acc;
  }, []);
};

const assetsLoader = (html, hostname, task) => {
  const links = getLinks(html, hostname);
  const promises = links.map((link) => {
    if (task) {
      return Promise.resolve(task(link, axios.get, { responseType: 'arraybuffer' }));
    }
    return axios.get(link, { responseType: 'arraybuffer' })
      .catch((e) => {
        sourceFailLoad(e);
        return e;
      });
  });
  return Promise.all(promises)
    .then((data) => data.filter((file) => file))
    .then((filteredData) => filteredData.map((file) => {
      sourcesDebug(`loaded file '${file.config.url}'`);
      const ext = path.extname(file.config.url);
      const pathSave = `${getFileName(file.config.url)}${ext || '.html'}`;
      return { pathSave, data: file.data, url: file.config.url };
    }));
};

export default assetsLoader;
