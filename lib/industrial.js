const slugify = require('slugify');
const marked = require('marked');
const nunjucks = require('nunjucks');
const request = require('request-json');
/**
 * Generic Industrial Plugin for doing stuff with the site build
 *  - manipulates files object before rendering
 *  - exposes some filters/templating functions passed to the template engine
 *  - houses a siteConfig object with values used in the buid
 */

module.exports ={
    plugin:plugin
};
/**
 * A Metalsmith plugin to modify files as needed
 *
 * @return {Function}
 */

function plugin() {

    // var client = request.createClient('https://www.industrialmarketer.com');
    

    // client.get('/api/featured.php', function(err, res, body) {
    //     return console.log(body.rows[0].title);
    //   });
    


    return function(files, metalsmith) {
        // files['insights/podcast/index.html'].title = files['insights/podcast/index.html'].title.replace('{{pagination.num}}','')
        files['insights/podcast/index.html'].seo.page_title = "Industrial Strength Marketing Podcast for Manufacturing and Distributors";
        files['insights/podcast/index.html'].title = "Podcast";
        files['insights/podcast/index.html'].seo.description = "Welcome to the Industrial Strength Marketing Podcast. Featuring inspiring conversations between industrial leaders and host James Soto, Founder and CEO of one of North America’s top industrial marketing agencies.";
        // const navItem = {
        //     add_trailing: true,
        //     depth: 1,
        //     file: files['insights/podcast/index.html'],
        //     name: 'podcast',
        //     path: 'insights/podcast',
        //     type: 'dir'
        // };
        // metalsmith._metadata.navs.primary.push(navItem);

        for (var file in files) {
            
            //do not build private files, they are for metadata usage only
            if(files[file].private){
                delete files[file];
            }

            if(files['redirects.html']){
                files['_redirects'] = files['redirects.html'];
                delete files['redirects.html'];
            }

            if(files['feed/index.html']){
                files['rss-feed.xml'] = files['feed/index.html'];
                delete files['feed/index.html'];
            }
            
        }
        
    };
}
