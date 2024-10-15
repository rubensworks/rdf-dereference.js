# Changelog
All notable changes to this project will be documented in this file.

<a name="v4.0.0"></a>
## [v4.0.0](https://github.com/rubensworks/rdf-dereference.js/compare/v3.0.0...v4.0.0) - 2024-10-15

### BREAKING CHANGES
* [Bump to Comunica v4](https://github.com/rubensworks/rdf-dereference.js/commit/a24da07415ccb323397b4fb3efd0bafc35bbbe02)
  * Besides performance improvements, this increases the minimum requires Node.js version to 18.

<a name="v3.0.0"></a>
## [v3.0.0](https://github.com/rubensworks/rdf-dereference.js/compare/v2.2.0...v3.0.0) - 2024-07-04

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Replace default export with named export `rdfDereferencer` for better ESM support (#53)](https://github.com/rubensworks/rdf-dereference.js/commit/13d623cc8173bfe2e12df2f5ff3e1dda945c6159)
  * Update your imports to `import { rdfDereferencer } from "rdf-dereference";`

<a name="v2.2.0"></a>
## [v2.2.0](https://github.com/rubensworks/rdf-dereference.js/compare/v2.1.0...v2.2.0) - 2023-08-07

### Added
* [Support custom fetch function (#46)](https://github.com/rubensworks/rdf-dereference.js/commit/b59ff0bd96de01c5f8ee7a01f8f09cc0f3c25532)

### Changed
* [Use process shim (#43)](https://github.com/rubensworks/rdf-dereference.js/commit/2accbad301bfad2e07bd424dbd88baef319115f0)

<a name="v2.1.0"></a>
## [v2.1.0](https://github.com/rubensworks/rdf-dereference.js/compare/v2.0.1...v2.1.0) - 2023-01-31

### Added
* [Add shaclc support](https://github.com/rubensworks/rdf-dereference.js/commit/439eaaeef29809be6390f744e7f432ae1646c015)

<a name="v2.0.1"></a>
## [v2.0.1](https://github.com/rubensworks/rdf-dereference.js/compare/v2.0.0...v2.0.1) - 2022-11-09

### Fixed
* [Include source map files in packed files](https://github.com/rubensworks/rdf-dereference.js/commit/f343a6aaff8fa75e764eaf146994e333b89a610f)

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.9.0...v2.0.0) - 2022-03-02

### Breaking changes
* The `dereference` method now returns the resulting quads in a the `data` field instead of `quads`.
* The `dereference` method now returns an optional metadata field that can contain the `triples` field.
* Returned headers now follow the [Headers API from the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Headers).

### Changed
* [Update to Comunica 2](https://github.com/rubensworks/rdf-dereference.js/commit/eac51293787d4d0ff81c15606ba9f3607e987feb)

<a name="v1.9.0"></a>
## [v1.9.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.8.0...v1.9.0) - 2021-08-30

### Changed
* [Update to Comunica 1.22 and @rdfjs/types](https://github.com/rubensworks/rdf-dereference.js/commit/5a17487e87a35ce30b47e9b7b118268c0d7660c0)

<a name="v1.8.0"></a>
## [v1.8.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.7.0...v1.8.0) - 2021-03-16

### Added
* [Add Microdata to RDF parser, Closes #26](https://github.com/rubensworks/rdf-dereference.js/commit/0adce4b27757dede9c3decef0c29f471eda9f962)

<a name="v1.7.0"></a>
## [v1.7.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.6.0...v1.7.0) - 2021-01-15

### Changed
* [Update to Comunica 1.19](https://github.com/rubensworks/rdf-dereference.js/commit/b60f764f12e3a833e6c2036e75afeb82d24ad3c6)

<a name="v1.6.0"></a>
## [v1.6.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.4.1...v1.6.0) - 2020-09-25

### Fixed
* [Expose typings, Closes #20](https://github.com/rubensworks/rdf-dereference.js/commit/4ab8bdd559be2d41db21814793963dc17567b23e)

### Changed
* [Update to Comunica 1.16](https://github.com/rubensworks/rdf-dereference.js/commit/3771216274e929a1a10c42950248611b738d8a90)

<a name="v1.5.0"></a>
## [v1.5.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.3.1...v1.5.0) - 2020-04-18

### Changed
* [Update dependencies to support JSON-LD 1.1](https://github.com/rubensworks/rdf-dereference.js/commit/4415dc8cb9baeca33cfa89a4a2cb04210da307e5)

<a name="v1.4.1"></a>
## [v1.4.1](https://github.com/rubensworks/rdf-dereference.js/compare/v1.4.0...v1.4.1) - 2020-03-09

### Fixed
* [Add missing bus-init actor, Closes #9](https://github.com/rubensworks/rdf-dereference.js/commit/29999da93d6778fe5aa0a233f6466909bc6aae74)

<a name="v1.4.0"></a>
## [v1.4.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.2.1...v1.4.0) - 2020-01-29

### Added
* [Allow local file paths to be dereferenced, Closes #7](https://github.com/rubensworks/rdf-dereference.js/commit/f93040553eb565038f706ae25c5dbbf1fb3c998d)

<a name="v1.3.1"></a>
## [v1.3.1](https://github.com/rubensworks/rdf-dereference.js/compare/v1.3.0...v1.3.1) - 2020-01-10

### Added
* [Allow HTTP proxies to be defined](https://github.com/rubensworks/rdf-dereference.js/commit/2b27f632ceed5b79062779ac0de4b430f622a8e6)

<a name="v1.3.0"></a>
## [v1.3.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.2.1...v1.3.0) - 2020-01-10

### Added
* [Pass options to Comunica's context](https://github.com/rubensworks/rdf-dereference.js/commit/a4628a8d238b978e70cd46fc419fb2b34774fcd1)

<a name="v1.2.1"></a>
## [v1.2.1](https://github.com/rubensworks/rdf-dereference.js/compare/v1.2.0...v1.2.1) - 2019-10-21

### Fixed
* [Avoid circular importing of parser](https://github.com/rubensworks/rdf-dereference.js/commit/64155c516bc2afcfdd1e40264635a7804ea8d543)

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.1.0...v1.2.0) - 2019-10-17

### Added
* [Allow headers and methods to be customized and read, Closes #1](https://github.com/rubensworks/rdf-dereference.js/commit/189707acbd26319aed76d63b44b8d5d9cd51c82a)

### Changed
* [Bump to Comunica 1.9.3](https://github.com/rubensworks/rdf-dereference.js/commit/ff60fa2f1885ddd0b1ca4578679594a9c9bad431)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/rubensworks/rdf-dereference.js/compare/v1.0.0...v1.1.0) - 2019-09-29

### Added
* [Add CLI tool](https://github.com/rubensworks/rdf-dereference.js/commit/f447152bec93620677fa7a733c98e0d75b41265f)

<a name="v1.0.0"></a>
## [v1.0.0] - 2019-09-29

Initial release
