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
/*jshint expr: true*/
(function() {
  "use strict";

  var TaborlinParse = require('../taborlin-parse');
  var path = require('path');
  var fs = require('fs');
  var read = fs.readFileSync;

  describe('TaborlinParse', function() {
    before(function() {
      this.documentSourcePath = path.join('test', 'cases', 'simple', 'button.css');
      var data = {
        "title": "Button",
        "filename": "button.css",
        "source": "test/cases/simple/button.css",
        "template": "lib/template.jade"
      }
      this.TaborlinParse = new TaborlinParse(read(this.documentSourcePath, 'utf8'), data);
    });
    it('exists', function() {
      TaborlinParse.should.be.ok;
      this.TaborlinParse.should.be.instanceOf(TaborlinParse);
    });
    it('should parse the css file', function() {
      var caseCSSJson, parsedJson;
      caseCSSJson = read(path.join('test', 'cases', 'simple', 'button.json'), 'utf8');
      parsedJson = JSON.stringify(this.TaborlinParse.cssParseResults, null, 2);
    });
    it('should validate taborlin comments', function () {
      var validComment = {
        'type': 'comment',
        'comment': read(path.join('test', 'cases', 'simple', 'validcomment.txt'), 'utf8')
      };
      var validationResult = this.TaborlinParse.isValidComment(validComment);
      validationResult.should.equal(true);
    });
    it('should generate json for template', function() {
      var caseTaborlinJson, resultJson;
      caseTaborlinJson = read(path.join('test', 'cases', 'simple', 'button.taborlin.json'), 'utf8').trim();
      resultJson = JSON.stringify(this.TaborlinParse.results, null, 2);
      resultJson.should.equal(caseTaborlinJson);
    });
    it('should parse component name for template', function() {
      this.TaborlinParse.results.components[0].name.should.equal('Button');
    });
    it('should generate component slug for template', function() {
      this.TaborlinParse.results.components[0].slug.should.equal('button');
    });
    it('should parse component details for template', function() {
      this.TaborlinParse.results.components[0].modifiers[':active'].should.equal('Active state');
    });
    it('should parse example html for template', function() {
      this.TaborlinParse.results.components[0].markup.should.equal("<a class=\"topcoat-button\">Button</a>\r<a class=\"topcoat-button is-active\">Button</a>\r<a class=\"topcoat-button is-disabled\">Button</a>");
    });
    it('should generate dash separated slugs for template', function() {
      this.TaborlinParse.results.components[1].slug.should.equal('taborlin-quiet-button-component');
    });
  });

}).call(this);
