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

}
