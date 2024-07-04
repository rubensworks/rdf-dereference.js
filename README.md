# RDF Dereference

[![Build status](https://github.com/rubensworks/rdf-dereference.js/workflows/CI/badge.svg)](https://github.com/rubensworks/rdf-dereference.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdf-dereference.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdf-dereference.js?branch=master)
[![npm version](https://badge.fury.io/js/rdf-dereference.svg)](https://www.npmjs.com/package/rdf-dereference)

This library dereferences URLs to get its RDF contents.

This tool is useful in situations where you have a URL,
and you just need the _parsed triples/quads_,
without having to concern yourself with determining the correct content type and picking the correct parser.

RDF contents are returned as an _RDF stream_ with [RDFJS](http://rdf.js.org/)-compliant quads. If you would prefer a [`DatasetCore`](https://rdf.js.org/dataset-spec/#datasetcore-interface) return type see [rdf-dereference-store](https://www.npmjs.com/package/rdf-dereference-store).
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
| [Microdata](https://w3c.github.io/microdata-rdf/) | `text/html`, `application/xhtml+xml` | `.html`, `.htm`, `.xhtml`, `.xht` |
| [RDFa](https://www.w3.org/TR/2008/REC-SVGTiny12-20081222/metadata.html#MetadataAttributes) in [SVG](https://www.w3.org/TR/SVGTiny12/)/[XML](https://html.spec.whatwg.org/multipage/) | `image/svg+xml`,`application/xml` | `.xml`, `.svg`, `.svgz` |
| [SHACL Compact Syntax](https://w3c.github.io/shacl/shacl-compact-syntax/) | `text/shaclc` | `.shaclc`, `.shc` |
| [Extended SHACL Compact Syntax](https://github.com/jeswr/shaclcjs#extended-shacl-compact-syntax) | `text/shaclc-ext` | `.shaclce`, `.shce` |

Internally, this library makes use of RDF parsers from the [Comunica framework](https://github.com/comunica/comunica),
which enable streaming processing of RDF.

Internally, the following fully spec-compliant parsers are used:

* [N3.js](https://github.com/rdfjs/n3.js)
* [jsonld-streaming-parser.js](https://github.com/rubensworks/jsonld-streaming-parser.js)
* [microdata-rdf-streaming-parser.js](https://github.com/rubensworks/microdata-rdf-streaming-parser.js)
* [rdfa-streaming-parser.js](https://github.com/rubensworks/rdfa-streaming-parser.js)
* [rdfxml-streaming-parser.js](https://github.com/rdfjs/rdfxml-streaming-parser.js)
* [shaclcjs](https://github.com/jeswr/shaclcjs)

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
import { rdfDereferencer } from "rdf-dereference";
```

_or_

```javascript
const { rdfDereferencer } = require("rdf-dereference");
```

## Usage

### Dereferencing an RDF document

The `rdfDereferencer.dereference` method accepts an URL,
and outputs a promise resolving to an object containing a quad stream.

```javascript
const { data } = await rdfDereferencer.dereference('http://dbpedia.org/page/12_Monkeys');
data.on('data', (quad) => console.log(quad))
     .on('error', (error) => console.error(error))
     .on('end', () => console.log('All done!'));
```

Such a stream is useful when the RDF document is huge,
and you want to process it in a memory-efficient way.

Dereferencing works with any kind of RDF serialization,
even HTML documents containing RDFa and JSON-LD:

```javascript
const { data: quads1 } = await rdfDereferencer.dereference('https://www.rubensworks.net/');
const { data: quads2 } = await rdfDereferencer.dereference('https://www.netflix.com/title/80180182');
```

### Dereferencing a local file

Similar as above, the `rdfDereferencer.dereference` method also accepts file paths.

```javascript
const { data } = await rdfDereferencer.dereference('path/to/file.ttl', { localFiles: true });
data.on('data', (quad) => console.log(quad))
    .on('error', (error) => console.error(error))
    .on('end', () => console.log('All done!'));
```

Note that the `localFiles` flag MUST be enabled before local paths can be dereferenced for security reasons.

This feature is not available when this package is used within a browser environment.

### Importing the resulting quads into a store

These resulting quads can easily be stored in a [more convenient datastructure](http://rdf.js.org/stream-spec/#store-interface)
using tools such as [`rdf-store-stream`](https://www.npmjs.com/package/rdf-store-stream):

```javascript
import {storeStream} from "rdf-store-stream";
import {DataFactory} from "rdf-data-factory";

const dataFactory = new DataFactory();
const store = await storeStream(quads);

// Now you can do quad pattern queries over the stream, such as getting all triples having 'http://example.org/subject' as subject.
const resultStream = store.match(dataFactory.namedNode('http://example.org/subject'));
```

### Advanced features

#### Input: Passing custom headers

You can pass custom headers for the HTTP request via the options object:

```javascript
const { data } = await rdfDereferencer.dereference('https://www.netflix.com/title/80180182', {
  headers: {
    'Accept-Datetime': 'Thu, 31 May 2007 20:35:00 GMT',
  },
});
```

By default, the `GET` method will be used.

#### Input: Setting the HTTP method

You can define the HTTP method via the options object:

```javascript
const { data } = await rdfDereferencer.dereference('https://www.netflix.com/title/80180182', {
  method: 'POST',
});
```

By default, the `GET` method will be used.

#### Input: Using a custom fetch function

You can pass custom headers for the HTTP request via the options object:

```javascript
const { data } = await rdfDereferencer.dereference('https://www.netflix.com/title/80180182', {
  fetch: myFetch,
});
```

By default, the `GET` method will be used.

#### Output: Determining the final URL

If dereferencing went through various redirects, it may be useful to determine the final URL.
This can be done using the `url` field of the output object:

```javascript
const { data, url } = await rdfDereferencer.dereference('https://www.netflix.com/title/80180182');
console.log(url); // The final URL, e.g. https://www.netflix.com/at-en/title/80180182
```

#### Output: Response Headers

This library will return the HTTP response headers as a [Headers object](https://developer.mozilla.org/en-US/docs/Web/API/Headers):

```javascript
const { data, headers } = await rdfDereferencer.dereference('https://ruben.verborgh.org/profile/');
console.log(headers); // Example: new Headers({ 'content-length': '65701' })
```

#### Output: Triples or Quads

Some RDF serializations don't support named graphs, such as Turtle and N-Triples.
In some cases, it may be valuable to know whether or not an RDF document was serialized with such a format.
If this was the case, the `triples` flag will be set to true on the resulting object:

```javascript
const { quads, metadata } = await rdfDereferencer.dereference('https://ruben.verborgh.org/profile/');
console.log(metadata.triples); // If the document only supported triples, true in this case, since it returned Turtle.
```

### Command line usage

A CLI version of this tool exists, which can be installed globally as follows:

```bash
$ npm install -g rdf-dereference
```

After that, you can dereference any URL to a compact JSON-based quad representation:

```bash
$ rdf-dereference https://www.rubensworks.net/
[
{"subject":"https://www.rubensworks.net/","predicate":"http://xmlns.com/foaf/0.1/primaryTopic","object":"https://www.rubensworks.net/#me","graph":""},
{"subject":"https://www.rubensworks.net/","predicate":"http://xmlns.com/foaf/0.1/maker","object":"https://www.rubensworks.net/#me","graph":""},
{"subject":"https://www.rubensworks.net/#me","predicate":"http://www.w3.org/1999/02/22-rdf-syntax-ns#type","object":"http://xmlns.com/foaf/0.1/Person","graph":""},
{"subject":"https://www.rubensworks.net/#me","predicate":"http://xmlns.com/foaf/0.1/name","object":"\"Ruben Taelman\"","graph":""},
...
```

After that, you can dereference local files, for which the content type will be identified by extension:

```bash
$ rdf-dereference path/to/file.ttl
...
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
