/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { CheckboxControl, Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */

/**
 * Component for rendering a single visibility condition section in the modal.
 *
 * Renders either a custom component (if provided via condition.render) or a default
 * list of checkboxes based on the condition's options.
 *
 * @param {Object}   props           Component props.
 * @param {Object}   props.condition The condition configuration object.
 * @param {Object}   props.state     The current state for this condition's checkboxes.
 * @param {Function} props.onChange  Callback when a checkbox changes (key, isChecked).
 * @return {React.JSX.Element|null} The condition section component or null.
 */
export default function ConditionSection( { condition, state, onChange } ) {
	// If the condition registered a custom React component, use it.
	if ( condition.render ) {
		const CustomRender = condition.render;
		return <CustomRender state={ state } onChange={ onChange } />;
	}

	// Default: render a group of checkboxes for this condition's options.
	if ( ! condition.options || condition.options.length === 0 ) {
		return null;
	}

	return (
		<ul className="block-editor-block-visibility-modal__sub-options">
			{ condition.options.map( ( { key, label, icon } ) => (
				<li
					key={ key }
					className="block-editor-block-visibility-modal__options-item"
				>
					<CheckboxControl
						label={ sprintf(
							// translators: %s: The option name (e.g., "Desktop", "Mobile").
							__( 'Hide on %s' ),
							label
						) }
						checked={ state?.[ key ] === true }
						indeterminate={ state?.[ key ] === null }
						onChange={ ( checked ) => onChange( key, checked ) }
					/>
					{ icon && (
						<Icon
							icon={ icon }
							className={ clsx( {
								'block-editor-block-visibility-modal__options-icon--checked':
									state?.[ key ],
							} ) }
						/>
					) }
				</li>
			) ) }
		</ul>
	);
}
