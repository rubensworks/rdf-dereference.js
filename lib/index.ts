import type { RdfDereferencerBase } from './RdfDereferencerBase';

export * from "./RdfDereferencer";
export * from "./RdfDereferencerBase";
const rdfDereferencerFactory = require('../engine-default') as (() => RdfDereferencerBase) | undefined;

const rdfDereferencer = <RdfDereferencerBase>(
  typeof rdfDereferencerFactory === 'function' ? rdfDereferencerFactory() : undefined
);
export { rdfDereferencer };
