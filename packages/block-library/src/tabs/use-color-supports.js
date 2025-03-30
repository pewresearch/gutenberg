const useColorSupports = ( attributes ) => {
	const {
		customTabBackgroundColor,
		customTabHoverColor,
		customTabActiveColor,
		customTabTextColor,
		customTabActiveTextColor,
		customTabHoverTextColor,
	} = attributes;
	const styles = {};
	if ( customTabBackgroundColor ) {
		if ( customTabBackgroundColor.slug ) {
			styles[
				'--custom-tab-background-color'
			] = `var( --wp--preset--color--${ customTabBackgroundColor.slug } );`;
		} else {
			styles[ '--custom-tab-background-color' ] =
				customTabBackgroundColor;
		}
	}
	if ( customTabActiveColor ) {
		if ( customTabActiveColor.slug ) {
			styles[
				'--custom-tab-active-color'
			] = `var( --wp--preset--color--${ customTabActiveColor.slug } );`;
		} else {
			styles[ '--custom-tab-active-color' ] = customTabActiveColor;
		}
	}

	if ( customTabHoverColor ) {
		if ( customTabHoverColor.slug ) {
			styles[
				'--custom-tab-hover-color'
			] = `var( --wp--preset--color--${ customTabHoverColor.slug } );`;
		} else {
			styles[ '--custom-tab-hover-color' ] = customTabHoverColor;
		}
	}

	if ( customTabTextColor ) {
		if ( customTabTextColor.slug ) {
			styles[
				'--custom-tab-text-color'
			] = `var( --wp--preset--color--${ customTabTextColor.slug } );`;
		} else {
			styles[ '--custom-tab-text-color' ] = customTabTextColor;
		}
	}

	if ( customTabActiveTextColor ) {
		if ( customTabActiveTextColor.slug ) {
			styles[
				'--custom-tab-active-text-color'
			] = `var( --wp--preset--color--${ customTabActiveTextColor.slug } );`;
		} else {
			styles[ '--custom-tab-active-text-color' ] =
				customTabActiveTextColor;
		}
	}

	if ( customTabHoverTextColor ) {
		if ( customTabHoverTextColor.slug ) {
			styles[
				'--custom-tab-hover-text-color'
			] = `var( --wp--preset--color--${ customTabHoverTextColor.slug } );`;
		} else {
			styles[ '--custom-tab-hover-text-color' ] = customTabHoverTextColor;
		}
	}

	return styles;
};

export default useColorSupports;
