## electron-compilers

electron-compilers are the actual implementations of classes that power
[electron-compile](https://github.com/electronjs/electron-compile)

For JavaScript:

* JavaScript ES6/ES7 (via Babel)
* TypeScript
* CoffeeScript

For CSS:

* LESS

For HTML:

* Jade

### Why is this a separate repo?!

Shipping compilers for all of these languages will add a ton of weight to your
download size. Making this a separate top-level module allows you to mark it
as a `devDependency` and not include it in the final app.
