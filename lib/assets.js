/**
 * @file
 * Webpack assets parsing.
 */

const path = require('path');
const { librariesMatcher } = require('./libraries');

/** @typedef {import('webpack').NormalModule} NormalModule */
/** @typedef {import('webpack').Module} Module */

/**
 * @typedef {Object} ConcatModule
 *
 * @prop {Module[]} [modules] Sub-modules from a ConcatenationModule.
 */

/**
 * @typedef {Object} EntryOptions
 *
 * @prop {string} [name] Property to give intersection for type checking.
 * @prop {string[]} [dependOn] Other entries that this entry depends on.
 */

/**
 * @typedef {Object} Entrypoint
 *
 * @prop {string} [name] Import request string.
 * @prop {import('webpack').Chunk[]} chunks Sub-modules from a ConcatenationModule.
 * @prop {EntryOptions} options Entrypoint options.
 */

/**
 * @callback FileProcessor
 *
 * @param {FileProcessorArguments} args File processor arguments.
 * @return {Object} File properties.
 */

/**
 * @typedef {Object} ParserParameters
 *
 * @prop {FileProcessor} processor File processor.
 * @prop {string} extensionName Name of the extension this compilation belongs
 * @prop {string} libraryName Naming template for the libraries.
 */

/**
 * @typedef {Object} DependencyResolverParameters
 *
 * @prop {import('webpack').ChunkGraph} chunkGraph Chunk graph.
 * @prop {string} extensionName Name of this Drupal extension.
 * @prop {(name: string) => string} namer Translator of the library name.
 */

/**
 * Processes the list of dependencies for a list of modules.
 *
 * @param {(Module|NormalModule|ConcatModule)[]} modules The module list.
 * @return {string[]} List of Drupal library names.
 */
const getDependencies = (modules) =>
  modules
    .flatMap((module) => {
      const library =
        'userRequest' in module && librariesMatcher(module.userRequest);
      const subModules = 'modules' in module && module.modules;

      return [
        library ? library.library : '',
        ...(subModules ? getDependencies(subModules) : []),
      ];
    })
    .filter(Boolean);

/**
 * Creates a dependency resolver for a group of chunks.
 *
 * @param {DependencyResolverParameters} parameters Parameters for resolving.
 * @return {(chunks: import('webpack').Chunk[], siblings?: string[]) => string[]}
 *   Dependency resolver.
 */
const createDependencyResolver = ({ chunkGraph, extensionName, namer }) => (
  chunks,
  siblings = [],
) => [
  ...chunks.flatMap((chunk) =>
    getDependencies(chunkGraph.getChunkModules(chunk)),
  ),
  ...siblings.map((name) => `${extensionName}/${namer(name)}`),
];

/**
 * Creates a library namer.
 *
 * @param {string} template The naming template.
 * @return {(name: string) => string} The namer function.
 */
const createLibraryNamer = (template) => (name) =>
  template.replace(/\[name\]/g, name);

/**
 * Creates a parser from a Webpack compilation.
 *
 * @param {import('webpack').Compilation} compilation The compilation.
 * @param {ParserParameters} params Parameters for parsing.
 * @return {(entry: Entrypoint) => Library} Parser function.
 */
const createParser = (
  compilation,
  { libraryName, extensionName, processor },
) => {
  const { outputOptions, chunkGraph } = compilation;
  const { context = '' } = compilation.options;

  const relative = path.relative(context, outputOptions.path || '');
  const filePrefix = relative ? `${relative}/` : '';

  const namer = createLibraryNamer(libraryName);

  const resolveDependencies = chunkGraph
    ? createDependencyResolver({ chunkGraph, extensionName, namer })
    : null;

  return ({ name = '', chunks, options }) => ({
    name: namer(name),
    files: Object.fromEntries(
      chunks.flatMap(({ files }) =>
        [...files].map((filename) => [
          `${filePrefix}${filename}`,
          processor({ filename, compilation }),
        ]),
      ),
    ),
    dependencies: resolveDependencies
      ? resolveDependencies(chunks, options.dependOn)
      : [],
  });
};

/**
 * Parses entries from a Webpack compilation.
 *
 * @param {import('webpack').Compilation} compilation The compilation.
 * @param {ParserParameters} params Parameters for parsing.
 * @return {Library[]} The parsed entries.
 */
module.exports.parseEntries = (compilation, params) =>
  [...compilation.entrypoints.values()].map(createParser(compilation, params));
