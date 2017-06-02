( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.ui = mw.libs.advancedSearch.ui || {};

	/**
	 * @class
	 * @extends {OO.ui.Widget}
	 * @mixins {OO.ui.mixin.GroupElement}
	 * @constructor
	 *
	 * @param  {ext.advancedSearch.dm.SearchModel} store
	 * @param  {Object} config
	 */
	mw.libs.advancedSearch.ui.FormPane = function ( store, config ) {
		this.store = store;

		store.connect( this, { update: 'onStoreUpdate' } );

		mw.libs.advancedSearch.ui.FormPane.parent.call( this, config );
		OO.ui.mixin.GroupElement.call( this, config );

		var $bar = $( '<div></div>' )
			.addClass( 'oo-ui-buttonElement-button' )
			.addClass( 'advancedSearch-filterBar' )
			.on( 'click', function () { console.log( 'clicked', this ); } );

		var $labelContainer = $( '<div><strong>Advanced Parameters</strong></div>' );
		$bar.append( $labelContainer );

		var dummyDemoWidgets = [
			new OO.ui.TagItemWidget( { label: 'First demo label: foo' } ),
			new OO.ui.TagItemWidget( { label: 'Second demo label: bar' } ),
			new OO.ui.TagItemWidget( { label: 'Third demo label: baz' } ),
			new OO.ui.TagItemWidget( { label: 'Fourth demo label: quux' } ),
			new OO.ui.TagItemWidget( { label: 'Fivth demo label: quaux' } )
		];

		$.each( dummyDemoWidgets, function ( _, w ) {
			// TODO Create custom TagItemWidget classes that have special classes (for styling) and disable clicking
			w.$element.on( 'click', function () { return false; } );
			w.$element.addClass( 'advancedSearch-previewLabel' );
			$labelContainer.append( w.$element );
		} );

		this.$group.addClass( 'advancedSearch-fieldContainer' );
		this.$element.addClass( 'oo-ui-buttonElement-framed' );
		this.$element.append( $bar ).append( this.$group );
	};

	OO.inheritClass( mw.libs.advancedSearch.ui.FormPane, OO.ui.Widget );
	OO.mixinClass( mw.libs.advancedSearch.ui.FormPane, OO.ui.mixin.GroupElement );
	// TODO add indicator mixin

	mw.libs.advancedSearch.ui.FormPane.prototype.onStoreUpdate = function () {
		// TODO update preview
	};

} )( mediaWiki );
