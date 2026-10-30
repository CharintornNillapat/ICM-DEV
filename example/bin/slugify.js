#!/usr/bin/env node
import { slugify } from '../src/slugify.js';

console.log(slugify(process.argv.slice(2).join(' ')));
