/**
 * @file
 * Test the PHP file output.
 */

const { strictEqual } = require('assert');
const fs = require('fs').promises;
const { optimize } = require('webpack');
const { cleanDist, runWebpack, FIXTURES_DIST } = require('./utils');
const DrupalPlugin = require('..');

const getContent = () => fs.readFile(`${FIXTURES_DIST}/assets.php`, 'utf8');

describe('PHP file', function () {
  afterEach(cleanDist);

  it('should create appropriate PHP file content', async function () {
    await runWebpack({
      entry: {
        main: './src/simple-drupal-import.js',
        other: './src/simple-drupal-import-0.js',
      },
    });

    const files = await fs.readdir(FIXTURES_DIST);
    strictEqual(files.includes('assets.php'), true, '"assets.php" exists.');

    const expected = `<?php

/**
 * @file
 * Contains the assets compiled from Webpack.
 *
 * Include this within hook_libraries_info_build():
 * @code
 * function extension_name_libraries_info_build() {
 *   $libraries = include __DIR__ . '/dist/assets.php';
 *   return $libraries;
 * }
 * @endcode
 */

return [
  'main' => [
    'js' => [
      'dist/main.js' => [],
    ],
    'dependencies' => [
      'core/drupal',
    ],
  ],
  'other' => [
    'js' => [
      'dist/other.js' => [],
    ],
    'dependencies' => [
      'extension/library',
      'core/drupalSettings',
    ],
  ],
];
`;
    strictEqual(await getContent(), expected, 'Expected file content.');

    await runWebpack({
      entry: {
        main: './src/simple-drupal-import.js',
        other: './src/simple-drupal-import-0.js',
      },
      plugins: [new DrupalPlugin(), new optimize.ModuleConcatenationPlugin()],
    });
    strictEqual(await getContent(), expected, 'With concatenation plugin.');
  });
});
