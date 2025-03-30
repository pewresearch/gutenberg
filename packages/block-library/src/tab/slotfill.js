/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

/**
 * Props to @fabiankaegy for the SlotFill implementation https://github.com/WordPress/gutenberg/pull/63689#issuecomment-2268555989
 */
const { Fill, Slot } = createSlotFill( 'TabsList' );

export const TabFill = ( { children, tabsClientId } ) => {
	return <Fill name={ `TabsList-${ tabsClientId }` }>{ children }</Fill>;
};

export const TabsListSlot = ( { tabsClientId } ) => {
	return (
		<Slot
			name={ `TabsList-${ tabsClientId }` }
			bubblesVirtually
			as="ul"
			role="tablist"
			className="tabs__list"
		/>
	);
};
