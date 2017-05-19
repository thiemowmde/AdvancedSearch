( function ( mw, $ ) {
	'use strict';

	function isLoaded() {
		if ( !mw.libs ) {
			mw.libs = {};
		}
		if ( !mw.libs.advancedSearch ) {
			mw.libs.advancedSearch = {};
		}

		if ( mw.libs.advancedSearch.advancedOptionsLoaded ) {
			return true;
		}
		mw.libs.advancedSearch.advancedOptionsLoaded = true;

		return false;
	}

	if ( isLoaded() ) {
		return;
	}

	if ( mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Search' ) {
		return;
	}

	/**
	 * @param {string} val
	 * @return {string}
	 */
	function trimQuotes( val ) {
		val = val.replace( /^"((?:\\.|[^"\\])+)"$/, '$1' );
		if ( !/^"/.test( val ) ) {
			val = val.replace( /\\(.)/g, '$1' );
		}
		return val;
	}

	/**
	 * @param {string} val
	 * @return {string}
	 */
	function enforceQuotes( val ) {
		return '"' + trimQuotes( val ).replace( /(["\\])/g, '\\$1' ) + '"';
	}

	/**
	 * @param {string} val
	 * @return {string}
	 */
	function optionalQuotes( val ) {
		return /\s/.test( val ) ? enforceQuotes( val ) : trimQuotes( val );
	}

	/**
	 * @param {string} val
	 * @return {string}
	 */
	function formatSizeConstraint( val ) {
		return val.replace( /[\s.]+/g, '' ).replace( /(\d)\D+(?=\d)/g, '$1,' );
	}

	var advancedOptions = [
		// Text
		{
			group: 'text',
			id: 'phrase',
			placeholder: '"…"',
			formatter: function ( val ) {
				return enforceQuotes( val );
			},
			parser: /(?:^| +)"((?:\\.|[^"\\])+)"(?= |$)/gi,
			init: function () {
				return new OO.ui.TagMultiselectWidget( {} );
			}
		},
		{
			group: 'text',
			id: 'fuzzy',
			placeholder: '…~2',
			formatter: function ( val ) {
				return optionalQuotes( val ) + '~2';
			},
			parser: /(?:^| +)("(?:\\.|[^"\\])+"|[^\s":]+)~2(?= |$)/gi
		},
		{
			group: 'text',
			id: 'not',
			placeholder: '-…',
			formatter: function ( val ) {
				return '-' + optionalQuotes( val );
			},
			parser: /(?:^| +)-("(?:\\.|[^"\\])+"|[^\s":]+)(?= |$)/gi
		},
		{
			group: 'text',
			id: 'hastemplate',
			placeholder: 'hastemplate:…',
			formatter: function ( val ) {
				return 'hastemplate:' + optionalQuotes( val );
			},
			parser: /(?:^| +)\bhastemplate:("(?:\\.|[^"\\])+"|[^\s"]+)/gi,
			init: function () {
				return new OO.ui.CapsuleMultiselectWidget( {} );
			}
		},
		{
			group: 'text',
			id: 'insource',
			placeholder: 'insource:…',
			formatter: function ( val ) {
				return 'insource:' + ( /^\/.*\/$/.test( val ) ? val : optionalQuotes( val ) );
			},
			parser: /(?:^| +)\binsource:(\/\S+\/|"(?:\\.|[^"\\])+"|[^\s"]+)/gi
		},

		// Titles and headlines
		// local:…
		{
			group: 'title',
			id: 'prefix',
			placeholder: 'prefix:…',
			formatter: function ( val ) {
				return 'prefix:' + val;
			},
			parser: /(?:^| +)\bprefix:(.+)/gi,
			greedy: true
		},
		{
			group: 'title',
			id: 'intitle',
			placeholder: 'intitle:…',
			formatter: function ( val ) {
				return 'intitle:' + optionalQuotes( val );
			},
			parser: /(?:^| +)\bintitle:("(?:\\.|[^"\\])+"|[^\s"]+)/gi
		},

		// Categories
		{
			group: 'categories',
			id: 'deepcat',
			placeholder: 'deepcat:…',
			/* enabled: function () {
			 return !!mw.libs.deepCat;
			 }, */
			formatter: function ( val ) {
				return 'deepcat:' + optionalQuotes( val );
			},
			parser: /(?:^| +)\bdeepcat:("(?:\\.|[^"\\])+"|\S+)/gi
		},
		{
			group: 'categories',
			id: 'deepcat2',
			placeholder: 'deepcat:…',
			/* enabled: function () {
			 return !!mw.libs.deepCat;
			 }, */
			formatter: function ( val ) {
				return 'deepcat:' + optionalQuotes( val );
			},
			parser: /(?:^| +)\bdeepcat:("(?:\\.|[^"\\])+"|\S+)/gi
		},
		/* {
		 group: 'categories',
		 id: 'incategory',
		 placeholder: 'incategory:…',
		 formatter: function ( val ) {
		 return 'incategory:' + optionalQuotes( val );
		 },
		 parser: /(?:^| +)\bincategory:("(?:\\.|[^"\\])+"|\S+)/gi
		 }, */

		// Files
		// filebits:…
		// filesize:…
		{
			group: 'files',
			id: 'filetype',
			placeholder: 'filetype:…',
			formatter: function ( val ) {
				var types = '';
				val.split( ',' ).forEach( function ( type ) {
					type = $.trim( type ).replace( /\W+/g, '/' ).replace( /^\w*\W+(?=\w{3})/, '' ).toLowerCase();
					switch ( type ) {
						case '':
							break;

						// Individual file types with non-standard alternatives
						case 'bitmap':
						case 'image':
						case 'bild':
							types += 'filetype:bitmap';
							break;
						case 'audio':
						case 'music':
						case 'musik':
							types += 'filetype:audio';
							break;
						case 'drawing':
						case 'vector':
						case 'vektor':
						case 'zeichnung':
							types += 'filetype:drawing';
							break;

						// Other known file types
						case 'multimedia':
						case 'office':
						case 'video':
							types += 'filetype:' + type;
							break;

						// Individual MIME types with non-standard alternatives
						case 'flac':
							types += 'filemime:audio/flac';
							break;
						case 'midi':
						case 'mid':
							types += 'filemime:audio/midi';
							break;
						case 'wav':
						case 'wave':
							types += 'filemime:audio/wav';
							break;
						case 'jpg':
							types += 'filemime:image/jpeg';
							break;
						case 'tif':
							types += 'filemime:image/tiff';
							break;
						case 'svg':
						case 'xml':
							types += 'filemime:xml/svg';
							break;

						// Other known MIME types
						case 'ogg':
						case 'pdf':
							types += 'filemime:application/' + type;
							break;
						default:
							types += 'filemime:' + ( /\W/.test( type ) ? type : 'image/' + type );
							break;
					}
				} );
				return types;
			},
			requiredNamespace: 6,
			parser: /(?:^| +)\bfile(?:mime|type):(?:\w{3,}\/)?(\w{3,})/gi
		},
		{
			group: 'files',
			id: 'filew',
			placeholder: 'filew:…',
			formatter: function ( val ) {
				return 'filew:' + formatSizeConstraint( val );
			},
			requiredNamespace: 6,
			parser: /(?:^| +)\bfilew(?:idth)?\b:?([<>\d.,]+)/gi
		},
		{
			group: 'files',
			id: 'fileh',
			placeholder: 'fileh:…',
			formatter: function ( val ) {
				return 'fileh:' + formatSizeConstraint( val );
			},
			requiredNamespace: 6,
			parser: /(?:^| +)\bfileh(?:eight)?\b:?([<>\d.,]+)/gi
		}
		/* {
		 group: 'files',
		 id: 'fileres',
		 placeholder: 'fileres:…',
		 formatter: function ( val ) {
		 return 'fileres:' + formatSizeConstraint( val );
		 },
		 requiredNamespace: 6,
		 parser: /(?:^| +)\bfileres\b:?([<>\d.,]+)/gi
		 } */

		// Ordering
		// prefer-recent:…
		// boost-templates:…

		// Meta
		// linksto:…
		// neartitle:…
		// morelike:…
	];

	var i18n = {
		de: {
			'advanced-search': 'Erweiterte Suchoptionen',

			text: 'Text',
			phrase: 'Genau diese Wortgruppe:',
			fuzzy: 'Ungefähr dieses Wort:',
			not: 'Nicht dieses Wort:',
			hastemplate: 'Nur Seiten mit dieser Vorlage:',
			insource: 'Suche im Wikitext:',

			title: 'Titel',
			prefix: 'Seitentitel beginnt mit:',
			intitle: 'Seitentitel enthält:',

			categories: 'Kategorien',
			deepcat: 'In dieser oder tieferer Kategorie:',
			deepcat2: 'Zweite Kategorie zur Querschnittssuche:',
			incategory: 'Nur direkt in dieser Kategorie:',

			files: 'Dateien',
			filetype: 'Dateien dieses Typs:',
			filew: 'Dateibreite in Pixel:',
			fileh: 'Dateihöhe in Pixel:',
			fileres: 'Diagonalauflösung in Pixel:'
		},
		en: {
			'advanced-search': 'Advanced search options',

			text: 'Text',
			phrase: 'Exactly this phrase:',
			fuzzy: 'Approximately this word:',
			not: 'Not this word:',
			hastemplate: 'Only pages with this template:',
			insource: 'Search in wikitext source:',

			title: 'Title',
			prefix: 'Page title starts with:',
			intitle: 'Page title contains:',

			categories: 'Categories',
			deepcat: 'In this or deeper category:',
			deepcat2: 'Second category to intersect with:',
			incategory: 'Only in this category:',

			files: 'Files',
			filetype: 'File type:',
			filew: 'File width in pixels:',
			fileh: 'File height in pixels:',
			fileres: 'Diagonal resolution in pixels:'
		}
	};

	/**
	 * @param {string} key
	 * @return {string}
	 */
	function msg( key ) {
		var lang = mw.config.get( 'wgUserLanguage' );

		return i18n[ lang ] && i18n[ lang ][ key ] || i18n.en[ key ] || '<' + key + '>';
	}

	/**
	 * @param {RegExp|undefined} regexp
	 * @param {string} val
	 * @return {Array|boolean}
	 */
	function lastMatch( regexp, val ) {
		var match,
			result = false;

		while ( regexp && ( match = regexp.exec( val ) ) ) {
			result = match;
		}

		return result;
	}

	/**
	 * @param {string} fullQuery
	 * @return {string}
	 */
	function parseSearchOptions( fullQuery ) {
		[ true, false ].forEach( function ( parseGreedyOptions ) {
			for ( var i = advancedOptions.length; i--; ) {
				var option = advancedOptions[ i ],
					isGreedy = option.greedy ? true : false;

				if ( isGreedy !== parseGreedyOptions ) {
					continue;
				}

				var $field = $( '#advancedSearchOption-' + option.id + ' input' );

				if ( !$field.length || $.trim( $field.val() ) ) {
					continue;
				}

				var match = lastMatch( option.parser, fullQuery );

				if ( match ) {
					fullQuery = fullQuery.slice( 0, match.index )
						+ fullQuery.slice( match.index + match[ 0 ].length );
					$field.val( trimQuotes( match[ 1 ] ) );
				}
			}
		} );

		return $.trim( fullQuery );
	}

	/**
	 * @param {string} [fullQuery]
	 * @param {boolean} [clean=false]
	 * @return {string}
	 */
	function formatSearchOptions( fullQuery, clean ) {
		var greedyQuery = '';

		fullQuery = fullQuery || '';

		advancedOptions.forEach( function ( option ) {
			var $field = $( '#advancedSearchOption-' + option.id + ' input' );

			if ( !$field.length ) {
				return;
			}

			var val = $.trim( $field.val() );

			if ( val ) {
				// FIXME: Should fail if there is more than one greedy option!
				if ( option.greedy && !greedyQuery ) {
					greedyQuery += ' ' + option.formatter( val );
				} else {
					fullQuery += ' ' + option.formatter( val );
				}

				if ( clean === true ) {
					$field.val( '' );
				}

				if ( option.requiredNamespace ) {
					$( '#mw-search-ns' + option.requiredNamespace ).prop( 'checked', true );
				}
			}
		} );

		return $.trim( fullQuery + greedyQuery );
	}

	mw.loader.using( [ 'oojs-ui' ], function () {
		var $search = $( 'form#search, form#powersearch' ),
			optionSets = {};

		advancedOptions.forEach( function ( option ) {
			if ( option.enabled && !option.enabled() ) {
				return;
			}

			var widgetInit = option.init || function () {
				var id = 'advancedSearchOption-' + option.id;
				return new OO.ui.TextInputWidget( {
					id: id
				} );
			},
			widget = widgetInit();

			if ( !optionSets[ option.group ] ) {
				optionSets[ option.group ] = new OO.ui.FieldsetLayout( {
					label: msg( option.group )
				} );
			}

			optionSets[ option.group ].addItems( [
				new OO.ui.FieldLayout( widget, {
					label: msg( option.id ),
					align: 'right'
				} )
			] );
		} );

		var $allOptions = $( '<div class="advancedSearch-fieldContainer">' )
			.hide();

		for ( var group in optionSets ) {
			$allOptions.append( optionSets[ group ].$element );
		}

		var advancedButton = new OO.ui.ButtonWidget( {
			label: msg( 'advanced-search' )
			// indicator: 'down'
		} ).on( 'click', function () {
			var $searchField = $search.find( 'input[name="search"]' ),
				query = $searchField.val();

			$allOptions.toggle();

			if ( $allOptions.is( ':visible' ) ) {
				// Clean the top-right search box to avoid confusion
				var $topSearchField = $( '#searchInput' );
				if ( $topSearchField.val() === query ) {
					$topSearchField.val( '' );
				}

				query = parseSearchOptions( query );
				$searchField.val( query );
				advancedButton.setLabel( msg( 'advanced-search' ) );
			} else {
				advancedButton.setLabel( formatSearchOptions() || msg( 'advanced-search' ) );
			}
		} );

		var $advancedButton = advancedButton.$element.css( {
			clear: 'both',
			display: 'block',
			margin: 0,
			'max-width': '50em',
			'padding-top': '0.3em',
			position: 'relative'
		} );
		$advancedButton.children().css( {
			'background-image': 'url(//de.wikipedia.org/w/load.php?modules=oojs-ui.styles.indicators&image=down)',
			'background-position': '99%',
			'background-repeat': 'no-repeat',
			'background-size': '18px',
			display: 'block',
			'text-align': 'left'
		} );
		$search.append( $advancedButton, $allOptions );

		$search.on( 'submit', function () {
			var $searchField = $( this ).find( 'input[name="search"]' ),
				query = formatSearchOptions( $searchField.val(), true );

			$searchField.val( query );
			// Copy to the top-right search box for the sake of completeness
			$( '#searchInput' ).val( query );
		} );
	} );

	mw.loader.load( '//de.wikipedia.org/w/index.php?title=MediaWiki:Gadget-DeepCat.js&action=raw&ctype=text/javascript' );
} )( mediaWiki, jQuery );
