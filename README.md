# Webpack Drupal plugin

[![Tests status](https://github.com/wongjn/webpack-drupal-plugin/workflows/Tests/badge.svg)](https://github.com/wongjn/webpack-drupal-plugin/actions?query=workflow%3ATests)
[![npm](https://img.shields.io/npm/v/webpack-drupal-plugin)](https://npmjs.com/package/webpack-drupal-plugin)

A Webpack plugin that bridges Webpack-built assets with Drupal extensions by
generating a php file that returns the webpack-emitted assets as library
definitions to be used in [`hook_library_info_build()`](https://api.drupal.org/apis/hook_library_info_build).

This plugin supports JavaScript files as well as CSS files (added to the
`theme` group).

## Dependencies

Imports are automatically mapped to [Webpack externals](https://webpack.js.org/configuration/externals)

### Top-level Core libraries

Special libraries:

| Import                                        | Drupal Library      |
| --------------------------------------------- | ------------------- |
| `import Drupal from 'Drupal'`                 | core/drupal         |
| `import drupalSettings from 'drupalSettings'` | core/drupalSettings |

Otherwise, for all other libraries they will be mapped by
`Drupal/[library/name] → library/name`. For example,
`import Drupal from 'Drupal/core/drupal.debounce'` will automatically register
`core/drupal.debounce` library as a dependency. All library imports will give
the `Drupal` global object.

### Third-party libraries

Third-party imports that exist in Drupal core will also be mapped, according to
their [npm](https://npmjs.com/) package names (as well as the above pattern).

| Import                                               | Drupal Library          |
| ---------------------------------------------------- | ----------------------- |
| `import CKEDITOR from 'ckeditor4'`                   | core/ckeditor           |
| `import CKEditor from 'ckeditor5'`                   | core/ckeditor5          |
| `import namespace from '@ckeditor/ckeditor5-[plugin]'` | core/ckeditor5.[plugin] |
| `import 'es6-promise/auto'`                          | core/es6-promise        |
| `import jQuery from 'jquery'`                        | core/jquery             |
| `import Modernizr from 'modernizr'`                  | core/modernizr          |
| `import once from '@drupal/once'`                    | core/once               |
| `import Sortable from 'sortablejs'`                  | core/sortable           |
| `import tabbable from 'tabbable'`                    | core/tabbable           |

As indicated above, the import will give the appropriate global if it exists.

## Options

Explanation and defaults of options for the plugin are given below.

```js
const context = 'foo/bar/baz';

module.exports = {
  context,
  // ...
  plugins: [
    new DrupalPlugin({
      // The filename of the PHP file exported.
      filename: 'assets.php',
      // Processor that returns properties for a file. The processor is given an
      // argument object `{ filename: string, compilation: Compilation }` for
      // each file and should return an object of properties (return an empty
      // object when no properties should be added).
      processor: DrupalPlugin.maybeMinified,
      // The extension (theme, module, profile) name that the built libraries
      // belong to. This is necessary when using `dependOn` option for entries
      // so that this plugin can correctly declare sibling dependencies.
      extensionName: require('path').basename(context),
      // The naming template for the library definitions. [name] can be used as
      // a placeholder for the entry name.
      libraryName: '[name]',
    }),
  ],
};
```
