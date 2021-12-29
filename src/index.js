/**
 * Get the entire dom with all the computed style as a self contained string.
 *
 * CSS stylesheet are copied in the document, and computed style are inlined in the dom.
 *
 * @param {boolean} optimizeImport  Specifies whether or not to try to optimize import to reduce the size of the output.
 * @returns {Promise<string>}       Root element of the new clone containing all the styles.
 */
async function domWithStyles(optimizeImport) {
    const noStyleTags = new Set(['BASE', 'HEAD', 'HTML', 'META', 'NOFRAME', 'NOSCRIPT', 'PARAM', 'SCRIPT', 'STYLE', 'TITLE', 'LINK']);
    const ignoreTags = new Set(['SCRIPT', 'NOSCRIPT', 'STYLE', 'LINK']);
    let defaultStylesCache = new Map();

    async function initializeStyleSheets(){
        const sheets = [];

        for (let i = 0; i < document.styleSheets.length; i++) {
            const styleSheet = document.styleSheets[i];
            let rules = [];

            try{
                rules = styleSheet.cssRules;
            }
            catch {
                rules = await loadCss(styleSheet.href);
            }

            sheets.push(rules);
        }

        return Promise.resolve(sheets);
    }

    /**
     * Returns a new style element by downloading the css file using url defined in the provided Element.
     *
     *
     * @param {string} href                  URL to the CSS resources
     *
     * @returns {Promise<CSSRuleList>}       Style element created by downloading a css style sheet and reject if the download fails.
     */
    async function loadCss(href) {
        let css;
        try {
            const response = await fetch(href);
            css = response.text();
        }
        catch (e) {
            css = await loadCssWithCorsAnywhere(href);
        }

        const doc = document.implementation.createHTMLDocument("");
        const styleElement = document.createElement('style');
        styleElement.textContent = css;

        const style = doc.body.appendChild(styleElement);

        return Promise.resolve(style.sheet.cssRules);
    }

    /**
     * Returns a new style element by downloading the css file using url defined in the provided Element using the proxy cors-anywhere.
     *
     *
     * @param {string} href            Element with tag name link and attribute rel set to stylesheet.
     *
     * @returns {Promise<string>}      Content of style element created by downloading a css style sheet and reject if the download fails.
     */
    async function loadCssWithCorsAnywhere(href){
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const response = await fetch(proxyUrl + href);
        return response.text();
    }

    /**
     * Check if an Element node has a style defined to it.
     *
     * @param {Element} node    Element for which to test if there is a style.
     *
     * @returns {boolean}       True if the element 'node' has a style no otherwise.
     */
    function hasStyle(node) {
        return window.getComputedStyle(node, null) !== undefined;
    }


    /**
     * Gets the name for a css property of an element at a specified index.
     *
     * @param {Element} node    Element to which the property belongs to.
     * @param {int} index       Position of the property in the list of css properties of the Element node.
     *
     * @returns {string}        Name of the css property at position 'index' for element 'node'.
     */
    function getPropertyName(node, index) {
        return window.getComputedStyle(node, null).item(index);
    }


    /**
     * Gets the value for a css property of an element using its index.
     *
     * @param {Element} node    Element to which the property belongs to.
     * @param {string}  name    Name of the property.
     *
     * @returns {string}        Value of the css property with name 'name' for element 'node'.
     */
    function getPropertyValue(node, name) {
        return window.getComputedStyle(node, null).getPropertyValue(name);
    }


    /**
     * Gets the number of css property for an element.
     *
     * @param {Element} node    Element to which the properties belongs to.
     *
     * @returns {int}           Number of css properties defined for element 'node'.
     */
    function numberProperties(node) {
        return window.getComputedStyle(node, null).length;
    }


    /**
     * Checks if a value is equal to the default style, computed by 'getDefaultStyle'.
     *
     * @param {string}                cssPropName     Name of the property to be checked against.
     * @param {string}                propertyValue   Value of the property that is being checked for equality with default property.
     * @param {CSSStyleDeclaration}   defaultStyle    Default style declaration. See 'getDefaultStyle'.
     *
     * @returns {boolean}                             True if the value is equal to the default style, false otherwise.
     */
    function isDefaultStyle(cssPropName, propertyValue, defaultStyle) {
        if(!defaultStyle){
            return false;
        }

        return propertyValue === defaultStyle.getPropertyValue(cssPropName);
    }

    /**
     * Check if property has an inline style for an element.
     *
     * The inline style is computed by checking if the string of the property is present in the the inlined style of the
     * element being investigated.
     *
     * @param {Element} node             Element for which the default style needs to be computed.
     * @param {String} cssPropName       Name of the property to check
     *
     * @return {boolean}                 True if the property is in the inlined style, false otherwise.
     */
    function isInlineStyle(node, cssPropName){
        const inlineStyle = node.getAttribute("style");

        if(!inlineStyle){
            return false;
        }

        return inlineStyle.indexOf(cssPropName) !== -1;
    }

    /**
     * Get the default style for an element.
     *
     * The default style corresponds to the style of an empty element for a specific tag, id and classes.
     * Note that a cache is created and all the already computed default styles for a particular type of node are stored in 'defaultStylesCache'.
     *
     * @param {Element} node            Element for which the default style needs to be computed.
     *
     * @returns {CSSStyleDeclaration}   Default style of element 'node'.
     */
    function getDefaultStyle(node) {
        const key = JSON.stringify({
            tag: node.tagName,
            id: node.getAttribute('id'),
            classes: node.getAttribute('class') ? [node.getAttribute('class').split(' ')].sort() : []
        });

        if (!defaultStylesCache.has(key)) {
            defaultStylesCache.set(key, window.getComputedStyle(node, null));
        }

        return defaultStylesCache.get(key);
    }


    /**
     * Checks if an element has a specific tag name.
     *
     * @param {Node} node       Node to which the tag name is being tested.
     * @param {string} tagName  Name of the tag to test against.
     *
     * @returns {boolean}       True if the tag name of element 'node' matches 'tagname', false otherwise.
     */
    function hasTagName(node, tagName) {
        if (node.tagName === undefined) {
            return false;
        }

        return node.tagName.toLowerCase() === tagName.toLowerCase();
    }


    /**
     * Checks if an element has to be ignored during cloning.
     *
     * Elements are ignored if they are undefined, do not have a tagname or belong to the ignore list 'ignoreTags'.
     *
     * @param {Node} node       Node being tested.
     *
     * @returns {boolean}       True if element 'node' is ignored during cloning, false otherwise.
     */
    function isIgnored(node) {
        if (node === undefined) {
            return true;
        }

        if(isEmptyTextNode(node)){
            return true;
        }

        if (node.tagName === undefined) {
            return false;
        }

        return ignoreTags.has(node.tagName.toUpperCase());
    }

    /**
     * Checks if an element is an empty text node
     *
     * Elements are considered to be empty text node if they only contain blank characters, meaning white space and carriage characters
     *
     * @param {Node} node       Node being tested.
     *
     * @returns {boolean}       True if element 'node' is of type TEXT_NODE and only contain blank characters, false otherwise.
     */
    function isEmptyTextNode(node){
        if(node.nodeType !== Node.TEXT_NODE){
            return false;
        }

        if((node.previousElementSibling && hasTagName(node.previousElementSibling, 'span')) || (node.nextElementSibling && hasTagName(node.nextElementSibling, 'span'))) {
            return false;
        }

        const length = node.nodeValue.length;
        let index = 0;

        while(index < length) {
            if(!isBlankCharacter(node.nodeValue.charCodeAt(index++))){
                return false;
            }
        }

        return true;
    }

    /**
     * Checks if a character is a blank character
     *
     * A charactere is considered blank if it is either a white space or carriage characters
     *
     * @param {int} charCode    UTF-8 code of the character
     *
     * @returns {boolean}       True if 'charCode' is a blank space, False otherwise.
     */
    function isBlankCharacter(charCode) {
        return 9 === charCode || 32 === charCode || 0xB === charCode || 0xC === charCode || 10 === charCode || 13 === charCode;
    }

    /**
     * Checks if an element has style properties.
     *
     * Elements are considered to have style properties if they have a tag name, and are NOT in the no style list 'noStyleTags'.
     *
     * @param {Element} node    Element being tested.
     *
     * @returns {boolean}       True if element 'node' has style properties, false otherwise.
     */
    function isComputeStyle(node) {
        if (node.tagName === undefined) {
            return false;
        }

        return node instanceof Element && !noStyleTags.has(node.tagName.toUpperCase());
    }


    /**
     * Returns a new empty image
     *
     * Elements with tag name img keep the size, class, id and alt properties but lose all the others.
     *
     * @param {Element} element            Element with tag name img.
     *
     * @returns {Element}       Empty image keeping information about its size.
     */
    function computeImageElement(element) {
        const img = document.createElement('img');

        if (element.alt) {
            img.alt = element.alt;
        }

        if (element.id) {
            img.id = element.id;
        }

        img.width = element.width;
        img.height = element.height;
        img.class = element.class;

        return img;
    }

    /**
     * Update the style of the cloned element by using the one of the element being cloned.
     *
     *
     * @param {Element} clone       Target cloned element.
     * @param {Element} node        Source element to be cloned.
     *
     * @returns {void}
     */
    function updateStyle(clone, node) {
        let defaultStyle = getDefaultStyle(node);
        const cssLength = numberProperties(node);

        if (!hasStyle(node)) {
            return;
        }

        for (let i = 0, l = cssLength; i < l; ++i) {
            const cssPropName = getPropertyName(node, i);
            const cssPropValue = getPropertyValue(node, cssPropName);

            if(!cssPropValue){
                continue;
            }

            if (!isDefaultStyle(cssPropName, cssPropValue, defaultStyle) || isInlineStyle(node, cssPropName)) {
                if(clone.style === undefined){
                    clone.style = {}
                }

                clone.style[cssPropName] = cssPropValue;
            }
        }
    }


    /**
     * Recursively copy all the nodes of an element while inserting all the styles so they are contained in one string.
     *
     * @param {Node} node        Source element to be cloned
     *
     * @returns {Node}           Root element of the new clone containing all the styles.
     */
    function deepCloneWithStyles(node) {
        if (isIgnored(node)) {
            return null;
        }

        if (hasTagName(node, 'img')) {
            return computeImageElement(node);
        }

        const clone = node.cloneNode(false);

        if (isComputeStyle(node)) {
            updateStyle(clone, node);
        }

        for (let child of node.childNodes) {
            const cloneChild = deepCloneWithStyles(child);

            if(cloneChild){
                clone.appendChild(cloneChild);
            }

        }

        return clone;
    }


    /**
     * Filters the style sheets passed as parameter to return only the rules used by the current document
     *
     * @param {boolean} isOptimizeCss       If set to true, the algorithm tries to remove all the unused CSS styles.
     * @param {StyleSheetList} styleSheets  Style sheets to filter
     * @returns {Array<Array<CSSRule>>}     Array representing the style sheets containing only the CSSRules used by the current document
     */
    function getUsedStyles(isOptimizeCss, styleSheets) {
        const used = [];

        for (let i = 0; i < styleSheets.length; ++i) {
            const rules = styleSheets[i];
            const cleanRules = [];

            for (let r = 0; r < rules.length; ++r) {
                if (!isOptimizeCss || document.querySelectorAll(rules[r].selectorText).length > 0) {
                    cleanRules.push(rules[r].cssText);
                }
            }

            used.push(cleanRules);
        }

        return used;
    }


    /**
     * Computes style sheets and dom tree of the current document.
     *
     * @returns {Promise<(Element|[])[]>}  An array containing the promise of the dom tree and a promise of the style sheets
     */
    async function createDomElements(){
        const styleSheets = initializeStyleSheets();
        const clone = deepCloneWithStyles(document.documentElement);

        return Promise.all([Promise.resolve(clone), styleSheets]);
    }


    /**
     * Generate a document from a dom tree and its style sheets
     *
     * @param {boolean} isOptimizeCss          If set to true, the algorithm tries to remove all the unused CSS styles.
     * @param {Node} node                      Root of the tree that will compose the document
     * @param {StyleSheetList} styleSheets     List of style sheets order by priority (first being the lowest)
     * @returns {Document}                     HTML Document composed of the style sheets and the tree
     */
    function finalize(isOptimizeCss, node, styleSheets){
        const doc = document.implementation.createDocument("", "", document.doctype);
        doc.appendChild(node);

        if(document.head === undefined){
            const html = document.getElementsByTagName('html')[0];
            html.appendChild(document.createElement('head'));
        }

        for(let rules of getUsedStyles(isOptimizeCss, styleSheets)){
            if(rules.length === 0){
                continue;
            }

            const usedStyle = document.createElement('style');
            usedStyle.textContent = rules.join(' ');
            doc.head.appendChild(usedStyle);
        }

        return doc;
    }


    /**
     *
     * @param {string} error    Error string containing what went wrong during the dom creation.
     * @returns {Document}      HTML Document containing the error message.
     */
    function createErrorDocument(error){
        const doc = document.implementation.createDocument("", "", document.doctype);

        const htmlNode = document.createElement('html');
        const bodyNode = document.createElement('body');
        htmlNode.appendChild(bodyNode);
        bodyNode.innerHTML = error;
        doc.appendChild(htmlNode);

        return doc;
    }

    return (async () => {
        if(window.sessionStorage.getItem('allow_snapshot') === 'true'){
            const stored = window.sessionStorage.getItem('dom_snapshot');
            if(stored) return stored;
        }

        let doc;

        try{
            [rootNode, styleSheets] = await createDomElements();
            doc = finalize(optimizeImport, rootNode, styleSheets);
        }
        catch(e){
            doc = createErrorDocument(e);
        }

        const ns = new XMLSerializer();
        const dom = ns.serializeToString(doc);

        if(window.sessionStorage.getItem('allow_snapshot') === 'true') {
            window.sessionStorage.setItem('dom_snapshot', dom);
        }

        return dom;
    })();
};

export {domWithStyles as default};