import {IActorDereferenceRdfOutput} from "@comunica/bus-dereference-rdf";
import { ActionContext, Actor } from "@comunica/core";
import * as RDF from "@rdfjs/types";
import { MediatorDereferenceRdf } from '@comunica/bus-dereference-rdf';
import { KeysHttp, KeysInitQuery } from '@comunica/context-entries';
import { DataFactory } from 'rdf-data-factory';

/**
 * An RdfDerefencer can dereference URLs to RDF streams, using any RDF serialization.
 */
export class RdfDereferencerBase<Q extends RDF.BaseQuad = RDF.Quad> {

  public readonly mediatorDereferenceRdf: MediatorDereferenceRdf;

  constructor(args: IRdfDerefencerArgs) {
    this.mediatorDereferenceRdf = args.mediatorDereferenceRdf;
  }

  /**
   * Dereference the given URL to an RDF stream.
   * @param {string} url An HTTP(S) HTTPS URL.
   * @param {IDereferenceOptions} options
   * @return {IActorRdfDereferenceOutput} The dereference output.
   */
  public dereference(url: string, options: IDereferenceOptions = {}): Promise<IActorDereferenceRdfOutput> {
    const context = new ActionContext(options)
      .setDefault(KeysInitQuery.dataFactory, new DataFactory())
      .setDefault(KeysInitQuery.parseUnsupportedVersions, options.parseUnsupportedVersions);
    // Delegate dereferencing to the mediator
    return this.mediatorDereferenceRdf.mediate({
      context: typeof options.fetch === 'function' ? context.setDefault(KeysHttp.fetch, options.fetch) : context,
      headers: new Headers(options.headers),
      method: options.method,
      url,
    });
  }

}

export interface IDereferenceOptions {
  /**
   * Optional HTTP method to use.
   * Defaults to GET.
   */
  method?: string;
  /**
   * Optional HTTP headers to pass.
   */
  headers?: {[key: string]: string};
  /**
   * If dereferencing of local files should be enabled.
   * This is not possible in browser environments.
   */
  localFiles?: boolean;
  /**
   * The fetch function to use.
   */
  fetch?: typeof fetch;
  /**
   * By default, errors will be emitted if parsers encounter unsupported versions.
   * Setting this flag to true will silence those checks.
   */
  parseUnsupportedVersions?: boolean;
}

export interface IRdfDerefencerArgs {
  mediatorDereferenceRdf: MediatorDereferenceRdf;
  actors: Actor<any, any, any>[];
}
