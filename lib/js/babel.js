'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mimeTypes = ['text/jsx', 'application/javascript'];
let babel = null;
let istanbul = null;

class BabelCompiler extends _compilerBase.SimpleCompilerBase {
  constructor() {
    super();
  }

  static getInputMimeTypes() {
    return mimeTypes;
  }

  // NB: This method exists to stop Babel from trying to load plugins from the
  // app's node_modules directory, which in a production app doesn't have Babel
  // installed in it. Instead, we try to load from our entry point's node_modules
  // directory (i.e. Grunt perhaps), and if it doesn't work, just keep going.
  attemptToPreload(names, prefix) {
    if (!names.length) return null;

    const fixupModule = exp => {
      // NB: Some plugins like transform-decorators-legacy, use import/export
      // semantics, and others don't
      if ('default' in exp) return exp['default'];
      return exp;
    };

    const nodeModulesAboveUs = _path2.default.resolve(__dirname, '..', '..', '..');

    const preloadStrategies = [x => fixupModule(require.main.require(x)), x => fixupModule(require(_path2.default.join(nodeModulesAboveUs, x))), x => fixupModule(require(x))];

    const possibleNames = name => {
      let names = [`babel-${prefix}-${name}`];

      if (prefix === 'plugin') {
        // Look for module names that do not start with "babel-plugin-"
        names.push(name);
      }

      return names;
    };

    // Apply one preloading strategy to the possible names of a module, and return the preloaded
    // module if found, null otherwise
    const preloadPossibleNames = (name, strategy) => {
      if (typeof strategy !== 'function') return null;

      return possibleNames(name).reduce((mod, possibleName) => {
        if (mod !== null) return mod;

        try {
          return strategy(possibleName);
        } catch (e) {} // eslint-disable-line no-empty

        return null;
      }, null);
    };

    // Pick a loading strategy that finds the first plugin, the same strategy will be
    // used to preload all plugins
    const selectedStrategy = preloadStrategies.reduce((winner, strategy) => {
      if (winner !== null) return winner;
      return preloadPossibleNames(names[0], strategy) === null ? null : strategy;
    }, null);

    return names.map(name => preloadPossibleNames(name, selectedStrategy)).filter(mod => mod !== null);
  }

  compileSync(sourceCode, filePath, compilerContext) {
    // eslint-disable-line no-unused-vars
    babel = babel || require('babel-core');

    let opts = Object.assign({}, this.compilerOptions, {
      filename: filePath,
      ast: false,
      babelrc: false
    });

    let useCoverage = false;
    if ('coverage' in opts) {
      useCoverage = !!opts.coverage;
      delete opts.coverage;
    }

    if ('plugins' in opts) {
      let plugins = this.attemptToPreload(opts.plugins, 'plugin');
      if (plugins && plugins.length === opts.plugins.length) opts.plugins = plugins;
    }

    if ('presets' in opts) {
      let presets = this.attemptToPreload(opts.presets, 'preset');
      if (presets && presets.length === opts.presets.length) opts.presets = presets;
    }

    const output = babel.transform(sourceCode, opts);
    let sourceMaps = output.map ? JSON.stringify(output.map) : null;

    let code = output.code;
    if (useCoverage) {
      istanbul = istanbul || require('istanbul');

      sourceMaps = null;
      code = new istanbul.Instrumenter().instrumentSync(output.code, filePath);
    }

    return { code, sourceMaps, mimeType: 'application/javascript' };
  }

