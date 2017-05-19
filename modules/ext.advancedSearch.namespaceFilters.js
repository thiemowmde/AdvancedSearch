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
		'de': {
			articles: 'Artikel',
			images: 'Dateien',
			project: 'Projektnamensräume',
			talk: 'Diskussionsseiten',
			all: 'Alle',
			'search-in': 'Suche in:',
			'individual-namespaces': 'Individuelle Namensräume:',
			'blanknamespace': '(Artikel)'
		},
		'en': {
			articles: 'Articles',
			images: 'Files',
			project: 'Project namespaces',
			talk: 'Talk pages',
			all: 'All',
			'search-in': 'Search in:',
			'individual-namespaces': 'Individual namespaces:',
			'blanknamespace': '(Article)'
		}
	};

	/**
	 * @param {string} key
	 * @return {string}
	 */
	function msg( key ) {
		var lang = mw.config.get( 'wgUserLanguage' );

		return i18n[lang] && i18n[lang][key] || i18n.en[key] || '<' + key + '>';
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
			return ns >= 0 && !( ns % 2 ) && namespaces[ns + 1];
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
			} ).text( mw.config.get( 'wgFormattedNamespaces' )[ns]
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
		$individualNamespaces = $( '#mw-searchoptions' ),
		$headline = $( '#mw-searchoptions h4' );

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
		$headline = $( '<h4>' );
		$presetsBar.after( $individualNamespaces.append( $headline, $table ) );
	}

	$headline.css( {
		color: '#666',
		float: 'none',
		'font-weight': 'normal',
		'margin-bottom': '0.3em'
	} );
	$individualNamespaces.css( {
			background: 'linear-gradient(rgba(0, 0, 0, 0.1), #fff 0.5em)',
			'box-sizing': 'border-box',
			'margin-top': '-1px',
			'max-width': '50em',
			'padding-top': '1em'
		} )
		.hide();
	$presetsBar.css( {
			'background-image': 'url(//de.wikipedia.org/w/load.php?modules=oojs-ui.styles.indicators&image=down)',
			'background-position': '99%',
			'background-repeat': 'no-repeat',
			'background-size': '18px',
			'border-color': '#a2a9b1',
			'border-radius': '2px',
			'box-sizing': 'border-box',
			cursor: 'pointer',
			'margin-top': '0.3em',
			'max-width': '50em',
			padding: '0.4em 0.7em',
			'padding-right': '28px',
			position: 'relative'
		} )
		.append( $( '<b>' ).text( msg( 'search-in' ) ), '\n' )
		.click( function ( e ) {
			$individualNamespaces.toggle();
		} );

	$headline.text( msg( 'individual-namespaces' ) );

	$individualNamespaces.find( 'table' ).css( {
		float: 'none',
		margin: 0
	} );
	$individualNamespaces.find( 'tr:first-child td:first-child' ).css( {
		'min-width': '12em'
	} );

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

	$( '#mw-searchoptions input[id^=mw-search-ns]' ).click( function ( e ) {
		if ( !e.originalEvent ) {
			return;
		}

		updatePresetStates();
	} );

	updatePresetStates();

	$( '.search-types, #mw-search-togglebox, #mw-search-togglebox + .divider' )
		.hide();

} )( mediaWiki, jQuery );
