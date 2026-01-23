/**
 * WordPress dependencies
 */
import {
	store,
	getContext,
	getElement,
	withSyncEvent,
} from '@wordpress/interactivity';

const { state: privateState, actions: privateActions } = store(
	'core/dialog/private',
	{
		callbacks: {
			/**
			 * Handles click on the backdrop element to close the dialog.
			 * This is for the dialog-backdrop block wrapper.
			 *
			 * @param {Event} event The click event.
			 */
			onBackdropWrapperClick: withSyncEvent( ( event ) => {
				const { ref } = getElement();

				// Only close if clicking directly on the backdrop, not on child elements
				if ( event.target !== ref ) {
					return;
				}

				const context = getContext();
				const dialogId = context?.id;

				if ( ! dialogId ) {
					return;
				}

				const dialog = privateState.dialogs[ dialogId ];
				if ( ! dialog?.isOpen || dialog?.isClosing ) {
					return;
				}

				privateActions.close( dialogId );
			} ),
		},
	},
	{
		lock: true,
	}
);
