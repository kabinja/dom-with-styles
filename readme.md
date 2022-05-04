# Get the current DOM with the styles

# Objective

The goal of this function is to provide a simple way to extract the DOM of a webpage that can be contained in a single string. We rely on the engine of [SingleFile](https://github.com/gildas-lormeau/SingleFile) to capture the page.

## How to use it?

getCurrentDomWithStyles does not take any arguments and returns a Promise that when resolved contains a string containing the entire dom with all the style elements.

Example of usage:

```javascript

    document.addEventListener('readystatechange', event => {
        domWithStyles.getContent().then(function (dom) {
            console.log(dom);
        });
    });

```

In this example the script is waiting for the page to be loaded, and then displays the computed current dom with styles in the console.

## How to build it

1. Move to the root of the project
2. Run `npm build`.
3. A browsified version is created at `<ROOT>/dist/domWithStyles.bundle.js`