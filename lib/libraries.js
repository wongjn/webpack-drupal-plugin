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
const jqueryUiMatcher = (request) => {
  const [, widget] = /^jquery-ui\/ui\/widgets\/(.+)$/.exec(request) || [];
  const library = widget && `core/jquery.ui.${widget}`;
  return library ? { library, external: `jQuery/*${library}*/` } : false;
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
  return library ? { library, external: `Drupal/*${library}*/` } : false;
};

/**
 * Drupal libraries matcher function.
 *
 * @param {string} request The import path being requested.
 * @return {DrupalLibrary|false} The definition for an import or false otherwise.
 */
module.exports.librariesMatcher = (request) => {
  switch (request) {
    case 'backbone':
      return { library: 'core/backbone', external: 'Backbone' };
    case 'ckeditor4':
      return { library: 'core/ckeditor', external: 'CKEDITOR' };
    case 'Drupal':
      return { library: 'core/drupal', external: 'Drupal' };
    case 'drupalSettings':
      return { library: 'core/drupalSettings', external: 'drupalSettings' };
    case 'es6-promise/auto':
      return { library: 'core/es6-promise', external: 'undefined' };
    case 'jquery':
      return { library: 'core/jquery', external: 'jQuery' };
    case 'jquery-cookie':
    case 'jquery-form':
    case 'jquery-once':
      return {
        library: `core/${request.replace('-', '.')}`,
        external: `jQuery/*core/${request.replace('-', '.')}*/`,
      };
    case 'farbtastic':
    case 'joyride':
      return {
        library: `core/jquery.${request}`,
        external: `jQuery/*core/jquery.${request}*/`,
      };
    case 'jquery-ui':
    case 'jquery-ui/ui/widget':
      return {
        library: 'core/jquery.ui.widget',
        external: 'jQuery/*core/jquery.ui.widget*/',
      };
    case 'jquery-ui/ui/position':
      return {
        library: 'core/jquery.ui.position',
        external: 'jQuery/*core/jquery.ui.position*/',
      };
    case 'modernizr':
      return { library: 'core/modernizr', external: 'Modernizr' };
    case '@popperjs/core':
      return { library: 'core/popperjs', external: 'Popper' };
    case 'sortablejs':
      return { library: 'core/sortable', external: 'Sortable' };
    case 'underscore':
      return { library: 'core/underscore', external: '_' };
    case 'js-cookie':
      return { library: 'core/js-cookie', external: 'Cookies' };
    default:
  }

  return jqueryUiMatcher(request) || libraryMatcher(request);
};
