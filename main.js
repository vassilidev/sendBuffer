const Apify = require('apify');
const fs = require("fs");

async function waitFile(filename) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(filename)) {
            await delay(3000);
            await waitFile(filename);
            resolve();
        } else {
            resolve();
        }
    })
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

Apify.main(async () => {
    const input = await Apify.getInput();

    const browser = await Apify.launchPuppeteer({launchOptions: {headless: true, ignoreHTTPSErrors: true}});
    const page = await browser.newPage();

    if (fs.existsSync(input.fileName)) {
        fs.unlinkSync(input.fileName);
    }

    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './'
    });
    await page.goto(input.url, {waitUntil: "domcontentloaded"}).catch((e) => (""));

    await waitFile(input.fileName);

    let fileData = fs.readFileSync(input.fileName);
    fileData = new Buffer(fileData);

    await Apify.setValue('OUTPUT', fileData);
    console.dir(fileData);

    fs.unlinkSync(input.fileName);

    await browser.close();
});
