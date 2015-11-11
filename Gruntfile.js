'use strict';
module.exports = function (grunt) {

    function notGitFile(filepath) {
        return filepath.match(/BACKUP|LOCAL|BASE|REMOTE/) === null;
    }
    function config(file) {
        return {
            src: ['conf/' + file],
            dest: 'build/',
            wrapper: [
                'var config = \n',
                ';\n'
            ]
        };
    }
    function site(fqdn) {
        return {
            options: {
                bucket: fqdn,
                access: 'public-read'
            },
            upload: [{
                src: 'dist/*',
                dest: '/'
            }, {
                src: 'dist/pushit/*',
                dest: '/pushit/'
            }, {
                src: 'dist/pushit/assets/*',
                dest: '/pushit/assets/'
            }, {
                src: 'dist/pushit/fonts/*',
                dest: '/pushit/fonts/'
            }]
        };
    }
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' all rights reserved */\n',

        notify: {
            dev: {
                options: {
                    message: 'Development build successful.'
                }
            },
            prd: {
                options: {
                    message: 'Production build successful.'
                }
            }
        },

        // clean build files
        clean: [
            'build/',
            'dist/'
        ],

        insertJsFiles: {
            src: {
                src: 'index.html',
                dest: 'build/index.html'
            },
            srcJsUnbundled: {
                src: 'index.html',
                dest: 'build/index.html',
                jsBaseDir: 'build/js/src',
                jsFiles: '**/*.js',
                appendPath: '/pushit/js/',
            }
        },
        ngtemplates:  {
            pushit: {
                options: {
                    base: 'src/',
                    encoding: 'utf-8'
                },
                src: [
                    'src/**/*.html',
                    '!src/index.html'
                ],
                dest: 'build/templates.js'
            }
        },
        commonjs: {
            modules: {
                cwd: 'src/',
                src: '**/*.js',
                dest: 'build/js/',
                filter: notGitFile
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: [
                    'src/**/*.js'
                ],
                filter: notGitFile
            },
            test: {
                src: [
                    'test/**/*.js'
                ]
            }
        },
        wrap: {
            // wrap closures around all files to protect the global namespace
            closure: {
                src: ['src/**/*.js'],
                dest: 'build/js/',
                filter: notGitFile,
                wrapper: [
                    '(function () {\n',
                    '})();\n'
                ]
            }
        },
        // less compiles less files to css
        less: {
            src: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.less'],
                    filter: notGitFile,
                    dest: "build/css/",
                    ext: '.css'
                }]
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            src: {
                src: [
                    'build/js/**/*.js',
                    '<%= ngtemplates.pushit.dest %>'
                ],
                dest: 'build/<%= pkg.name %>.js'
            },
            srcJsUnbundled: {
                src: [
                    '<%= ngtemplates.pushit.dest %>'
                ],
                dest: 'build/<%= pkg.name %>.js'
            },
            css: {
                src: [
                    'build/css/**/*.css'
                ],
                dest: 'build/<%= pkg.name %>.css'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            prd: {
                files: [{
                    'dist/pushit/<%= pkg.name %>-<%= pkg.version %>.js': '<%= concat.src.dest %>',
                    'dist/pushit/<%= pkg.name %>-lib-<%= pkg.version %>.js': '<%= concat.lib.dest %>'
                }]
            }
        },
        mincss: {
            options: {
                banner: '<%= banner %>'
            },
            prd: {
                files: [{
                    'dist/pushit/<%= pkg.name %>-<%= pkg.version %>.css': '<%= concat.css.dest %>'
                }]
            }
        },
        copy: {
            'configfile': {
                files: [{
                    'dist/pushit/config.js': 'build/conf/*'
                }]
            },
            dev: {
                files: [{
                    'dist/pushit/<%= pkg.name %>-dev.js': '<%= concat.src.dest %>',
                    'dist/pushit/<%= pkg.name %>-lib-dev.js': '<%= concat.lib.dest %>',
                    'dist/pushit/<%= pkg.name %>-dev.css': '<%= concat.css.dest %>'
                }]
            },
            devJsUnbundled: {
                files: [{
                    expand: true,
                    cwd: 'build/js/src/',
                    src: [ '**/*.js' ],
                    dest: 'dist/pushit/js/'
                }]
            },
            assets: {
                files: [{
                    expand: true,
                    flatten: true,
                    src:  ['src/assets/**/*'],
                    dest: 'dist/pushit/assets/'
                }, {
                    expand: true,
                    flatten: true,
                    src:  ['lib/fonts/**/*'],
                    dest: 'dist/pushit/fonts/'
                }]
            }
        },
        manifest: {
            prd: {
                options: {
                    basePath: 'dist',
                    preferOnline: false,
                    verbose: false,
                    timestamp: true,
                    exclude: [
                        'pushit/assets',
                        'pushit/fonts'
                    ]
                },
                src: [
                    "pushit/**/*"
                ],
                dest: "dist/manifest.appcache"
            }
        },
        // watch will auto-grunt anything that has a rule set up here
        watch: {
            dev: {
                files: ['Gruntfile.js', 'src/**'],
                tasks: ['dev']
            },
            devJsUnbundled: {
                files: ['Gruntfile.js', 'src/**'],
                tasks: ['devJsUnbundled']
            }
        },
        // s3 deployement targets
        s3: {
        }
    });

    // plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-mincss');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-commonjs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-insertJsFiles');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-wrap');
    grunt.loadNpmTasks('grunt-manifest');
    grunt.loadNpmTasks('grunt-s3');

    // tasks
    grunt.registerTask('src',            ['ngtemplates', 'less', 'jshint:src', 'wrap:closure', 'insertJsFiles:src',           'concat:src',           'concat:lib', 'concat:css']);
    grunt.registerTask('srcJsUnbundled', ['ngtemplates', 'less', 'jshint:src', 'wrap:closure', 'insertJsFiles:srcJsUnbundled', 'concat:srcJsUnbundled', 'concat:lib', 'concat:css']);

    grunt.registerTask('dev',            ['src',           'replace:dev', 'copy:dev',                       'copy:assets', 'notify:dev']);
    grunt.registerTask('devJsUnbundled', ['srcJsUnbundled', 'replace:dev', 'copy:dev', 'copy:devJsUnbundled', 'copy:assets', 'notify:dev']);

    grunt.registerTask('prd', ['src', 'replace:prd', 'uglify', 'mincss', 'copy:assets', 'manifest:prd', 'notify:prd']);


    grunt.registerTask('deploy-local',             ['clean', 'wrap:localconf', 'dev']);
    grunt.registerTask('deploy-default',           ['clean', 'wrap:configfile', 'dev']);
};
