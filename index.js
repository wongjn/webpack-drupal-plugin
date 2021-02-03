/**
 * @file
 * Main plugin class.
 */

const { ExternalsPlugin } = require('webpack');
const { librariesMatcher } = require('./lib/libraries');

/**
 * Webpack externals matcher function.
 *
 * @param {{ request?: string }} ctx Object containing details of the file.
 * @param {WebpackExternalsCallback} callback Callback function used to indicate
 *   how the module should be externalized.
 */
const externalsMatcher = ({ request = '' }, callback) => {
  const library = librariesMatcher(request);
  callback(undefined, library ? library.external : undefined);
};

/* eslint-disable class-methods-use-this */

module.exports = class DrupalPlugin {
  /**
   * Applies the plugin onto the webpack compiler.
   *
   * @param {import('webpack').Compiler} compiler The Webpack compiler.
   */
  apply(compiler) {
    // Apply Drupal libraries as externals.
    new ExternalsPlugin('var', externalsMatcher).apply(compiler);
  }
};
