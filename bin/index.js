#!/usr/bin/env node
import { Command } from 'commander';
import pageLoader from '../src/index.js';

const program = new Command();

program
  .name('page-loader')
  .version('1.0.0')
  .description('Page loader utility')
  .option('-o, --output [path]', 'output dir (default: "/home/user/current-dir")')
  .argument('<address>')
  .action((address) => {
    pageLoader(address, program.opts().output);
  });
program.parse();
