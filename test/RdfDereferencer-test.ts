import "jest-rdf";
const quad = require('rdf-quad');
import {arrayifyStream} from 'arrayify-stream';
import {join} from "path";
import {Readable} from "stream";
import {RdfDereferencer} from "../lib/RdfDereferencer";
import 'cross-fetch';
import { Headers } from 'cross-fetch';

import {rdfDereferencer} from "..";
import { mocked } from 'jest-mock';

// Mock fetch
let fetchOut: any;
(<any> global).fetch = jest.fn((input: any, init: any) => {
  return fetchOut;
});

const getMock = (options: { statusCode?: number, error?: boolean, body?: Readable, headers?: any, url?: string }) => {
  if (options.error) {
    return Promise.reject(new Error('fetch error'));
  } else {
    return Promise.resolve({
      url: options.url || 'http://example.org/',
      status: options.statusCode || 200,
      body: options.body,
      headers: new Headers(options.headers || {}),
    });
  }
};

const mockSetup = (...args: Parameters<typeof getMock>) => {
  fetchOut = getMock(...args);
};

mockSetup({ statusCode: 200 });

describe('dereferencer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be an RdfDereferencer instance', () => {
    expect(rdfDereferencer).toBeInstanceOf(RdfDereferencer);
  });

  it('should error on 404 responses', async () => {
    mockSetup({ statusCode: 404 });
    return expect(rdfDereferencer.dereference('http://example.org/')).rejects
      .toThrow(new Error('Could not retrieve http://example.org/ (HTTP status 404):\nempty response'));
  });

  it('should error on errors', async () => {
    mockSetup({ error: true });
    return expect(rdfDereferencer.dereference('http://example.org/')).rejects
      .toThrow(new Error('fetch error'));
  });

  it('should handle text/turtle responses', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } });
    const out = await rdfDereferencer.dereference('http://example.org/');
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url).toEqual('http://example.org/');
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o1'),
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should use custom fetch function when provided', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);

    const myFetch: typeof fetch = async (url) => getMock({ statusCode: 200, body, headers: { 'content-type': 'text/turtle' } }) as any;

    const out = await rdfDereferencer.dereference('http://example.org/', { fetch: myFetch });
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
    mockSetup({ statusCode: 200, body, headers: {}, url: 'http://example.org/bla.ttl' });
    const out = await rdfDereferencer.dereference('http://example.org/bla.ttl');
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
    const out = await rdfDereferencer.dereference('http://example.org/');
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
    const out = await rdfDereferencer.dereference('http://example.org/');
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
    return expect(rdfDereferencer.dereference('http://example.org/')).rejects
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
    const out = await rdfDereferencer.dereference('http://example.org/');
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
    const out = await rdfDereferencer.dereference('http://example.org/', { method: 'GET' });
    expect(fetch).toHaveBeenCalledWith('http://example.org/', {
      agent: expect.anything(),
      headers: expect.anything(),
      method: 'GET',
      keepalive: true,
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
    const out = await rdfDereferencer.dereference('http://example.org/', { headers: { _a: 'A', _b: 'B' } });
    expect(fetch).toHaveBeenCalledWith('http://example.org/', {
      agent: expect.anything(),
      headers: expect.anything(),
      method: undefined,
      keepalive: true,
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
    const out = await rdfDereferencer.dereference('http://example.org/', { method: 'POST' });
    expect(fetch).toHaveBeenCalledWith('http://example.org/', {
      agent: expect.anything(),
      headers: expect.anything(),
      method: 'POST',
      keepalive: true,
    });
    expect(out.headers).toEqual(new Headers({
      'content-type': 'text/turtle',
    }));
  });

  it('should handle relative local .ttl files', async () => {
    const out = await rdfDereferencer.dereference('test/assets/example.ttl', { localFiles: true });
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url.endsWith(join(process.cwd(), 'test/assets/example.ttl'))).toBeTruthy();
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
      quad(out.url, 'http://ex.org/p', 'http://ex.org/o1'),
      quad(out.url, 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should error on relative local .ttl files without localFiles flag', async () => {
    await expect(rdfDereferencer.dereference('test/assets/example.ttl')).rejects.toThrow(
      new Error('Tried to dereference a local file without enabling localFiles option: test/assets/example.ttl'));
  });

  it('should handle absolute local .ttl files', async () => {
    const out = await rdfDereferencer.dereference(join(process.cwd(), 'test/assets/example.ttl'), { localFiles: true });
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url.endsWith(join(process.cwd(), 'test/assets/example.ttl'))).toBeTruthy();
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
      quad(out.url, 'http://ex.org/p', 'http://ex.org/o1'),
      quad(out.url, 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should handle absolute local .shaclc files', async () => {
    const out = await rdfDereferencer.dereference(join(process.cwd(), 'test/assets/example.shaclc'), { localFiles: true });
    expect(out.metadata.triples).toBeTruthy();
    expect(out.url.endsWith(join(process.cwd(), 'test/assets/example.shaclc'))).toBeTruthy();
    return expect(arrayifyStream(out.data)).resolves.toBeRdfIsomorphic([
      quad("http://localhost:3002/ContactsShape#ContactsShape", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/shacl#NodeShape"),
      quad("http://localhost:3002/ContactsShape", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2002/07/owl#Ontology"),
    ]);
  });

  it('should error on absolute local .ttl files without localFiles flag', async () => {
    await expect(rdfDereferencer.dereference(join(process.cwd(), 'test/assets/example.ttl'))).rejects.toThrow(
      new Error('Tried to dereference a local file without enabling localFiles option: '
        + join(process.cwd(), 'test/assets/example.ttl')));
  });

  it('should handle known versions', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: new Headers({ 'content-type': 'text/turtle; version=1.2' }) });
    await expect(arrayifyStream((await rdfDereferencer.dereference('http://example.org/')).data)).resolves.toBeRdfIsomorphic([
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o1'),
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });

  it('should error on unknown versions', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: new Headers({ 'content-type': 'text/turtle; version=unknown' }) });
    await expect(arrayifyStream((await rdfDereferencer.dereference('http://example.org/')).data)).rejects.toThrow(
            new Error('Detected unsupported version as media type parameter: "unknown" on line 2.'));
  });

  it('should handle unknown versions with parseUnsupportedVersions', async () => {
    const body = new Readable();
    body.push(`
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o1>, <http://ex.org/o2>.
`);
    body.push(null);
    mockSetup({ statusCode: 200, body, headers: new Headers({ 'content-type': 'text/turtle; version=unknown' }) });
    await expect(arrayifyStream((await rdfDereferencer.dereference('http://example.org/', { parseUnsupportedVersions: true })).data)).resolves.toBeRdfIsomorphic([
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o1'),
      quad('http://ex.org/s', 'http://ex.org/p', 'http://ex.org/o2'),
    ]);
  });
});
