"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * This class is the base interface for compilers that are used by
 * electron-compile. If your compiler library only supports a
 * synchronous API, use SimpleCompilerBase instead.
 *
 * @interface
 */
class CompilerBase {
  constructor() {
    this.compilerOptions = {};
  }

  /**
   * This method describes the MIME types that your compiler supports as input.
   * Many precompiled file types don't have a specific MIME type, so if it's not
   * recognized by the mime-types package, you need to patch rig-mime-types in
   * electron-compile.
   *
   * @return {string[]}  An array of MIME types that this compiler can compile.
   *
   * @abstract
   */
  static getInputMimeTypes() {
    throw new Error("Implement me!");
  }

  /**
   * Determines whether a file should be compiled
   *
   * @param  {string} fileName        The full path of a file to compile.
   * @param  {object} compilerContext An object that compilers can add extra
                                    information to as part of a job - the caller
                                    won't do anything with this.
   * @return {Promise<bool>}        True if you are able to compile this file.
   *
   * @abstract
   */
  shouldCompileFile(fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      throw new Error("Implement me!");
    })();
  }

  /**
   * Returns the dependent files of this file. This is used for languages such
   * as LESS which allow you to import / reference other related files. In future
   * versions of electron-compile, we will use this information to invalidate
   * all of the parent files if a child file changes.
   *
   * @param  {string} sourceCode    The contents of filePath
   * @param  {string} fileName        The full path of a file to compile.
   * @param  {object} compilerContext An object that compilers can add extra
                                    information to as part of a job - the caller
                                    won't do anything with this.
   * @return {Promise<string[]>}    An array of dependent file paths, or an empty
   *                                array if there are no dependent files.
   *
   * @abstract
   */
  determineDependentFiles(sourceCode, fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      throw new Error("Implement me!");
    })();
  }

  /**
   * Compiles the file
   *
   * @param  {string} sourceCode    The contents of filePath
   * @param  {string} fileName      The full path of a file to compile.
   * @param  {object} compilerContext An object that compilers can add extra
                                    information to as part of a job - the caller
                                    won't do anything with this.
   * @return {Promise<object>}      An object representing the compiled result
   * @property {string} code        The compiled code
   * @property {string} mimeType    The MIME type of the compiled result, which
   *                                should exist in the mime-types database.
   *
   * @abstract
   */
  compile(sourceCode, fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      // eslint-disable-line no-unused-vars
      throw new Error("Implement me!");
    })();
  }

  shouldCompileFileSync(fileName, compilerContext) {
    // eslint-disable-line no-unused-vars
    throw new Error("Implement me!");
  }

  determineDependentFilesSync(sourceCode, fileName, compilerContext) {
    // eslint-disable-line no-unused-vars
    throw new Error("Implement me!");
  }

  compileSync(sourceCode, fileName, compilerContext) {
    // eslint-disable-line no-unused-vars
    throw new Error("Implement me!");
  }

  /**
   * Returns a version number representing the version of the underlying
   * compiler library. When this number changes, electron-compile knows
   * to throw all away its generated code.
   *
   * @return {string}  A version number. Note that this string isn't
   *                   parsed in any way, just compared to the previous
   *                   one for equality.
   *
   * @abstract
   */
  getCompilerVersion() {
    throw new Error("Implement me!");
  }
}

exports.CompilerBase = CompilerBase; /**
                                      * This class implements all of the async methods of CompilerBase by just
                                      * calling the sync version. Use it to save some time when implementing
                                      * simple compilers.
                                      *
                                      * To use it, implement the compile method, the getCompilerVersion method,
                                      * and the getInputMimeTypes static method.
                                      *
                                      * @abstract
                                      */

