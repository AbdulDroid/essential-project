#!/usr/bin/env node

var chalk       = require('chalk');
var clear       = require('clear');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Preferences = require('preferences');
var touch       = require('touch');
var _           = require('lodash');
var fs          = require('fs');
var fsPath      = require('fs-path');
var path        = require('path');
var Spinner     = CLI.Spinner;

//placeholder texts and objects
var package = {
    name: '',
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
        test: ''
    },
    repository:{},
    author: '',
    license: '',
    bugs: {},
    homepage:'',
    dependencies:{}
};
var mainContent='';
var dbContent='';
var type = 'basic';

clear();

console.log(
    chalk.green(
        figlet.textSync('Essential kit', {horizontalLayout: 'full'})
    )
);

console.log(
    chalk.green.bold('\n\n\=======================\n\nThis tool helps you create a starter code or make you write a lot less boilerplate code to get your node or express project up on running. Please follow the interactive tool to setup your profile.')
);

function getBasicDetails(callback){
    var questions = [
        {
            name: 'name',
            type: 'input',
            message: 'Project name:',
            validate: function(value){
                if(value.length){
                    return true;
                } else {
                    return 'Please enter a project name';
                }
            }
        },
        {
            name: 'version',
            type: 'input',
            message: 'version(default=1.0.0):'
        },
        {
            name: 'description',
            type: 'input',
            message: 'description(optional):'
        },
        {
            name: 'main',
            type: 'input',
            message: 'main file name(default=index.js):'
        },
        {
            name: 'test',
            type: 'input',
            message: 'test(optional):'
        },
        {
            name: 'author',
            type: 'input',
            message: 'author:',
            validate: function(value){
                if(value.length){
                    return true;
                } else {
                    return 'Please enter your name as the author';
                }
            }
        },
        {
            name: 'license',
            type: 'input',
            message: 'license (default=ISC):'
        },
        {
            name: 'dependencies',
            type: 'checkbox',
            message: 'Select the package dependencies you need for your project:',
            choices: [{
                name:'express',
                checked: true
            }, {
                name: 'dotenv'
            }, {
                name: 'express-session'
            }, {
                name: 'body-parser',
                checked: true
            }, {
                name:'cookie-parser'
            }, {
                name:'express-validator'
            }, {
                name: 'pug'
            }, {
                name:'serve-favicon'
            },{
                name:'nodemon',
                checked: true
            },{
                name:'csurf'
            }
        ],
        },
        {
            name: 'repo',
            type: 'list',
            message: 'Connect to remote github repo?',
            choices: ['Yes', 'No'],
            default: 'No'
        }
    ];

    inquirer.prompt(questions).then(function(answers) {
        var status = new Spinner ('Creating project core file (package.json and index.js). Please wait...');
        status.start;

        package.name = answers.name.toLowerCase();
        if(answers.version.length){
            package.version = answers.version;
        }
        if(answers.description.length) {
            package.description = answers.description;
        }
        if(answers.main.length){
            package.main = answers.main;
        }
        if(answers.test.length) {
            package.scripts.test = answers.test;
        }
        package.author = answers.author;
        if(answers.license.length){
            package.license = answers.license;
        }
        if(answers.dependencies.length){
            var temp = answers.dependencies;
            package.scripts['start'] = 'node ' + package.main; 
            for(var i = 0; i < answers.dependencies.length; i++){
                if(temp[i] === 'body-parser'){
                    package.dependencies[temp[i]] = '^1.18.2';
                    mainContent += 'var bodyParser = require(\'body-parser\');\n';
                } else if (temp[i] === 'express'){
                    package.dependencies[temp[i]] = '^4.16.2';
                    mainContent += 'var express = require(\'express\');\n';
                } else if (temp[i] === 'csurf'){
                    package.dependencies[temp[i]] = '^1.9.0';
                    mainContent += 'var csurf = require(\'csurf\');\n';
                } else if (temp[i] === 'cookie-parser'){
                    package.dependencies[temp[i]] = '^1.4.3';
                    mainContent += 'var cookieParser = require(\'cookie-parser\');\n';
                } else if (temp[i] === 'dotenv'){
                    package.dependencies[temp[i]] = '^4.0.0';
                    mainContent += 'var dotenv = require(\'dotenv\');\n';
                } else if (temp[i] === 'nodemon'){
                    package.dependencies[temp[i]] = '^1.14.11';
                    mainContent += 'var nodemon = require(\'nodemon\');\n';
                    package.scripts['ekit'] = 'nodemon ' + package.main;
                } else if (temp[i] === 'express-session'){
                    package.dependencies[temp[i]] = '^1.15.2';
                    mainContent += 'var expressSession = require(\'express-session\');\n';
                } else if (temp[i] === 'express-validator'){
                    package.dependencies[temp[i]] = '^4.3.0';
                    mainContent += 'var expressValidator = require(\'express-validator\');\n';
                } else if (temp[i] === 'pug'){
                    package.dependencies[temp[i]] = '^2.0.0-rc.4';
                    mainContent += 'var pug = require(\'pug\');\n';
                } else if (temp[i] === 'serve-favicon'){
                    package.dependencies[temp[i]] = '^2.4.5';
                    mainContent += 'var serveFavicon = require(\'serve-favicon\');\n';
                }
            }
        }
        let check = answers.repo === 'No';
        status.stop();
        return callback(null, check);
    });
}

