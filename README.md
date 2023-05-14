### Hexlet tests and linter status

[![Actions Status](https://github.com/JS-NinjaNN/backend-project-4/workflows/hexlet-check/badge.svg)](https://github.com/JS-NinjaNN/backend-project-4/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/11cebc2cb0a70bef068b/maintainability)](https://codeclimate.com/github/JS-NinjaNN/backend-project-4/maintainability)
[![tests](https://github.com/JS-NinjaNN/backend-project-4/actions/workflows/page-loader-check.yml/badge.svg)](https://github.com/JS-NinjaNN/backend-project-4/actions/workflows/page-loader-check.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/11cebc2cb0a70bef068b/test_coverage)](https://codeclimate.com/github/JS-NinjaNN/backend-project-4/test_coverage)

---

# Description

Page-loader is a cli-app which downloads the html page at a specified url along with the necessary files, replaces the links to these files with local ones and allows you to run this page later without the internet. The application is friendly, it displays the download status of each of the files and notifies you of any errors that occur.

---

## Minimum system requirements

Node.js 13.2.0 or higher

---

## Installation

Attention! Commands must be run from the app directory!

Installing dependencies

``` Makefile
make install
```

Installing a package with app

The following command will be run as root!

``` Makefile
make link
```

## Usage

``` Makefile
Usage: page-loader [-h] [-V] [-o] <address>

Optional arguments:
  -V, --version  Show program's version number and exit.
  -o, --output [path]   output dir (default: "/home/user/current-dir").
  -h, --help     Show this help message and exit.

```

## Example of usage

[![asciicast](https://asciinema.org/a/E6lZ70xSDAR9UdytjCUwFg8ER.svg)](https://asciinema.org/a/E6lZ70xSDAR9UdytjCUwFg8ER)