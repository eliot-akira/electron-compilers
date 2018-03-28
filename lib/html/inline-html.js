'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mimeTypes = require('@paulcbetts/mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inputMimeTypes = ['text/html'];
let cheerio = null;

const d = require('debug')('electron-compile:inline-html');

const compiledCSS = {
  'text/less': true,
  'text/scss': true,
  'text/sass': true,
  'text/stylus': true
};

/**
 * @access private
 */
class InlineHtmlCompiler extends _compilerBase.CompilerBase {
  constructor(compileBlock, compileBlockSync) {
    super();

    this.compileBlock = compileBlock;
    this.compileBlockSync = compileBlockSync;
  }

  static createFromCompilers(compilersByMimeType) {
    d(`Setting up inline HTML compilers: ${JSON.stringify(Object.keys(compilersByMimeType))}`);

    let compileBlock = (() => {
      var _ref = _asyncToGenerator(function* (sourceCode, filePath, mimeType, ctx) {
        let realType = mimeType;
        if (!mimeType && ctx.tag === 'script') realType = 'application/javascript';

        if (!realType) return sourceCode;

        let compiler = compilersByMimeType[realType] || compilersByMimeType['text/plain'];
        let ext = _mimeTypes2.default.extension(realType);
        let fakeFile = `${filePath}:inline_${ctx.count}.${ext}`;

        d(`Compiling inline block for ${filePath} with mimeType ${mimeType}`);
        if (!(yield compiler.shouldCompileFile(fakeFile, ctx))) return sourceCode;
        return (yield compiler.compileSync(sourceCode, fakeFile, ctx)).code;
      });

      return function compileBlock(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      };
    })();

    let compileBlockSync = (sourceCode, filePath, mimeType, ctx) => {
      let realType = mimeType;
      if (!mimeType && ctx.tag === 'script') realType = 'application/javascript';

      if (!realType) return sourceCode;

      let compiler = compilersByMimeType[realType] || compilersByMimeType['text/plain'];
      let ext = _mimeTypes2.default.extension(realType);
      let fakeFile = `${filePath}:inline_${ctx.count}.${ext}`;

      d(`Compiling inline block for ${filePath} with mimeType ${mimeType}`);
      if (!compiler.shouldCompileFileSync(fakeFile, ctx)) return sourceCode;
      return compiler.compileSync(sourceCode, fakeFile, ctx).code;
    };

    return new InlineHtmlCompiler(compileBlock, compileBlockSync);
  }

  static getInputMimeTypes() {
    return inputMimeTypes;
  }

