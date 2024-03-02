# binobj

[![Node.js CI](https://github.com/mburakeker/binobj/actions/workflows/node.js.yml/badge.svg)](https://github.com/mburakeker/binobj/actions/workflows/node.js.yml)

A Node.js package to clean up 'bin' and 'obj' folders in your project.

## Installation

Install globally using npm:

```bash
npm install -g binobj
```

## Usage

Run the following command in your project directory:

```bash
binobj
```

or if you haven't installed it:

```bash
npx binobj
```

This will recursively search and delete 'bin' and 'obj' folders in the current working directory and its subdirectories.

Note: You will be prompted to confirm before the deletion process begins.
