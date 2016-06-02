# Pundit client

Pundit is a web application that allows users to annotate web pages. Compared to others annotations tool Pundit is a bit “special” since it allows to create **semantic annotations**.

This is the official and open source repository for the Pundit client.

Repository for Pundit Annotator and Pundit Annotator Pro. Developed in AngularJs. These tools allow web annotation with highlights, comments and semantic annotations.

## Developers site

The developers site is available at [this URL](http://net7.github.io/pundit2/).

## Annotation server

The Pundit client needs the Annotation Server you can [download here](http://release.server.thepund.it/annotationserver-1.6.2.zip).

## License

http://thepund.it/license/

## Install

To install the project and be ready to develop you need a few components:

- npm (nodejs >0.9);
- grunt-cli.

On **Ubuntu 12.04** (and maybe others) you might need to add a repository for a recent version of nodejs:

```
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

Install **npm**, **grunt**:

```
sudo apt-get install npm
sudo npm -g install grunt-cli grunt
```

Install bower

```
sudo npm install -g bower
```

Install **pundit2**:

**WARNING:** this step must NOT be run as root, npm will just let you down.

```
npm install
```

This will install the full toolchain to develop, build and deploy the application.

### Develop

```
grunt dev
```

Examples are built in `examples/*html` from `examples/src/*html`.

To create a new one: add a new .html in `examples/src/`, include the header and footer comments
for grunt to build them correctly. Or copy one of the existing into a new one, directly.

The list of examples is built and included everywhere automatically.

To get a list of grunt targets:

```
grunt --help
```

### Build

```
grunt build
```

Will build a production ready pundit2 distribution in `/build/`:

- `css/*ver*.pundit.css`
- `css/fonts/*`
- `scripts/*ver*.libs.js`
- `scripts/*ver*.pundit2.js`

Plus all of the examples using the production code: `index.html` or just `*.html`.

Plus the documentation in `/Docs`.

### Used in this project

- Js framework: <a href="https://docs.angularjs.org/api" target="_blank">Angular js</a>
- Css/html framework: <a href="http://getbootstrap.com/css/" target="_blank">Bootstrap</a>
- js+css/html: <a href="http://mgcrea.github.io/angular-strap/" target="_blank">Angular strap</a>
- Unit tests: <a href="http://jasmine.github.io/1.3/introduction.html" target="_blank">Jasmine</a>
- E2E tests: <a href="https://github.com/angular/protractor/blob/master/docs/api.md" target="_blank">Protractor</a>


