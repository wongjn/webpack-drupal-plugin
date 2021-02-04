/**
 * @file
 * Test utilities.
 */

const fs = require('fs').promises;
const path = require('path');
const webpack = require('webpack');
const DrupalPlugin = require('..');

const FIXTURES_DIST = path.resolve(__dirname, 'fixtures/dist');

module.exports.FIXTURES_DIST = FIXTURES_DIST;

/**
 * Cleans the built files from the fixtures folder.
 *
 * @return {Promise<void>} Promise that resolves once the files have been
 *   deleted.
 */
module.exports.cleanDist = () => fs.rmdir(FIXTURES_DIST, { recursive: true });

/**
 * Builds a Webpack configuration with some testing defaults.
 *
 * @param {import('webpack').Configuration} [config] Webpack config.
 * @return {Promise<import('webpack').Stats>} Compilation stats.
 */
module.exports.runWebpack = (config = {}) =>
  new Promise((resolve, reject) =>
    webpack(
      {
        context: path.resolve(__dirname, 'fixtures'),
        entry: './src/simple-drupal-import.js',
        output: { path: FIXTURES_DIST },
        mode: 'none',
        plugins: [new DrupalPlugin()],
        ...config,
      },
      (error, stats) => (error || !stats ? reject(error) : resolve(stats)),
    ),
  );

/**
 * Generates a random string.
 *
 * @param {number} [length=8] Length of the string to generate.
 * @return {string} The random string.
 */
module.exports.randomString = (length = 8) =>
  Math.random()
    .toString(36)
    .substring(2, 2 + length);
