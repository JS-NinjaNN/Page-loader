import fsp from 'fs/promises';
import path from 'path';
import axios from 'axios';
import getFileName from './utils/getFileName.js';
import getDirName from './utils/getDirName.js';
import setLocalLinks from './utils/setLocalLinks.js';
import assetsLoader from './utils/assetsLoader.js';

const pageLoader = (address, outputPath = process.cwd(), task = null) => {
  const fileName = getFileName(address);
  const dirName = getDirName(address);
  const rootDir = `${outputPath}${path.sep}${dirName}`;
  const filePath = path.resolve(rootDir, `${fileName}.html`);
  const assetsDirName = `${fileName}_files`;
  const assetsDirPath = path.resolve(outputPath, dirName, assetsDirName);

  return fsp.mkdir(rootDir)
    .then(() => axios.get(address))
    .then(({ data }) => {
      console.log('output path: ', rootDir);
      const page = setLocalLinks(data, assetsDirName, address);
      const promisePageSave = fsp.writeFile(filePath, page);
      const promiseFilesSave = fsp.mkdir(assetsDirPath)
        .then(() => {
          console.log(`Dir ${assetsDirPath} created.`);
          return assetsLoader(data, address, task);
        })
        .then((files) => {
          const promises = files.map((file) => {
            const pathToFile = path.resolve(assetsDirPath, file.pathSave);
            return fsp.writeFile(pathToFile, file.data)
              .then(() => file.url);
          });
          return Promise.all(promises);
        });
      return Promise.all([promiseFilesSave, promisePageSave]);
    });
};

export default pageLoader;
