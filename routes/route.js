const db = require("../models")
var puppeteer = require("puppeteer")
// var axios = require("axios")
const cheerio = require('cheerio');


module.exports = (app) => {
    // main page
    app.get("/", (req, res) => {
        db.Article.find({isSaved: false}, (err, data) => {
            if (data.length !== 0) {
                res.render("index", {page: false, articles: data});
            } else {
                res.render("index", {page: true, articles: null})
            }
        })
    })

    // saved pages
    app.get("/saved", (req, res) => {
        db.Article.find({isSaved: true}, (err, data) => {
            if (data.length !== 0) {
                res.render("saved", {save: false, articles: data});
            } else {
                res.render("saved", {save: true, articles: null})
            }
        })
    })

    // move article to save
    app.get("/articles/update/:id", (req, res) => {
        db.Article.findOneAndUpdate({_id: req.params.id}, {isSaved: true}, (err, data) => {
            err ? console.log(err) : res.send("success")
        })
    })

    // move article to main
    app.get("/articles/delete/:id", (req, res) => {
        db.Article.findOneAndUpdate({_id: req.params.id}, {isSaved: false}, (err, data) => {
            err ? console.log(err) : res.send("success")
        })
    })

    // get notes
    app.get("/note/get/:id", (req, res) => {
        db.Article.findOne({ _id: req.params.id })
            .populate("note")
            .then((data) =>  res.json(data))
            .catch((err) => res.json(err))
    })

    // create note
    app.post("/note/new/:id", (req, res) => {
        db.Note.create(req.body)
            .then((dbNote) =>  db.Article.findOneAndUpdate({ _id: req.params.id }, {$set: { note: dbNote._id }}, { new: true }))
            .then((data) => res.json(data))
            .catch((err) => res.json(err))
    })

    // update note
    app.post("/note/update/:id", (req, res) => {
        db.Note.findOneAndUpdate({_id: req.params.id}, req.body , (err, data) => {
            err ? console.log(err) : res.json(data)
        })
    })

    // delete note
    app.get("/note/delete/:id", (req, res) => {
        db.Note.findByIdAndRemove({ _id: req.params.id })
            .then((data) => db.Article.findOneAndUpdate({ note: req.params.id }, { $set: {note: null}}))
            .then((data) => res.json(data))
            .catch((err) => res.json(err))
    })

    app.get("/api/scrape", (req, res) => {
        puppeteer.launch({
            headless: true, 
            ignoreDefaultArgs: ['--disable-extensions'], 
            executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            args: [
                '--auto-open-devtools-for-tabs',
                '--disable-dev-shm-usage'
        ]})
            .then(browser => browser.newPage())
            .then((page) => {
                page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36")
                return page.goto('https://www.cnet.com/news/').then(() => {
                    return page.waitForSelector(".fdListingContainer .fdListing .row .riverPost").then(() => {
                        return page.content()
                    })
                })
            })
            .then((html) => {
                const $ = cheerio.load(html)
                
                $(".fdListingContainer .fdListing .row .riverPost").each(function() {
                    let result = {}
                    let spanImage = $(this).children(".assetThumb").children("a").children("figure").children("noscript").text().trim()

                    if (spanImage.includes('<span><img src="')) {
                        spanImage = spanImage.replace('<span><img src="', '')
                    }

                    if (spanImage.includes('" class="" alt="" height="196" width="196"></span>')) {
                        spanImage = spanImage.replace('" class="" alt="" height="196" width="196"></span>', '')
                    }
                    
                    result.title = $(this).children(".assetText").children("h3").children("a").text().trim()
                    result.image = spanImage
                    result.link = `https://www.cnet.com/${$(this).children(".assetText").children("h3").children("a").attr("href")}`
                    result.summary = $(this).children(".assetText").children("p").text().trim()
                    result.byline = $(this).children(".assetText").children(".byline").text().trim()
                    db.Article.findOne({title: result.title}).then(exist => {
                        if (!exist) {
                            db.Article.create(result)
                                .then(data => console.log(data))
                                .catch(err => console.log(`Error: ${err}`))
                        }
                    })
                    
                })
            })
            // .then(() => res.send("success"))
            .catch(function(err) {
                console.log(`Error: ${err}`);
            })

            // axios.get("https://www.nytimes.com/section/technology")
            //     .then(function(response) {
            //         var $ = cheerio.load(response.data)
        
            //         $(".story-menu li .story .story-body").each(function(i, element) {
            //             // console.log(i);
                        
            //             let result = {}
            //             result.title = $(this).children(".story-link").children(".story-meta").children("h2").text().trim()
            //             result.link = $(this).children(".story-link").attr("href")
            //             result.summary = $(this).children(".story-link").children(".story-meta").children(".summary").text().trim()
            //             result.byline = $(this).children(".story-link").children(".story-meta").children(".byline").text().trim()
            //             result.image = $(this).children(".story-link").children(".wide-thumb").children("img").attr("src")
        
            //             // console.log(result)
            //             db.Article.create(result)
            //                 .then((data) => {
            //                     console.log(data)
            //                 })
            //                 .catch((err) => {
            //                     return res.json(err);
            //                 })
            //         })
            //         return res.send("success")
            //     })
            //     .catch((err) => {
            //         return res.json(err);
            //     })

    })
}