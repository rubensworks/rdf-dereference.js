import {IActionRdfDereference, IActorRdfDereferenceOutput} from "@comunica/bus-rdf-dereference";
import {ActionContext, Actor, IActorTest, Mediator} from "@comunica/core";
import * as RDF from "rdf-js";

/**
 * An RdfDerefencer can dereference URLs to RDF streams, using any RDF serialization.
 */
export class RdfDereferencer<Q extends RDF.BaseQuad = RDF.Quad>  {

  public readonly mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest,
    IActorRdfDereferenceOutput>, IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;

  constructor(args: IRdfDerefencerArgs) {
    this.mediatorRdfDereference = args.mediatorRdfDereference;
  }

  /**
   * Dereference the given URL to an RDF stream.
   * @param {string} url An HTTP or HTTPS URL.
   * @return {IActorRdfDereferenceOutput} The dereference output.
   */
  public dereference(url: string): Promise<IActorRdfDereferenceOutput> {
    // Delegate dereferencing to the mediator
    return this.mediatorRdfDereference.mediate({ context: ActionContext({}), url });
  }

}

export interface IRdfDerefencerArgs {
  mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest,
    IActorRdfDereferenceOutput>, IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;
}
