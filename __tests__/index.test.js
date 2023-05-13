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
  const htmlFileName = 'test_page.html';
  const fileName1 = 'nodejs.png';
  const fileName1Loaded = 'localhost-test-page-files-nodejs-png.png';
  let loadedPage;
  let loadedCoursesPage;
  let fileData1;
  const cssFileName = 'application.css';
  const cssFileLoaded = 'localhost-assets-application-css.css';
  let cssFileReaded;
  const jsFileName = 'runtime.js';
  const jsFileLoaded = 'localhost-test-page-files-runtime-js.js';
  let jsFileReaded;
  const coursesFileName = 'courses.html';
  const coursesFileLoaded = 'localhost-courses.html';
  let coursesFileReaded;
  let page;

  beforeAll(() => {
    loadedPage = `<!DOCTYPE html><html lang="ru"><head>
    <meta charset="utf-8">
    <title>Курсы по программированию Хекслет</title>
    <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">
    <link rel="stylesheet" media="all" href="localhost-test_files/localhost-assets-application-css.css">
    <link href="localhost-test_files/localhost-courses.html" rel="canonical">
  </head>
  <body>
    <img src="localhost-test_files/localhost-test-page-files-nodejs-png.png" alt="Иконка профессии Node.js-программист">
    <h3>
      <a href="/professions/nodejs">Node.js-программист</a>
    </h3>
    <script src="https://js.stripe.com/v3/"></script>
    <script src="localhost-test_files/localhost-test-page-files-runtime-js.js"></script>
  
</body></html>`;

    loadedCoursesPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Courses</title>
</head>
<body>
  <h1>Courses:</h1>
  <p>Course 1</p>
  <p>Course 2</p>
</body>
</html>`;

    page = fs.readFileSync(getFixturePath(htmlFileName));
    fileData1 = fs.readFileSync(getFixturePath(testFilesDir, fileName1));
    cssFileReaded = fs.readFileSync(getFixturePath(testFilesDir, cssFileName)).toString();
    jsFileReaded = fs.readFileSync(getFixturePath(testFilesDir, jsFileName)).toString();
    coursesFileReaded = fs.readFileSync(getFixturePath(testFilesDir, coursesFileName));
  });

  beforeEach(() => {
    nock('http://localhost')
      .get('/test')
      .reply(200, page)
      .get(`/${testFilesDir}/${fileName1}`)
      .reply(200, fileData1)
      .get('/assets/application.css')
      .reply(200, cssFileReaded)
      .get('/test-page_files/runtime.js')
      .reply(200, jsFileReaded)
      .get('/courses')
      .reply(200, coursesFileReaded);
  });

  afterAll(() => {
    fsp.rm(getFixturePath(getDirName(address)), { recursive: true });
  });

  it('test page-loader', async () => {
    await pageLoader(address, getFixturePath());

    const dataPage = await fsp.readFile(getFixturePath(getDirName(address), `${getFileName(address)}.html`), 'utf8');
    expect(dataPage).toBe(loadedPage);

    const file1 = await fsp
      .readFile(getFixturePath(getDirName(address), 'localhost-test_files', fileName1Loaded));
    expect(file1).toBeDefined();

    const file2 = await fsp
      .readFile(getFixturePath(getDirName(address), 'localhost-test_files', cssFileLoaded), 'utf8');
    expect(file2).toBe(cssFileReaded);

    const file3 = await fsp.readFile(getFixturePath(getDirName(address), 'localhost-test_files', jsFileLoaded), 'utf8');
    expect(file3).toBe(jsFileReaded);

    const file4 = await fsp
      .readFile(getFixturePath(getDirName(address), 'localhost-test_files', coursesFileLoaded), 'utf8');
    expect(file4).toBe(loadedCoursesPage);
  });
});
