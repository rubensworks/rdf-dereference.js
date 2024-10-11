import {RdfDereferencerBase} from './RdfDereferencerBase';

export * from "./RdfDereferencer";
export * from "./RdfDereferencerBase";
const rdfDereferencerFactory = require('../engine-default');
const rdfDereferencer = <RdfDereferencerBase>(typeof rdfDereferencerFactory === 'function' ? rdfDereferencerFactory() : undefined);
export {rdfDereferencer};
