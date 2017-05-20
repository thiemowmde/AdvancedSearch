( function ( mw ) {
	'use strict';

	mw.libs = mw.libs || {};
	mw.libs.advancedSearch = mw.libs.advancedSearch || {};
	mw.libs.advancedSearch.dm = mw.libs.advancedSearch.dm || {};

	mw.libs.advancedSearch.dm.SearchModel = function () {
		this.searchOptions = {};

		// Mixin constructor
		OO.EventEmitter.call( this );
	};

	/* Initialization */

	OO.initClass( mw.libs.advancedSearch.dm.SearchModel );
	OO.mixinClass( mw.libs.advancedSearch.dm.SearchModel, OO.EventEmitter );

	mw.libs.advancedSearch.dm.SearchModel.prototype.storeOption = function ( optionId, value ) {
		// TODO check for allwed options?
		this.searchOptions[ optionId ] = value;
		this.emit( 'update' );
	};

	mw.libs.advancedSearch.dm.SearchModel.prototype.getOption = function ( optionId ) {
		return this.searchOptions[ optionId ];
	};

	mw.libs.advancedSearch.dm.SearchModel.prototype.toJSON = function () {
		return JSON.stringify( this.searchOptions );
	};

} )( mediaWiki );
