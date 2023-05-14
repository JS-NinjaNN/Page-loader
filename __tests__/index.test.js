import os from 'os';
import fs, { readFileSync } from 'fs';
import fsp from 'fs/promises';
import nock from 'nock';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import pageLoader from '../src/index.js';
import getFileName from '../src/utils/getFileName.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturePath = (...restOfPath) => path.join(__dirname, '..', '__fixtures__', ...restOfPath);
const readFixture = (...restOfPath) => readFileSync(getFixturePath(...restOfPath), 'utf-8');

describe('test pageLoader', () => {
  const address = 'http://localhost/test';
  const testFilesDir = 'test-page_files';
  const loadedTestFilesDir = 'localhost-test_files';
  const mainHtmlFileName = 'test_page.html';
  const imageFileName = 'nodejs.png';
  const loadedImageFileName = 'localhost-test-page-files-nodejs-png.png';
  const cssFileName = 'application.css';
  const loadedCssFileName = 'localhost-assets-application-css.css';
  const jsFileName = 'runtime.js';
  const loadedJsFileName = 'localhost-test-page-files-runtime-js.js';
  const coursesFileName = 'courses.html';
  const loadedCoursesFileName = 'localhost-courses.html';

  const loadedPageContent = readFixture('loaded_page.html').toString();
  const loadedCoursesPageContent = readFixture('loaded_courses_page.html').toString();
  const imageData = readFixture(testFilesDir, imageFileName);
  const cssFileContent = readFixture(testFilesDir, cssFileName).toString();
  const jsFileContent = readFixture(testFilesDir, jsFileName).toString();
  const coursesFileContent = readFixture(testFilesDir, coursesFileName);
  const mainHtmlPageContent = readFixture(mainHtmlFileName);

  const testDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);

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

  afterAll(async () => {
    await fsp.rm(path.resolve(testDir), { recursive: true });
  });

  it('test page-loader', async () => {
    await pageLoader(address, testDir);

    const dataPage = await fsp.readFile(path.resolve(testDir, `${getFileName(address)}.html`), 'utf8');
    expect(dataPage).toBe(loadedPageContent);

    const file1 = await fsp
      .readFile(path.resolve(testDir, loadedTestFilesDir, loadedImageFileName));
    expect(file1).toBeDefined();

    const file2 = await fsp
      .readFile(path.resolve(testDir, loadedTestFilesDir, loadedCssFileName), 'utf8');
    expect(file2).toBe(cssFileContent);

    const file3 = await fsp.readFile(path.resolve(testDir, loadedTestFilesDir, loadedJsFileName), 'utf8');
    expect(file3).toBe(jsFileContent);

    const file4 = await fsp
      .readFile(path.resolve(testDir, loadedTestFilesDir, loadedCoursesFileName), 'utf8');
    expect(file4).toBe(loadedCoursesPageContent);
  });

  it('test page-loader errors', async () => {
    await expect(pageLoader('http://localhost/wrong_page', path.resolve(testDir))).rejects.toHaveProperty('statusCode', 404);
    await expect(pageLoader('wrong_address', path.resolve(testDir))).rejects.toThrow('Incorrect address (must be as \'http://example.com\')');
    await expect(pageLoader(address, path.resolve(testDir, 'wrong_directory_name'))).rejects.toHaveProperty('code', 'ENOENT');
  });
});
