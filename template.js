'use strict';

exports.description = "Scaffolds a new Electron application";

exports.after = "You should now install project dependecies with _npm install_.";

exports.warnOn = '*';

exports.template = function(grunt, init, done) {
  init.process({}, [
    init.prompt('name'),
    {
      name: 'productName',
      message: 'Product name',
      default: function(value, data, done) {
        var name = data.name || '';
        name = name.replace(/[\W_]+/g, ' ');
        name = name.replace(/\w+/g, function(word) {
          return word[0].toUpperCase() + word.slice(1).toLowerCase();
        });
        done(null, name);
      }
    },
    init.prompt('description'),
    init.prompt('version'),
    init.prompt('licenses'),
    init.prompt('author_name'),
    init.prompt('author_email'),
    init.prompt('repository')
  ], function(err, props) {

    var files = init.filesToCopy(props);
    
    
    /* Getting license when only one is selected */
    if ( props.licenses && props.licenses.length === 1 ) {
      var license = props.licenses[0];
      var fileobj = init.expand({filter: 'isFile'}, 'licenses/LICENSE-' + license)[0];
      if (fileobj) {
        files['LICENSE.txt'] = fileobj.rel;
      }
    }
    else {
      init.addLicenseFiles(files, props.licenses);
    }

    init.copyAndProcess(files, props, { noProcess : 'resources/**' });

    grunt.file.mkdir('assets');
    grunt.file.mkdir('assets/images');
    grunt.file.mkdir('assets/stylesheets');
    grunt.file.mkdir('assets/javascript');

    init.writePackageJSON('package.json', props, function(pkg, props) {
      if (pkg.licenses && pkg.licenses.length === 1) {
        pkg.licenses[0]["url"] = "LICENSE.txt";
      }
      else {
        pkg.licenses.map(function(license){
          return { type: license.type, url: 'LICENSE-' + license.type };
        });
      }

      return Object.assign(pkg, {
        productName: props.productName,
        appBundleId: props.productName + '.app',
        helperBundleId: props.productName + '.app.helper',
        main: "main.js",
        scripts: {
          "start": "electron main.js",
          "build": "babel-node scripts/build.js --platform=all",
          "build:osx": "babel-node scripts/build.js --platform=darwin",
          "build:win": "babel-node scripts/build.js --platform=win32",
          "build:linux": "babel-node scripts/build.js --platform=linux"
        },
        devDependencies: {
          "babel": "^5.8.29",
          "denodeify": "^1.2.1",
          "electron-prebuilt": "^0.36.0",
          "electron-builder": "^2.8.3",
          "electron-packager": "^7.0.0",
          "lodash": "^3.10.1",
          "minimist": "^1.2.0"
        }
      });
    });

    done();
  });
};