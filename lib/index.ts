import {RdfDereferencerBase} from './RdfDereferencerBase';

export * from "./RdfDereferencer";
export * from "./RdfDereferencerBase";
const rdfDereferencer = <RdfDereferencerBase>require('../engine-default');
export {rdfDereferencer};
