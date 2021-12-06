const request = require('request');
const util = require('util');
const prompt = require('prompt-sync')();
const cheerio = require('cheerio');
// @ts-ignore
var pdf = require('html-pdf');
// @ts-ignore
var markdown = require("markdown").markdown;

const requestPromise = util.promisify(request);

const data = async () => {
    const username = prompt("Enter username - ");
    const githubUrl = "https://github.com/" + username;
    const htmlData = await requestPromise(githubUrl);
    // console.log(htmlData.body);
    return htmlData.body;
};

data().then(data => {
    let $ = cheerio.load(data);

    let repositoriesName = $(".d-flex.width-full.flex-items-center.position-relative");
    console.log(repositoriesName.length)
    if (repositoriesName.length == 0) {
        repositoriesName = $(".mr-2.text-bold")
        for (let i = 0; i < repositoriesName.length; i++) {
            let repoLink = "https://github.com" + $(repositoriesName[i]).attr("href");
            console.log(repoLink);
            request(repoLink, MarkdownExists);
        }
    }
    else {
        for (let i = 0; i < repositoriesName.length; i++) {
            let repoLink = "https://github.com" + $(repositoriesName[i]).find("a").attr("href");
            console.log(repoLink);
            request(repoLink, MarkdownExists);
        }
    }

});

function MarkDownToPDF(body, name) {
    const html = markdown.toHTML(body);
    pdf.create(html).toFile(name + ".pdf", function (err, res) {
        if (err) return console.log(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
    });
}

//request("https://raw.githubusercontent.com/himanshusanecha/test-repoc/master/README.md", MarkDownToPDF);

function MarkdownExists(error, response, body) {
    let $ = cheerio.load(body);
    let readMe = $(".js-navigation-open.Link--primary");
    let href = "";
    let readMeExists = false;
    for (let i = 0; i < readMe.length; i++) {
        let fileName = $(readMe[i]).attr("title");
        if (fileName == "README.md") {
            href = "https://github.com" + $(readMe[i]).attr("href");
            //console.log(href);
            readMeExists = true;
            break;
        }
    }
    if (readMeExists) {
        request(href, goToMarkDown)
    }
    else {
        console.log("ReadMe does not exists");
    }

}

async function goToMarkDown(error, response, body) {
    let $ = cheerio.load(body);
    let urlItem = $("#raw-url");
    url = "https://raw.githubusercontent.com" + $(urlItem[0]).attr("href").replace("/raw", '');
    let name = $(urlItem[0]).attr("href");
    name = name.split("/");
    console.log(name);
    const markDown = await requestPromise(url);
    MarkDownToPDF(markDown.body, name[2]);
}
