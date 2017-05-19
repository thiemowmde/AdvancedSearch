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
		$outputPage->addModules( 'ext.advancedSearch.init' );
	}

}
