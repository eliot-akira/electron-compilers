'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _toutsuite = require('toutsuite');

var _toutsuite2 = _interopRequireDefault(_toutsuite);

var _detectiveSass = require('detective-sass');

var _detectiveSass2 = _interopRequireDefault(_detectiveSass);

var _detectiveScss = require('detective-scss');

var _detectiveScss2 = _interopRequireDefault(_detectiveScss);

var _sassLookup = require('sass-lookup');

var _sassLookup2 = _interopRequireDefault(_sassLookup);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mimeTypes = ['text/sass', 'text/scss'];
let sass = null;

/**
 * @access private
 */
class SassCompiler extends _compilerBase.CompilerBase {
  constructor() {
    super();

    this.compilerOptions = {
      comments: true,
      sourceMapEmbed: true,
      sourceMapContents: true
    };

    this.seenFilePaths = {};
  }

  static getInputMimeTypes() {
    return mimeTypes;
  }

  static isSassPartial(fileName) {
    const basename = _path2.default.basename(fileName);
    const ext = _path2.default.extname(fileName);
    return ext === '.scss' && basename[0] === '_';
  }

  shouldCompileFile(fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      return !SassCompiler.isSassPartial(fileName);
    })();
  }

  determineDependentFiles(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this.determineDependentFilesSync(sourceCode, filePath, compilerContext);
    })();
  }

  compile(sourceCode, filePath, compilerContext) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      sass = sass || _this2.getSass();

      let thisPath = _path2.default.dirname(filePath);
      _this2.seenFilePaths[thisPath] = true;

      let paths = Object.keys(_this2.seenFilePaths);

      if (_this2.compilerOptions.paths) {
        paths.push(..._this2.compilerOptions.paths);
      }

      paths.unshift('.');

      sass.importer(_this2.buildImporterCallback(paths));

      let opts = Object.assign({}, _this2.compilerOptions, {
        indentedSyntax: filePath.match(/\.sass$/i),
        sourceMapRoot: filePath
      });

      let result = yield new Promise(function (res, rej) {
        sass.compile(sourceCode, opts, function (r) {
          if (r.status !== 0) {
            rej(new Error(r.formatted || r.message));
            return;
          }

          res(r);
          return;
        });
      });

      let source = result.text;

      // NB: If you compile a file that is solely imports, its
      // actual content is '' yet it is a valid file. '' is not
      // truthy, so we're going to replace it with a string that
      // is truthy.
      if (!source) {
        source = ' ';
      }

      return {
        code: source,
        mimeType: 'text/css'
      };
    })();
  }

  shouldCompileFileSync(fileName, compilerContext) {
    // eslint-disable-line no-unused-vars
    return !SassCompiler.isSassPartial(fileName);
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    // eslint-disable-line no-unused-vars
    let dependencyFilenames = _path2.default.extname(filePath) === '.sass' ? (0, _detectiveSass2.default)(sourceCode) : (0, _detectiveScss2.default)(sourceCode);
    let dependencies = [];

    for (let dependencyName of dependencyFilenames) {
      dependencies.push((0, _sassLookup2.default)(dependencyName, _path2.default.basename(filePath), _path2.default.dirname(filePath)));
    }

    return dependencies;
  }

  compileSync(sourceCode, filePath, compilerContext) {
    // eslint-disable-line no-unused-vars
    sass = sass || this.getSass();

    let thisPath = _path2.default.dirname(filePath);
    this.seenFilePaths[thisPath] = true;

    let paths = Object.keys(this.seenFilePaths);

    if (this.compilerOptions.paths) {
      paths.push(...this.compilerOptions.paths);
    }

    paths.unshift('.');
    sass.importer(this.buildImporterCallback(paths));

    let opts = Object.assign({}, this.compilerOptions, {
      indentedSyntax: filePath.match(/\.sass$/i),
      sourceMapRoot: filePath
    });

    let result;
    (0, _toutsuite2.default)(() => {
      sass.compile(sourceCode, opts, r => {
        if (r.status !== 0) {
          throw new Error(r.formatted);
        }
        result = r;
      });
    });

    let source = result.text;

    // NB: If you compile a file that is solely imports, its
    // actual content is '' yet it is a valid file. '' is not
    // truthy, so we're going to replace it with a string that
    // is truthy.
    if (!source) {
      source = ' ';
    }

    return {
      code: source,
      mimeType: 'text/css'
    };
  }

  getSass() {
    let ret;
    (0, _toutsuite2.default)(() => ret = require('sass.js/dist/sass.node').Sass);
    return ret;
  }

  buildImporterCallback(includePaths) {
    const self = this;
    return function (request, done) {
      let file;
      if (request.file) {
        done();
        return;
      } else {
        // sass.js works in the '/sass/' directory
        const cleanedRequestPath = request.resolved.replace(/^\/sass\//, '');
        for (let includePath of includePaths) {
          const filePath = _path2.default.resolve(includePath, cleanedRequestPath);
          let variations = sass.getPathVariations(filePath);

          file = variations.map(self.fixWindowsPath.bind(self)).reduce(self.importedFileReducer.bind(self), null);

          if (file) {
            const content = _fs2.default.readFileSync(file, { encoding: 'utf8' });
            return sass.writeFile(file, content, () => {
              done({ path: file });
              return;
            });
          }
        }

        if (!file) {
          done();
          return;
        }
      }
    };
  }

  importedFileReducer(found, path) {
    // Find the first variation that actually exists
    if (found) return found;

    try {
      const stat = _fs2.default.statSync(path);
      if (!stat.isFile()) return null;
      return path;
    } catch (e) {
      return null;
    }
  }

  fixWindowsPath(file) {
    // Unfortunately, there's a bug in sass.js that seems to ignore the different
    // path separators across platforms

    // For some reason, some files have a leading slash that we need to get rid of
    if (process.platform === 'win32' && file[0] === '/') {
      file = file.slice(1);
    }

    // Sass.js generates paths such as `_C:\myPath\file.sass` instead of `C:\myPath\_file.sass`
    if (file[0] === '_') {
      const parts = file.slice(1).split(_path2.default.sep);
      const dir = parts.slice(0, -1).join(_path2.default.sep);
      const fileName = parts.reverse()[0];
      file = _path2.default.resolve(dir, '_' + fileName);
    }
    return file;
  }

  getCompilerVersion() {
    // NB: There is a bizarre bug in the node module system where this doesn't
    // work but only in saveConfiguration tests
    //return require('@paulcbetts/node-sass/package.json').version;
    return "4.1.1";
  }
}
exports.default = SassCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3Mvc2Fzcy5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJzYXNzIiwiU2Fzc0NvbXBpbGVyIiwiY29uc3RydWN0b3IiLCJjb21waWxlck9wdGlvbnMiLCJjb21tZW50cyIsInNvdXJjZU1hcEVtYmVkIiwic291cmNlTWFwQ29udGVudHMiLCJzZWVuRmlsZVBhdGhzIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJpc1Nhc3NQYXJ0aWFsIiwiZmlsZU5hbWUiLCJiYXNlbmFtZSIsImV4dCIsImV4dG5hbWUiLCJzaG91bGRDb21waWxlRmlsZSIsImNvbXBpbGVyQ29udGV4dCIsImRldGVybWluZURlcGVuZGVudEZpbGVzIiwic291cmNlQ29kZSIsImZpbGVQYXRoIiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jIiwiY29tcGlsZSIsImdldFNhc3MiLCJ0aGlzUGF0aCIsImRpcm5hbWUiLCJwYXRocyIsIk9iamVjdCIsImtleXMiLCJwdXNoIiwidW5zaGlmdCIsImltcG9ydGVyIiwiYnVpbGRJbXBvcnRlckNhbGxiYWNrIiwib3B0cyIsImFzc2lnbiIsImluZGVudGVkU3ludGF4IiwibWF0Y2giLCJzb3VyY2VNYXBSb290IiwicmVzdWx0IiwiUHJvbWlzZSIsInJlcyIsInJlaiIsInIiLCJzdGF0dXMiLCJFcnJvciIsImZvcm1hdHRlZCIsIm1lc3NhZ2UiLCJzb3VyY2UiLCJ0ZXh0IiwiY29kZSIsIm1pbWVUeXBlIiwic2hvdWxkQ29tcGlsZUZpbGVTeW5jIiwiZGVwZW5kZW5jeUZpbGVuYW1lcyIsImRlcGVuZGVuY2llcyIsImRlcGVuZGVuY3lOYW1lIiwiY29tcGlsZVN5bmMiLCJyZXQiLCJyZXF1aXJlIiwiU2FzcyIsImluY2x1ZGVQYXRocyIsInNlbGYiLCJyZXF1ZXN0IiwiZG9uZSIsImZpbGUiLCJjbGVhbmVkUmVxdWVzdFBhdGgiLCJyZXNvbHZlZCIsInJlcGxhY2UiLCJpbmNsdWRlUGF0aCIsInJlc29sdmUiLCJ2YXJpYXRpb25zIiwiZ2V0UGF0aFZhcmlhdGlvbnMiLCJtYXAiLCJmaXhXaW5kb3dzUGF0aCIsImJpbmQiLCJyZWR1Y2UiLCJpbXBvcnRlZEZpbGVSZWR1Y2VyIiwiY29udGVudCIsInJlYWRGaWxlU3luYyIsImVuY29kaW5nIiwid3JpdGVGaWxlIiwicGF0aCIsImZvdW5kIiwic3RhdCIsInN0YXRTeW5jIiwiaXNGaWxlIiwiZSIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInNsaWNlIiwicGFydHMiLCJzcGxpdCIsInNlcCIsImRpciIsImpvaW4iLCJyZXZlcnNlIiwiZ2V0Q29tcGlsZXJWZXJzaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsWUFBWSxDQUFDLFdBQUQsRUFBYyxXQUFkLENBQWxCO0FBQ0EsSUFBSUMsT0FBTyxJQUFYOztBQUVBOzs7QUFHZSxNQUFNQyxZQUFOLG9DQUF3QztBQUNyREMsZ0JBQWM7QUFDWjs7QUFFQSxTQUFLQyxlQUFMLEdBQXVCO0FBQ3JCQyxnQkFBVSxJQURXO0FBRXJCQyxzQkFBZ0IsSUFGSztBQUdyQkMseUJBQW1CO0FBSEUsS0FBdkI7O0FBTUEsU0FBS0MsYUFBTCxHQUFxQixFQUFyQjtBQUNEOztBQUVELFNBQU9DLGlCQUFQLEdBQTJCO0FBQ3pCLFdBQU9ULFNBQVA7QUFDRDs7QUFFRCxTQUFPVSxhQUFQLENBQXFCQyxRQUFyQixFQUErQjtBQUM3QixVQUFNQyxXQUFXLGVBQUtBLFFBQUwsQ0FBY0QsUUFBZCxDQUFqQjtBQUNBLFVBQU1FLE1BQU0sZUFBS0MsT0FBTCxDQUFhSCxRQUFiLENBQVo7QUFDQSxXQUFPRSxRQUFNLE9BQU4sSUFBaUJELFNBQVMsQ0FBVCxNQUFjLEdBQXRDO0FBQ0Q7O0FBRUtHLG1CQUFOLENBQXdCSixRQUF4QixFQUFrQ0ssZUFBbEMsRUFBbUQ7QUFBQTtBQUFFO0FBQ25ELGFBQU8sQ0FBQ2QsYUFBYVEsYUFBYixDQUEyQkMsUUFBM0Is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QUFJO0FBQ0YsWUFBTUMsT0FBTyxhQUFHQyxRQUFILENBQVlILElBQVosQ0FBYjtBQUNBLFVBQUksQ0FBQ0UsS0FBS0UsTUFBTCxFQUFMLEVBQW9CLE9BQU8sSUFBUDtBQUNwQixhQUFPSixJQUFQO0FBQ0QsS0FKRCxDQUlFLE9BQU1LLENBQU4sRUFBUztBQUNULGFBQU8sSUFBUDtBQUNEO0FBQ0Y7O0FBRURiLGlCQUFlVCxJQUFmLEVBQXFCO0FBQ25CO0FBQ0E7O0FBRUE7QUFDQSxRQUFJdUIsUUFBUUMsUUFBUixLQUFxQixPQUFyQixJQUFnQ3hCLEtBQUssQ0FBTCxNQUFZLEdBQWhELEVBQXFEO0FBQ25EQSxhQUFPQSxLQUFLeUIsS0FBTCxDQUFXLENBQVgsQ0FBUDtBQUNEOztBQUVEO0FBQ0EsUUFBSXpCLEtBQUssQ0FBTCxNQUFZLEdBQWhCLEVBQXFCO0FBQ25CLFlBQU0wQixRQUFRMUIsS0FBS3lCLEtBQUwsQ0FBVyxDQUFYLEVBQWNFLEtBQWQsQ0FBb0IsZUFBS0MsR0FBekIsQ0FBZDtBQUNBLFlBQU1DLE1BQU1ILE1BQU1ELEtBQU4sQ0FBWSxDQUFaLEVBQWUsQ0FBQyxDQUFoQixFQUFtQkssSUFBbkIsQ0FBd0IsZUFBS0YsR0FBN0IsQ0FBWjtBQUNBLFlBQU0vRSxXQUFXNkUsTUFBTUssT0FBTixHQUFnQixDQUFoQixDQUFqQjtBQUNBL0IsYUFBTyxlQUFLSyxPQUFMLENBQWF3QixHQUFiLEVBQWtCLE1BQU1oRixRQUF4QixDQUFQO0FBQ0Q7QUFDRCxXQUFPbUQsSUFBUDtBQUNEOztBQUVEZ0MsdUJBQXFCO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLFdBQU8sT0FBUDtBQUNEO0FBM05vRDtrQkFBbEM1RixZIiwiZmlsZSI6InNhc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgdG91dFN1aXRlIGZyb20gJ3RvdXRzdWl0ZSc7XG5pbXBvcnQgZGV0ZWN0aXZlU0FTUyBmcm9tICdkZXRlY3RpdmUtc2Fzcyc7XG5pbXBvcnQgZGV0ZWN0aXZlU0NTUyBmcm9tICdkZXRlY3RpdmUtc2Nzcyc7XG5pbXBvcnQgc2Fzc0xvb2t1cCBmcm9tICdzYXNzLWxvb2t1cCc7XG5pbXBvcnQge0NvbXBpbGVyQmFzZX0gZnJvbSAnLi4vY29tcGlsZXItYmFzZSc7XG5cbmNvbnN0IG1pbWVUeXBlcyA9IFsndGV4dC9zYXNzJywgJ3RleHQvc2NzcyddO1xubGV0IHNhc3MgPSBudWxsO1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYXNzQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb21waWxlck9wdGlvbnMgPSB7XG4gICAgICBjb21tZW50czogdHJ1ZSxcbiAgICAgIHNvdXJjZU1hcEVtYmVkOiB0cnVlLFxuICAgICAgc291cmNlTWFwQ29udGVudHM6IHRydWVcbiAgICB9O1xuXG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzID0ge307XG4gIH1cblxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XG4gICAgcmV0dXJuIG1pbWVUeXBlcztcbiAgfVxuXG4gIHN0YXRpYyBpc1Nhc3NQYXJ0aWFsKGZpbGVOYW1lKSB7XG4gICAgY29uc3QgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVOYW1lKTtcbiAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZU5hbWUpO1xuICAgIHJldHVybiBleHQ9PT0nLnNjc3MnICYmIGJhc2VuYW1lWzBdPT09J18nO1xuICB9XG5cbiAgYXN5bmMgc2hvdWxkQ29tcGlsZUZpbGUoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuICFTYXNzQ29tcGlsZXIuaXNTYXNzUGFydGlhbChmaWxlTmFtZSk7XG4gIH1cblxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpO1xuICB9XG5cbiAgYXN5bmMgY29tcGlsZShzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBzYXNzID0gc2FzcyB8fCB0aGlzLmdldFNhc3MoKTtcblxuICAgIGxldCB0aGlzUGF0aCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzW3RoaXNQYXRoXSA9IHRydWU7XG5cbiAgICBsZXQgcGF0aHMgPSBPYmplY3Qua2V5cyh0aGlzLnNlZW5GaWxlUGF0aHMpO1xuXG4gICAgaWYgKHRoaXMuY29tcGlsZXJPcHRpb25zLnBhdGhzKSB7XG4gICAgICBwYXRocy5wdXNoKC4uLnRoaXMuY29tcGlsZXJPcHRpb25zLnBhdGhzKTtcbiAgICB9XG5cbiAgICBwYXRocy51bnNoaWZ0KCcuJyk7XG5cbiAgICBzYXNzLmltcG9ydGVyKHRoaXMuYnVpbGRJbXBvcnRlckNhbGxiYWNrKHBhdGhzKSk7XG5cbiAgICBsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zLCB7XG4gICAgICBpbmRlbnRlZFN5bnRheDogZmlsZVBhdGgubWF0Y2goL1xcLnNhc3MkL2kpLFxuICAgICAgc291cmNlTWFwUm9vdDogZmlsZVBhdGgsXG4gICAgfSk7XG5cbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgbmV3IFByb21pc2UoKHJlcyxyZWopID0+IHtcbiAgICAgIHNhc3MuY29tcGlsZShzb3VyY2VDb2RlLCBvcHRzLCAocikgPT4ge1xuICAgICAgICBpZiAoci5zdGF0dXMgIT09IDApIHtcbiAgICAgICAgICByZWoobmV3IEVycm9yKHIuZm9ybWF0dGVkIHx8IHIubWVzc2FnZSkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcyhyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsZXQgc291cmNlID0gcmVzdWx0LnRleHQ7XG5cbiAgICAvLyBOQjogSWYgeW91IGNvbXBpbGUgYSBmaWxlIHRoYXQgaXMgc29sZWx5IGltcG9ydHMsIGl0c1xuICAgIC8vIGFjdHVhbCBjb250ZW50IGlzICcnIHlldCBpdCBpcyBhIHZhbGlkIGZpbGUuICcnIGlzIG5vdFxuICAgIC8vIHRydXRoeSwgc28gd2UncmUgZ29pbmcgdG8gcmVwbGFjZSBpdCB3aXRoIGEgc3RyaW5nIHRoYXRcbiAgICAvLyBpcyB0cnV0aHkuXG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgIHNvdXJjZSA9ICcgJztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogc291cmNlLFxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2NzcydcbiAgICB9O1xuICB9XG5cbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiAhU2Fzc0NvbXBpbGVyLmlzU2Fzc1BhcnRpYWwoZmlsZU5hbWUpO1xuICB9XG5cbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIGxldCBkZXBlbmRlbmN5RmlsZW5hbWVzID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT0gJy5zYXNzJyA/IGRldGVjdGl2ZVNBU1Moc291cmNlQ29kZSkgOiBkZXRlY3RpdmVTQ1NTKHNvdXJjZUNvZGUpO1xuICAgIGxldCBkZXBlbmRlbmNpZXMgPSBbXTtcblxuICAgIGZvciAobGV0IGRlcGVuZGVuY3lOYW1lIG9mIGRlcGVuZGVuY3lGaWxlbmFtZXMpIHtcbiAgICAgIGRlcGVuZGVuY2llcy5wdXNoKHNhc3NMb29rdXAoZGVwZW5kZW5jeU5hbWUsIHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpLCBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlcGVuZGVuY2llcztcbiAgfVxuXG4gIGNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHNhc3MgPSBzYXNzIHx8IHRoaXMuZ2V0U2FzcygpO1xuXG4gICAgbGV0IHRoaXNQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICB0aGlzLnNlZW5GaWxlUGF0aHNbdGhpc1BhdGhdID0gdHJ1ZTtcblxuICAgIGxldCBwYXRocyA9IE9iamVjdC5rZXlzKHRoaXMuc2VlbkZpbGVQYXRocyk7XG5cbiAgICBpZiAodGhpcy5jb21waWxlck9wdGlvbnMucGF0aHMpIHtcbiAgICAgIHBhdGhzLnB1c2goLi4udGhpcy5jb21waWxlck9wdGlvbnMucGF0aHMpO1xuICAgIH1cblxuICAgIHBhdGhzLnVuc2hpZnQoJy4nKTtcbiAgICBzYXNzLmltcG9ydGVyKHRoaXMuYnVpbGRJbXBvcnRlckNhbGxiYWNrKHBhdGhzKSk7XG5cbiAgICBsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zLCB7XG4gICAgICBpbmRlbnRlZFN5bnRheDogZmlsZVBhdGgubWF0Y2goL1xcLnNhc3MkL2kpLFxuICAgICAgc291cmNlTWFwUm9vdDogZmlsZVBhdGgsXG4gICAgfSk7XG5cbiAgICBsZXQgcmVzdWx0O1xuICAgIHRvdXRTdWl0ZSgoKSA9PiB7XG4gICAgICBzYXNzLmNvbXBpbGUoc291cmNlQ29kZSwgb3B0cywgKHIpID0+IHtcbiAgICAgICAgaWYgKHIuc3RhdHVzICE9PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHIuZm9ybWF0dGVkKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSByO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBsZXQgc291cmNlID0gcmVzdWx0LnRleHQ7XG5cbiAgICAvLyBOQjogSWYgeW91IGNvbXBpbGUgYSBmaWxlIHRoYXQgaXMgc29sZWx5IGltcG9ydHMsIGl0c1xuICAgIC8vIGFjdHVhbCBjb250ZW50IGlzICcnIHlldCBpdCBpcyBhIHZhbGlkIGZpbGUuICcnIGlzIG5vdFxuICAgIC8vIHRydXRoeSwgc28gd2UncmUgZ29pbmcgdG8gcmVwbGFjZSBpdCB3aXRoIGEgc3RyaW5nIHRoYXRcbiAgICAvLyBpcyB0cnV0aHkuXG4gICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgIHNvdXJjZSA9ICcgJztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogc291cmNlLFxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2NzcydcbiAgICB9O1xuICB9XG5cbiAgZ2V0U2FzcygpIHtcbiAgICBsZXQgcmV0O1xuICAgIHRvdXRTdWl0ZSgoKSA9PiByZXQgPSByZXF1aXJlKCdzYXNzLmpzL2Rpc3Qvc2Fzcy5ub2RlJykuU2Fzcyk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGJ1aWxkSW1wb3J0ZXJDYWxsYmFjayAoaW5jbHVkZVBhdGhzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIChmdW5jdGlvbiAocmVxdWVzdCwgZG9uZSkge1xuICAgICAgbGV0IGZpbGU7XG4gICAgICBpZiAocmVxdWVzdC5maWxlKSB7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc2Fzcy5qcyB3b3JrcyBpbiB0aGUgJy9zYXNzLycgZGlyZWN0b3J5XG4gICAgICAgIGNvbnN0IGNsZWFuZWRSZXF1ZXN0UGF0aCA9IHJlcXVlc3QucmVzb2x2ZWQucmVwbGFjZSgvXlxcL3Nhc3NcXC8vLCAnJyk7XG4gICAgICAgIGZvciAobGV0IGluY2x1ZGVQYXRoIG9mIGluY2x1ZGVQYXRocykge1xuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGluY2x1ZGVQYXRoLCBjbGVhbmVkUmVxdWVzdFBhdGgpO1xuICAgICAgICAgIGxldCB2YXJpYXRpb25zID0gc2Fzcy5nZXRQYXRoVmFyaWF0aW9ucyhmaWxlUGF0aCk7XG5cbiAgICAgICAgICBmaWxlID0gdmFyaWF0aW9uc1xuICAgICAgICAgICAgLm1hcChzZWxmLmZpeFdpbmRvd3NQYXRoLmJpbmQoc2VsZikpXG4gICAgICAgICAgICAucmVkdWNlKHNlbGYuaW1wb3J0ZWRGaWxlUmVkdWNlci5iaW5kKHNlbGYpLCBudWxsKTtcblxuICAgICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KTtcbiAgICAgICAgICAgIHJldHVybiBzYXNzLndyaXRlRmlsZShmaWxlLCBjb250ZW50LCAoKSA9PiB7XG4gICAgICAgICAgICAgIGRvbmUoeyBwYXRoOiBmaWxlIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBpbXBvcnRlZEZpbGVSZWR1Y2VyKGZvdW5kLCBwYXRoKSB7XG4gICAgLy8gRmluZCB0aGUgZmlyc3QgdmFyaWF0aW9uIHRoYXQgYWN0dWFsbHkgZXhpc3RzXG4gICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuICAgICAgaWYgKCFzdGF0LmlzRmlsZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgZml4V2luZG93c1BhdGgoZmlsZSkge1xuICAgIC8vIFVuZm9ydHVuYXRlbHksIHRoZXJlJ3MgYSBidWcgaW4gc2Fzcy5qcyB0aGF0IHNlZW1zIHRvIGlnbm9yZSB0aGUgZGlmZmVyZW50XG4gICAgLy8gcGF0aCBzZXBhcmF0b3JzIGFjcm9zcyBwbGF0Zm9ybXNcblxuICAgIC8vIEZvciBzb21lIHJlYXNvbiwgc29tZSBmaWxlcyBoYXZlIGEgbGVhZGluZyBzbGFzaCB0aGF0IHdlIG5lZWQgdG8gZ2V0IHJpZCBvZlxuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmIGZpbGVbMF0gPT09ICcvJykge1xuICAgICAgZmlsZSA9IGZpbGUuc2xpY2UoMSk7XG4gICAgfVxuXG4gICAgLy8gU2Fzcy5qcyBnZW5lcmF0ZXMgcGF0aHMgc3VjaCBhcyBgX0M6XFxteVBhdGhcXGZpbGUuc2Fzc2AgaW5zdGVhZCBvZiBgQzpcXG15UGF0aFxcX2ZpbGUuc2Fzc2BcbiAgICBpZiAoZmlsZVswXSA9PT0gJ18nKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGZpbGUuc2xpY2UoMSkuc3BsaXQocGF0aC5zZXApO1xuICAgICAgY29uc3QgZGlyID0gcGFydHMuc2xpY2UoMCwgLTEpLmpvaW4ocGF0aC5zZXApO1xuICAgICAgY29uc3QgZmlsZU5hbWUgPSBwYXJ0cy5yZXZlcnNlKClbMF07XG4gICAgICBmaWxlID0gcGF0aC5yZXNvbHZlKGRpciwgJ18nICsgZmlsZU5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmlsZTtcbiAgfVxuXG4gIGdldENvbXBpbGVyVmVyc2lvbigpIHtcbiAgICAvLyBOQjogVGhlcmUgaXMgYSBiaXphcnJlIGJ1ZyBpbiB0aGUgbm9kZSBtb2R1bGUgc3lzdGVtIHdoZXJlIHRoaXMgZG9lc24ndFxuICAgIC8vIHdvcmsgYnV0IG9ubHkgaW4gc2F2ZUNvbmZpZ3VyYXRpb24gdGVzdHNcbiAgICAvL3JldHVybiByZXF1aXJlKCdAcGF1bGNiZXR0cy9ub2RlLXNhc3MvcGFja2FnZS5qc29uJykudmVyc2lvbjtcbiAgICByZXR1cm4gXCI0LjEuMVwiO1xuICB9XG59XG4iXX0=