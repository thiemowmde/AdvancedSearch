<?php

namespace AdvancedSearch;

use OutputPage;
use Skin;

class Hooks {

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 *
	 * @param OutputPage $outputPage
	 * @param Skin $skin
	 */
	public static function onBeforePageDisplay( OutputPage $outputPage, Skin $skin ) {
		// TODO: Is it ok to just compare this as a string?
		if ( $outputPage->getTitle()->getFullText() === 'Special:Search' ) {
			$outputPage->addModules( 'ext.advancedSearch.init' );
		}
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialSearchPowerBox
	 *
	 * @param string[] &$showSections
	 * @param string $term
	 * @param string[] $opts
	 */
	public static function onSpecialSearchPowerBox( &$showSections, $term, $opts ) {
		// $showSections = [];
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SpecialSearchProfiles
	 *
	 * @param array[] &$profiles
	 */
	public static function onSpecialSearchProfiles( array &$profiles ) {
		$profiles = [];
	}

}
