import type { IDereferenceOptions, RdfDereferencerBase } from './RdfDereferencerBase';
import type { DatasetCore, BaseQuad } from '@rdfjs/types';
import { promisifyEventEmitter } from 'event-emitter-promisify';
export * from "./RdfDereferencer";
export * from "./RdfDereferencerBase";
// tslint:disable:no-var-requires
const dereferencer = <RdfDereferencerBase> require('../engine-default');
export default dereferencer;

import { Store } from "n3";
export async function dereferenceStore(url: string, options?: IDereferenceOptions): Promise<DatasetCore<BaseQuad>> {
  const store = new Store();
  const { data } = await dereferencer.dereference(url, options);
  return promisifyEventEmitter(store.import(data), store);
}
