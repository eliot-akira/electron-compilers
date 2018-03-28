'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _detectiveLess = require('detective-less');

var _detectiveLess2 = _interopRequireDefault(_detectiveLess);

var _compilerBase = require('../compiler-base');

var _toutsuite = require('toutsuite');

var _toutsuite2 = _interopRequireDefault(_toutsuite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mimeTypes = ['text/less'];
let lessjs = null;

/**
 * @access private
 */
class LessCompiler extends _compilerBase.CompilerBase {
  constructor() {
    super();

    this.compilerOptions = {
      sourceMap: { sourceMapFileInline: true }
    };

    this.seenFilePaths = {};
  }

  static getInputMimeTypes() {
    return mimeTypes;
  }

  shouldCompileFile(fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      return true;
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
      lessjs = lessjs || _this2.getLess();

      let thisPath = _path2.default.dirname(filePath);
      _this2.seenFilePaths[thisPath] = true;

      let paths = Object.keys(_this2.seenFilePaths);

      if (_this2.compilerOptions.paths) {
        paths.push(..._this2.compilerOptions.paths);
      }

      let opts = Object.assign({}, _this2.compilerOptions, {
        paths: paths,
        filename: _path2.default.basename(filePath)
      });

      let result = yield lessjs.render(sourceCode, opts);
      let source = result.css;

      // NB: If you compile a file that is solely imports, its
      // actual content is '' yet it is a valid file. '' is not
      // truthy, so we're going to replace it with a string that
      // is truthy.
      if (!source && typeof source === 'string') {
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
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    // eslint-disable-line no-unused-vars
    let dependencyFilenames = (0, _detectiveLess2.default)(sourceCode);
    let dependencies = [];

    for (let dependencyName of dependencyFilenames) {
      dependencies.push(_path2.default.join(_path2.default.dirname(filePath), dependencyName));
    }

    return dependencies;
  }

  compileSync(sourceCode, filePath, compilerContext) {
    // eslint-disable-line no-unused-vars
    lessjs = lessjs || this.getLess();

    let source;
    let error = null;

    let thisPath = _path2.default.dirname(filePath);
    this.seenFilePaths[thisPath] = true;

    let paths = Object.keys(this.seenFilePaths);

    if (this.compilerOptions.paths) {
      paths.push(...this.compilerOptions.paths);
    }

    let opts = Object.assign({}, this.compilerOptions, {
      paths: paths,
      filename: _path2.default.basename(filePath),
      fileAsync: false, async: false, syncImport: true
    });

    (0, _toutsuite2.default)(() => {
      lessjs.render(sourceCode, opts, (err, out) => {
        if (err) {
          error = err;
        } else {
          // NB: Because we've forced less to work in sync mode, we can do this
          source = out.css;
        }
      });
    });

    if (error) {
      throw error;
    }

    // NB: If you compile a file that is solely imports, its
    // actual content is '' yet it is a valid file. '' is not
    // truthy, so we're going to replace it with a string that
    // is truthy.
    if (!source && typeof source === 'string') {
      source = ' ';
    }

    return {
      code: source,
      mimeType: 'text/css'
    };
  }

  getLess() {
    let ret;
    (0, _toutsuite2.default)(() => ret = require('less'));
    return ret;
  }

  getCompilerVersion() {
    return require('less/package.json').version;
  }
}
exports.default = LessCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3MvbGVzcy5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJsZXNzanMiLCJMZXNzQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImNvbXBpbGVyT3B0aW9ucyIsInNvdXJjZU1hcCIsInNvdXJjZU1hcEZpbGVJbmxpbmUiLCJzZWVuRmlsZVBhdGhzIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJzaG91bGRDb21waWxlRmlsZSIsImZpbGVOYW1lIiwiY29tcGlsZXJDb250ZXh0IiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMiLCJzb3VyY2VDb2RlIiwiZmlsZVBhdGgiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMiLCJjb21waWxlIiwiZ2V0TGVzcyIsInRoaXNQYXRoIiwiZGlybmFtZSIsInBhdGhzIiwiT2JqZWN0Iiwia2V5cyIsInB1c2giLCJvcHRzIiwiYXNzaWduIiwiZmlsZW5hbWUiLCJiYXNlbmFtZSIsInJlc3VsdCIsInJlbmRlciIsInNvdXJjZSIsImNzcyIsImNvZGUiLCJtaW1lVHlwZSIsInNob3VsZENvbXBpbGVGaWxlU3luYyIsImRlcGVuZGVuY3lGaWxlbmFtZXMiLCJkZXBlbmRlbmNpZXMiLCJkZXBlbmRlbmN5TmFtZSIsImpvaW4iLCJjb21waWxlU3luYyIsImVycm9yIiwiZmlsZUFzeW5jIiwiYXN5bmMiLCJzeW5jSW1wb3J0IiwiZXJyIiwib3V0IiwicmV0IiwicmVxdWlyZSIsImdldENvbXBpbGVyVmVyc2lvbiIsInZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxNQUFNQSxZQUFZLENBQUMsV0FBRCxDQUFsQjtBQUNBLElBQUlDLFNBQVMsSUFBYjs7QUFFQTs7O0FBR2UsTUFBTUMsWUFBTixvQ0FBd0M7QUFDckRDLGdCQUFjO0FBQ1o7O0FBRUEsU0FBS0MsZUFBTCxHQUF1QjtBQUNyQkMsaUJBQVcsRUFBRUMscUJBQXFCLElBQXZCO0FBRFUs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QWMsRUFBZCxFQUFrQixLQUFLckIsZUFBdkIsRUFBd0M7QUFDakRnQixhQUFPQSxLQUQwQztBQUVqRE0sZ0JBQVUsZUFBS0MsUUFBTCxDQUFjYixRQUFkLENBRnVDO0FBR2pEMkIsaUJBQVcsS0FIc0MsRUFHL0JDLE9BQU8sS0FId0IsRUFHakJDLFlBQVk7QUFISyxLQUF4QyxDQUFYOztBQU1BLDZCQUFVLE1BQU07QUFDZDFDLGFBQU80QixNQUFQLENBQWNoQixVQUFkLEVBQTBCVyxJQUExQixFQUFnQyxDQUFDb0IsR0FBRCxFQUFNQyxHQUFOLEtBQWM7QUFDNUMsWUFBSUQsR0FBSixFQUFTO0FBQ1BKLGtCQUFRSSxHQUFSO0FBQ0QsU0FGRCxNQUVPO0FBQ0w7QUFDQWQsbUJBQVNlLElBQUlkLEdBQWI7QUFDRDtBQUNGLE9BUEQ7QUFRRCxLQVREOztBQVdBLFFBQUlTLEtBQUosRUFBVztBQUNULFlBQU1BLEtBQU47QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQUksQ0FBQ1YsTUFBRCxJQUFXLE9BQU9BLE1BQVAsS0FBa0IsUUFBakMsRUFBMkM7QUFDekNBLGVBQVMsR0FBVDtBQUNEOztBQUVELFdBQU87QUFDTEUsWUFBTUYsTUFERDtBQUVMRyxnQkFBVTtBQUZMLEtBQVA7QUFJRDs7QUFFRGhCLFlBQVU7QUFDUixRQUFJNkIsR0FBSjtBQUNBLDZCQUFVLE1BQU1BLE1BQU1DLFFBQVEsTUFBUixDQUF0QjtBQUNBLFdBQU9ELEdBQVA7QUFDRDs7QUFFREUsdUJBQXFCO0FBQ25CLFdBQU9ELFFBQVEsbUJBQVIsRUFBNkJFLE9BQXBDO0FBQ0Q7QUFsSW9EO2tCQUFsQy9DLFkiLCJmaWxlIjoibGVzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGRldGVjdGl2ZSBmcm9tICdkZXRlY3RpdmUtbGVzcyc7XG5pbXBvcnQge0NvbXBpbGVyQmFzZX0gZnJvbSAnLi4vY29tcGlsZXItYmFzZSc7XG5pbXBvcnQgdG91dFN1aXRlIGZyb20gJ3RvdXRzdWl0ZSc7XG5cbmNvbnN0IG1pbWVUeXBlcyA9IFsndGV4dC9sZXNzJ107XG5sZXQgbGVzc2pzID0gbnVsbDtcblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVzc0NvbXBpbGVyIGV4dGVuZHMgQ29tcGlsZXJCYXNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29tcGlsZXJPcHRpb25zID0ge1xuICAgICAgc291cmNlTWFwOiB7IHNvdXJjZU1hcEZpbGVJbmxpbmU6IHRydWUgfVxuICAgIH07XG5cbiAgICB0aGlzLnNlZW5GaWxlUGF0aHMgPSB7fTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRJbnB1dE1pbWVUeXBlcygpIHtcbiAgICByZXR1cm4gbWltZVR5cGVzO1xuICB9XG5cbiAgYXN5bmMgc2hvdWxkQ29tcGlsZUZpbGUoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpO1xuICB9XG5cbiAgYXN5bmMgY29tcGlsZShzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBsZXNzanMgPSBsZXNzanMgfHwgdGhpcy5nZXRMZXNzKCk7XG5cbiAgICBsZXQgdGhpc1BhdGggPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgIHRoaXMuc2VlbkZpbGVQYXRoc1t0aGlzUGF0aF0gPSB0cnVlO1xuXG4gICAgbGV0IHBhdGhzID0gT2JqZWN0LmtleXModGhpcy5zZWVuRmlsZVBhdGhzKTtcblxuICAgIGlmICh0aGlzLmNvbXBpbGVyT3B0aW9ucy5wYXRocykge1xuICAgICAgcGF0aHMucHVzaCguLi50aGlzLmNvbXBpbGVyT3B0aW9ucy5wYXRocyk7XG4gICAgfVxuXG4gICAgbGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbXBpbGVyT3B0aW9ucywge1xuICAgICAgcGF0aHM6IHBhdGhzLFxuICAgICAgZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG4gICAgfSk7XG5cbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgbGVzc2pzLnJlbmRlcihzb3VyY2VDb2RlLCBvcHRzKTtcbiAgICBsZXQgc291cmNlID0gcmVzdWx0LmNzcztcblxuICAgIC8vIE5COiBJZiB5b3UgY29tcGlsZSBhIGZpbGUgdGhhdCBpcyBzb2xlbHkgaW1wb3J0cywgaXRzXG4gICAgLy8gYWN0dWFsIGNvbnRlbnQgaXMgJycgeWV0IGl0IGlzIGEgdmFsaWQgZmlsZS4gJycgaXMgbm90XG4gICAgLy8gdHJ1dGh5LCBzbyB3ZSdyZSBnb2luZyB0byByZXBsYWNlIGl0IHdpdGggYSBzdHJpbmcgdGhhdFxuICAgIC8vIGlzIHRydXRoeS5cbiAgICBpZiAoIXNvdXJjZSAmJiB0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJykge1xuICAgICAgc291cmNlID0gJyAnO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBzb3VyY2UsXG4gICAgICBtaW1lVHlwZTogJ3RleHQvY3NzJ1xuICAgIH07XG4gIH1cblxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgbGV0IGRlcGVuZGVuY3lGaWxlbmFtZXMgPSBkZXRlY3RpdmUoc291cmNlQ29kZSk7XG4gICAgbGV0IGRlcGVuZGVuY2llcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgZGVwZW5kZW5jeU5hbWUgb2YgZGVwZW5kZW5jeUZpbGVuYW1lcykge1xuICAgICAgZGVwZW5kZW5jaWVzLnB1c2gocGF0aC5qb2luKHBhdGguZGlybmFtZShmaWxlUGF0aCksIGRlcGVuZGVuY3lOYW1lKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlcGVuZGVuY2llcztcbiAgfVxuXG4gIGNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIGxlc3NqcyA9IGxlc3NqcyB8fCB0aGlzLmdldExlc3MoKTtcblxuICAgIGxldCBzb3VyY2U7XG4gICAgbGV0IGVycm9yID0gbnVsbDtcblxuICAgIGxldCB0aGlzUGF0aCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzW3RoaXNQYXRoXSA9IHRydWU7XG5cbiAgICBsZXQgcGF0aHMgPSBPYmplY3Qua2V5cyh0aGlzLnNlZW5GaWxlUGF0aHMpO1xuXG4gICAgaWYgKHRoaXMuY29tcGlsZXJPcHRpb25zLnBhdGhzKSB7XG4gICAgICBwYXRocy5wdXNoKC4uLnRoaXMuY29tcGlsZXJPcHRpb25zLnBhdGhzKTtcbiAgICB9XG5cbiAgICBsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zLCB7XG4gICAgICBwYXRoczogcGF0aHMsXG4gICAgICBmaWxlbmFtZTogcGF0aC5iYXNlbmFtZShmaWxlUGF0aCksXG4gICAgICBmaWxlQXN5bmM6IGZhbHNlLCBhc3luYzogZmFsc2UsIHN5bmNJbXBvcnQ6IHRydWVcbiAgICB9KTtcblxuICAgIHRvdXRTdWl0ZSgoKSA9PiB7XG4gICAgICBsZXNzanMucmVuZGVyKHNvdXJjZUNvZGUsIG9wdHMsIChlcnIsIG91dCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTkI6IEJlY2F1c2Ugd2UndmUgZm9yY2VkIGxlc3MgdG8gd29yayBpbiBzeW5jIG1vZGUsIHdlIGNhbiBkbyB0aGlzXG4gICAgICAgICAgc291cmNlID0gb3V0LmNzcztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIC8vIE5COiBJZiB5b3UgY29tcGlsZSBhIGZpbGUgdGhhdCBpcyBzb2xlbHkgaW1wb3J0cywgaXRzXG4gICAgLy8gYWN0dWFsIGNvbnRlbnQgaXMgJycgeWV0IGl0IGlzIGEgdmFsaWQgZmlsZS4gJycgaXMgbm90XG4gICAgLy8gdHJ1dGh5LCBzbyB3ZSdyZSBnb2luZyB0byByZXBsYWNlIGl0IHdpdGggYSBzdHJpbmcgdGhhdFxuICAgIC8vIGlzIHRydXRoeS5cbiAgICBpZiAoIXNvdXJjZSAmJiB0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJykge1xuICAgICAgc291cmNlID0gJyAnO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBzb3VyY2UsXG4gICAgICBtaW1lVHlwZTogJ3RleHQvY3NzJ1xuICAgIH07XG4gIH1cblxuICBnZXRMZXNzKCkge1xuICAgIGxldCByZXQ7XG4gICAgdG91dFN1aXRlKCgpID0+IHJldCA9IHJlcXVpcmUoJ2xlc3MnKSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGdldENvbXBpbGVyVmVyc2lvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnbGVzcy9wYWNrYWdlLmpzb24nKS52ZXJzaW9uO1xuICB9XG59XG4iXX0=