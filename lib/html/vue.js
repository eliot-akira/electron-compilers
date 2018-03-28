'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _compilerBase = require('../compiler-base');

var _toutsuite = require('toutsuite');

var _toutsuite2 = _interopRequireDefault(_toutsuite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inputMimeTypes = ['text/vue'];
let vueify = null;

const mimeTypeToSimpleType = {
  'text/coffeescript': 'coffee',
  'text/typescript': 'ts',
  'application/javascript': 'js',
  'text/jade': 'jade',
  'text/less': 'less',
  'text/sass': 'sass',
  'text/scss': 'scss',
  'text/stylus': 'stylus'
};

/**
 * @access private
 */
class VueCompiler extends _compilerBase.CompilerBase {
  constructor(asyncCompilers, syncCompilers) {
    super();
    Object.assign(this, { asyncCompilers, syncCompilers });

    this.compilerOptions = {};
  }

  static createFromCompilers(compilersByMimeType) {
    let makeAsyncCompilers = () => Object.keys(compilersByMimeType).reduce((acc, mimeType) => {
      let compiler = compilersByMimeType[mimeType];

      acc[mimeType] = (() => {
        var _ref = _asyncToGenerator(function* (content, cb, vueCompiler, filePath) {
          let ctx = {};
          try {
            if (!(yield compiler.shouldCompileFile(filePath, ctx))) {
              cb(null, content);
              return;
            }

            let result = yield compiler.compile(content, filePath, ctx);
            cb(null, result.code);
            return;
          } catch (e) {
            cb(e);
          }
        });

        return function (_x, _x2, _x3, _x4) {
          return _ref.apply(this, arguments);
        };
      })();

      let st = mimeTypeToSimpleType[mimeType];
      if (st) acc[st] = acc[mimeType];

      return acc;
    }, {});

    let makeSyncCompilers = () => Object.keys(compilersByMimeType).reduce((acc, mimeType) => {
      let compiler = compilersByMimeType[mimeType];

      acc[mimeType] = (content, cb, vueCompiler, filePath) => {
        let ctx = {};
        try {
          if (!compiler.shouldCompileFileSync(filePath, ctx)) {
            cb(null, content);
            return;
          }

          let result = compiler.compileSync(content, filePath, ctx);
          cb(null, result.code);
          return;
        } catch (e) {
          cb(e);
        }
      };

      let st = mimeTypeToSimpleType[mimeType];
      if (st) acc[st] = acc[mimeType];

      return acc;
    }, {});

    // NB: This is super hacky but we have to defer building asyncCompilers
    // and syncCompilers until compilersByMimeType is filled out
    let ret = new VueCompiler(null, null);

    let asyncCompilers, syncCompilers;
    Object.defineProperty(ret, 'asyncCompilers', {
      get: () => {
        asyncCompilers = asyncCompilers || makeAsyncCompilers();
        return asyncCompilers;
      }
    });

    Object.defineProperty(ret, 'syncCompilers', {
      get: () => {
        syncCompilers = syncCompilers || makeSyncCompilers();
        return syncCompilers;
      }
    });

    return ret;
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

  compile(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      vueify = vueify || require('@paulcbetts/vueify');

      let opts = Object.assign({}, _this.compilerOptions);

      let code = yield new Promise(function (res, rej) {
        vueify.compiler.compileNoGlobals(sourceCode, filePath, _this.asyncCompilers, opts, function (e, r) {
          if (e) {
            rej(e);
          } else {
            res(r);
          }
        });
      });

      return {
        code,
        mimeType: 'application/javascript'
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
    // eslint-disable-line no-unused-vars
    vueify = vueify || require('@paulcbetts/vueify');

    let opts = Object.assign({}, this.compilerOptions);

    let err, code;
    (0, _toutsuite2.default)(() => {
      vueify.compiler.compileNoGlobals(sourceCode, filePath, this.syncCompilers, opts, (e, r) => {
        if (e) {
          err = e;
        } else {
          code = r;
        }
      });
    });

    if (err) throw err;

    return {
      code,
      mimeType: 'application/javascript'
    };
  }

  getCompilerVersion() {
    // NB: See same issue with SASS and user-scoped modules as to why we hard-code this
    let thisVersion = '9.4.0';
    let compilers = this.allCompilers || [];
    let otherVersions = compilers.map(x => x.getCompilerVersion).join();

    return `${thisVersion},${otherVersions}`;
  }
}
exports.default = VueCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL3Z1ZS5qcyJdLCJuYW1lcyI6WyJpbnB1dE1pbWVUeXBlcyIsInZ1ZWlmeSIsIm1pbWVUeXBlVG9TaW1wbGVUeXBlIiwiVnVlQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImFzeW5jQ29tcGlsZXJzIiwic3luY0NvbXBpbGVycyIsIk9iamVjdCIsImFzc2lnbiIsImNvbXBpbGVyT3B0aW9ucyIsImNyZWF0ZUZyb21Db21waWxlcnMiLCJjb21waWxlcnNCeU1pbWVUeXBlIiwibWFrZUFzeW5jQ29tcGlsZXJzIiwia2V5cyIsInJlZHVjZSIsImFjYyIsIm1pbWVUeXBlIiwiY29tcGlsZXIiLCJjb250ZW50IiwiY2IiLCJ2dWVDb21waWxlciIsImZpbGVQYXRoIiwiY3R4Iiwic2hvdWxkQ29tcGlsZUZpbGUiLCJyZXN1bHQiLCJjb21waWxlIiwiY29kZSIsImUiLCJzdCIsIm1ha2VTeW5jQ29tcGlsZXJzIiwic2hvdWxkQ29tcGlsZUZpbGVTeW5jIiwiY29tcGlsZVN5bmMiLCJyZXQiLCJkZWZpbmVQcm9wZXJ0eSIsImdldCIsImdldElucHV0TWltZVR5cGVzIiwiZmlsZU5hbWUiLCJjb21waWxlckNvbnRleHQiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyIsInNvdXJjZUNvZGUiLCJyZXF1aXJlIiwib3B0cyIsIlByb21pc2UiLCJyZXMiLCJyZWoiLCJjb21waWxlTm9HbG9iYWxzIiwiciIsImRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyIsImVyciIsImdldENvbXBpbGVyVmVyc2lvbiIsInRoaXNWZXJzaW9uIiwiY29tcGlsZXJzIiwiYWxsQ29tcGlsZXJzIiwib3RoZXJWZXJzaW9ucyIsIm1hcCIsIngiLCJqb2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7Ozs7Ozs7QUFFQSxNQUFNQSxpQkFBaUIsQ0FBQyxVQUFELENBQXZCO0FBQ0EsSUFBSUMsU0FBUyxJQUFiOztBQUVBLE1BQU1DLHVCQUF1QjtBQUMzQix1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LFlBQUwsSUFBcUIsRUFBckM7QUFDQSxRQUFJQyxnQkFBZ0JGLFVBQVVHLEdBQVYsQ0FBZUMsQ0FBRCxJQUFPQSxFQUFFTixrQkFBdkIsRUFBMkNPLElBQTNDLEVBQXBCOztBQUVBLFdBQVEsR0FBRU4sV0FBWSxJQUFHRyxhQUFjLEVBQXZDO0FBQ0Q7QUFqSm1EO2tCQUFqQ2xELFciLCJmaWxlIjoidnVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21waWxlckJhc2V9IGZyb20gJy4uL2NvbXBpbGVyLWJhc2UnO1xuaW1wb3J0IHRvdXRTdWl0ZSBmcm9tICd0b3V0c3VpdGUnO1xuXG5jb25zdCBpbnB1dE1pbWVUeXBlcyA9IFsndGV4dC92dWUnXTtcbmxldCB2dWVpZnkgPSBudWxsO1xuXG5jb25zdCBtaW1lVHlwZVRvU2ltcGxlVHlwZSA9IHtcbiAgJ3RleHQvY29mZmVlc2NyaXB0JzogJ2NvZmZlZScsXG4gICd0ZXh0L3R5cGVzY3JpcHQnOiAndHMnLFxuICAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc6ICdqcycsXG4gICd0ZXh0L2phZGUnOiAnamFkZScsXG4gICd0ZXh0L2xlc3MnOiAnbGVzcycsXG4gICd0ZXh0L3Nhc3MnOiAnc2FzcycsXG4gICd0ZXh0L3Njc3MnOiAnc2NzcycsXG4gICd0ZXh0L3N0eWx1cyc6ICdzdHlsdXMnLFxufTtcblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVnVlQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3Rvcihhc3luY0NvbXBpbGVycywgc3luY0NvbXBpbGVycykge1xuICAgIHN1cGVyKCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IGFzeW5jQ29tcGlsZXJzLCBzeW5jQ29tcGlsZXJzIH0pO1xuXG4gICAgdGhpcy5jb21waWxlck9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tQ29tcGlsZXJzKGNvbXBpbGVyc0J5TWltZVR5cGUpIHtcbiAgICBsZXQgbWFrZUFzeW5jQ29tcGlsZXJzID0gKCkgPT4gT2JqZWN0LmtleXMoY29tcGlsZXJzQnlNaW1lVHlwZSkucmVkdWNlKChhY2MsIG1pbWVUeXBlKSA9PiB7XG4gICAgICBsZXQgY29tcGlsZXIgPSBjb21waWxlcnNCeU1pbWVUeXBlW21pbWVUeXBlXTtcblxuICAgICAgYWNjW21pbWVUeXBlXSA9IGFzeW5jIChjb250ZW50LCBjYiwgdnVlQ29tcGlsZXIsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGxldCBjdHggPSB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIWF3YWl0IGNvbXBpbGVyLnNob3VsZENvbXBpbGVGaWxlKGZpbGVQYXRoLCBjdHgpKSB7XG4gICAgICAgICAgICBjYihudWxsLCBjb250ZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgY29tcGlsZXIuY29tcGlsZShjb250ZW50LCBmaWxlUGF0aCwgY3R4KTtcbiAgICAgICAgICBjYihudWxsLCByZXN1bHQuY29kZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY2IoZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGxldCBzdCA9IG1pbWVUeXBlVG9TaW1wbGVUeXBlW21pbWVUeXBlXTtcbiAgICAgIGlmIChzdCkgYWNjW3N0XSA9IGFjY1ttaW1lVHlwZV07XG5cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30pO1xuXG4gICAgbGV0IG1ha2VTeW5jQ29tcGlsZXJzID0gKCkgPT4gT2JqZWN0LmtleXMoY29tcGlsZXJzQnlNaW1lVHlwZSkucmVkdWNlKChhY2MsIG1pbWVUeXBlKSA9PiB7XG4gICAgICBsZXQgY29tcGlsZXIgPSBjb21waWxlcnNCeU1pbWVUeXBlW21pbWVUeXBlXTtcblxuICAgICAgYWNjW21pbWVUeXBlXSA9IChjb250ZW50LCBjYiwgdnVlQ29tcGlsZXIsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGxldCBjdHggPSB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIWNvbXBpbGVyLnNob3VsZENvbXBpbGVGaWxlU3luYyhmaWxlUGF0aCwgY3R4KSkge1xuICAgICAgICAgICAgY2IobnVsbCwgY29udGVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHJlc3VsdCA9IGNvbXBpbGVyLmNvbXBpbGVTeW5jKGNvbnRlbnQsIGZpbGVQYXRoLCBjdHgpO1xuICAgICAgICAgIGNiKG51bGwsIHJlc3VsdC5jb2RlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjYihlKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbGV0IHN0ID0gbWltZVR5cGVUb1NpbXBsZVR5cGVbbWltZVR5cGVdO1xuICAgICAgaWYgKHN0KSBhY2Nbc3RdID0gYWNjW21pbWVUeXBlXTtcblxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSk7XG5cbiAgICAvLyBOQjogVGhpcyBpcyBzdXBlciBoYWNreSBidXQgd2UgaGF2ZSB0byBkZWZlciBidWlsZGluZyBhc3luY0NvbXBpbGVyc1xuICAgIC8vIGFuZCBzeW5jQ29tcGlsZXJzIHVudGlsIGNvbXBpbGVyc0J5TWltZVR5cGUgaXMgZmlsbGVkIG91dFxuICAgIGxldCByZXQgPSBuZXcgVnVlQ29tcGlsZXIobnVsbCwgbnVsbCk7XG5cbiAgICBsZXQgYXN5bmNDb21waWxlcnMsIHN5bmNDb21waWxlcnM7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJldCwgJ2FzeW5jQ29tcGlsZXJzJywge1xuICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgIGFzeW5jQ29tcGlsZXJzID0gYXN5bmNDb21waWxlcnMgfHwgbWFrZUFzeW5jQ29tcGlsZXJzKCk7XG4gICAgICAgIHJldHVybiBhc3luY0NvbXBpbGVycztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXQsICdzeW5jQ29tcGlsZXJzJywge1xuICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgIHN5bmNDb21waWxlcnMgPSBzeW5jQ29tcGlsZXJzIHx8IG1ha2VTeW5jQ29tcGlsZXJzKCk7XG4gICAgICAgIHJldHVybiBzeW5jQ29tcGlsZXJzO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRJbnB1dE1pbWVUeXBlcygpIHtcbiAgICByZXR1cm4gaW5wdXRNaW1lVHlwZXM7XG4gIH1cblxuICBhc3luYyBzaG91bGRDb21waWxlRmlsZShmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGFzeW5jIGNvbXBpbGUoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdnVlaWZ5ID0gdnVlaWZ5IHx8IHJlcXVpcmUoJ0BwYXVsY2JldHRzL3Z1ZWlmeScpO1xuXG4gICAgbGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbXBpbGVyT3B0aW9ucyk7XG5cbiAgICBsZXQgY29kZSA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdnVlaWZ5LmNvbXBpbGVyLmNvbXBpbGVOb0dsb2JhbHMoc291cmNlQ29kZSwgZmlsZVBhdGgsIHRoaXMuYXN5bmNDb21waWxlcnMsIG9wdHMsIChlLHIpID0+IHtcbiAgICAgICAgaWYgKGUpIHsgcmVqKGUpOyB9IGVsc2UgeyByZXMocik7IH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGUsXG4gICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnXG4gICAgfTtcbiAgfVxuXG4gIHNob3VsZENvbXBpbGVGaWxlU3luYyhmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb21waWxlU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICB2dWVpZnkgPSB2dWVpZnkgfHwgcmVxdWlyZSgnQHBhdWxjYmV0dHMvdnVlaWZ5Jyk7XG5cbiAgICBsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zKTtcblxuICAgIGxldCBlcnIsY29kZTtcbiAgICB0b3V0U3VpdGUoKCkgPT4ge1xuICAgICAgdnVlaWZ5LmNvbXBpbGVyLmNvbXBpbGVOb0dsb2JhbHMoc291cmNlQ29kZSwgZmlsZVBhdGgsIHRoaXMuc3luY0NvbXBpbGVycywgb3B0cywgKGUscikgPT4ge1xuICAgICAgICBpZiAoZSkgeyBlcnIgPSBlOyB9IGVsc2UgeyBjb2RlID0gcjsgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpZiAoZXJyKSB0aHJvdyBlcnI7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29kZSxcbiAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCdcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q29tcGlsZXJWZXJzaW9uKCkge1xuICAgIC8vIE5COiBTZWUgc2FtZSBpc3N1ZSB3aXRoIFNBU1MgYW5kIHVzZXItc2NvcGVkIG1vZHVsZXMgYXMgdG8gd2h5IHdlIGhhcmQtY29kZSB0aGlzXG4gICAgbGV0IHRoaXNWZXJzaW9uID0gJzkuNC4wJztcbiAgICBsZXQgY29tcGlsZXJzID0gdGhpcy5hbGxDb21waWxlcnMgfHwgW107XG4gICAgbGV0IG90aGVyVmVyc2lvbnMgPSBjb21waWxlcnMubWFwKCh4KSA9PiB4LmdldENvbXBpbGVyVmVyc2lvbikuam9pbigpO1xuXG4gICAgcmV0dXJuIGAke3RoaXNWZXJzaW9ufSwke290aGVyVmVyc2lvbnN9YDtcbiAgfVxufVxuIl19