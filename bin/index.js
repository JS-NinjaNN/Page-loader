#!/usr/bin/env node
import { Command } from 'commander';
import debug from 'debug';
import Listr from 'listr';

import pageLoader from '../src/index.js';

const debugError = debug('page-loader:error');
const program = new Command();

program
  .name('page-loader')
  .version('1.0.0')
  .description('Page loader utility')
  .option('-o, --output [path]', 'output dir (default: "/home/user/current-dir")')
  .argument('<address>')
  .action((address) => {
    const executeTask = (url, func, config) => {
      let taskData;
      const tasks = new Listr([
        {
          title: `Loading file '${url}'`,
          task: (_ctx, task) => func(url, config)
            .then((data) => {
              taskData = data;
            })
            .catch((e) => task.skip(`Fail load '${url}'. ${e.message}`)),
        },
      ]);
      return tasks.run()
        .then(() => taskData);
    };

    pageLoader(address, program.opts().output, executeTask)
      .then(() => process.exit(0))
      .catch((e) => {
        debugError(e);
        switch (e.code) {
          case 'ERR_BAD_REQUEST':
            console.error(`404: page '${e.config.url}' not found.`);
            process.exit(1);
            break;
          default:
            console.error(e.message);
            process.exit(1);
            break;
        }
      });
  });
program.parse();
