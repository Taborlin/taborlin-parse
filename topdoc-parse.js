/**
 *
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
"use strict";

var cssParse = require('css-parse');
var path = require('path');
var yaml = require('js-yaml');
var TopdocUtils = require('topdoc-utils');
var CleanCSS = require('clean-css');

var TopdocParse = (function() {
  function TopdocParse(source, data) {
    this.source = source;
    this.data = data;
    this.cssParseResults = this.cssParse();
    this.minified = new CleanCSS().minify(this.source);
    this.results = this.topdocParse();
  }

  TopdocParse.prototype.cssParse = function() {
    var cssParseResult;
    try {
      cssParseResult = cssParse(this.source, { position: true });
    } catch (err) {
      console.error(err);
    }
    return cssParseResult;
  };

  TopdocParse.prototype.topdocParse = function() {
    var sourceLines = this.source.split(/\n/g);
    this.validRegEx = /^ ?topdoc/;
    var results = this.data;
    results.minified = this.minified;
    results.components = [];
    var rules = this.cssParseResults.stylesheet.rules;
    for (var i = 0; i < rules.length; i++) {
      var listItem = rules[i];
      if (this.isValidComment(listItem)) {
        var startCSSPos = listItem.position.end;
        var endCSSPos = null;
        for (var nextItem = i + 1; nextItem <= rules.length; nextItem++) {
          if (this.isValidComment(rules[nextItem])) {
            endCSSPos = rules[nextItem].position.start;
            break;
          }
        }
        var cssLines;
        if (endCSSPos) {
          cssLines = sourceLines.slice(startCSSPos.line, endCSSPos.line - 1);
        } else {
          cssLines = sourceLines.slice(startCSSPos.line);
        }
        var css = cssLines.join('\n');
        listItem.comment = listItem.comment.replace(this.validRegEx, '');

        var component = yaml.load(listItem.comment);
        component.markup = this.parseMarkup(listItem.comment);
        component.css = css;
        component.slug = TopdocUtils.slugify(component.name);
        results.components.push(component);
      }
    }
    return results;
  };
  TopdocParse.prototype.parseMarkup = function(comment) {
    var markup, commentEnd, indent;
    markup = comment;
    markup = markup.substring(markup.search(/markup:/)+7);
    commentEnd = markup.search(/\s\w+:/);
    commentEnd = (commentEnd >= 0)? commentEnd: markup.length;
    markup = markup.substring(0, commentEnd);
    markup = markup.replace(/(\r|\n)/m, '');
    markup = markup.replace(/\n/g, '\r');
    indent = markup.substring(0, markup.search(/\S/));
    markup = markup.split('\r'+indent).join('\r');
    markup = markup.trim();
    return markup;
  };
  TopdocParse.prototype.isValidComment = function(comment) {
    var commentMatch;
    if (comment && comment.type === "comment") {
      commentMatch = this.validRegEx.exec(comment.comment);
      if (commentMatch) {
        return true;
      }
    }
    return false;
  };

  return TopdocParse;

})();

module.exports = TopdocParse;
