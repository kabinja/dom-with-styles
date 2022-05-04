import * as singleFile from "./single-file";
import * as domObserver from "./domObserver";

async function getContent() {
    const pageData = await singleFile.getPageData();
    return pageData.content;
}

function trackMutation() {
    return domObserver.trackMutation();
}

export {getContent, trackMutation};