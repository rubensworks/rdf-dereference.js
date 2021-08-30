import {IActionRdfDereference, IActorRdfDereferenceOutput} from "@comunica/bus-rdf-dereference";
import {ActionContext, Actor, IActorTest, Mediator} from "@comunica/core";
import * as RDF from "@rdfjs/types";

/**
 * An RdfDerefencer can dereference URLs to RDF streams, using any RDF serialization.
 */
export class RdfDereferencerBase<Q extends RDF.BaseQuad = RDF.Quad> {

  public readonly mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest,
    IActorRdfDereferenceOutput>, IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;

  constructor(args: IRdfDerefencerArgs) {
    this.mediatorRdfDereference = args.mediatorRdfDereference;
  }

  /**
   * Dereference the given URL to an RDF stream.
   * @param {string} url An HTTP(S) HTTPS URL.
   * @param {IDereferenceOptions} options
   * @return {IActorRdfDereferenceOutput} The dereference output.
   */
  public dereference(url: string, options: IDereferenceOptions = {}): Promise<IActorRdfDereferenceOutput> {
    // Delegate dereferencing to the mediator
    return this.mediatorRdfDereference.mediate({
      context: ActionContext(options),
      headers: options.headers,
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
}

export interface IRdfDerefencerArgs {
  mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest,
    IActorRdfDereferenceOutput>, IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;
}
