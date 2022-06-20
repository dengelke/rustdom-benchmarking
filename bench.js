const fs = require('fs');
const path = require('path');

let browser = false;

let cloneBench = true;

const clean = str => browser ? str.replace(/\x1b\[\dm/g, '') : str;

const bench = (name, count, times) => {
  let total = 0;
  for (let i = 0; i < times; i++) {
    const timeName = `${name} \x1b[2m${i < 1 ? 'cold' : ' hot'}\x1b[0m`;
    console.time(clean(timeName));
    total = count();
    console.timeEnd(clean(timeName));
  }
  return total;
};
const crawl = (element, kind) => {
  const nodes = element[kind];
  const { length } = nodes;
  let count = length;
  for (let i = 0; i < length; i++)
    count += crawl(nodes[i], kind);
  return count;
};

const heapUsage = () => `heapUsed: ${Math.round(process.memoryUsage()['heapUsed'] / 1024 / 1024 * 100) / 100} MB`

let createDocument;

console.log(' DOM TYPE: ', process.env.DOM);
console.log(` pre loading: ${heapUsage()}`);
console.time(' loading');
switch (process.env.DOM) {
  case 'RUSTDOM':
    const RustDOM = require('rustdom');
    createDocument = (html) => new RustDOM(html).document;
    break;
  case 'JSDOM':
    const JSDOM = require('jsdom').JSDOM;
    createDocument = (html) => new JSDOM(html).window.document;
    break;
  case 'LINKEDOM':
    const parseHTML = require('linkedom').parseHTML;
    createDocument = (html) => parseHTML(html).document;
    break;
}
console.timeEnd(' loading');
console.log(` post loading: ${heapUsage()}`);

// Load html file
const html = fs.readFileSync(path.resolve(__dirname, './files/html.html'), 'utf8');

try {
  console.log();
  console.time(' parsing');
  const document = createDocument(html);
  console.timeEnd(' parsing');
  console.log(` post parsing: ${heapUsage()}`);
  console.log();
  try {
    console.log(' total div', bench(' querySelectorAll("div")', () => document.documentElement.querySelectorAll('div').length, 2));
  }
  catch (o_O) {
    console.warn(clean(`⚠ \x1b[1merror\x1b[0m - unable to querySelectorAll("div"): ${o_O.message}`));
  }
  console.log();

  try {
    console.log(' total p', bench(' getElementsByTagName("p")', () => document.documentElement.getElementsByTagName('p').length, 2));
  }
  catch (o_O) {
    console.warn(clean(`⚠ \x1b[1merror\x1b[0m - unable to getElementsByTagName("p"): ${o_O.message}`));
  }
  console.log();

  try {
    bench(' html.normalize()', () => { document.documentElement.normalize(); }, 1);
  }
  catch (o_O) {
    console.warn(clean(`⚠ \x1b[1merror\x1b[0m - unable to normalize html: ${o_O.message}`));
  }
  console.log();

  try {
    console.log(' total childNodes', bench(' crawling childNodes', () => crawl(document.documentElement, 'childNodes'), 2));
  }
  catch (o_O) {
    console.warn(clean(`⚠ \x1b[1merror\x1b[0m - unable to crawl childNodes: ${o_O.message}`));
  }
  console.log();

  try {
    console.log(' total children', bench(' crawling children', () => crawl(document.documentElement, 'children'), 2));
  }
  catch (o_O) {
    console.warn(clean(`⚠ \x1b[1merror\x1b[0m - unable to crawl children: ${o_O.message}`));
  }
  console.log()

  if (cloneBench) {
    try {
      const html = bench(' html.cloneNode(true)', () => document.documentElement.cloneNode(true), 1);
      console.log(' cloneNode: OK');
      console.log();

      const outerHTML = bench(' html.outerHTML', () => html.outerHTML, 2);

      if (outerHTML.length !== document.documentElement.outerHTML.length)
        throw new Error('invalid output');
      console.log(' outcome: OK');
    }
    catch (o_O) {
      console.warn(clean(`⚠ \x1b[1merror\x1b[0m - unable to clone html: ${o_O.message}`));
    }
    console.log();
  }

  if (cloneBench) {
    console.time(' html.innerHTML');
    document.documentElement.innerHTML = document.documentElement.innerHTML;
    console.timeEnd(' html.innerHTML');
  }

  try {
    const divs = document.documentElement.querySelectorAll('div');
    console.time(' removing divs');
    divs.forEach(div => {
      div.remove();
    });
    console.timeEnd(' removing divs');
  }
  catch (o_O) {
    console.warn(clean(`⚠ \x1b[1merror\x1b[0m - unable to div.remove() them all: ${o_O.message}`));
  }
  console.log();

  try {
    console.log(' total div', bench(' div count', () => document.documentElement.getElementsByTagName('div').length, 1));
  }
  catch (o_O) {
    console.warn(clean(`⚠ \x1b[1merror\x1b[0m - unable to getElementsByTagName("div"): ${o_O.message}`));
  }
  console.log();

  console.time(' serialize');
  const output = document.documentElement.outerHTML;
  console.timeEnd(' serialize');
  console.log(` post serialize: ${heapUsage()}`);
  console.log();
} catch (err) {
  console.log({ err })
}
