/* global module, require */

module.exports = function( grunt ) {

	'use strict';

	var _ = require( 'lodash' );

	var pkg = _.merge(
		grunt.file.readJSON( 'package.json' ),
		grunt.file.readJSON( 'project.json' )
	);

	grunt.initConfig( {

		pkg: pkg,

		autoprefixer: {
			options: {
				browsers: [
					'Android >= 2.1',
					'Chrome >= 21',
					'Edge >= 12',
					'Explorer >= 7',
					'Firefox >= 17',
					'Opera >= 12.1',
					'Safari >= 6.0'
				],
				cascade: false
			},
			editor: [ 'editor-style.css' ],
			main: [ 'style.css' ]
		},

		clean: {
			options: {
				force: true
			},
			build: [ 'build/*' ]
		},

		copy: {
			build: {
				expand: true,
				cwd: '.',
				src: [
					'*.css',
					'*.php',
					'*.txt',
					'screenshot.png',
					'assets/**',
					'inc/**',
					'templates/**'
				],
				dest: 'build/'
			}
		},

		cssjanus: {
			options: {
				swapLtrRtlInUrl: false
			},
			assets: {
				expand: true,
				cwd: 'assets/css/',
				src: [ '**/*.css', '!**/*rtl.css', '!**/*min.css' ],
				dest: 'assets/css/',
				ext: '-rtl.css'
			},
			editor: {
				files: {
					'editor-style-rtl.css': 'editor-style.css'
				}
			},
			main: {
				files: {
					'style-rtl.css': 'style.css'
				}
			}
		},

		cssmin: {
			options: {
				processImport: false,
				roundingPrecision: 5,
				shorthandCompacting: false
			},
			assets: {
				expand: true,
				cwd: 'assets/css/',
				src: [ '**/*.css', '!**/*.min.css' ],
				dest: 'assets/css/',
				ext: '.min.css'
			}
		},

		devUpdate: {
			package: {
				options: {
					packageJson: null,
					packages: {
						devDependencies: true,
						dependencies: false
					},
					reportOnlyPkgs: [],
					reportUpdated: false,
					semver: true,
					updateType: 'force'
				}
			}
		},

		imagemin: {
			options: {
				optimizationLevel: 3
			},
			assets: {
				expand: true,
				cwd: 'assets/images/',
				src: [ '**/*.{gif,jpeg,jpg,png,svg}' ],
				dest: 'assets/images/'
			},
			screenshot: {
				files: {
					'screenshot.png': 'screenshot.png'
				}
			},
			wp_org: {
				expand: true,
				cwd: 'wp-org-assets/',
				src: [ '**/*.{gif,jpeg,jpg,png,svg}' ],
				dest: 'wp-org-assets/'
			}
		},

		jshint: {
			assets: [ 'assets/js/**/*.js', '!assets/js/**/*.min.js' ],
			gruntfile: [ 'Gruntfile.js' ]
		},

		replace: {
			php: {
				overwrite: true,
				replacements: [
					{
						from: /@since(\s+)NEXT/g,
						to: '@since$1<%= pkg.version %>'
					},
					{
						from: /'PRIMER_CHILD_VERSION',(\s*)'[\w.+-]+'/,
						to: "'PRIMER_CHILD_VERSION',$1'<%= pkg.version %>'"
					}
				],
				src: [ '*.php', 'inc/**/*.php', 'templates/**/*.php' ]
			},
			readme: {
				overwrite: true,
				replacements: [
					{
						from: /Stable tag:(\s*)[\w.+-]+/,
						to: 'Stable tag:$1<%= pkg.version %>'
					}
				],
				src: [ 'readme.txt' ]
			},
			sass: {
				overwrite: true,
				replacements: [
					{
						from: /Version:(\s*)[\w.+-]+/,
						to: 'Version:$1<%= pkg.version %>'
					}
				],
				src: [ '.dev/sass/**/*.scss' ]
			}
		},

		sass: {
			options: {
				precision: 5,
				sourceMap: false
			},
			assets: {
				expand: true,
				cwd: '.dev/sass/assets/',
				src: [ '**/*.scss' ],
				dest: 'assets/css/'
			},
			editor: {
				files: {
					'editor-style.css': '.dev/sass/editor-style.scss'
				}
			},
			main: {
				files: {
					'style.css': '.dev/sass/style.scss'
				}
			}
		},

		uglify: {
			options: {
				ASCIIOnly: true
			},
			assets: {
				expand: true,
				cwd: 'assets/js/',
				src: [ '**/*.js', '!**/*.min.js' ],
				dest: 'assets/js/',
				ext: '.min.js'
			}
		},

		watch: {
			images: {
				files: 'assets/images/**/*.{gif,jpeg,jpg,png,svg}',
				tasks: [ 'imagemin' ]
			},
			js: {
				files: 'assets/js/**/*.js',
				tasks: [ 'jshint', 'uglify' ]
			},
			sass: {
				files: '.dev/sass/**/*.scss',
				tasks: [ 'sass', 'autoprefixer', 'cssjanus', 'cssmin' ]
			}
		},

		wp_readme_to_markdown: {
			options: {
				post_convert: function( readme ) {
					var badges = {
						grunt: '[![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](https://gruntjs.com)',
						david_dev: '[![devDependency Status](https://david-dm.org/' + pkg.repository + '/dev-status.svg)](https://david-dm.org/' + pkg.repository + '?type=dev)',
						php: '[![Required PHP Version](https://img.shields.io/badge/php-' + pkg.requirements.php + '-8892bf.svg)](https://secure.php.net/supported-versions.php)',
						wordpress: '[![Required WordPress Version](https://img.shields.io/badge/wordpress-' + pkg.requirements.wordpress + '-0073aa.svg)](https://wordpress.org/download/release-archive/)',
						travis: '[![Build Status](https://travis-ci.org/' + pkg.repository + '.svg?branch=master)](https://travis-ci.org/' + pkg.repository + ')',
						coveralls: '[![Coverage Status](https://coveralls.io/repos/' + pkg.repository + '/badge.svg?branch=master)](https://coveralls.io/github/' + pkg.repository + ')',
						license: '[![License](https://img.shields.io/github/license/' + pkg.repository + '.svg)](https://github.com/' + pkg.repository + '/blob/master/license.txt)'
					};

					// Required
					readme = readme.replace( '## Description ##', badges.grunt + "  \n\n## Description ##" );
					readme = addBadge( readme, badges.david_dev );

					// Extras
					readme = ( pkg.requirements.php )              ? addBadge( readme, badges.php )       : readme;
					readme = ( pkg.requirements.wordpress )        ? addBadge( readme, badges.wordpress ) : readme;
					readme = grunt.file.exists( '.travis.yml' )    ? addBadge( readme, badges.travis )    : readme;
					readme = grunt.file.exists( '.coveralls.yml' ) ? addBadge( readme, badges.coveralls ) : readme;
					readme = grunt.file.exists( 'license.txt' )    ? addBadge( readme, badges.license )   : readme;

					return readme;
				}
			},
			all: {
				files: {
					'readme.md': 'readme.txt'
				}
			}
		}

	} );

	function addBadge( readme, badge ) {

		return readme.replace( " \n\n## Description ##", badge + "  \n\n## Description ##" );

	}

	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	grunt.registerTask( 'default', [ 'sass', 'autoprefixer', 'cssjanus', 'cssmin', 'jshint', 'uglify', 'imagemin' ] );
	grunt.registerTask( 'build',   [ 'default', 'version', 'clean:build', 'copy:build' ] );
	grunt.registerTask( 'readme',  [ 'wp_readme_to_markdown' ] );
	grunt.registerTask( 'version', [ 'replace', 'readme' ] );

};
