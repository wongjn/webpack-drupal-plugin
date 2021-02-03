/**
 * @file
 * Simple Drupal external import.
 */

import Drupal from 'Drupal/extension/library';
import drupalSettings from 'drupalSettings';

Drupal.library.function(drupalSettings.path);
