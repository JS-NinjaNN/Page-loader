import fs from 'fs';
import fsp from 'fs/promises';
import nock from 'nock';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import pageLoader from '../src/index.js';
import getFileName from '../src/utils/getFileName.js';
import getDirName from '../src/utils/getDirName.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturePath = (...restOfPath) => path.join(__dirname, '..', '__fixtures__', ...restOfPath);

describe('test pageLoader', () => {
  const address = 'http://localhost/test';
  const testFilesDir = 'test-page_files';
  const mainHtmlFileName = 'test_page.html';
  const imageFileName = 'nodejs.png';
  const loadedImageFileName = 'localhost-test-page-files-nodejs-png.png';
  const cssFileName = 'application.css';
  const loadedCssFileName = 'localhost-assets-application-css.css';
  const jsFileName = 'runtime.js';
  const loadedJsFileName = 'localhost-test-page-files-runtime-js.js';
  const coursesFileName = 'courses.html';
  const loadedCoursesFileName = 'localhost-courses.html';

  const loadedPageContent = fs.readFileSync(getFixturePath('loaded_page.html')).toString();
  const loadedCoursesPageContent = fs.readFileSync(getFixturePath('loaded_courses_page.html')).toString();
  const imageData = fs.readFileSync(getFixturePath(testFilesDir, imageFileName));
  const cssFileContent = fs.readFileSync(getFixturePath(testFilesDir, cssFileName)).toString();
  const jsFileContent = fs.readFileSync(getFixturePath(testFilesDir, jsFileName)).toString();
  const coursesFileContent = fs.readFileSync(getFixturePath(testFilesDir, coursesFileName));
  const mainHtmlPageContent = fs.readFileSync(getFixturePath(mainHtmlFileName));

  beforeEach(() => {
    nock('http://localhost')
      .get('/test')
      .reply(200, mainHtmlPageContent)
      .get(`/${testFilesDir}/${imageFileName}`)
      .reply(200, imageData)
      .get('/assets/application.css')
      .reply(200, cssFileContent)
      .get('/test-page_files/runtime.js')
      .reply(200, jsFileContent)
      .get('/courses')
      .reply(200, coursesFileContent);
  });

  afterAll(() => {
    fsp.rm(getFixturePath('localhost'), { recursive: true });
  });

  it('test page-loader', async () => {
    await pageLoader(address, getFixturePath());

    const dataPage = await fsp.readFile(getFixturePath(getDirName(address), `${getFileName(address)}.html`), 'utf8');
    expect(dataPage).toBe(loadedPageContent);

    const file1 = await fsp
      .readFile(getFixturePath(getDirName(address), 'localhost-test_files', loadedImageFileName));
    expect(file1).toBeDefined();

    const file2 = await fsp
      .readFile(getFixturePath(getDirName(address), 'localhost-test_files', loadedCssFileName), 'utf8');
    expect(file2).toBe(cssFileContent);

    const file3 = await fsp.readFile(getFixturePath(getDirName(address), 'localhost-test_files', loadedJsFileName), 'utf8');
    expect(file3).toBe(jsFileContent);

    const file4 = await fsp
      .readFile(getFixturePath(getDirName(address), 'localhost-test_files', loadedCoursesFileName), 'utf8');
    expect(file4).toBe(loadedCoursesPageContent);

    await fsp.rm(getFixturePath('localhost'), { recursive: true });
  });

  it('test page-loader errors', async () => {
    await expect(pageLoader('http://localhost/wrong_page', getFixturePath())).rejects.toHaveProperty('statusCode', 404);
    await expect(pageLoader('wrong_address', getFixturePath())).rejects.toThrow('Incorrect address (must be as \'http://example.com\')');
    await expect(pageLoader(address, getFixturePath())).rejects.toHaveProperty('code', 'EEXIST');
    await expect(pageLoader(address, getFixturePath('wrong_directory_name'))).rejects.toHaveProperty('code', 'ENOENT');
  });
});
