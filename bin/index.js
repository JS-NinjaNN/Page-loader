#!/usr/bin/env node
import { Command } from 'commander';
// import pageLoader from '../src/index.js';

const program = new Command();

program
  .name('page-loader')
  .version('1.0.0')
  .description('Page loader utility')
  .option('-o, --output [path]', 'output dir', '/home/user/current-dir')
  .argument('<url>')
  .action(() => {
    const option = program.opts();
    // const diff = genDiff(filepath1, filepath2, option.format);
    console.log(option);
  });
program.parse();
