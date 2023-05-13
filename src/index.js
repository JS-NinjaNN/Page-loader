import fsp from 'fs/promises';
import path from 'path';
import axios from 'axios';
import debug from 'debug';
import getFileName from './utils/getFileName.js';
import getDirName from './utils/getDirName.js';
import setLocalLinks from './utils/setLocalLinks.js';
import assetsLoader from './utils/assetsLoader.js';

const httpDebug = debug('page-loader:http');
const osDebug = debug('page-loader:os');
const pathDebug = debug('page-loader:path');
const loaderDebug = debug('page-loader:loader');

const pageLoader = (address, outputPath = process.cwd(), task = null) => {
  let fileName;
  let dirName;
  let rootDir;
  let filePath;
  let assetsDirName;
  let assetsDirPath;

  return Promise.resolve()
    .then(() => {
      fileName = getFileName(address);
      dirName = getDirName(address);
      rootDir = `${outputPath}${path.sep}${dirName}`;
      filePath = path.resolve(rootDir, `${fileName}.html`);
      assetsDirName = `${fileName}_files`;
      assetsDirPath = path.resolve(outputPath, dirName, assetsDirName);

      return fsp.mkdir(rootDir);
    })
    .then(() => axios.get(address))
    .then(({ data }) => {
      loaderDebug(`address: '${address}'`);
      loaderDebug(`output path: '${rootDir}'`);
      httpDebug('Page have been loaded.');
      const page = setLocalLinks(data, assetsDirName, address);
      loaderDebug('Links have been replaced by local');
      const promisePageSave = fsp.writeFile(filePath, page);
      const promiseFilesSave = fsp.mkdir(assetsDirPath)
        .then(() => assetsLoader(data, address, task))
        .then((files) => {
          const promises = files.map((file) => {
            const pathToFile = path.resolve(assetsDirPath, file.pathSave);
            return fsp.writeFile(pathToFile, file.data)
              .then(() => {
                osDebug(`File saved '${file.pathSave}'`);
                pathDebug(`path: '${pathToFile}'`);
                return file.url;
              });
          });
          return Promise.all(promises);
        })
        .then(() => loaderDebug('Resources have been saved.'));
      return Promise.all([promiseFilesSave, promisePageSave]);
    })
    .catch((e) => {
      throw e;
    });
};

export default pageLoader;
