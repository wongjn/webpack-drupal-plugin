/**
 * @file
 * Type definitions.
 */

/**
 * A Drupal library definition.
 */
type DrupalLibrary = {
  external: string;
  library: string;
};

/**
 * Webpack external definition.
 */
type WebpackExternal = string | boolean | string[] | { [index: string]: any };

/**
 * Webpack external definition callback.
 */
type WebpackExternalsCallback = (err?: Error, result?: WebpackExternal) => void;

/**
 * Internal representation of a parsed library from a Webpack entry.
 */
type Library = {
  name: string;
  files: { [x: string]: Object };
  dependencies: string[];
};

/**
 * File processor arguments.
 */
type FileProcessorArguments = {
  filename: string;
  compilation: import('webpack').Compilation;
};
