( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.DropdownWidget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.FileTypeSelection = function ( store, config ) {
		var myConfig = $.extend( {
			'menu': {
				items: [
					new OO.ui.MenuSectionOptionWidget( {
						"label": mw.msg( 'advancedsearch-filetype-section-types' )
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "bitmap",
						"label": mw.msg( 'advancedsearch-filetype-bitmap' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "vector",
						"label": mw.msg( 'advancedsearch-filetype-vector' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "video",
						"label": mw.msg( 'advancedsearch-filetype-video' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "audio",
						"label": mw.msg( 'advancedsearch-filetype-audio' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "multimedia",
						"label": mw.msg( 'advancedsearch-filetype-multimedia' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "document",
						"label": mw.msg( 'advancedsearch-filetype-document' ),
					} ),

					new OO.ui.MenuSectionOptionWidget( {
						"label": mw.msg( 'advancedsearch-filetype-section-image' )
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "jpeg",
						"label": mw.msg( 'advancedsearch-filetype-bitmap-jpeg' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "tiff",
						"label": mw.msg( 'advancedsearch-filetype-bitmap-tiff' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "svg",
						"label": mw.msg( 'advancedsearch-filetype-vector-svg' ),
					} ),

					new OO.ui.MenuSectionOptionWidget( {
						"label": mw.msg( 'advancedsearch-filetype-section-sound' )
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "jpeg",
						"label": mw.msg( 'advancedsearch-filetype-audio-wav' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "tiff",
						"label": mw.msg( 'advancedsearch-filetype-audio-flac' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "svg",
						"label": mw.msg( 'advancedsearch-filetype-audio-midi' ),
					} ),

					new OO.ui.MenuSectionOptionWidget( {
						"label": mw.msg( 'advancedsearch-filetype-section-document' )
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "jpeg",
						"label": mw.msg( 'advancedsearch-filetype-document-pdf' ),
					} ),
					new OO.ui.MenuOptionWidget( {
						"data": "tiff",
						"label": mw.msg( 'advancedsearch-filetype-document-office' ),
					} )
				]
			}
		}, config );
		this.store = store;

		store.connect( this, { update: 'onStoreUpdate' } );

		// Parent constructor
		mw.libs.advancedSearch.ui.FileTypeSelection.parent.call( this, myConfig );

		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.FileTypeSelection, OO.ui.DropdownWidget );

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.populateFromStore = function () {
		// TODO
	};

} )( mediaWiki );
