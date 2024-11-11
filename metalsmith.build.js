const metalsmith = require("metalsmith");
const permalinks = require("metalsmith-permalinks");
const collections = require("@metalsmith/collections");
const metadata = require("metalsmith-collection-metadata");
const pagination = require("metalsmith-pagination");
const nav = require("metalsmith-navigation");
const layouts = require("metalsmith-layouts");
const markdown = require("metalsmith-markdown");
const sitemap = require("metalsmith-mapsite");
const assets = require("metalsmith-assets");
const debugUi = require("metalsmith-debug-ui");
const marked = require("marked");
const emailfeed = require("./lib/email_rss_feed.js");
const slugify = require("slugify");
const industrial = require("./lib/industrial.js");
const initYoutubes = require("./lib/youtubes.js");
const path = require('node:path');

const siteConfig = {
    seoSuffix: " - Industrial Strength Marketing",
    siteUrl: "https://industrialstrengthmarketing.com",
    siteName: "Industrial Strength Marketing",
    navConfigs: {
        primary: {
            sortBy: "nav_sort",
            filterProperty: "show_in_menu",
            filterValue: "true",
            includeDirs: true,
            permalinks: false,
        },
    },
    navSettings: {
        permalinks: true,
    },
};
/**
 *  Get nav label or default to title
 * @param {object} val
 */
const navLabel = function (val) {
    return val.nav_title ? val.nav_title : val.title;
};

/**
 *  Get body classes
 * @param {string} path
 */
const cssClassify = function (val, prefix = "page-") {
    let cssClass = val ? val.toLowerCase().replace(/\s+/g, "-").replace("/", "-") : "home";
    return prefix + cssClass.replace("/", "-");
};

/**
 * Find an item in collection by field value
 * @param {*} val
 * @param {string} field to search in collection
 * @param {array} collection - metalsmith collection
 */
const findByField = function (val, field, collection) {
    if (!val || !field || !collection) {
        return "";
    }
    let r = collection.find((item) => item[field] === val);
    return r;
};
/**
 *  Title case text
 * @param {string} str text to title case
 */
const titleCase = function (str) {
    if (!str) {
        return str;
    }
    let exclusions = ["of", "the", "is", "for", "a", "and", "to", "with", "into", "on"];
    let words = str.split(" ");
    for (var i = 0; i < words.length; i++) {
        let word = words[i];

        if (exclusions.includes(word.toLowerCase()) && i > 0) {
            words[i] = word.toLowerCase() + " ";
        } else {
            words[i] = word.charAt(0).toUpperCase() + word.slice(1);
        }
    }
    return words.join(" ");
};

const md = function (str) {
    let out = "";
    if (str) {
        out = marked(str);
    }
    return out;
};

const getInsightType = function (collection) {
    return collection.filter((el) => el !== "insights");
};
const getLinkLabel = function (type) {
    const labels = {
        article: "Read More",
        podcast: "Learn More",
        video: "Watch Now",
    };

    return labels[type];
};

function getYoutubeId(url) {
    var ID = "";
    url = url.replace(/(>|<)/gi, "").split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        ID = url;
    }
    return ID;
}

function getYoutubeThumbnail(url) {
    let id = getYoutubeId(url);
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

function transformSoundcloudEmbed(embed) {
    //296500717
    const regex = /\/tracks\/(\d{1,12})/;
    let m = regex.exec(embed);
    let embedurl = embed;
    if (m[1]) {
        embedurl = `<iframe width="100%" height="166" scrolling="no" id="podcast-embed" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/${m[1]}&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=false&show_comments=false&show_playcount=false&show_user=false&hide_related=false&visual=false&start_track=0&callback=true"></iframe>`;
    }
    return embedurl;
}

function toSlug(val) {
    return slugify(val).toLowerCase();
}

function cleanUrl(val) {
    const regex = /(?<!:)(\/\/)/gm;
    const result = val.replace(regex, "/");
    return result;
}

function readTime(content, label = " min read") {
    const text = content.toString();
    const wpm = 230;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);
    return time + label;
}

function formatDate(strDate) {
    try {
        if (strDate) {
            const d = new Date(strDate);
            return d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
        }
    } catch (e) {
        console.log(e);
    }

    return "";
}

const buildAttributes = function (obj) {
    let attrs = [];
    for (const [key, value] of Object.entries(obj)) {
        attrs.push(`${key}="${value}"`);
    }
    return attrs.join(' ');
}
function responsiveImage(url, options = {}){ 
    const defaults = {
        cssClass : '',
        alt: ''
    }
    const params = {...defaults, ...options};
    let attributes = buildAttributes(params).replace("cssClass", "class");
    const ext = path.extname(url);
    const base = path.basename(url ,ext);
    const dir = path.dirname(url);
    const small = path.join(dir, `${base}-sm${ext}`);
    const md = path.join(dir, `${base}-md${ext}`);

    return `<img src="${url}" ${attributes}
    srcset="${small} 400w,
            ${md} 600w,
            ${url} 1000w"
    sizes="(max-width: 400px) 400px, (max-width: 800px) 600px, (min-width: 801px) 1000px"/>`; 
}

