import {RdfDereferencerBase} from './RdfDereferencerBase';

export * from "./RdfDereferencer";
export * from "./RdfDereferencerBase";
const rdfDereferencerFactory = require('../engine-default');
const rdfDereferencer = <RdfDereferencerBase>rdfDereferencerFactory ? rdfDereferencerFactory() : undefined;
export {rdfDereferencer};
