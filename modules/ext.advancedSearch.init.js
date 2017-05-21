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

	function initializeCurrentSearch( state ) {
		if ( mw.libs.advancedSearch.initializedFromUrl ) {
			return;
		}
		var currentSearch;
		try {
			currentSearch = JSON.parse( mw.util.getParamValue( 'advancedSearch-current' ) );
			if ( typeof currentSearch === 'object' ) {
				for ( var opt in currentSearch ) {
					state.storeOption( opt, currentSearch[ opt ] );
				}
			}
		} catch ( e ) {}
		mw.libs.advancedSearch.initializedFromUrl = true;
	}

	if ( isLoaded() ) {
		return;
	}

	var state = new mw.libs.advancedSearch.dm.SearchModel();
	initializeCurrentSearch( state );

	// TODO initialize with API call instead
	var templateModel = new mw.libs.advancedSearch.dm.MenuDataModel( {
		infoboxNature: 'Infobox Nature',
		infoboxArchitecture: 'Infobox Architecture',
		commonsLink: 'Link to Commons'
	} );

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

	/**
	 * @param  {string} id
	 * @return {Function}
	 */
	function createMultiSelectChangeHandler( id ) {
		return function ( newValue ) {

			if ( typeof newValue !== 'object' ) {
				state.storeOption( id, newValue );
				return;
			}

			state.storeOption( id, $.map( newValue, function ( $valueObj ) {
				if ( typeof $valueObj === 'string' ) {
					return $valueObj;
				}
				return $valueObj.data;
			} ) );
		};
	}

	var advancedOptions = [
		// Text
		{
			group: 'text',
			id: 'plain',
			placeholder: '…',
			formatter: function ( val ) {
				return optionalQuotes( val );
			}
		},
		{
			group: 'text',
			id: 'phrase',
			placeholder: '"…"',
			formatter: function ( val ) {
				if ( Array.isArray( val ) ) {
					return $.map( val, enforceQuotes ).join( ' ' );
				}
				return enforceQuotes( val );
			},
			init: function () {
				var widget = new mw.libs.advancedSearch.ui.ArbitraryWordInput(
					state,
					{ optionId: 'phrase' }
				);
				// TODO Move widget initialization to store, make widget listen to store.
				$.each( state.getOption( 'phrase' ), function () {
					widget.addTag( this );
				} );
				return widget;
			}
		},
		{
			group: 'text',
			id: 'not',
			placeholder: '-…',
			formatter: function ( val ) {
				return '-' + optionalQuotes( val );
			}
		},
		{
			group: 'text',
			id: 'fuzzy',
			placeholder: '…~2',
			formatter: function ( val ) {
				return optionalQuotes( val ) + '~2';
			}
		},

		// Structure
		{
			group: 'structure',
			id: 'prefix',
			placeholder: 'prefix:…',
			formatter: function ( val ) {
				return 'prefix:' + val;
			},
			greedy: true
		},
		{
			group: 'structure',
			id: 'intitle',
			placeholder: 'intitle:…',
			formatter: function ( val ) {
				return 'intitle:' + optionalQuotes( val );
			}
		},
		{
			group: 'structure',
			id: 'deepcat',
			placeholder: 'deepcat:…',
			/* enabled: function () {
			 return !!mw.libs.deepCat;
			 }, */
			formatter: function ( val ) {
				return 'deepcat:' + optionalQuotes( val );
			}
		},

		{
			group: 'structure',
			id: 'hastemplate',
			placeholder: 'hastemplate:…',
			formatter: function ( val ) {
				if ( Array.isArray( val ) ) {
					return $.map( val, function ( templateItem ) {
						return 'hastemplate:' + optionalQuotes( templateItem );
					} ).join( ' ' );
				}
				return 'hastemplate:' + optionalQuotes( val );
			},
			init: function () {
				var widget = new mw.libs.advancedSearch.ui.MenuedInput(
					templateModel,
					state,
					{ optionId: 'hastemplate' }
				);
				return widget;
			}
		},
		{
			group: 'structure',
			id: 'insource',
			placeholder: 'insource:…',
			formatter: function ( val ) {
				return 'insource:' + ( /^\/.*\/$/.test( val ) ? val : optionalQuotes( val ) );
			}
		},

		/*
		{
			group: 'categories',
			id: 'deepcat2',
			placeholder: 'deepcat:…',
			/* enabled: function () {
			 return !!mw.libs.deepCat;
			 },
			formatter: function ( val ) {
				return 'deepcat:' + optionalQuotes( val );
			}
		},
		{
			group: 'categories',
			id: 'incategory',
			placeholder: 'incategory:…',
			formatter: function ( val ) {
				return 'incategory:' + optionalQuotes( val );
			}
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
			requiredNamespace: 6
		},
		{
			group: 'files',
			id: 'filew',
			placeholder: 'filew:…',
			formatter: function ( val ) {
				return 'filew:' + formatSizeConstraint( val );
			},
			requiredNamespace: 6
		},
		{
			group: 'files',
			id: 'fileh',
			placeholder: 'fileh:…',
			formatter: function ( val ) {
				return 'fileh:' + formatSizeConstraint( val );
			},
			requiredNamespace: 6
		}
		/* {
			group: 'files',
			id: 'fileres',
			placeholder: 'fileres:…',
			formatter: function ( val ) {
				return 'fileres:' + formatSizeConstraint( val );
			},
			requiredNamespace: 6
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

			text: 'Seite enthält …',
			plain: 'Dieses Wort:',
			phrase: 'Genau diesen Text:',
			fuzzy: 'Ungefähr dieses Wort:',
			not: 'Nicht dieses Wort:',

			structure: 'Struktur',
			hastemplate: 'Nur Seiten mit dieser Vorlage:',
			insource: 'Suche im Wikitext:',
			prefix: 'Unterseiten von:',
			intitle: 'Seitentitel enthält:',
			deepcat: 'In dieser Kategorie:',
			deepcat2: 'Zweite Kategorie zur Querschnittssuche:',
			incategory: 'Nur direkt in dieser Kategorie:',

			files: 'Dateien',
			filetype: 'Dateien dieses Typs:',
			filew: 'Dateibreite in Pixel:',
			fileh: 'Dateihöhe in Pixel:',
			fileres: 'Diagonalauflösung in Pixel:'
		},
		en: {
			'advanced-search': 'Advanced Parameters',

			text: 'The page should include …',
			plain: 'This word:',
			phrase: 'Exactly this text:',
			fuzzy: 'One of those words:',
			not: 'Not this word:',

			structure: 'Structure',
			prefix: 'Subpages of this page:',
			intitle: 'Page title contains:',
			deepcat: 'Page in this category:',
			hastemplate: 'Only pages with this template:',
			incategory: 'Only in this category:',
			insource: 'Source code contains:',

			files: 'Files and Images',
			filetype: 'File type:',
			filew: 'File width in pixels:',
			fileh: 'File height in pixels:',
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
	 * @return {string[]}
	 */
	function formatSearchOptions() {
		var queryElements = [],
			greedyQuery = null;

		advancedOptions.forEach( function ( option ) {
			var val = state.getOption( option.id );

			if ( val ) {
				// FIXME: Should fail if there is more than one greedy option!
				if ( option.greedy && !greedyQuery ) {
					greedyQuery = option.formatter( val );
				} else {
					queryElements.push( option.formatter( val ) );
				}

				if ( option.requiredNamespace ) {
					$( '#mw-search-ns' + option.requiredNamespace ).prop( 'checked', true );
				}
			}
		} );

		if ( greedyQuery ) {
			queryElements.push( greedyQuery );
		}

		return queryElements;
	}

	var $search = $( 'form#search, form#powersearch' ),
		$searchField = $search.find( 'input[name="search"]' ),
		optionSets = {};

	$searchField.val( mw.util.getParamValue( 'advancedSearchOption-original' ) );

	advancedOptions.forEach( function ( option ) {
		if ( option.enabled && !option.enabled() ) {
			return;
		}

		var widgetInit = option.init || function () {
			var id = 'advancedSearchOption-' + option.id;
			return new OO.ui.TextInputWidget( {
				id: id,
				// TODO: These names are to long.
				name: id,
				value: mw.util.getParamValue( id )
			} );
		},
		widget = widgetInit();
		widget.on( 'change', createMultiSelectChangeHandler( option.id ) );

		if ( !optionSets[ option.group ] ) {
			optionSets[ option.group ] = new OO.ui.FieldsetLayout( {
				label: msg( option.group )
			} );
		}

		optionSets[ option.group ].addItems( [
			new OO.ui.FieldLayout( widget, {
				label: msg( option.id ),
				align: 'right',
				help: msg( option.id +  '_help' )
			} )
		] );
	} );

	var $allOptions = $( '<div>' ).prop( { 'class': 'advancedSearch-fieldContainer' } );

	for ( var group in optionSets ) {
		$allOptions.append( optionSets[ group ].$element );
	}

	var $advancedButtonLabel = $( '<span>' ).prop( { 'class': 'advancedSearch-optionTags' } ),
		advancedButton = new OO.ui.ButtonWidget( {
			$label: $advancedButtonLabel,
			label: msg( 'advanced-search' ),
			indicator: 'down'
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
		display: 'block',
		'text-align': 'left'
	} );
	$search.append( $advancedButton, $allOptions );

	function updateAdvancedButtonLabel() {
		$advancedButtonLabel.empty();
		$advancedButtonLabel.text( msg( 'advanced-search' ) );
		if ( !$allOptions.is( ':visible' ) ) {
			var searchOptions = formatSearchOptions();
			for ( var i = 0; i < searchOptions.length; i++ ) {
				$advancedButtonLabel.append( $( '<span>' ).text( searchOptions[ i ] ) );
			}
		}
	}

	updateAdvancedButtonLabel();
	advancedButton.on( 'click', function () {
		$allOptions.toggle();
		updateAdvancedButtonLabel();
	} );

	$search.on( 'submit', function () {
		var compiledQuery = $.trim( $searchField.val() + ' ' + formatSearchOptions().join( ' ' ) ),
			$compiledSearchField = $( '<input>' ).prop( {
				name: $searchField.prop( 'name' ),
				type: 'hidden'
			} ).val( compiledQuery );

		$searchField.prop( 'name', 'advancedSearchOption-original' )
			.after( $compiledSearchField );

		// Copy to the top-right search box for the sake of completeness
		$( '#searchInput' ).val( compiledQuery );
	} );

	// TODO Move this element into an OOUI component with the state as constructor param
	var $currentSearch = $( '<input>' ).prop( {
		name: 'advancedSearch-current',
		type: 'hidden'
	} );

	state.on( 'update', function ( evt ) {
		$currentSearch.val( state.toJSON() );
	} );
	$search.append( $currentSearch );

	mw.loader.load( '//de.wikipedia.org/w/index.php?title=MediaWiki:Gadget-DeepCat.js&action=raw&ctype=text/javascript' );
} )( mediaWiki, jQuery );
