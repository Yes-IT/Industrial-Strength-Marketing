import { Selector } from 'testcafe';
import { Config } from './config.js'; 
const metaDesc = Selector('meta').withAttribute('name', 'description');
fixture `Homepage`
    .page `${Config.host}`;

test('page loads', async t => {
    await t
    .expect(Selector('.address').innerText).contains('1401', 'no address in footer')
    .expect(metaDesc.getAttribute('content')).contains('Industrial', 'Homepage SEO meta desc not right');
});

// fixture `Design Collaboration Suite Page`
// .page `${Config.host}/design-collaboration-suite/`;

// test('page loads and is basically ok', async t => {
// await t
//     .expect(Selector('.table.comparison-table').exists).ok('selector not found - page not working')
//     .expect(Selector('title').innerText).contains('3D Modeling Software', 'page title wrong')
//     .expect(metaDesc.getAttribute('content')).contains('Learn features and benefits of the entire CAD design collaboration suite', 'SEO meta desc not right')
// });

