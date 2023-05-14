import fsp from 'fs/promises';
import path from 'path';
import axios from 'axios';
import debug from 'debug';
import getFileName from './utils/getFileName.js';
import setLocalLinks from './utils/setLocalLinks.js';
import loadAssets from './utils/loadAssets.js';

const httpDebug = debug('page-loader:http');
const osDebug = debug('page-loader:os');
const pathDebug = debug('page-loader:path');
const loaderDebug = debug('page-loader:loader');

const pageLoader = (address, outputPath = process.cwd(), task = null) => {
  let mainFileName;
  let mainFilePath;
  let assetsDirName;
  let assetsDirPath;

  return Promise.resolve()
    .then(() => {
      mainFileName = getFileName(address);
      mainFilePath = path.resolve(outputPath, `${mainFileName}.html`);
      assetsDirName = `${mainFileName}_files`;
      assetsDirPath = path.resolve(outputPath, assetsDirName);

      return axios.get(address);
    })
    .then(({ data }) => {
      loaderDebug(`address: '${address}'`);
      loaderDebug(`output path: '${outputPath}'`);
      httpDebug('Page have been loaded.');
      const page = setLocalLinks(data, assetsDirName, address);
      loaderDebug('Links have been replaced by local');
      const promisePageSave = fsp.writeFile(mainFilePath, page);
      const promiseFilesSave = fsp.mkdir(assetsDirPath)
        .then(() => loadAssets(data, address, task))
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