const templateConfig = {
    engineOptions: {
        filters: {
            navLabel: navLabel,
            findByField: findByField,
            cssClassify: cssClassify,
            formatDate: formatDate,
            md: md,
            transformSoundcloudEmbed: transformSoundcloudEmbed,
            getYoutubeId: getYoutubeId,
            getYoutubeThumbnail: getYoutubeThumbnail,
            getInsightType: getInsightType,
            getLinkLabel: getLinkLabel,
            cleanUrl: cleanUrl,
            titleCase: titleCase,
            readTime: readTime,
            toSlug: toSlug,
            responsiveImage: responsiveImage,
        },
        autoescape: false,
    },
};


const siteBuild = metalsmith(__dirname)
    .metadata({
        modified: new Date(),
        year: new Date().getFullYear(),
        siteConfig: siteConfig,
        env: process.env,
    })
    .source("./src/content/")
    .destination("./build/")
    .ignore([".DS_Store"])
    .clean(true)
    .use(initYoutubes())
    .use(
        collections({
            team: {
                pattern: "team/*.md",
                sortBy: "order",
                refer: false,
            },
            work: {
                pattern: ["work/*.md", "!work/index.md", "!work/davron.md", "!work/motion-industries.md"],
                filterBy: function(file) {
                    return file.private !== true;
                },
                sortBy: "order",
            },
            portfolio: {
                pattern: ["portfolio/*.md", "!portfolio/index.md"],
                sortBy: "order",
            },
            featured_case_study: {
                sortBy: "order",
                refer: false,
            },
            resources: {
                pattern: ["resources/*.md", "!resources/index.md"],
                sortBy: "order",
            },
            services: {
                pattern: ["services/*.md"],
                sortBy: "nav_sort",
            },
            article: {
                pattern: ["insights/articles/*.md"],
                sortBy: "date",
                reverse: true,
            },
            video: {
                pattern: ["insights/videos/*.md"],
                sortBy: "date",
                reverse: true,
            },
            podcast: {
                pattern: ["insights/podcast/*.md"],
                sortBy: "date",
                reverse: true,
            },
            insights: {
                pattern: ["insights/**/*.md", "!insights/index.md"],
                sortBy: "date",
                reverse: true,
                refer: false,
            },
            client: {
                pattern: ["clients/*.md", "!clients/index.md"],
                sortBy: "nav_sort",
            },
            socialmedia: {
                pattern: "social_media/social-media.md",
                refer: false,
            },
        })
    )
    .use((files, metalsmith, done) => {
        const socialMediaData = metalsmith._metadata.collections.socialmedia;
        if (socialMediaData && socialMediaData.length) {
            metalsmith.metadata().socialmedia = socialMediaData[0]; // Add to global metadata
        } else {
            console.warn("social_media/social-media.md not found or is empty.");
        }
        done();
    })
    .use(
        pagination({
            "collections.article": {
                perPage: 5,
                layout: "blog-index.njk",
                first: "insights/articles/index.html",
                path: "insights/articles/:num/index.html",
                filter: function (page) {
                    return page.private != "true";
                },
                pageMetadata: {
                    title: "Industrial Marketing Manufacturing and Distribution Trends {{pagination.num}}",
                    seo: { description: "Read the latest articles on what it takes to make marketing the strength of your industrial business." },
                },
            },
            "collections.video": {
                perPage: 5,
                layout: "blog-index.njk",
                first: "insights/videos/index.html",
                path: "insights/videos/:num/index.html",
                filter: function (page) {
                    return page.private != "true";
                },
                pageMetadata: {
                    title: "Industrial Marketing Manufacturing and Distribution Videos {{pagination.num}}",
                    seo: { description: "A collection of videos to help you stand up what makes you stand out." },
                },
            },
            "collections.podcast": {
                perPage: 5,
                layout: "blog-index.njk",
                first: "insights/podcast/index.html",
                path: "insights/podcast/:num/index.html",
                filter: function (page) {
                    return page.private != "true";
                },
                pageMetadata: {
                    title: "Industrial Strength Marketing Podcast for Manufacturing and Distributors {{pagination.num}}",
                    seo: { description: "A podcast featuring inspiring conversations with industrial leaders about making marketing the strength of their business." },
                },
            },
        })
    )
    .use(
        metadata({
            "collections.team": {
                private: true,
            },
            "collections.resources": {
                private: true,
            },
            "collections.portfolio": {
                private: true,
            },
        })
    )
    .use(markdown())
    .use(
        permalinks({
            relative: false,
            duplicatesFail: false,
            linksets: [
                {
                    match: { collection: "article" },
                    pattern: "insights/articles/:title-:campaign_id",
                },
            ],
        })
    )
    .use(emailfeed({ collection: "insights", title: "Industrial Strength Marketing", site_url: siteConfig.siteUrl, destination: "rss.xml" }))
    .use(nav(siteConfig.navConfigs, siteConfig.navSettings))
    .use(industrial.plugin())
    .use(layouts(templateConfig))
    .use(sitemap({ hostname: "https://industrialstrengthmarketing.com", omitIndex: true }))
    .use(
        assets({
            source: "./public", // relative to the working directory
            destination: ".", // relative to the build directory
        })
    );

if (process.env.NODE_ENV === "dev") {
    siteBuild.use(debugUi.report());
}

siteBuild.build(function (err, files) {
    if (err) {
        console.log(err);
    }
    // console.log(files);
    console.log("Metalsmith finished!");
});