function setRepo(callback) {
    var questions = [
        {
            name: 'repoType',
            type: 'list',
            message: 'Choose your repo type/host:',
            choices: ['git','svn'],
            default: 'git'
        },
        {
            name: 'url',
            type: 'input',
            message: 'link to the remote repo:',
            validate: function(value){
                if(value.length){
                    return true;
                } else {
                    return 'Please enter a valid repo link';
                }
            }
        }
    ];
    inquirer.prompt(questions).then(function(answers){
        var temp = answers.repoType === 'git';
        if(!temp){
            package.repository['type'] = 'svn';
        } else {
            package.repository['type'] = 'git';
        }
        package.repository['url'] = answers.url;
        return callback();
    });
}

function setSetupType(callback) {
    var questions= [
        {
            name: 'setupType',
            type: 'list',
            message: 'Please select the project structure/pattern you want:',
            choices: ['Basic', 'MVC pattern'],
            default: 'Basic'
        },
        {
            name: 'dbType',
            type: 'list',
            message: 'Please select your database option:',
            choices: ['MongoDB', 'Redis'],
            default: 'MongoDB'
        }
    ];
    inquirer.prompt(questions).then(function(answers){
        let sType = answers.setupType === 'Basic';
        let dType = answers.dbType === 'MongoDB';
        
        if(dType){
            package.dependencies['mongodb'] = '^3.0.1';
            mainContent += 'var mongoClient = require(\'mongodb\');\n\n';
        } else {
            package.dependencies['redis'] = '^2.8.0';
            mainContent += 'var redisClient = require(\'redis\');\n\n';
        }
        mainContent += '\n console.log(\'Start some awesome work from here on\');'
        if(sType){
            completeBasic();
        } else {
            completeMVP();
        }
        return callback();
    });
}

function completeBasic(){
    var filePath = process.cwd();
    fsPath.writeFile(filePath + '/' + package.name + '/db/db.js', '//Your database code goes here', function(err){
        if(err){
            return console.log(chalk.red('An error occured'));
        }

        fsPath.writeFile(filePath + '/' + package.name + '/package.json', JSON.stringify(package), function(err){
            if(err){
                return console.log(chalk.red('An error occured'));
            }

            fsPath.writeFile(filePath + '/' +    package.name + '/' + package.main, mainContent, function(err) {
                if(err){
                    return console.log(chalk.red('An error occured'));
                }
                return console.log(chalk.green('Setup completed... your new project has been created and saved to' + filePath + '/' + package.name));
            });
        });
    });
}

function completeMVP(){
    var filePath = process.cwd();
    fsPath.writeFile(filePath + '/' + package.name + '/database/db.js', '//Your database code goes here', function(err){
        if(err){
            return console.log(chalk.red('An error occured'));
        }
        fsPath.writeFile(filePath + '/' + package.name + '/models/form.js', '//Code for your model goes here', function(err){
            if(err){
                return console.log(chalk.red('An error occured'));
            }

            fsPath.writeFile(filePath + '/' + package.name + '/public/css/style.css', '//Do some cool stuff here {}', function(err){
                if(err){
                    return console.log(chalk.red('An error occured'));
                }

                fsPath.writeFile(filePath + '/' + package.name + '/public/js/main.js', '//Make some awesome JavaScript stuff here', function(err){
                    if(err){
                        return console.log(chalk.red('An error occured'));
                    }

                    fsPath.writeFile(filePath + '/' + package.name + '/routes/form.js', '//All form routes goes here', function(err){
                        if(err){
                            return console.log(chalk.red('An error occured'));
                        }

                        fsPath.writeFile(filePath + '/' + package.name + '/routes/index.js', '//Control code goes here I believe, just do your thing', function(err){
                            if(err){
                                return console.log(chalk.red('An error occured'));
                            }

                            fsPath.writeFile(filePath + '/' + package.name + '/package.json', JSON.stringify(package), function(err){
                                if(err){
                                    return console.log(chalk.red('An error occured'));
                                }
                
                                fsPath.writeFile(filePath + '/' +    package.name + '/' + package.main, mainContent, function(err) {
                                    if(err){
                                        return console.log(chalk.red('An error occured'));
                                    }
                                    return console.log(chalk.green('Setup completed... your new project has been created and saved to' + filePath + '/' + package.name));
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

function startProcess(){
    getBasicDetails(function(err, check){
        if(err){
            return console.log(chalk.red('An error occured'));
        }
        if(!check){
            setRepo(function(err) {
                if(err){
                    console.log(chalk.red('An error occured'));
                }
                console.log(chalk.green('Your remote repository has been added successfully\n'));
                console.log('\n---------------------\n\nAlmost done, now select your file structure and database option and we will be done :)');
                delete package['bugs'];
                delete package['homepage'];
                setSetupType(function(err){
                    if (err) {
                        return console.log(chalk.red('An error occured'));
                    }
                });
               });
        } else {
            delete package['repository'];
            delete package['bugs'];
            delete package['homepage'];

            setSetupType(function(err){
                if (err) {
                    return console.log(chalk.red('An error occured'));
                }
            });
        }
    });
}

startProcess();

