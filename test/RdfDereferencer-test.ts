import "jest-rdf";
const arrayifyStream = require('arrayify-stream');
const quad = require('rdf-quad');
import {Readable} from "stream";
import {RdfDereferencer} from "../lib/RdfDereferencer";

import dereferencer from "..";

const mockSetup = require('./__mocks__/follow-redirects').mockSetup;

describe('dereferencer', () => {
  it('should be an RdfDereferencer instance', () => {
    expect(dereferencer).toBeInstanceOf(RdfDereferencer);
  });

  it('should error on 404 responses', async () => {
    mockSetup({ statusCode: 404 });
    return expect(dereferencer.dereference('http://example.org/')).rejects
      .toThrow(new Error('Could not retrieve http://example.org/ (404: unknown error)'));
  });

  it('should error on errors', async () => {
    mockSetup({ error: true });
    return expect(dereferencer.dereference('http://example.org/')).rejects
      .toThrow(new Error('Request Error!'));
  });

  it('should handle text/turtle responses', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } });
    const out = await dereferencer.dereference('http://example.org/');
    expect(out.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/');
    return expect(arrayifyStream(out.quads)).resolves.toBeRdfIsomorphic([
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o1'),
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should handle text/turtle responses for https', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } });
    const out = await dereferencer.dereference('https://example.org/');
    expect(out.triples).toBeTruthy();
    expect(out.url).toEqual('https://example.org/');
    return expect(arrayifyStream(out.quads)).resolves.toBeRdfIsomorphic([
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o1'),
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should handle text/turtle responses by extension', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body });
    const out = await dereferencer.dereference('http://example.org/bla.ttl');
    expect(out.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/bla.ttl');
    return expect(arrayifyStream(out.quads)).resolves.toBeRdfIsomorphic([
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o1'),
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should handle text/turtle responses with overridden content locations', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle', 'content-location': 'http://example.org/bla' } });
    const out = await dereferencer.dereference('http://example.org/');
    expect(out.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/bla');
    return expect(arrayifyStream(out.quads)).resolves.toBeRdfIsomorphic([
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o1'),
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should fail to parse invalid text/turtle', async () => {
    const body = new Readable();
    body.push(`
<s> <p> <o1>,
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } });
    const out = await dereferencer.dereference('http://example.org/');
    expect(out.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/');
    return expect(arrayifyStream(out.quads))
      .rejects.toThrow(new Error('Expected entity but got eof on line 3.'));
  });

  it('should fail to parse unknown content types', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'unknown' } });
    return expect(dereferencer.dereference('http://example.org/')).rejects
      .toThrow();
  });

  it('should handle application/ld+json responses', async () => {
    const body = new Readable();
    body.push(`
{
  "@context": { "@vocab": "http://schema.org/" },
  "@type": "Person",
  "@id": "",
  "name": "Jane Doe",
  "url": { "@id": "" }
}
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'application/ld+json' } });
    const out = await dereferencer.dereference('http://example.org/');
    expect(out.triples).toBeFalsy();
    expect(out.url).toEqual('http://example.org/');
    return expect(arrayifyStream(out.quads))
      .resolves.toBeRdfIsomorphic([
        quad('http://example.org/', 'http://schema.org/name', '"Jane Doe"'),
        quad('http://example.org/', 'http://schema.org/url', 'http://example.org/'),
        quad('http://example.org/', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person'),
      ]);
  });

  it('should return HTTP response headers', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } });
    const out = await dereferencer.dereference('http://example.org/', { method: 'GET' });
    expect(out.headers).toEqual({
      'content-type': 'text/turtle',
      "usedheaders": "{}",
      'usedmethod': 'GET',
    });
  });

  it('should pass custom HTTP headers', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } });
    const out = await dereferencer.dereference('http://example.org/', { headers: { _a: 'A', _b: 'B' } });
    expect(out.headers).toEqual({
      'content-type': 'text/turtle',
      'usedheaders':  "{\"_a\":\"A\",\"_b\":\"B\"}",
      'usedmethod': 'GET',
    });
  });

  it('should pass custom HTTP methods', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } });
    const out = await dereferencer.dereference('http://example.org/', { method: 'POST' });
    expect(out.headers).toEqual({
      'content-type': 'text/turtle',
      "usedheaders": "{}",
      'usedmethod': 'POST',
    });
  });
});
