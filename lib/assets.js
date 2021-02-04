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
 * @param {import('webpack').ChunkGraph} chunkGraph Chunk graph.
 * @param {string} extensionName Name of this Drupal extension.
 * @return {(chunks: import('webpack').Chunk[], siblings?: string[]) => string[]}
 *   Dependency resolver.
 */
const createDependencyResolver = (chunkGraph, extensionName) => (
  chunks,
  siblings = [],
) => [
  ...chunks.flatMap((chunk) =>
    getDependencies(chunkGraph.getChunkModules(chunk)),
  ),
  ...siblings.map((name) => `${extensionName}/${name}`),
];

/**
 * Creates a parser from a Webpack compilation.
 *
 * @param {import('webpack').Compilation} compilation The compilation.
 * @param {FileProcessor} process File properties processor.
 * @return {(entry: Entrypoint) => Library} Parser function.
 */
const createParser = (compilation, process) => {
  const { outputOptions, chunkGraph } = compilation;
  const { context = '' } = compilation.options;

  const relative = path.relative(context, outputOptions.path || '');
  const filePrefix = relative ? `${relative}/` : '';

  const resolveDependencies = chunkGraph
    ? createDependencyResolver(chunkGraph, path.basename(context))
    : null;

  return ({ name = '', chunks, options }) => ({
    name,
    files: Object.fromEntries(
      chunks.flatMap(({ files }) =>
        [...files].map((filename) => [
          `${filePrefix}${filename}`,
          process({ filename, compilation }),
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
 * @param {FileProcessor} process File properties processor.
 * @return {Library[]} The parsed entries.
 */
module.exports.parseEntries = (compilation, process) =>
  [...compilation.entrypoints.values()].map(createParser(compilation, process));
