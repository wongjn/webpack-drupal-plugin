/**
 * @file
 * Test mapped Webpack externals.
 */

const { strictEqual } = require('assert');
const { ExternalModule } = require('webpack');
const { cleanDist, runWebpack } = require('./utils');

/* eslint-disable class-methods-use-this */

/**
 * Gets the external modules from the first main entrypoint chunk.
 *
 * @param {import('webpack').Compilation} compilation Webpack compilation.
 * @return {ExternalModule} External modules.
 */
const getExternalModules = (compilation) =>
  compilation.chunkGraph
    .getChunkModules(compilation.entrypoints.get('main').chunks[0])
    .filter((module) => module instanceof ExternalModule);

describe('Externals mapping', function () {
  afterEach(cleanDist);

  it('should automatically map externals', async function () {
    const externals = getExternalModules((await runWebpack()).compilation);
    strictEqual(externals.length, 1);
    strictEqual(externals[0].userRequest, 'Drupal');
  });

  it('should keep libraries that resolve to the same external separate', async function () {
    const { compilation } = await runWebpack({
      entry: './src/multiple-externals.js',
    });
    strictEqual(getExternalModules(compilation).length, 4);
  });
});