class SimpleCompilerBase extends CompilerBase {
  constructor() {
    super();
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
      return _this.compileSync(sourceCode, filePath, compilerContext);
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
}
exports.SimpleCompilerBase = SimpleCompilerBase;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21waWxlci1iYXNlLmpzIl0sIm5hbWVzIjpbIkNvbXBpbGVyQmFzZSIsImNvbnN0cnVjdG9yIiwiY29tcGlsZXJPcHRpb25zIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJFcnJvciIsInNob3VsZENvbXBpbGVGaWxlIiwiZmlsZU5hbWUiLCJjb21waWxlckNvbnRleHQiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyIsInNvdXJjZUNvZGUiLCJjb21waWxlIiwic2hvdWxkQ29tcGlsZUZpbGVTeW5jIiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jIiwiY29tcGlsZVN5bmMiLCJnZXRDb21waWxlclZlcnNpb24iLCJTaW1wbGVDb21waWxlckJhc2UiLCJmaWxlUGF0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7OztBQU9PLE1BQU1BLFlBQU4sQ0FBbUI7QUFDeEJDLGdCQUFjO0FBQ1osU0FBS0MsZUFBTCxHQUF1QixFQUF2QjtBQUNEOztBQUVEOzs7Ozs7Ozs7O0FBVUEsU0FBT0MsaUJBQVAsR0FBMkI7QUFDekIsVUFBTSxJQUFJQyxLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0Q7O0FBR0Q7Ozs7Ozs7Ozs7O0FBV01DLG1CQUFOLENBQXdCQyxRQUF4QixFQUFrQ0MsZUFBbEMsRUFBbUQ7QUFBQTtBQUFFO0FBQ25ELFlBQU0sSUFBSUgsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQURpRDtBQUVsRDs7QUFHRDs7Ozs7Ozs7Ozs7Ozs7OztBQWdCTUkseUJBQU4sQ0FBOEJDLFVBQTlCLEVBQTBDSCxRQUExQyxFQUFvREMsZUFBcEQsRUFBcUU7QUFBQTtBQUFFO0FBQ3JFLFlBQU0sSUFBSUgsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQURtRTtBQUVwRTs7QUFHRDs7Ozs7Ozs7Ozs7Ozs7O0FBZU1NLFNBQU4sQ0FBY0QsVUFBZCxFQUEwQkgsUUFBMUIsRUFBb0NDLGVBQXBDLEVBQXFEO0FBQUE7QUFBRTtBQUNyRCxZQUFNLElBQUlILEtBQUosQ0FBVSxlQUFWLENBQU47QUFEbUQ7QUFFcEQ7O0FBRURPLHdCQUFzQkwsUUFBdEIsRUFBZ0NDLGVBQWhDLEVBQWlEO0FBQUU7QUFDakQsVUFBTSxJQUFJSCxLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0Q7O0FBRURRLDhCQUE0QkgsVUFBNUIsRUFBd0NILFFBQXhDLEVBQWtEQyxlQUFsRCxFQUFtRTtBQUFFO0FBQ25FLFVBQU0sSUFBSUgsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQUNEOztBQUVEUyxjQUFZSixVQUFaLEVBQXdCSCxRQUF4QixFQUFrQ0MsZUFBbEMsRUFBbUQ7QUFBRTtBQUNuRCxVQUFNLElBQUlILEtBQUosQ0FBVSxlQUFWLENBQU47QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7QUFXQVUsdUJBQXFCO0FBQ25CLFVBQU0sSUFBSVYsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQUNEO0FBckd1Qjs7UUFBYkosWSxHQUFBQSxZLEVBeUdiOzs7Ozs7Ozs7OztBQVVPLE1BQU1lLGtCQUFOLFNBQWlDZixZQUFqQyxDQUE4QztBQUNuREMsZ0JBQWM7QUFDWjtBQUNEOztBQUVLSSxtQkFBTixDQUF3QkMsUUFBeEIsRUFBa0NDLGVBQWxDLEVBQW1EO0FBQUE7QUFBRTtBQUNuRCxhQUFPLElBQVA7QUFEaUQ7QUFFbEQ7O0FBRUtDLHlCQUFOLENBQThCQyxVQUE5QixFQUEwQ08sUUFBMUMsRUFBb0RULGVBQXBELEVBQXFFO0FBQUE7QUFBRTtBQUNyRSxhQUFPLEVBQVA7QUFEbUU7QUFFcEU7O0FBRUtHLFNBQU4sQ0FBY0QsVUFBZCxFQUEwQk8sUUFBMUIsRUFBb0NULGVBQXBDLEVBQXFEO0FBQUE7O0FBQUE7QUFDbkQsYUFBTyxNQUFLTSxXQUFMLENBQWlCSixVQUFqQixFQUE2Qk8sUUFBN0IsRUFBdUNULGVBQXZDLENBQVA7QUFEbUQ7QUFFcEQ7O0FBRURJLHdCQUFzQkwsUUFBdEIsRUFBZ0NDLGVBQWhDLEVBQWlEO0FBQUU7QUFDakQsV0FBTyxJQUFQO0FBQ0Q7O0FBRURLLDhCQUE0QkgsVUFBNUIsRUFBd0NPLFFBQXhDLEVBQWtEVCxlQUFsRCxFQUFtRTtBQUFFO0FBQ25FLFdBQU8sRUFBUDtBQUNEO0FBdkJrRDtRQUF4Q1Esa0IsR0FBQUEsa0IiLCJmaWxlIjoiY29tcGlsZXItYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBjbGFzcyBpcyB0aGUgYmFzZSBpbnRlcmZhY2UgZm9yIGNvbXBpbGVycyB0aGF0IGFyZSB1c2VkIGJ5XG4gKiBlbGVjdHJvbi1jb21waWxlLiBJZiB5b3VyIGNvbXBpbGVyIGxpYnJhcnkgb25seSBzdXBwb3J0cyBhXG4gKiBzeW5jaHJvbm91cyBBUEksIHVzZSBTaW1wbGVDb21waWxlckJhc2UgaW5zdGVhZC5cbiAqXG4gKiBAaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbXBpbGVyT3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGRlc2NyaWJlcyB0aGUgTUlNRSB0eXBlcyB0aGF0IHlvdXIgY29tcGlsZXIgc3VwcG9ydHMgYXMgaW5wdXQuXG4gICAqIE1hbnkgcHJlY29tcGlsZWQgZmlsZSB0eXBlcyBkb24ndCBoYXZlIGEgc3BlY2lmaWMgTUlNRSB0eXBlLCBzbyBpZiBpdCdzIG5vdFxuICAgKiByZWNvZ25pemVkIGJ5IHRoZSBtaW1lLXR5cGVzIHBhY2thZ2UsIHlvdSBuZWVkIHRvIHBhdGNoIHJpZy1taW1lLXR5cGVzIGluXG4gICAqIGVsZWN0cm9uLWNvbXBpbGUuXG4gICAqXG4gICAqIEByZXR1cm4ge3N0cmluZ1tdfSAgQW4gYXJyYXkgb2YgTUlNRSB0eXBlcyB0aGF0IHRoaXMgY29tcGlsZXIgY2FuIGNvbXBpbGUuXG4gICAqXG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgc3RhdGljIGdldElucHV0TWltZVR5cGVzKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkltcGxlbWVudCBtZSFcIik7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBmaWxlIHNob3VsZCBiZSBjb21waWxlZFxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGZpbGVOYW1lICAgICAgICBUaGUgZnVsbCBwYXRoIG9mIGEgZmlsZSB0byBjb21waWxlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBpbGVyQ29udGV4dCBBbiBvYmplY3QgdGhhdCBjb21waWxlcnMgY2FuIGFkZCBleHRyYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3JtYXRpb24gdG8gYXMgcGFydCBvZiBhIGpvYiAtIHRoZSBjYWxsZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvbid0IGRvIGFueXRoaW5nIHdpdGggdGhpcy5cbiAgICogQHJldHVybiB7UHJvbWlzZTxib29sPn0gICAgICAgIFRydWUgaWYgeW91IGFyZSBhYmxlIHRvIGNvbXBpbGUgdGhpcyBmaWxlLlxuICAgKlxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGFzeW5jIHNob3VsZENvbXBpbGVGaWxlKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHRocm93IG5ldyBFcnJvcihcIkltcGxlbWVudCBtZSFcIik7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkZXBlbmRlbnQgZmlsZXMgb2YgdGhpcyBmaWxlLiBUaGlzIGlzIHVzZWQgZm9yIGxhbmd1YWdlcyBzdWNoXG4gICAqIGFzIExFU1Mgd2hpY2ggYWxsb3cgeW91IHRvIGltcG9ydCAvIHJlZmVyZW5jZSBvdGhlciByZWxhdGVkIGZpbGVzLiBJbiBmdXR1cmVcbiAgICogdmVyc2lvbnMgb2YgZWxlY3Ryb24tY29tcGlsZSwgd2Ugd2lsbCB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBpbnZhbGlkYXRlXG4gICAqIGFsbCBvZiB0aGUgcGFyZW50IGZpbGVzIGlmIGEgY2hpbGQgZmlsZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHNvdXJjZUNvZGUgICAgVGhlIGNvbnRlbnRzIG9mIGZpbGVQYXRoXG4gICAqIEBwYXJhbSAge3N0cmluZ30gZmlsZU5hbWUgICAgICAgIFRoZSBmdWxsIHBhdGggb2YgYSBmaWxlIHRvIGNvbXBpbGUuXG4gICAqIEBwYXJhbSAge29iamVjdH0gY29tcGlsZXJDb250ZXh0IEFuIG9iamVjdCB0aGF0IGNvbXBpbGVycyBjYW4gYWRkIGV4dHJhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvcm1hdGlvbiB0byBhcyBwYXJ0IG9mIGEgam9iIC0gdGhlIGNhbGxlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29uJ3QgZG8gYW55dGhpbmcgd2l0aCB0aGlzLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPHN0cmluZ1tdPn0gICAgQW4gYXJyYXkgb2YgZGVwZW5kZW50IGZpbGUgcGF0aHMsIG9yIGFuIGVtcHR5XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheSBpZiB0aGVyZSBhcmUgbm8gZGVwZW5kZW50IGZpbGVzLlxuICAgKlxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHRocm93IG5ldyBFcnJvcihcIkltcGxlbWVudCBtZSFcIik7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb21waWxlcyB0aGUgZmlsZVxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHNvdXJjZUNvZGUgICAgVGhlIGNvbnRlbnRzIG9mIGZpbGVQYXRoXG4gICAqIEBwYXJhbSAge3N0cmluZ30gZmlsZU5hbWUgICAgICBUaGUgZnVsbCBwYXRoIG9mIGEgZmlsZSB0byBjb21waWxlLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBpbGVyQ29udGV4dCBBbiBvYmplY3QgdGhhdCBjb21waWxlcnMgY2FuIGFkZCBleHRyYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3JtYXRpb24gdG8gYXMgcGFydCBvZiBhIGpvYiAtIHRoZSBjYWxsZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvbid0IGRvIGFueXRoaW5nIHdpdGggdGhpcy5cbiAgICogQHJldHVybiB7UHJvbWlzZTxvYmplY3Q+fSAgICAgIEFuIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGNvbXBpbGVkIHJlc3VsdFxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gY29kZSAgICAgICAgVGhlIGNvbXBpbGVkIGNvZGVcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IG1pbWVUeXBlICAgIFRoZSBNSU1FIHR5cGUgb2YgdGhlIGNvbXBpbGVkIHJlc3VsdCwgd2hpY2hcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCBleGlzdCBpbiB0aGUgbWltZS10eXBlcyBkYXRhYmFzZS5cbiAgICpcbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBhc3luYyBjb21waWxlKHNvdXJjZUNvZGUsIGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHRocm93IG5ldyBFcnJvcihcIkltcGxlbWVudCBtZSFcIik7XG4gIH1cblxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW1wbGVtZW50IG1lIVwiKTtcbiAgfVxuXG4gIGRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyhzb3VyY2VDb2RlLCBmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbXBsZW1lbnQgbWUhXCIpO1xuICB9XG5cbiAgY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW1wbGVtZW50IG1lIVwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmVyc2lvbiBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSB2ZXJzaW9uIG9mIHRoZSB1bmRlcmx5aW5nXG4gICAqIGNvbXBpbGVyIGxpYnJhcnkuIFdoZW4gdGhpcyBudW1iZXIgY2hhbmdlcywgZWxlY3Ryb24tY29tcGlsZSBrbm93c1xuICAgKiB0byB0aHJvdyBhbGwgYXdheSBpdHMgZ2VuZXJhdGVkIGNvZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge3N0cmluZ30gIEEgdmVyc2lvbiBudW1iZXIuIE5vdGUgdGhhdCB0aGlzIHN0cmluZyBpc24ndFxuICAgKiAgICAgICAgICAgICAgICAgICBwYXJzZWQgaW4gYW55IHdheSwganVzdCBjb21wYXJlZCB0byB0aGUgcHJldmlvdXNcbiAgICogICAgICAgICAgICAgICAgICAgb25lIGZvciBlcXVhbGl0eS5cbiAgICpcbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBnZXRDb21waWxlclZlcnNpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW1wbGVtZW50IG1lIVwiKTtcbiAgfVxufVxuXG5cbi8qKlxuICogVGhpcyBjbGFzcyBpbXBsZW1lbnRzIGFsbCBvZiB0aGUgYXN5bmMgbWV0aG9kcyBvZiBDb21waWxlckJhc2UgYnkganVzdFxuICogY2FsbGluZyB0aGUgc3luYyB2ZXJzaW9uLiBVc2UgaXQgdG8gc2F2ZSBzb21lIHRpbWUgd2hlbiBpbXBsZW1lbnRpbmdcbiAqIHNpbXBsZSBjb21waWxlcnMuXG4gKlxuICogVG8gdXNlIGl0LCBpbXBsZW1lbnQgdGhlIGNvbXBpbGUgbWV0aG9kLCB0aGUgZ2V0Q29tcGlsZXJWZXJzaW9uIG1ldGhvZCxcbiAqIGFuZCB0aGUgZ2V0SW5wdXRNaW1lVHlwZXMgc3RhdGljIG1ldGhvZC5cbiAqXG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIFNpbXBsZUNvbXBpbGVyQmFzZSBleHRlbmRzIENvbXBpbGVyQmFzZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhc3luYyBzaG91bGRDb21waWxlRmlsZShmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGFzeW5jIGNvbXBpbGUoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIHJldHVybiB0aGlzLmNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpO1xuICB9XG5cbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuIl19