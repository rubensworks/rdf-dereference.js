# RDF Dereference

[![Build Status](https://travis-ci.org/rubensworks/rdf-dereference.js.svg?branch=master)](https://travis-ci.org/rubensworks/rdf-dereference.js)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdf-dereference.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdf-dereference.js?branch=master)
[![npm version](https://badge.fury.io/js/rdf-dereference.svg)](https://www.npmjs.com/package/rdf-dereference) [![Greenkeeper badge](https://badges.greenkeeper.io/rubensworks/rdf-dereference.js.svg)](https://greenkeeper.io/)

This library dereferences URLs to get its RDF contents.

This tool is useful in situations where you have a URL,
and you just need the _parsed triples/quads_,
without having to concern yourself with determining the correct content type and picking the correct parser.

RDF contents are returned as an _RDF stream_ with [RDFJS](http://rdf.js.org/)-compliant quads.
This library takes care of all the necessary boilerplate automatically,
such as content negotiation for getting appropriate RDF serialization, decompression, following redirects, setting base URLs, and so on. 

The following RDF serializations are supported:

| **Name** | **Content type** | **Extensions** |
| -------- | ---------------- | ------------- |
| [TriG](https://www.w3.org/TR/trig/) | `application/trig` | `.trig` |
| [N-Quads](https://www.w3.org/TR/n-quads/) | `application/n-quads` | `.nq`, `.nquads` |
| [Turtle](https://www.w3.org/TR/turtle/) | `text/turtle` | `.ttl`, `.turtle` |
| [N-Triples](https://www.w3.org/TR/n-triples/) | `application/n-triples` | `.nt`, `.ntriples` |
| [Notation3](https://www.w3.org/TeamSubmission/n3/) | `text/n3` | `.n3` |
| [JSON-LD](https://json-ld.org/) | `application/ld+json`, `application/json` | `.json`, `.jsonld` |
| [RDF/XML](https://www.w3.org/TR/rdf-syntax-grammar/) | `application/rdf+xml` | `.rdf`, `.rdfxml`, `.owl` |
| [RDFa](https://www.w3.org/TR/rdfa-in-html/) and script RDF data tags [HTML](https://html.spec.whatwg.org/multipage/)/[XHTML](https://www.w3.org/TR/xhtml-rdfa/) | `text/html`, `application/xhtml+xml` | `.html`, `.htm`, `.xhtml`, `.xht` |
| [RDFa](https://www.w3.org/TR/2008/REC-SVGTiny12-20081222/metadata.html#MetadataAttributes) in [SVG](https://www.w3.org/TR/SVGTiny12/)/[XML](https://html.spec.whatwg.org/multipage/) | `image/svg+xml`,`application/xml` | `.xml`, `.svg`, `.svgz` |

Internally, this library makes use of RDF parsers from the [Comunica framework](https://github.com/comunica/comunica),
which enable streaming processing of RDF.

## Installation

```bash
$ npm install rdf-dereference
```

or

```bash
$ yarn add rdf-dereference
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Require

```typescript
import rdfDereferencer from "rdf-dereference";
```

_or_

```javascript
const rdfDereferencer = require("rdf-dereference").default;
```

## Usage

TODO

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
