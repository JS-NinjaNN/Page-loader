import path from 'path';
import * as cheerio from 'cheerio';
import srcList from './srcList.js';
import getFileName from './getFileName.js';
import getCurrentLink from './getCurrentLink.js';

const setLocalLinks = (page, dir, host) => {
  const $ = cheerio.load(page);
  srcList().forEach((src) => {
    const links = $('html').find(src.name);
    links.each((i) => {
      if ($(links[i]).attr(src.src)) {
        const ext = path.extname($(links[i]).attr(src.src));
        const currentLink = getCurrentLink(host, $(links[i]).attr(src.src));
        if (currentLink) {
          const localHref = path.join(dir, `${getFileName(currentLink)}${ext || '.html'}`);
          $(links[i]).attr(src.src, localHref);
        }
      }
    });
  });
  return $.html();
};

export default setLocalLinks;
