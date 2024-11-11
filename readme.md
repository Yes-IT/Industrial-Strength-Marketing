Industrial Static Site
========================

This static (JAM stack) site is generated via [metalsmith](http://www.metalsmith.io/) from markdown content files. The `build` directory is what is expected to be deployed for serving to the public.

There is a [NetlifyCMS](https://www.netlifycms.org/) instance in place for editing the markdown files (accessible at /admin/).

 
Getting Started
----------------

- Clone the repo
- `npm install`
- `npm start` to begin watching files and preview the site via [browsersync](https://browsersync.io/) at http://localhost:3000 or the url reported in the terminal output if you are already using browsersync. 

 
Folder Structure
-----------------------
````
industrial-static
|-build
|-layouts
|   |-partials
|-public
|-src
|  |-admin
|  |-content
|  |-js
|  |-less
|-tools
````

`build` - This folder is .gitignored and generate from running `npm run build`. Don't edit anything in this folder your edits will be destroyed.

`layouts` - This folder contains the main site layout and other page layouts. Layouts us [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) for templating. Partials and other 'included' files related to layout are also here.

`public` - This folder is merged into the `build` folder during the build process. It contains things like favicons, pdfs, imgs, etc. - stuff the site needs that is not created during the build.

`tools` - This folder is git ignored and contains tools and things developers might use.

`src` - This is where the magic happens. Content is located here in markdown files along with less & js files. The admin portion is also here.

Building
--------

`npm run build` is the build command. This command compiles js & less,  copies everything from the 'public' folder, creates the admin config file, 

Deploying
---------

Deploy to netlify.com via pushing to the git remote origin and publishing via netlify.

Redirects
---------

Redirects can be specified in the `public/_redirects` folder. Check the (Netlify docs)[https://www.netlify.com/docs/redirects/] on this topic.
