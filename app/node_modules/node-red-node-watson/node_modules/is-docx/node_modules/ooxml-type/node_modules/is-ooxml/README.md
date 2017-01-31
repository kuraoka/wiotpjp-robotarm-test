# is-ooxml
Detect if file buffer is an OOXML file type.  

Checks for `'PK\x03\x04\x14\x00\x06\x00'` at the start of a file buffer.

## Install

```
npm install is-ooxml
```

## Usage

```js
const fs = require('fs');
const isOoxml = require('is-ooxml');

const docx = fs.readFileSync('example.docx');
const pdf = fs.readFileSync('example.pdf');

console.log(isOoxml(docx), isOoxml(pdf)); // > true false
```
