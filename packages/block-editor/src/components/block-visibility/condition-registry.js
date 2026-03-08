/**
 * Registry for block visibility conditions on the client side.
 *
 * Each condition registers:
 * - slug:        Unique key (matches PHP slug and the key in blockVisibility metadata).
 * - label:       Human-readable group label shown in the modal.
 * - options:     Array of { key, label, icon? } items that become checkboxes.
 * - description: Optional help text shown when conditions are active.
 * - priority:    Controls ordering in the modal (lower = higher). Default: 10.
 * - render:      Optional React component for custom UI instead of default checkboxes.
 *
 * @package gutenberg
 */

/**
 * Map of registered conditions.
 */
const registeredConditions = new Map();

/**
 * Registers a block visibility condition.
 *
 * @param {string} slug   Unique slug for this condition.
 * @param {Object} config Configuration object for the condition.
 * @param {string} config.label       Human-readable label for the condition.
 * @param {Array}  config.options     Array of { key, label, icon? } for checkbox options.
 * @param {string} config.description Optional description text.
 * @param {number} config.priority    Optional priority for ordering (default: 10).
 * @param {Function} config.render    Optional custom React component for rendering.
 */
export function registerBlockVisibilityCondition( slug, config ) {
	if ( registeredConditions.has( slug ) ) {
		// eslint-disable-next-line no-console
		console.warn(
			`Block visibility condition "${ slug }" is already registered.`
		);
		return;
	}

	registeredConditions.set( slug, {
		slug,
		label: config.label,
		options: config.options ?? [],
		description: config.description ?? null,
		priority: config.priority ?? 10,
		render: config.render ?? null,
	} );
}

/**
 * Unregisters a block visibility condition.
 *
 * @param {string} slug The slug of the condition to unregister.
 */
export function unregisterBlockVisibilityCondition( slug ) {
	registeredConditions.delete( slug );
}

/**
 * Gets all registered visibility conditions, sorted by priority.
 *
 * @return {Array} Array of registered conditions.
 */
export function getRegisteredConditions() {
	return Array.from( registeredConditions.values() ).sort(
		( a, b ) => a.priority - b.priority
	);
}

/**
 * Gets a specific registered visibility condition.
 *
 * @param {string} slug The slug of the condition to retrieve.
 * @return {Object|null} The condition configuration, or null if not found.
 */
export function getRegisteredCondition( slug ) {
	return registeredConditions.get( slug ) ?? null;
}
