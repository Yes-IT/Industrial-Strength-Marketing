var pp = require('preprocess');
var appIds = {
    'master' : '0b07460638a541008ca6d981a9433b08667136751ecb1ca9d5f697979f16b9bc',
    'insights' : 'aaa83f3b98bda10672ae0a2a56ee0e541b3ac3e381dbcf7514082a719753a3b6',
}
if (process.env.NODE_ENV !== 'production') {
process.env.NODE_ENV = 'dev';
}
//netlify branch deploy
if(process.env.CONTEXT === 'branch-deploy'){

}

if (!process.env.BRANCH) {
    process.env.BRANCH = 'master';
}

if(appIds[process.env.BRANCH]){
    process.env.APP_ID = appIds[process.env.BRANCH];
}

var NODE_ENV = process.env.NODE_ENV;

pp.preprocessFileSync(process.argv[2], process.argv[3], process.env, {});
