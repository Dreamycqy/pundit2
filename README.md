### 标注系统前端

1.1 使用说明  
(1) 安装 (install)  
配置nodejs，npm和grunt，以Ubuntu系统为例  
//安装nodejs  
```
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

//安装npm和grunt  
```
sudo apt-get install npm
sudo npm -g install grunt-cli grunt
```

//安装bower  
```
sudo npm install -g bower
```

//安装  
```
npm install
```

(2) 开发 (develop)  
日常开发测试可以使用 **grunt dev** 在本地查看效果  

(3) 编译 (build)  
正式编译执行 grunt build命令，最终生成的js和css文件存放在build目录下  

```
css/*ver*.pundit.css
css/fonts/*
scripts/*ver*.libs.js
scripts/*ver*.pundit2.js
```

一般情况下，css和libs.js没怎么变化，pundit2.js基本上每次修改都会生成一个新的版本，而且scripts目录下的js是经过压缩的，不太利于线上出现问题时进行调试，所以目前使用的js文件是从编译之后punditapp目录下的**.tmp/concat/scripts**目录下取得没有压缩版本的pundit2.js和libs.js文件。标注系统前端对这两个js文件进行引用时的位置是punditapp/scripts/目录下，所以每当build之后如果需要重新部署的话那就要将新的pundit2.js和libs.js文件复制到服务器端的punditapp/scripts/目录下。

1.2 注意事项  
(1) 如果是汉化操作，不需要将punditapp/app/src/templates.js中的内容汉化，因为它是build过程中根据项目源码生成的；  
(2) 如果需要打开debug输出，修改 app/src/Core/PUNDITDEFAULTCONF.constant.js文件中的debugAllModules，设置为true即可，如果想要细看某个模块的输出，那就看打开对应模块的debug即可；  
(3) 关于系统能进行哪些配置可以查看app/src/Core/PUNDITDEFAULTCONF.constant.js文件，或者访问http://dev.thepund.it/download/client/last-beta/docs/index.html#!/api/punditConfig   
(4) 在开发测试阶段，如果要添加新的example，可以在app/examples/src目录下新建一个html文件，并要求包含header.inc和footer.inc等相关的引用，建议直接复制某个html进来。另外，如果开发过程中添加了新的模块，而这个新的模块要求界面导入新的js文件的话，要求将需要导入的js文件放入到_pundit.inc文件中。  

=====

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

* npm (nodejs >0.9);
* grunt-cli.

On **Ubuntu 12.04** (and maybe others) you might need to add a repository for a recent version of nodejs:

    sudo apt-get update
    sudo apt-get install -y python-software-properties python g++ make
    sudo add-apt-repository -y ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

Install **npm**, **grunt**:

    sudo apt-get install npm
    sudo npm -g install grunt-cli grunt

Install bower

    sudo npm install -g bower

Install **pundit2**:

**WARNING:** this step must NOT be run as root, npm will just let you down.

    npm install

This will install the full toolchain to develop, build and deploy the application.

### Develop

    grunt dev

Examples are built in `examples/*html` from `examples/src/*html`.

To create a new one: add a new .html in `examples/src/`, include the header and footer comments
for grunt to build them correctly. Or copy one of the existing into a new one, directly.

The list of examples is built and included everywhere automatically.

To get a list of grunt targets:

    grunt --help

### Build

    grunt build

Will build a production ready pundit2 distribution in `/build/`:

* `css/*ver*.pundit.css`
* `css/fonts/*`
* `scripts/*ver*.libs.js`
* `scripts/*ver*.pundit2.js`

Plus all of the examples using the production code: `index.html` or just `*.html`.

Plus the documentation in `/Docs`.

### Used in this project

* Js framework: <a href="https://docs.angularjs.org/api" target="_blank">Angular js</a>
* Css/html framework: <a href="http://getbootstrap.com/css/" target="_blank">Bootstrap</a>
* js+css/html: <a href="http://mgcrea.github.io/angular-strap/" target="_blank">Angular strap</a>
* Unit tests: <a href="http://jasmine.github.io/1.3/introduction.html" target="_blank">Jasmine</a>
* E2E tests: <a href="https://github.com/angular/protractor/blob/master/docs/api.md" target="_blank">Protractor</a>
