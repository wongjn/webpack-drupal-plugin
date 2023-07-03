/**
 * @file
 * Drupal libraries matcher.
 */

/**
 * Import matcher function for jQuery UI components.
 *
 * @param {string} request The import path being requested.
 * @return {DrupalLibrary|false} The definition for a jQuery UI widget or false
 *   otherwise.
 */
const ckeditor5Matcher = (request) => {
  const [, name] = /^@ckeditor\/ckeditor5-([^/]+)$/.exec(request) || [];

  if (name) {
    const camelCase = name
      .split('-')
      .map((part, i) =>
        i === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`,
      )
      .join('');
    return {
      library: `core/ckeditor5.${camelCase}`,
      external: `CKEditor5.${camelCase}`,
    };
  }

  return false;
};

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
    case 'ckeditor5':
      return { library: 'core/ckeditor5', external: 'CKEditor5' };
    case '@ckeditor/ckeditor5-basic-styles':
      return ckeditor5Matcher('@ckeditor/ckeditor5-basic');
    case '@ckeditor/ckeditor5-block-quote':
      return ckeditor5Matcher('@ckeditor/ckeditor5-blockquote');
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

  return ckeditor5Matcher(request) || libraryMatcher(request);
};
