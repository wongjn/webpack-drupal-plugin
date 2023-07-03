/**
 * @file
 * Drupal libraries matcher.
 */

/**
 * Import matcher function for Drupal libraries.
 *
 * @param {string} request The import path being requested.
 * @return {DrupalLibrary|false} The definition for a Drupal library or false
 *   otherwise.
 */
const libraryMatcher = (request) => {
  const [, library] = /^Drupal\/(\w+\/.+)$/.exec(request) || [];
  return library ? { library, external: `window.Drupal/*${library}*/` } : false;
};

/**
 * Drupal libraries matcher function.
 *
 * @param {string} request The import path being requested.
 * @return {DrupalLibrary|false} The definition for an import or false otherwise.
 */
module.exports.librariesMatcher = (request) => {
  switch (request) {
    case 'ckeditor4':
      return { library: 'core/ckeditor', external: 'CKEDITOR' };
    case 'Drupal':
      return { library: 'core/drupal', external: 'Drupal' };
    case 'drupalSettings':
      return { library: 'core/drupalSettings', external: 'drupalSettings' };
    case '@drupal/once':
      return { library: 'core/once', external: 'once' };
    case 'es6-promise/auto':
      return { library: 'core/es6-promise', external: 'undefined' };
    case 'jquery':
      return { library: 'core/jquery', external: 'jQuery' };
    case 'modernizr':
      return { library: 'core/modernizr', external: 'Modernizr' };
    case 'sortablejs':
      return { library: 'core/sortable', external: 'Sortable' };
    case 'tabbable':
      return { library: 'core/tabbable', external: 'tabbable' };
    case 'js-cookie':
      return { library: 'core/js-cookie', external: 'Cookies' };
    default:
  }

  return libraryMatcher(request);
};
