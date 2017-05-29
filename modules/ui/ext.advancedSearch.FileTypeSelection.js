( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.Widget}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.FileTypeSelection = function ( store, config ) {
		config = config || {};
		this.store = store;
		this.optionId = config.optionId;

		store.connect( this, { update: 'onStoreUpdate' } );

		// Parent constructor
		mw.libs.advancedSearch.ui.FileTypeSelection.parent.call( this, config );

		var $presetContainer =  $( '<div class="advancedSearch-filetype-presets"></div>' ),
			$filetypeContainer = $( '<div class="advancedSearch-filetype-selection"></div>' );

		this.$element.append( $presetContainer ).append( $filetypeContainer );
		this.presets = new OO.ui.CheckboxMultiselectInputWidget( {
			options: [
				{ data: 'image', label: mw.msg( 'advancedsearch-filetype-preset-image' ) },
				{ data: 'video', label: mw.msg( 'advancedsearch-filetype-preset-video' ) },
				{ data: 'sound', label: mw.msg( 'advancedsearch-filetype-preset-sound' ) },
				{ data: 'document', label: mw.msg( 'advancedsearch-filetype-preset-document' ) }
			]
		} );
		this.fileTypeInput = new OO.ui.MenuTagMultiselectWidget( {
			options: [
				{ data: 'bitmap', label: 'Bitmap' },
				{ data: 'drawing', label: 'Drawing' },
				{ data: 'video', label: 'Video' },
				{ data: 'audio', label: 'Audio' }
			]
		} );
		$presetContainer.append( this.presets.$element );
		$filetypeContainer.append( this.fileTypeInput.$element );


		this.populateFromStore();
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.FileTypeSelection, OO.ui.Widget );

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.onPresetChange = function ( evt ) {
		console.log("Presets changed", evt);
		// TODO update store
	};

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.onStoreUpdate = function () {
		this.populateFromStore();
	};

	mw.libs.advancedSearch.ui.FileTypeSelection.prototype.populateFromStore = function () {
		// TODO
	};

} )( mediaWiki );
