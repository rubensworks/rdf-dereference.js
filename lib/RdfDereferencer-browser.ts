import * as RDF from "rdf-js";
import {RdfDereferencerBase} from "./RdfDereferencerBase";

/**
 * An RdfDerefencer can dereference URLs to RDF streams, using any RDF serialization.
 */
export class RdfDereferencer<Q extends RDF.BaseQuad = RDF.Quad> extends RdfDereferencerBase<Q> {

}
