const request = require('request-promise-native');
const Config = require('./Config.js').Config;
const url = `${Config.host}/sitemap.xml`;
fixture `Check jobs sitemap`
.before( async ctx => {
    await request(url, function (error, response, body) {
        ctx.sitemap = body;       
    });
});

test('first test', async t => {
    await t.expect(checkSiteMap(t.fixtureCtx.sitemap)).eql(true, 'sitemap.xml seems broken');
});

function checkSiteMap(data){
    var count = (data.match(/<loc>/g) || []).length;
    if(count < 10){
        return false
    }
    return true;
}