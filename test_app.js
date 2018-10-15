const axios = require('axios');
const domParser = require('dom-parser');

var cache = {};
async function crawler(url, id, cb) {
    cache[url] = cache[url] ? cache[url] : await axios.get(url)
        .catch(function (e) {
            console.error("Err near the axios.get", e);
        });
    return cb(cache[url].data, id);
}

function getInnerHTML_example_using_dom_parser(x, id) {
    let r = null;
    try {
        let dp = new domParser({errorHandler: (e) => {
                clog(e);
            }});
        let xmldoc = dp.parseFromString(x, 'text/html');
        let el = xmldoc.getElementById(id);
        r = el.innerHTML;
    } catch (e) {
        console.error(e);
    }
    return JSON.stringify(r);
}

function getInnerHTML(x, id) {
    // Please write your code here
    // Please don't use any standard or nonstandard DOMParser
    let startTag = x.match(new RegExp('<[^>]+id="' + id + '"[^>]*>', 'g'))[0];
    let openTagName = startTag.match(/<.+?\s/)[0].replace(" ", "");
    let closeTagName = openTagName.replace("<", "</");
    let openTags = [], closeTags = [];

    function doCompareOpenCloseTags(){
        openTags.push(x.indexOf(openTagName, openTags[openTags.length - 1]+1));
        closeTags.push(x.indexOf(closeTagName, closeTags[closeTags.length - 1]+1));
        if(openTags[openTags.length - 1] < closeTags[closeTags.length - 1]) {
            doCompareOpenCloseTags();
        }
    }
    openTags.push(x.indexOf(startTag));
    closeTags.push(x.indexOf(startTag));
    doCompareOpenCloseTags();

    return JSON.stringify(x.substring(openTags[0]+startTag.length, closeTags[closeTags.length - 1]));
}

(async () => {
    let url = "https://www.amazon.com/dp/B01I5X5SQE"
    let id = 'SalesRank';
    let r1 = await crawler(url, id, getInnerHTML_example_using_dom_parser);
    let r2 = await crawler(url, id, getInnerHTML_example_using_dom_parser);
    console.log('Does the "getInnerHTML_example_using_dom_parser" function work correctly?', r1 === r2);
    let r3 = await crawler(url, id, getInnerHTML);
    console.log('Does the "getInnerHTML" function work correctly?', r3 === r2);
})()
