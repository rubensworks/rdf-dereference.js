import { RdfDereferencerBase } from './lib/RdfDereferencerBase';
export * from "./lib/RdfDereferencer";
// tslint:disable:no-var-requires
export default <RdfDereferencerBase> require('./engine-default');
