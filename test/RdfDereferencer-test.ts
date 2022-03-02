import "jest-rdf";
const arrayifyStream = require('arrayify-stream');
const quad = require('rdf-quad');
import {join} from "path";
import {Readable} from "stream";
import {RdfDereferencer} from "../lib/RdfDereferencer";
import 'cross-fetch';

import dereferencer from "..";
import { mocked } from 'ts-jest/utils';

// Mock fetch
let fetchOut: any;
(<any> global).fetch = jest.fn((input: any, init: any) => {
  return fetchOut;
});

const mockSetup = (options: { statusCode?: number, error?: boolean, body?: Readable, headers?: any, url?: string }) => {
  if (options.error) {
    fetchOut = Promise.reject(new Error('fetch error'));
  } else {
    fetchOut = Promise.resolve({
      url: options.url || 'http://example.org/',
      status: options.statusCode || 200,
      body: options.body,
      headers: new Headers(options.headers || {}),
    });
  }
};
mockSetup({ statusCode: 200 });

describe('dereferencer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be an RdfDereferencer instance', () => {
    expect(dereferencer).toBeInstanceOf(RdfDereferencer);
  });

  it('should error on 404 responses', async () => {
    mockSetup({ statusCode: 404 });
    return expect(dereferencer.dereference('http://example.org/')).rejects
      .toThrow(new Error('Could not retrieve http://example.org/ (HTTP status 404):\nempty response'));
  });

  it('should error on errors', async () => {
    mockSetup({ error: true });
    return expect(dereferencer.dereference('http://example.org/')).rejects
      .toThrow(new Error('fetch error'));
  });

  it('should handle text/turtle responses', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } });
    const out = await dereferencer.dereference('http://example.org/');
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/');
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
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
    mockSetup({ statusCode: 200, body, url: 'http://example.org/bla.ttl' });
    const out = await dereferencer.dereference('http://example.org/bla.ttl');
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/bla.ttl');
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
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
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/');
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
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
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/');
    return expect(arrayifyStream(out.data))
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
    expect(out.metadata).toBeFalsy();
    expect(out.url).toEqual('http://example.org/');
    return expect(arrayifyStream(out.data))
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
    mockSetup({ statusCode: 200, body, headers: new Headers({ 'content-type': 'text/turtle' }) });
    const out = await dereferencer.dereference('http://example.org/', { method: 'GET' });
    expect(fetch).toHaveBeenCalledWith('http://example.org/', {
      agent: expect.anything(),
      headers: expect.anything(),
      method: 'GET',
    });
    expect(out.headers).toEqual(new Headers({
      'content-type': 'text/turtle',
    }));
  });

  it('should pass custom HTTP headers', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: new Headers({ 'content-type': 'text/turtle' }) });
    const out = await dereferencer.dereference('http://example.org/', { headers: { _a: 'A', _b: 'B' } });
    expect(fetch).toHaveBeenCalledWith('http://example.org/', {
      agent: expect.anything(),
      headers: expect.anything(),
      method: undefined,
    });
    expect((<any> mocked(fetch).mock.calls[0][1].headers).get('_a')).toEqual('A');
    expect((<any> mocked(fetch).mock.calls[0][1].headers).get('_b')).toEqual('B');
    expect(out.headers).toEqual(new Headers({
      'content-type': 'text/turtle',
    }));
  });

  it('should pass custom HTTP methods', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: new Headers({ 'content-type': 'text/turtle' }) });
    const out = await dereferencer.dereference('http://example.org/', { method: 'POST' });
    expect(fetch).toHaveBeenCalledWith('http://example.org/', {
      agent: expect.anything(),
      headers: expect.anything(),
      method: 'POST',
    });
    expect(out.headers).toEqual(new Headers({
      'content-type': 'text/turtle',
    }));
  });

  it('should handle relative local .ttl files', async () => {
    const out = await dereferencer.dereference('test/assets/example.ttl', { localFiles: true });
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url).toEqual(join(process.cwd(), 'test/assets/example.ttl'));
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
      quad(out.url, 'http://ex.org/p', 'http://ex.org/o1'),
      quad(out.url, 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should error on relative local .ttl files without localFiles flag', async () => {
    await expect(dereferencer.dereference('test/assets/example.ttl')).rejects.toThrow(
      new Error('Tried to dereference a local file without enabling localFiles option: test/assets/example.ttl'));
  });

  it('should handle absolute local .ttl files', async () => {
    const out = await dereferencer.dereference(join(process.cwd(), 'test/assets/example.ttl'), { localFiles: true });
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url).toEqual(join(process.cwd(), 'test/assets/example.ttl'));
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
      quad(out.url, 'http://ex.org/p', 'http://ex.org/o1'),
      quad(out.url, 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should error on absolute local .ttl files without localFiles flag', async () => {
    await expect(dereferencer.dereference(join(process.cwd(), 'test/assets/example.ttl'))).rejects.toThrow(
      new Error('Tried to dereference a local file without enabling localFiles option: '
        + join(process.cwd(), 'test/assets/example.ttl')));
  });
});
