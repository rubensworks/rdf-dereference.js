import {IActorDereferenceRdfOutput} from "@comunica/bus-dereference-rdf";
import {join} from "path";
import * as RDF from "@rdfjs/types";
import {IDereferenceOptions, RdfDereferencerBase} from "./RdfDereferencerBase";
const process = require("process/");

/**
 * An RdfDerefencer can dereference URLs to RDF streams, using any RDF serialization.
 */
export class RdfDereferencer<Q extends RDF.BaseQuad = RDF.Quad> extends RdfDereferencerBase<Q> {

  /**
   * Dereference the given URL to an RDF stream.
   * @param {string} url An HTTP(S) HTTPS URL, or a local file path.
   *                     Local file paths are only allowed when options.localFiles is enabled.
   * @param {IDereferenceOptions} options
   * @return {IActorRdfDereferenceOutput} The dereference output.
   */
  public dereference(url: string, options: IDereferenceOptions = {}): Promise<IActorDereferenceRdfOutput> {
    // For security reasons, only allow derefencing local files if the option is enabled.
    // This is to avoid issues with packages that use this tool via a Web API,
    // and don't want to expose access to their local files.
    if (!url.startsWith('http')) {
      if (!options.localFiles) {
        return Promise.reject(
          new Error('Tried to dereference a local file without enabling localFiles option: ' + url));
      } else if (!url.startsWith('/') && !(url.indexOf(':') < url.indexOf('\\'))) {
        url = join(process.cwd(), url);
      }
    }

    return super.dereference(url, options);
  }

}
