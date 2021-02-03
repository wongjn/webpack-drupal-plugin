/**
 * @file
 * Writes output.
 */

/**
 * Joins array of strings with indentation.
 *
 * @param {string[]} strings List of strings.
 * @param {number} indent Amount of spaces to indent.
 */
const joinIndent = (strings, indent) =>
  strings.join('\n').replace(/(^|\n)/g, `$1${' '.repeat(indent)}`);

/**
 * Write an entry for a parsed asset library.
 *
 * @param {Library} library The library.
 * @return {string} Entry.
 */
const writeLibrary = ({ name, files, dependencies }) => `'${name}' => [
  'js' => [
${joinIndent(
  files.map((file) => `'${file}' => [],`),
  4,
)}
  ],
  'dependencies' => [
${joinIndent(
  dependencies.map((dependency) => `'${dependency}',`),
  4,
)}
  ],
],`;

/**
 * Writes the include file content from a list of libraries.
 *
 * @param {Library[]} libraries The list of parsed libraries.
 * @return {string} The include file content.
 */
module.exports.writeFile = (libraries) => `<?php

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
${joinIndent(libraries.map(writeLibrary), 2)}
];
`;