  getCompilerVersion() {
    return require('babel-core/package.json').version;
  }
}
exports.default = BabelCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9iYWJlbC5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJiYWJlbCIsImlzdGFuYnVsIiwiQmFiZWxDb21waWxlciIsImNvbnN0cnVjdG9yIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJhdHRlbXB0VG9QcmVsb2FkIiwibmFtZXMiLCJwcmVmaXgiLCJsZW5ndGgiLCJmaXh1cE1vZHVsZSIsImV4cCIsIm5vZGVNb2R1bGVzQWJvdmVVcyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJwcmVsb2FkU3RyYXRlZ2llcyIsIngiLCJyZXF1aXJlIiwibWFpbiIsImpvaW4iLCJwb3NzaWJsZU5hbWVzIiwibmFtZSIsInB1c2giLCJwcmVsb2FkUG9zc2libGVOYW1lcyIsInN0cmF0ZWd5IiwicmVkdWNlIiwibW9kIiwicG9zc2libGVOYW1lIiwiZSIsInNlbGVjdGVkU3RyYXRlZ3kiLCJ3aW5uZXIiLCJtYXAiLCJmaWx0ZXIiLCJjb21waWxlU3luYyIsInNvdXJjZUNvZGUiLCJmaWxlUGF0aCIsImNvbXBpbGVyQ29udGV4dCIsIm9wdHMiLCJPYmplY3QiLCJhc3NpZ24iLCJjb21waWxlck9wdGlvbnMiLCJmaWxlbmFtZSIsImFzdCIsImJhYmVscmMiLCJ1c2VDb3ZlcmFnZSIsImNvdmVyYWdlIiwicGx1Z2lucyIsInByZXNldHMiLCJvdXRwdXQiLCJ0cmFuc2Zvcm0iLCJzb3VyY2VNYXBzIiwiSlNPTiIsInN0cmluZ2lmeSIsImNvZGUiLCJJbnN0cnVtZW50ZXIiLCJpbnN0cnVtZW50U3luYyIsIm1pbWVUeXBlIiwiZ2V0Q29tcGlsZXJWZXJzaW9uIiwidmVyc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUVBLE1BQU1BLFlBQVksQ0FBQyxVQUFELEVBQWEsd0JBQWIsQ0FBbEI7QUFDQSxJQUFJQyxRQUFRLElBQVo7QUFDQSxJQUFJQyxXQUFXLElBQWY7O0FBRWUsTUFBTUMsYUFBTiwwQ0FBK0M7QUFDNURDLGdCQUFjO0FB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aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1NpbXBsZUNvbXBpbGVyQmFzZX0gZnJvbSAnLi4vY29tcGlsZXItYmFzZSc7XG5cbmNvbnN0IG1pbWVUeXBlcyA9IFsndGV4dC9qc3gnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCddO1xubGV0IGJhYmVsID0gbnVsbDtcbmxldCBpc3RhbmJ1bCA9IG51bGw7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhYmVsQ29tcGlsZXIgZXh0ZW5kcyBTaW1wbGVDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgc3RhdGljIGdldElucHV0TWltZVR5cGVzKCkge1xuICAgIHJldHVybiBtaW1lVHlwZXM7XG4gIH1cblxuICAvLyBOQjogVGhpcyBtZXRob2QgZXhpc3RzIHRvIHN0b3AgQmFiZWwgZnJvbSB0cnlpbmcgdG8gbG9hZCBwbHVnaW5zIGZyb20gdGhlXG4gIC8vIGFwcCdzIG5vZGVfbW9kdWxlcyBkaXJlY3RvcnksIHdoaWNoIGluIGEgcHJvZHVjdGlvbiBhcHAgZG9lc24ndCBoYXZlIEJhYmVsXG4gIC8vIGluc3RhbGxlZCBpbiBpdC4gSW5zdGVhZCwgd2UgdHJ5IHRvIGxvYWQgZnJvbSBvdXIgZW50cnkgcG9pbnQncyBub2RlX21vZHVsZXNcbiAgLy8gZGlyZWN0b3J5IChpLmUuIEdydW50IHBlcmhhcHMpLCBhbmQgaWYgaXQgZG9lc24ndCB3b3JrLCBqdXN0IGtlZXAgZ29pbmcuXG4gIGF0dGVtcHRUb1ByZWxvYWQobmFtZXMsIHByZWZpeCkge1xuICAgIGlmICghbmFtZXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGZpeHVwTW9kdWxlID0gKGV4cCkgPT4ge1xuICAgICAgLy8gTkI6IFNvbWUgcGx1Z2lucyBsaWtlIHRyYW5zZm9ybS1kZWNvcmF0b3JzLWxlZ2FjeSwgdXNlIGltcG9ydC9leHBvcnRcbiAgICAgIC8vIHNlbWFudGljcywgYW5kIG90aGVycyBkb24ndFxuICAgICAgaWYgKCdkZWZhdWx0JyBpbiBleHApIHJldHVybiBleHBbJ2RlZmF1bHQnXTtcbiAgICAgIHJldHVybiBleHA7XG4gICAgfTtcblxuICAgIGNvbnN0IG5vZGVNb2R1bGVzQWJvdmVVcyA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicsICcuLicpO1xuXG4gICAgY29uc3QgcHJlbG9hZFN0cmF0ZWdpZXMgPSBbXG4gICAgICB4ID0+IGZpeHVwTW9kdWxlKHJlcXVpcmUubWFpbi5yZXF1aXJlKHgpKSxcbiAgICAgIHggPT4gZml4dXBNb2R1bGUocmVxdWlyZShwYXRoLmpvaW4obm9kZU1vZHVsZXNBYm92ZVVzLCB4KSkpLFxuICAgICAgeCA9PiBmaXh1cE1vZHVsZShyZXF1aXJlKHgpKVxuICAgIF07XG5cbiAgICBjb25zdCBwb3NzaWJsZU5hbWVzID0gKG5hbWUpID0+IHtcbiAgICAgIGxldCBuYW1lcyA9IFtgYmFiZWwtJHtwcmVmaXh9LSR7bmFtZX1gXTtcblxuICAgICAgaWYgKHByZWZpeCA9PT0gJ3BsdWdpbicpIHtcbiAgICAgICAgLy8gTG9vayBmb3IgbW9kdWxlIG5hbWVzIHRoYXQgZG8gbm90IHN0YXJ0IHdpdGggXCJiYWJlbC1wbHVnaW4tXCJcbiAgICAgICAgbmFtZXMucHVzaChuYW1lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5hbWVzO1xuICAgIH07XG5cbiAgICAvLyBBcHBseSBvbmUgcHJlbG9hZGluZyBzdHJhdGVneSB0byB0aGUgcG9zc2libGUgbmFtZXMgb2YgYSBtb2R1bGUsIGFuZCByZXR1cm4gdGhlIHByZWxvYWRlZFxuICAgIC8vIG1vZHVsZSBpZiBmb3VuZCwgbnVsbCBvdGhlcndpc2VcbiAgICBjb25zdCBwcmVsb2FkUG9zc2libGVOYW1lcyA9IChuYW1lLCBzdHJhdGVneSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBzdHJhdGVneSAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiBwb3NzaWJsZU5hbWVzKG5hbWUpLnJlZHVjZSgobW9kLCBwb3NzaWJsZU5hbWUpPT57XG4gICAgICAgIGlmIChtb2QgIT09IG51bGwpIHJldHVybiBtb2Q7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gc3RyYXRlZ3kocG9zc2libGVOYW1lKTtcbiAgICAgICAgfSBjYXRjaChlKSB7fSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWVtcHR5XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9LCBudWxsKTtcbiAgICB9O1xuXG4gICAgLy8gUGljayBhIGxvYWRpbmcgc3RyYXRlZ3kgdGhhdCBmaW5kcyB0aGUgZmlyc3QgcGx1Z2luLCB0aGUgc2FtZSBzdHJhdGVneSB3aWxsIGJlXG4gICAgLy8gdXNlZCB0byBwcmVsb2FkIGFsbCBwbHVnaW5zXG4gICAgY29uc3Qgc2VsZWN0ZWRTdHJhdGVneSA9IHByZWxvYWRTdHJhdGVnaWVzLnJlZHVjZSgod2lubmVyLCBzdHJhdGVneSk9PntcbiAgICAgIGlmICh3aW5uZXIgIT09IG51bGwpIHJldHVybiB3aW5uZXI7XG4gICAgICByZXR1cm4gcHJlbG9hZFBvc3NpYmxlTmFtZXMobmFtZXNbMF0sIHN0cmF0ZWd5KSA9PT0gbnVsbCA/IG51bGwgOiBzdHJhdGVneTtcbiAgICB9LCBudWxsKTtcblxuICAgIHJldHVybiBuYW1lcy5tYXAobmFtZSA9PiBwcmVsb2FkUG9zc2libGVOYW1lcyhuYW1lLCBzZWxlY3RlZFN0cmF0ZWd5KSkuZmlsdGVyKChtb2QpID0+IG1vZCAhPT0gbnVsbCk7XG4gIH1cblxuICBjb21waWxlU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBiYWJlbCA9IGJhYmVsIHx8IHJlcXVpcmUoJ2JhYmVsLWNvcmUnKTtcblxuICAgIGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb21waWxlck9wdGlvbnMsIHtcbiAgICAgIGZpbGVuYW1lOiBmaWxlUGF0aCxcbiAgICAgIGFzdDogZmFsc2UsXG4gICAgICBiYWJlbHJjOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgbGV0IHVzZUNvdmVyYWdlID0gZmFsc2U7XG4gICAgaWYgKCdjb3ZlcmFnZScgaW4gb3B0cykge1xuICAgICAgdXNlQ292ZXJhZ2UgPSAhIW9wdHMuY292ZXJhZ2U7XG4gICAgICBkZWxldGUgb3B0cy5jb3ZlcmFnZTtcbiAgICB9XG5cbiAgICBpZiAoJ3BsdWdpbnMnIGluIG9wdHMpIHtcbiAgICAgIGxldCBwbHVnaW5zID0gdGhpcy5hdHRlbXB0VG9QcmVsb2FkKG9wdHMucGx1Z2lucywgJ3BsdWdpbicpO1xuICAgICAgaWYgKHBsdWdpbnMgJiYgcGx1Z2lucy5sZW5ndGggPT09IG9wdHMucGx1Z2lucy5sZW5ndGgpIG9wdHMucGx1Z2lucyA9IHBsdWdpbnM7XG4gICAgfVxuXG4gICAgaWYgKCdwcmVzZXRzJyBpbiBvcHRzKSB7XG4gICAgICBsZXQgcHJlc2V0cyA9IHRoaXMuYXR0ZW1wdFRvUHJlbG9hZChvcHRzLnByZXNldHMsICdwcmVzZXQnKTtcbiAgICAgIGlmIChwcmVzZXRzICYmIHByZXNldHMubGVuZ3RoID09PSBvcHRzLnByZXNldHMubGVuZ3RoKSBvcHRzLnByZXNldHMgPSBwcmVzZXRzO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dCA9IGJhYmVsLnRyYW5zZm9ybShzb3VyY2VDb2RlLCBvcHRzKTtcbiAgICBsZXQgc291cmNlTWFwcyA9IG91dHB1dC5tYXAgPyBKU09OLnN0cmluZ2lmeShvdXRwdXQubWFwKSA6IG51bGw7XG5cbiAgICBsZXQgY29kZSA9IG91dHB1dC5jb2RlO1xuICAgIGlmICh1c2VDb3ZlcmFnZSkge1xuICAgICAgaXN0YW5idWwgPSBpc3RhbmJ1bCB8fCByZXF1aXJlKCdpc3RhbmJ1bCcpO1xuXG4gICAgICBzb3VyY2VNYXBzID0gbnVsbDtcbiAgICAgIGNvZGUgPSAobmV3IGlzdGFuYnVsLkluc3RydW1lbnRlcigpKS5pbnN0cnVtZW50U3luYyhvdXRwdXQuY29kZSwgZmlsZVBhdGgpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGNvZGUsIHNvdXJjZU1hcHMsIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcsIH07XG4gIH1cblxuICBnZXRDb21waWxlclZlcnNpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJ2JhYmVsLWNvcmUvcGFja2FnZS5qc29uJykudmVyc2lvbjtcbiAgfVxufVxuIl19