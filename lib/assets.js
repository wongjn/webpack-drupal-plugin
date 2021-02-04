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
 * @typedef {Object} Entrypoint
 *
 * @prop {string} [name] Import request string.
 * @prop {import('webpack').Chunk[]} chunks Sub-modules from a ConcatenationModule.
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
 * Creates a parser from a Webpack compilation.
 *
 * @param {import('webpack').Compilation} compilation The compilation.
 * @param {FileProcessor} process File properties processor.
 * @return {(entry: Entrypoint) => Library} Parser function.
 */
const createParser = (compilation, process) => {
  const { options, outputOptions, chunkGraph } = compilation;
  const relative = path.relative(
    options.context || '',
    outputOptions.path || '',
  );
  const filePrefix = relative ? `${relative}/` : '';

  return ({ name = '', chunks }) => ({
    name,
    files: Object.fromEntries(
      chunks.flatMap(({ files }) =>
        [...files].map((filename) => [
          `${filePrefix}${filename}`,
          process({ filename, compilation }),
        ]),
      ),
    ),
    dependencies: chunkGraph
      ? chunks.flatMap((chunk) =>
          getDependencies(chunkGraph.getChunkModules(chunk)),
        )
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
