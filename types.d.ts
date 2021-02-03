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
