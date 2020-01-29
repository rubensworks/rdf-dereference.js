#!/usr/bin/env node
import {IActorRdfDereferenceOutput} from "@comunica/bus-rdf-dereference/lib/ActorRdfDereference";
import {quadToStringQuad} from "rdf-string";
import rdfDereferencer from "..";

// tslint:disable:no-console
// tslint:disable:no-var-requires

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error(`rdf-dereference dereferences an RDF stream

Usage:
  rdf-dereference some-url
  rdf-dereference http://dbpedia.org/page/12_Monkeys
`);
  process.exit(1);
}

rdfDereferencer.dereference(args[0], { localFiles: true })
  .then((out: IActorRdfDereferenceOutput) => {
    process.stdout.write('[');
    let first = true;
    out.quads.on('data', (quad) => {
      if (!first) {
        process.stdout.write(',\n');
      } else {
        process.stdout.write('\n');
      }
      first = false;
      process.stdout.write(JSON.stringify(quadToStringQuad(quad)));
    });
    out.quads.on('end', () => console.log('\n]'));
  })
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
