( function ( mw, $ ) {
	'use strict';

	function isLoaded() {
		if ( !mw.libs ) {
			mw.libs = {};
		}
		if ( !mw.libs.advancedSearch ) {
			mw.libs.advancedSearch = {};
		}

		if ( mw.libs.advancedSearch.namespaceFiltersLoaded ) {
			return true;
		}
		mw.libs.advancedSearch.namespaceFiltersLoaded = true;

		return false;
	}

	if ( isLoaded() ) {
		return;
	}

	if ( mw.config.get( 'wgCanonicalSpecialPageName' ) !== 'Search' ) {
		return;
	}

	var presets = [
		{
			id: 'articles',
			filter: '#mw-search-ns0'
		},
		{
			id: 'images',
			filter: '#mw-search-ns6'
		},
		{
			id: 'project',
			filter: '#mw-search-ns4, #mw-search-ns10, #mw-search-ns12, #mw-search-ns100, #mw-search-ns102, #mw-search-ns828'
		},
		{
			id: 'talk',
			filter: function ( index, checkbox ) {
				return /[13579]$/.test( checkbox.id );
			}
		},
		{
			id: 'all',
			filter: '*'
		}
	];

	var i18n = {
		de: {
			articles: 'Artikel',
			images: 'Dateien',
			project: 'Projektnamensräume',
			talk: 'Diskussionsseiten',
			all: 'Alle',
			'search-in': 'Suche in:',
			'individual-namespaces': 'Individuelle Namensräume',
			blanknamespace: '(Artikel)'
		},
		en: {
			articles: 'Articles',
			images: 'Files',
			project: 'Project namespaces',
			talk: 'Talk pages',
			all: 'All',
			'search-in': 'Search in:',
			'individual-namespaces': 'Individual namespaces',
			blanknamespace: '(Article)'
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
	 * @return {integer[]}
	 */
	function getContentNamespaceNumbers() {
		var namespaces = mw.config.get( 'wgFormattedNamespaces' );

		return Object.keys( namespaces ).map( function ( ns ) {
			return ns | 0;
		} ).filter( function ( ns ) {
			// Must be an even, positive number. Must have a discussion namespace.
			return ns >= 0 && ( ns % 2 ) === 0 && namespaces[ ns + 1 ];
		} );
	}

	/**
	 * @param {integer} ns
	 * @return {jQuery}
	 */
	function createNamespaceTableCell( ns ) {
		return $( '<td>' ).append(
			$( '<input>' ).prop( {
				id: 'mw-search-ns' + ns,
				name: 'ns' + ns,
				type: 'checkbox',
				value: 1
			} ),
			' ',
			$( '<label>' ).prop( {
				for: 'mw-search-ns' + ns
			} ).text( mw.config.get( 'wgFormattedNamespaces' )[ ns ]
				|| msg( 'blanknamespace' ) )
		);
	}

	function updatePresetStates() {
		presets.forEach( function ( preset ) {
			var $checkboxGroup = $( '#mw-searchoptions input[id^=mw-search-ns]' )
				.filter( preset.filter ),
				allChecked = true;

			if ( !$checkboxGroup.length ) {
				return;
			}

			$checkboxGroup.each( function ( index, checkbox ) {
				if ( !checkbox.checked ) {
					allChecked = false;
					return false;
				}
			} );

			$( '#' + preset.id ).prop( 'checked', allChecked );
		} );
	}

	$( 'form#search input[name=profile][value=default]' ).val( 'advanced' );

	var $presetsBar = $( '.mw-search-profile-tabs' ),
		$individualNamespaces = $( '#mw-searchoptions' );

	if ( !$individualNamespaces.length ) {
		var $table = $( '<table>' );
		getContentNamespaceNumbers().forEach( function ( ns ) {
			$table.append( $( '<tr>' ).append(
				createNamespaceTableCell( ns ),
				createNamespaceTableCell( ns + 1 )
			) );
		} );
		$individualNamespaces = $( '<fieldset>' ).prop( {
			id: 'mw-searchoptions'
		} );
		$presetsBar.after( $individualNamespaces.append( $table ) );
	}

	$presetsBar.css( {
		'border-color': '#a2a9b1',
		'border-radius': '2px',
		'box-sizing': 'border-box',
		'margin-top': '0.3em',
		'max-width': '50em',
		padding: '0.4em 0.7em',
		'padding-right': '28px',
		position: 'relative'
	} )
	.append( $( '<b>' ).text( msg( 'search-in' ) ), '\n' );

	presets.forEach( function ( preset ) {
		var $checkbox = $( '<input>' )
			.attr( {
				id: preset.id,
				type: 'checkbox'
			} )
			.css( {
				'vertical-align': 'middle'
			} )
			.click( function ( e ) {
				e.stopPropagation();

				if ( !e.originalEvent ) {
					return;
				}

				$( '#mw-searchoptions input[id^=mw-search-ns]' )
					.filter( preset.filter )
					.prop( 'checked', e.target.checked );

				updatePresetStates();
			} ),
			$label = $( '<label>' )
				.attr( {
					for: preset.id
				} )
				.css( {
					cursor: 'pointer',
					padding: '0.4em 0.2em',
					'white-space': 'nowrap'
				} )
				.click( function ( e ) {
					e.stopPropagation();
				} )
				.append( $checkbox, '\n', msg( preset.id ) );

		$presetsBar.append( $label, '\n' );
	} );

	updatePresetStates();

	$( '.search-types, #mw-search-togglebox, #mw-search-togglebox + .divider' )
		.hide();

	var namespaceItems = [],
		selectedNamespaces = [];
	$.each( mw.config.get( 'wgFormattedNamespaces' ), function ( ns, label ) {
		// Cast to integer.
		ns = ns | 0;

		if ( ns < 0 ) {
			return;
		}
		var icon = null;
		if ( ns === 2 ) {
			icon = 'userAvatar';
		} else if ( ns === 3 ) {
			icon = 'userTalk';
		} else if ( ns === 6 ) {
			icon = 'image';
		} else if ( ns === 8 ) {
			icon = 'language';
		} else if ( ns === 10 || ns === 828 ) {
			icon = 'puzzle';
		} else if ( ns === 12 ) {
			icon = 'help';
		} else if ( label === 'Wikipedia' ) {
			icon = 'logoWikipedia';
		} else if ( ns % 2 ) {
			icon = 'stripeSummary';
		} else {
			icon = 'article';
		}
		namespaceItems.push( new OO.ui.MenuOptionWidget( {
			data: ns,
			label: label || msg( 'blanknamespace' ),
			icon: icon
		} ) );

		if ( mw.util.getParamValue( 'ns' + ns ) ) {
			selectedNamespaces.push( ns );
		}
	} );

	var multiselect = new OO.ui.CapsuleMultiselectWidget( {
		menu: { items: namespaceItems },
		placeholder: msg( 'individual-namespaces' )
	} )
	.addItemsFromData( selectedNamespaces )
	.on( 'change', function ( values ) {
		$( '#mw-searchoptions input[id^=mw-search-ns]' ).each( function ( index, checkbox ) {
			var ns = checkbox.name.replace( /^\D+/, '' ) | 0;
			checkbox.checked = values.indexOf( ns ) !== -1;
		} );
	} );
	multiselect.$element.css( {
		'margin-top': '-1px'
	} );
	$presetsBar.after( multiselect.$element );

} )( mediaWiki, jQuery );
