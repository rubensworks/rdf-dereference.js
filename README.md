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
If the server did not emit any content type, then the content type will be guessed based on well-known extensions.

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

_If you need something more low-level with more control, have a look at [`rdf-parse`](https://github.com/rubensworks/rdf-parse.js#readme)._

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

### Dereferencing an RDF document

The `rdfDereferencer.dereference` method accepts an URL,
and outputs a promise resolving to an object containing a quad stream.

```javascript
const { quads } = await rdfDereferencer.dereference('http://dbpedia.org/page/12_Monkeys');
quads.on('data', (quad) => console.log(quad))
     .on('error', (error) => console.error(error))
     .on('end', () => console.log('All done!'));
```

Such a stream is useful when the RDF document is huge,
and you want to process it in a memory-efficient way.

Dereferencing works with any kind of RDF serialization,
even HTML documents containing RDFa and JSON-LD:

```javascript
const { quads1 } = await rdfDereferencer.dereference('https://www.rubensworks.net/');
const { quads2 } = await rdfDereferencer.dereference('https://www.netflix.com/title/80180182');
```

### Importing the resulting quads into a store

These resulting quads can easily be stored in a [more convenient datastructure](http://rdf.js.org/stream-spec/#store-interface)
using tools such as [`rdf-store-stream`](https://www.npmjs.com/package/rdf-store-stream):

```javascript
import {storeStream} from "rdf-store-stream";

const store = await storeStream(quads);

const resultStream = store.match(namedNode('http://example.org/subject'));
```

### Advanced features

#### Determining the final URL

If dereferencing went through various redirects, it may be useful to determine the final URL.
This can be done using the `url` field of the output object:

```javascript
const { quads, url } = await rdfDereferencer.dereference('https://www.netflix.com/title/80180182');
console.log(url); // The final URL, e.g. https://www.netflix.com/at-en/title/80180182
```

#### Triples or Quads

Some RDF serializations don't support named graphs, such as Turtle and N-Triples.
In some cases, it may be valuable to know whether or not an RDF document was serialized with such a format.
If this was the case, the `triples` flag will be set to true on the resulting object:

```javascript
const { quads, triples } = await rdfDereferencer.dereference('https://ruben.verborgh.org/profile/');
console.log(triples); // If the document only supported triples, true in this case, since it returned Turtle.
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
