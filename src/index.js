import * as singleFile from "./single-file";

async function getContent() {
    const pageData = await singleFile.getPageData();
    return pageData.content;
}

export {getContent};