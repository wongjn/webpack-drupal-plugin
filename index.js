/**
 * @file
 * Main plugin class.
 */

const { basename } = require('path');
const { ExternalsPlugin, sources } = require('webpack');
const { parseEntries } = require('./lib/assets');
const { librariesMatcher } = require('./lib/libraries');
const { writeFile } = require('./lib/output');

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

module.exports = class DrupalPlugin {
  constructor({
    filename = 'assets.php',
    processor = DrupalPlugin.maybeMinified,
    extensionName = '',
    libraryName = '[name]',
  } = {}) {
    /** @protected */
    this.filename = filename;
    /** @protected */
    this.processor = processor;
    /** @protected */
    this.extensionName = extensionName;
    /** @protected */
    this.libraryName = libraryName;
  }

  /**
   * Applies the plugin onto the webpack compiler.
   *
   * @param {import('webpack').Compiler} compiler The Webpack compiler.
   */
  apply(compiler) {
    // Apply Drupal libraries as externals.
    new ExternalsPlugin('var', externalsMatcher).apply(compiler);

    compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
      const extensionName =
        this.extensionName || basename(compilation.options.context || '');
      compilation.hooks.additionalAssets.tap(this.constructor.name, () => {
        // eslint-disable-next-line no-param-reassign
        compilation.assets[this.filename] = new sources.RawSource(
          writeFile(
            parseEntries(compilation, {
              processor: this.processor,
              extensionName,
              libraryName: this.libraryName,
            }),
          ),
        );
      });
    });
  }

  /**
   * Adds minified property to files when minified by Webpack.
   *
   * @param {FileProcessorArguments} args Arguments.
   * @return {Object} File properties.
   */
  static maybeMinified({ filename, compilation }) {
    return compilation.options.optimization.minimize && filename.endsWith('.js')
      ? { minified: true }
      : {};
  }
};