  shouldCompileFile(fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      return true;
    })();
  }

  determineDependentFiles(sourceCode, filePath, compilerContext) {
    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      return [];
    })();
  }

  each(nodes, selector) {
    return _asyncToGenerator(function* () {
      let acc = [];
      nodes.each(function (i, el) {
        let promise = selector(i, el);
        if (!promise) return false;

        acc.push(promise);
        return true;
      });

      yield Promise.all(acc);
    })();
  }

  eachSync(nodes, selector) {
    // NB: This method is here just so it's easier to mechanically
    // translate the async compile to compileSync
    return nodes.each((i, el) => {
      selector(i, el);
      return true;
    });
  }

  compile(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      cheerio = cheerio || require('cheerio');

      //Leave the attributes casing as it is, because of Angular 2 and maybe other case-sensitive frameworks
      let $ = cheerio.load(sourceCode, { lowerCaseAttributeNames: false });
      let toWait = [];

      let that = _this;
      let styleCount = 0;
      toWait.push(_this.each($('style'), (() => {
        var _ref2 = _asyncToGenerator(function* (i, el) {
          let mimeType = $(el).attr('type') || 'text/plain';

          let thisCtx = Object.assign({
            count: styleCount++,
            tag: 'style'
          }, compilerContext);

          let origText = $(el).text();
          let newText = yield that.compileBlock(origText, filePath, mimeType, thisCtx);

          if (origText !== newText) {
            $(el).text(newText);
            $(el).attr('type', 'text/css');
          }
        });

        return function (_x5, _x6) {
          return _ref2.apply(this, arguments);
        };
      })()));

      let scriptCount = 0;
      toWait.push(_this.each($('script'), (() => {
        var _ref3 = _asyncToGenerator(function* (i, el) {
          let src = $(el).attr('src');
          if (src && src.length > 2) {
            $(el).attr('src', InlineHtmlCompiler.fixupRelativeUrl(src));
            return;
          }

          let thisCtx = Object.assign({
            count: scriptCount++,
            tag: 'script'
          }, compilerContext);

          let mimeType = $(el).attr('type') || 'application/javascript';
          let origText = $(el).text();
          let newText = yield that.compileBlock(origText, filePath, mimeType, thisCtx);

          if (origText !== newText) {
            $(el).text(newText);
            $(el).attr('type', 'application/javascript');
          }
        });

        return function (_x7, _x8) {
          return _ref3.apply(this, arguments);
        };
      })()));

      $('link').map(function (i, el) {
        let href = $(el).attr('href');
        if (href && href.length > 2) {
          $(el).attr('href', InlineHtmlCompiler.fixupRelativeUrl(href));
        }

        // NB: In recent versions of Chromium, the link type MUST be text/css or
        // it will be flat-out ignored. Also I hate myself for hardcoding these.
        let type = $(el).attr('type');
        if (compiledCSS[type]) $(el).attr('type', 'text/css');
      });

      $('x-require').map(function (i, el) {
        let src = $(el).attr('src');

        // File URL? Bail
        if (src.match(/^file:/i)) return;

        // Absolute path? Bail.
        if (src.match(/^([\/]|[A-Za-z]:)/i)) return;

        try {
          $(el).attr('src', _path2.default.resolve(_path2.default.dirname(filePath), src));
        } catch (e) {
          $(el).text(`${e.message}\n${e.stack}`);
        }
      });

      yield Promise.all(toWait);

      return {
        code: $.html(),
        mimeType: 'text/html'
      };
    })();
  }

  shouldCompileFileSync(fileName, compilerContext) {
    // eslint-disable-line no-unused-vars
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    // eslint-disable-line no-unused-vars
    return [];
  }

  compileSync(sourceCode, filePath, compilerContext) {
    cheerio = cheerio || require('cheerio');

    //Leave the attributes casing as it is, because of Angular 2 and maybe other case-sensitive frameworks
    let $ = cheerio.load(sourceCode, { lowerCaseAttributeNames: false });

    let that = this;
    let styleCount = 0;
    this.eachSync($('style'), (() => {
      var _ref4 = _asyncToGenerator(function* (i, el) {
        let mimeType = $(el).attr('type');

        let thisCtx = Object.assign({
          count: styleCount++,
          tag: 'style'
        }, compilerContext);

        let origText = $(el).text();
        let newText = that.compileBlockSync(origText, filePath, mimeType, thisCtx);

        if (origText !== newText) {
          $(el).text(newText);
          $(el).attr('type', 'text/css');
        }
      });

      return function (_x9, _x10) {
        return _ref4.apply(this, arguments);
      };
    })());

    let scriptCount = 0;
    this.eachSync($('script'), (() => {
      var _ref5 = _asyncToGenerator(function* (i, el) {
        let src = $(el).attr('src');
        if (src && src.length > 2) {
          $(el).attr('src', InlineHtmlCompiler.fixupRelativeUrl(src));
          return;
        }

        let thisCtx = Object.assign({
          count: scriptCount++,
          tag: 'script'
        }, compilerContext);

        let mimeType = $(el).attr('type');

        let oldText = $(el).text();
        let newText = that.compileBlockSync(oldText, filePath, mimeType, thisCtx);

        if (oldText !== newText) {
          $(el).text(newText);
          $(el).attr('type', 'application/javascript');
        }
      });

      return function (_x11, _x12) {
        return _ref5.apply(this, arguments);
      };
    })());

    $('link').map((i, el) => {
      let href = $(el).attr('href');
      if (href && href.length > 2) {
        $(el).attr('href', InlineHtmlCompiler.fixupRelativeUrl(href));
      }

      // NB: In recent versions of Chromium, the link type MUST be text/css or
      // it will be flat-out ignored. Also I hate myself for hardcoding these.
      let type = $(el).attr('type');
      if (compiledCSS[type]) $(el).attr('type', 'text/css');
    });

    $('x-require').map((i, el) => {
      let src = $(el).attr('src');

      // File URL? Bail
      if (src.match(/^file:/i)) return;

      // Absolute path? Bail.
      if (src.match(/^([\/]|[A-Za-z]:)/i)) return;

      try {
        $(el).attr('src', _path2.default.resolve(_path2.default.dirname(filePath), src));
      } catch (e) {
        $(el).text(`${e.message}\n${e.stack}`);
      }
    });

    return {
      code: $.html(),
      mimeType: 'text/html'
    };
  }

  getCompilerVersion() {
    let thisVersion = require('../../package.json').version;
    let compilers = this.allCompilers || [];
    let otherVersions = compilers.map(x => x.getCompilerVersion).join();

    return `${thisVersion},${otherVersions}`;
  }

  static fixupRelativeUrl(url) {
    if (!url.match(/^\/\//)) return url;
    return `https:${url}`;
  }
}
exports.default = InlineHtmlCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2lubGluZS1odG1sLmpzIl0sIm5hbWVzIjpbImlucHV0TWltZVR5cGVzIiwiY2hlZXJpbyIsImQiLCJyZXF1aXJlIiwiY29tcGlsZWRDU1MiLCJJbmxpbmVIdG1sQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImNvbXBpbGVCbG9jayIsImNvbXBpbGVCbG9ja1N5bmMiLCJjcmVhdGVGcm9tQ29tcGlsZXJzIiwiY29tcGlsZXJzQnlNaW1lVHlwZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJPYmplY3QiLCJrZXlzIiwic291cmNlQ29kZSIsImZpbGVQYXRoIiwibWltZVR5cGUiLCJjdHgiLCJyZWFsVHlwZSIsInRhZyIsImNvbXBpbGVyIiwiZXh0IiwiZXh0ZW5zaW9uIiwiZmFrZUZpbGUiLCJjb3VudCIsInNob3VsZENvbXBpbGVGaWxlIiwiY29tcGlsZVN5bmMiLCJjb2RlIiwic2hvdWxkQ29tcGlsZUZpbGVTeW5jIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJmaWxlTmFtZSIsImNvbXBpbGVyQ29udGV4dCIsImRldGVybWluZURlcGVuZGVudEZpbGVzIiwiZWFjaCIsIm5vZGVzIiwic2VsZWN0b3IiLCJhY2MiLCJpIiwiZWwiLCJwcm9taXNlIiwicHVzaCIsIlByb21pc2UiLCJhbGwiLCJlYWNoU3luYyIsImNvbXBpbGUiLCIkIiwibG9hZCIsImxvd2VyQ2FzZUF0dHJpYnV0ZU5hbWVzIiwidG9XYWl0IiwidGhhdCIsInN0eWxlQ291bnQiLCJhdHRyIiwidGhpc0N0eCIsImFzc2lnbiIsIm9yaWdUZXh0IiwidGV4dCIsIm5ld1RleHQiLCJzY3JpcHRDb3VudCIsInNyYyIsImxlbmd0aCIsImZpeHVwUmVsYXRpdmVVcmwiLCJtYXAiLCJocmVmIiwidHlwZSIsIm1hdGNoIiwicmVzb2x2ZSIsImRpcm5hbWUiLCJlIiwibWVzc2FnZSIsInN0YWNrIiwiaHRtbCIsImRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyIsIm9sZFRleHQiLCJnZXRDb21waWxlclZlcnNpb24iLCJ0aGlzVmVyc2lvbiIsInZlcnNpb24iLCJjb21waWxlcnMiLCJhbGxDb21waWxlcnMiLCJvdGhlclZlcnNpb25zIiwieCIsImpvaW4iLCJ1cmwiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsaUJBQWlCLENBQUMsV0FBRCxDQUF2QjtBQUNBLElBQUlDLFVBQVUsSUFBZDs7QUFFQSxNQUFNQyxJQUFJQyxRQUFRLE9BQVIsRUFBaUIsOEJBQWpCLENBQVY7O0FBRUEsTUFBTUMsY0FBYztBQUNsQixlQUFhLElBREs7QUFFbEIsZUFBYSxJQUZLO0FBR2xCLGVBQWEsSUFISztBQUlsQixpQkFBZTtBQUpHLENBQXBCOztBQU9BOzs7QUFHZSxNQUFNQyxrQkFBTixvQ0FBOEM7QUFDM0RDLGNBQVlDLFlBQVosRUFBMEJDLGdCQUExQixFQUE0QztBQUMxQzs7QUFFQSxTQUFLRCxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDRDs7QUFFRCxTQUFPQyxtQkFBUCxDQUEyQkMsbUJBQTNCLEVBQWdEO0FBQzlDUixNQUFHLHFDQUFvQ1MsS0FBS0MsU0FBTCxDQUFlQyxPQUFPQyxJQUFQLENBQVlKLG1CQUFaLENBQWYsQ0FBaUQsRUFBeEY7O0FBRUEsUUFBSUg7QUFBQSxtQ0FBZSxXQUFPUSxVQUFQLEVBQW1CQyxRQUFuQixFQUE2QkMsUUFBN0IsRUFBdUNDLEdBQXZDLEVBQStDO0FBQ2hFLFlBQUlDLFdBQVdGLFFBQWY7QUFDQSxZQUFJLENBQUNBLFFBQUQsSUFBYUMsSUFBSUUsR0FBSixLQUFZLFFBQTdCLEVBQXVDRCxXQUFXLHdCQUFYOztBQUV2QyxZQUFJLENBQUNBLFFBQUwsRUFBZSxPQUFPSixVQUFQOztBQUVmLFlBQUlNLFdBQVdYLG9CQUFvQlMsUUFBcEIsS0FBaUNULG9CQUFvQixZQUFwQixDQUFoRDtBQUNBLFlBQUlZLE1BQU0sb0JBQVVDLFNBQVYsQ0FBb0JKLFFBQXBCLENB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IjoiaW5saW5lLWh0bWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBtaW1lVHlwZXMgZnJvbSAnQHBhdWxjYmV0dHMvbWltZS10eXBlcyc7XG5pbXBvcnQge0NvbXBpbGVyQmFzZX0gZnJvbSAnLi4vY29tcGlsZXItYmFzZSc7XG5cbmNvbnN0IGlucHV0TWltZVR5cGVzID0gWyd0ZXh0L2h0bWwnXTtcbmxldCBjaGVlcmlvID0gbnVsbDtcblxuY29uc3QgZCA9IHJlcXVpcmUoJ2RlYnVnJykoJ2VsZWN0cm9uLWNvbXBpbGU6aW5saW5lLWh0bWwnKTtcblxuY29uc3QgY29tcGlsZWRDU1MgPSB7XG4gICd0ZXh0L2xlc3MnOiB0cnVlLFxuICAndGV4dC9zY3NzJzogdHJ1ZSxcbiAgJ3RleHQvc2Fzcyc6IHRydWUsXG4gICd0ZXh0L3N0eWx1cyc6IHRydWUsXG59O1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmxpbmVIdG1sQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3Rvcihjb21waWxlQmxvY2ssIGNvbXBpbGVCbG9ja1N5bmMpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb21waWxlQmxvY2sgPSBjb21waWxlQmxvY2s7XG4gICAgdGhpcy5jb21waWxlQmxvY2tTeW5jID0gY29tcGlsZUJsb2NrU3luYztcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tQ29tcGlsZXJzKGNvbXBpbGVyc0J5TWltZVR5cGUpIHtcbiAgICBkKGBTZXR0aW5nIHVwIGlubGluZSBIVE1MIGNvbXBpbGVyczogJHtKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhjb21waWxlcnNCeU1pbWVUeXBlKSl9YCk7XG5cbiAgICBsZXQgY29tcGlsZUJsb2NrID0gYXN5bmMgKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBtaW1lVHlwZSwgY3R4KSA9PiB7XG4gICAgICBsZXQgcmVhbFR5cGUgPSBtaW1lVHlwZTtcbiAgICAgIGlmICghbWltZVR5cGUgJiYgY3R4LnRhZyA9PT0gJ3NjcmlwdCcpIHJlYWxUeXBlID0gJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnO1xuXG4gICAgICBpZiAoIXJlYWxUeXBlKSByZXR1cm4gc291cmNlQ29kZTtcblxuICAgICAgbGV0IGNvbXBpbGVyID0gY29tcGlsZXJzQnlNaW1lVHlwZVtyZWFsVHlwZV0gfHwgY29tcGlsZXJzQnlNaW1lVHlwZVsndGV4dC9wbGFpbiddO1xuICAgICAgbGV0IGV4dCA9IG1pbWVUeXBlcy5leHRlbnNpb24ocmVhbFR5cGUpO1xuICAgICAgbGV0IGZha2VGaWxlID0gYCR7ZmlsZVBhdGh9OmlubGluZV8ke2N0eC5jb3VudH0uJHtleHR9YDtcblxuICAgICAgZChgQ29tcGlsaW5nIGlubGluZSBibG9jayBmb3IgJHtmaWxlUGF0aH0gd2l0aCBtaW1lVHlwZSAke21pbWVUeXBlfWApO1xuICAgICAgaWYgKCEoYXdhaXQgY29tcGlsZXIuc2hvdWxkQ29tcGlsZUZpbGUoZmFrZUZpbGUsIGN0eCkpKSByZXR1cm4gc291cmNlQ29kZTtcbiAgICAgIHJldHVybiAoYXdhaXQgY29tcGlsZXIuY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmFrZUZpbGUsIGN0eCkpLmNvZGU7XG4gICAgfTtcblxuICAgIGxldCBjb21waWxlQmxvY2tTeW5jID0gKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBtaW1lVHlwZSwgY3R4KSA9PiB7XG4gICAgICBsZXQgcmVhbFR5cGUgPSBtaW1lVHlwZTtcbiAgICAgIGlmICghbWltZVR5cGUgJiYgY3R4LnRhZyA9PT0gJ3NjcmlwdCcpIHJlYWxUeXBlID0gJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnO1xuXG4gICAgICBpZiAoIXJlYWxUeXBlKSByZXR1cm4gc291cmNlQ29kZTtcblxuICAgICAgbGV0IGNvbXBpbGVyID0gY29tcGlsZXJzQnlNaW1lVHlwZVtyZWFsVHlwZV0gfHwgY29tcGlsZXJzQnlNaW1lVHlwZVsndGV4dC9wbGFpbiddO1xuICAgICAgbGV0IGV4dCA9IG1pbWVUeXBlcy5leHRlbnNpb24ocmVhbFR5cGUpO1xuICAgICAgbGV0IGZha2VGaWxlID0gYCR7ZmlsZVBhdGh9OmlubGluZV8ke2N0eC5jb3VudH0uJHtleHR9YDtcblxuICAgICAgZChgQ29tcGlsaW5nIGlubGluZSBibG9jayBmb3IgJHtmaWxlUGF0aH0gd2l0aCBtaW1lVHlwZSAke21pbWVUeXBlfWApO1xuICAgICAgaWYgKCFjb21waWxlci5zaG91bGRDb21waWxlRmlsZVN5bmMoZmFrZUZpbGUsIGN0eCkpIHJldHVybiBzb3VyY2VDb2RlO1xuICAgICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZha2VGaWxlLCBjdHgpLmNvZGU7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgSW5saW5lSHRtbENvbXBpbGVyKGNvbXBpbGVCbG9jaywgY29tcGlsZUJsb2NrU3luYyk7XG4gIH1cblxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XG4gICAgcmV0dXJuIGlucHV0TWltZVR5cGVzO1xuICB9XG5cbiAgYXN5bmMgc2hvdWxkQ29tcGlsZUZpbGUoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBhc3luYyBlYWNoKG5vZGVzLCBzZWxlY3Rvcikge1xuICAgIGxldCBhY2MgPSBbXTtcbiAgICBub2Rlcy5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgbGV0IHByb21pc2UgPSBzZWxlY3RvcihpLGVsKTtcbiAgICAgIGlmICghcHJvbWlzZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBhY2MucHVzaChwcm9taXNlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoYWNjKTtcbiAgfVxuXG4gIGVhY2hTeW5jKG5vZGVzLCBzZWxlY3Rvcikge1xuICAgIC8vIE5COiBUaGlzIG1ldGhvZCBpcyBoZXJlIGp1c3Qgc28gaXQncyBlYXNpZXIgdG8gbWVjaGFuaWNhbGx5XG4gICAgLy8gdHJhbnNsYXRlIHRoZSBhc3luYyBjb21waWxlIHRvIGNvbXBpbGVTeW5jXG4gICAgcmV0dXJuIG5vZGVzLmVhY2goKGksZWwpID0+IHtcbiAgICAgIHNlbGVjdG9yKGksZWwpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBjb21waWxlKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICBjaGVlcmlvID0gY2hlZXJpbyB8fCByZXF1aXJlKCdjaGVlcmlvJyk7XG4gICAgXG4gICAgLy9MZWF2ZSB0aGUgYXR0cmlidXRlcyBjYXNpbmcgYXMgaXQgaXMsIGJlY2F1c2Ugb2YgQW5ndWxhciAyIGFuZCBtYXliZSBvdGhlciBjYXNlLXNlbnNpdGl2ZSBmcmFtZXdvcmtzXG4gICAgbGV0ICQgPSBjaGVlcmlvLmxvYWQoc291cmNlQ29kZSwge2xvd2VyQ2FzZUF0dHJpYnV0ZU5hbWVzOiBmYWxzZX0pO1xuICAgIGxldCB0b1dhaXQgPSBbXTtcblxuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgc3R5bGVDb3VudCA9IDA7XG4gICAgdG9XYWl0LnB1c2godGhpcy5lYWNoKCQoJ3N0eWxlJyksIGFzeW5jIChpLCBlbCkgPT4ge1xuICAgICAgbGV0IG1pbWVUeXBlID0gJChlbCkuYXR0cigndHlwZScpIHx8ICd0ZXh0L3BsYWluJztcblxuICAgICAgbGV0IHRoaXNDdHggPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgY291bnQ6IHN0eWxlQ291bnQrKyxcbiAgICAgICAgdGFnOiAnc3R5bGUnXG4gICAgICB9LCBjb21waWxlckNvbnRleHQpO1xuXG4gICAgICBsZXQgb3JpZ1RleHQgPSAkKGVsKS50ZXh0KCk7XG4gICAgICBsZXQgbmV3VGV4dCA9IGF3YWl0IHRoYXQuY29tcGlsZUJsb2NrKG9yaWdUZXh0LCBmaWxlUGF0aCwgbWltZVR5cGUsIHRoaXNDdHgpO1xuXG4gICAgICBpZiAob3JpZ1RleHQgIT09IG5ld1RleHQpIHtcbiAgICAgICAgJChlbCkudGV4dChuZXdUZXh0KTtcbiAgICAgICAgJChlbCkuYXR0cigndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGxldCBzY3JpcHRDb3VudCA9IDA7XG4gICAgdG9XYWl0LnB1c2godGhpcy5lYWNoKCQoJ3NjcmlwdCcpLCBhc3luYyAoaSwgZWwpID0+IHtcbiAgICAgIGxldCBzcmMgPSAkKGVsKS5hdHRyKCdzcmMnKTtcbiAgICAgIGlmIChzcmMgJiYgc3JjLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgJChlbCkuYXR0cignc3JjJywgSW5saW5lSHRtbENvbXBpbGVyLmZpeHVwUmVsYXRpdmVVcmwoc3JjKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IHRoaXNDdHggPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgY291bnQ6IHNjcmlwdENvdW50KyssXG4gICAgICAgIHRhZzogJ3NjcmlwdCdcbiAgICAgIH0sIGNvbXBpbGVyQ29udGV4dCk7XG5cbiAgICAgIGxldCBtaW1lVHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKSB8fCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc7XG4gICAgICBsZXQgb3JpZ1RleHQgPSAkKGVsKS50ZXh0KCk7XG4gICAgICBsZXQgbmV3VGV4dCA9IGF3YWl0IHRoYXQuY29tcGlsZUJsb2NrKG9yaWdUZXh0LCBmaWxlUGF0aCwgbWltZVR5cGUsIHRoaXNDdHgpO1xuXG4gICAgICBpZiAob3JpZ1RleHQgIT09IG5ld1RleHQpIHtcbiAgICAgICAgJChlbCkudGV4dChuZXdUZXh0KTtcbiAgICAgICAgJChlbCkuYXR0cigndHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgJCgnbGluaycpLm1hcCgoaSwgZWwpID0+IHtcbiAgICAgIGxldCBocmVmID0gJChlbCkuYXR0cignaHJlZicpO1xuICAgICAgaWYgKGhyZWYgJiYgaHJlZi5sZW5ndGggPiAyKSB7ICQoZWwpLmF0dHIoJ2hyZWYnLCBJbmxpbmVIdG1sQ29tcGlsZXIuZml4dXBSZWxhdGl2ZVVybChocmVmKSk7IH1cblxuICAgICAgLy8gTkI6IEluIHJlY2VudCB2ZXJzaW9ucyBvZiBDaHJvbWl1bSwgdGhlIGxpbmsgdHlwZSBNVVNUIGJlIHRleHQvY3NzIG9yXG4gICAgICAvLyBpdCB3aWxsIGJlIGZsYXQtb3V0IGlnbm9yZWQuIEFsc28gSSBoYXRlIG15c2VsZiBmb3IgaGFyZGNvZGluZyB0aGVzZS5cbiAgICAgIGxldCB0eXBlID0gJChlbCkuYXR0cigndHlwZScpO1xuICAgICAgaWYgKGNvbXBpbGVkQ1NTW3R5cGVdKSAkKGVsKS5hdHRyKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgfSk7XG5cbiAgICAkKCd4LXJlcXVpcmUnKS5tYXAoKGksIGVsKSA9PiB7XG4gICAgICBsZXQgc3JjID0gJChlbCkuYXR0cignc3JjJyk7XG5cbiAgICAgIC8vIEZpbGUgVVJMPyBCYWlsXG4gICAgICBpZiAoc3JjLm1hdGNoKC9eZmlsZTovaSkpIHJldHVybjtcblxuICAgICAgLy8gQWJzb2x1dGUgcGF0aD8gQmFpbC5cbiAgICAgIGlmIChzcmMubWF0Y2goL14oW1xcL118W0EtWmEtel06KS9pKSkgcmV0dXJuO1xuXG4gICAgICB0cnkge1xuICAgICAgICAkKGVsKS5hdHRyKCdzcmMnLCBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSwgc3JjKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICQoZWwpLnRleHQoYCR7ZS5tZXNzYWdlfVxcbiR7ZS5zdGFja31gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHRvV2FpdCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogJC5odG1sKCksXG4gICAgICBtaW1lVHlwZTogJ3RleHQvaHRtbCdcbiAgICB9O1xuICB9XG5cbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICBjaGVlcmlvID0gY2hlZXJpbyB8fCByZXF1aXJlKCdjaGVlcmlvJyk7XG4gICAgXG4gICAgLy9MZWF2ZSB0aGUgYXR0cmlidXRlcyBjYXNpbmcgYXMgaXQgaXMsIGJlY2F1c2Ugb2YgQW5ndWxhciAyIGFuZCBtYXliZSBvdGhlciBjYXNlLXNlbnNpdGl2ZSBmcmFtZXdvcmtzXG4gICAgbGV0ICQgPSBjaGVlcmlvLmxvYWQoc291cmNlQ29kZSwge2xvd2VyQ2FzZUF0dHJpYnV0ZU5hbWVzOiBmYWxzZX0pO1xuXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBzdHlsZUNvdW50ID0gMDtcbiAgICB0aGlzLmVhY2hTeW5jKCQoJ3N0eWxlJyksIGFzeW5jIChpLCBlbCkgPT4ge1xuICAgICAgbGV0IG1pbWVUeXBlID0gJChlbCkuYXR0cigndHlwZScpO1xuXG4gICAgICBsZXQgdGhpc0N0eCA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBjb3VudDogc3R5bGVDb3VudCsrLFxuICAgICAgICB0YWc6ICdzdHlsZSdcbiAgICAgIH0sIGNvbXBpbGVyQ29udGV4dCk7XG5cbiAgICAgIGxldCBvcmlnVGV4dCA9ICQoZWwpLnRleHQoKTtcbiAgICAgIGxldCBuZXdUZXh0ID0gdGhhdC5jb21waWxlQmxvY2tTeW5jKG9yaWdUZXh0LCBmaWxlUGF0aCwgbWltZVR5cGUsIHRoaXNDdHgpO1xuXG4gICAgICBpZiAob3JpZ1RleHQgIT09IG5ld1RleHQpIHtcbiAgICAgICAgJChlbCkudGV4dChuZXdUZXh0KTtcbiAgICAgICAgJChlbCkuYXR0cigndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHNjcmlwdENvdW50ID0gMDtcbiAgICB0aGlzLmVhY2hTeW5jKCQoJ3NjcmlwdCcpLCBhc3luYyAoaSwgZWwpID0+IHtcbiAgICAgIGxldCBzcmMgPSAkKGVsKS5hdHRyKCdzcmMnKTtcbiAgICAgIGlmIChzcmMgJiYgc3JjLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgJChlbCkuYXR0cignc3JjJywgSW5saW5lSHRtbENvbXBpbGVyLmZpeHVwUmVsYXRpdmVVcmwoc3JjKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IHRoaXNDdHggPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgY291bnQ6IHNjcmlwdENvdW50KyssXG4gICAgICAgIHRhZzogJ3NjcmlwdCdcbiAgICAgIH0sIGNvbXBpbGVyQ29udGV4dCk7XG5cbiAgICAgIGxldCBtaW1lVHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKTtcblxuICAgICAgbGV0IG9sZFRleHQgPSAkKGVsKS50ZXh0KCk7XG4gICAgICBsZXQgbmV3VGV4dCA9IHRoYXQuY29tcGlsZUJsb2NrU3luYyhvbGRUZXh0LCBmaWxlUGF0aCwgbWltZVR5cGUsIHRoaXNDdHgpO1xuXG4gICAgICBpZiAob2xkVGV4dCAhPT0gbmV3VGV4dCkge1xuICAgICAgICAkKGVsKS50ZXh0KG5ld1RleHQpO1xuICAgICAgICAkKGVsKS5hdHRyKCd0eXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICQoJ2xpbmsnKS5tYXAoKGksIGVsKSA9PiB7XG4gICAgICBsZXQgaHJlZiA9ICQoZWwpLmF0dHIoJ2hyZWYnKTtcbiAgICAgIGlmIChocmVmICYmIGhyZWYubGVuZ3RoID4gMikgeyAkKGVsKS5hdHRyKCdocmVmJywgSW5saW5lSHRtbENvbXBpbGVyLmZpeHVwUmVsYXRpdmVVcmwoaHJlZikpOyB9XG5cbiAgICAgIC8vIE5COiBJbiByZWNlbnQgdmVyc2lvbnMgb2YgQ2hyb21pdW0sIHRoZSBsaW5rIHR5cGUgTVVTVCBiZSB0ZXh0L2NzcyBvclxuICAgICAgLy8gaXQgd2lsbCBiZSBmbGF0LW91dCBpZ25vcmVkLiBBbHNvIEkgaGF0ZSBteXNlbGYgZm9yIGhhcmRjb2RpbmcgdGhlc2UuXG4gICAgICBsZXQgdHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKTtcbiAgICAgIGlmIChjb21waWxlZENTU1t0eXBlXSkgJChlbCkuYXR0cigndHlwZScsICd0ZXh0L2NzcycpO1xuICAgIH0pO1xuXG4gICAgJCgneC1yZXF1aXJlJykubWFwKChpLCBlbCkgPT4ge1xuICAgICAgbGV0IHNyYyA9ICQoZWwpLmF0dHIoJ3NyYycpO1xuXG4gICAgICAvLyBGaWxlIFVSTD8gQmFpbFxuICAgICAgaWYgKHNyYy5tYXRjaCgvXmZpbGU6L2kpKSByZXR1cm47XG5cbiAgICAgIC8vIEFic29sdXRlIHBhdGg/IEJhaWwuXG4gICAgICBpZiAoc3JjLm1hdGNoKC9eKFtcXC9dfFtBLVphLXpdOikvaSkpIHJldHVybjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgJChlbCkuYXR0cignc3JjJywgcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShmaWxlUGF0aCksIHNyYykpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAkKGVsKS50ZXh0KGAke2UubWVzc2FnZX1cXG4ke2Uuc3RhY2t9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogJC5odG1sKCksXG4gICAgICBtaW1lVHlwZTogJ3RleHQvaHRtbCdcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q29tcGlsZXJWZXJzaW9uKCkge1xuICAgIGxldCB0aGlzVmVyc2lvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb247XG4gICAgbGV0IGNvbXBpbGVycyA9IHRoaXMuYWxsQ29tcGlsZXJzIHx8IFtdO1xuICAgIGxldCBvdGhlclZlcnNpb25zID0gY29tcGlsZXJzLm1hcCgoeCkgPT4geC5nZXRDb21waWxlclZlcnNpb24pLmpvaW4oKTtcblxuICAgIHJldHVybiBgJHt0aGlzVmVyc2lvbn0sJHtvdGhlclZlcnNpb25zfWA7XG4gIH1cblxuICBzdGF0aWMgZml4dXBSZWxhdGl2ZVVybCh1cmwpIHtcbiAgICBpZiAoIXVybC5tYXRjaCgvXlxcL1xcLy8pKSByZXR1cm4gdXJsO1xuICAgIHJldHVybiBgaHR0cHM6JHt1cmx9YDtcbiAgfVxufVxuIl19