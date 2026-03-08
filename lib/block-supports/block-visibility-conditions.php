<?php
/**
 * Block Visibility Conditions Registry.
 *
 * @package gutenberg
 */

/**
 * Registry for block visibility conditions.
 *
 * This class manages the registration of custom visibility condition types
 * that can be used to control block visibility beyond the built-in viewport conditions.
 *
 * @since 6.9.0
 */
class WP_Block_Visibility_Conditions_Registry {
	/**
	 * Singleton instance.
	 *
	 * @var WP_Block_Visibility_Conditions_Registry|null
	 */
	private static $instance = null;

	/**
	 * Registered visibility conditions.
	 *
	 * @var array
	 */
	private $conditions = array();

	/**
	 * Private constructor to enforce singleton pattern.
	 */
	private function __construct() {}

	/**
	 * Gets the singleton instance of the registry.
	 *
	 * @return WP_Block_Visibility_Conditions_Registry The singleton instance.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Registers a new visibility condition type.
	 *
	 * @param string $slug Unique slug for this condition (e.g., 'userRole', 'schedule').
	 * @param array  $args {
	 *     Configuration array for the visibility condition.
	 *
	 *     @type string   $label           Human-readable name for the condition.
	 *     @type callable $render_callback Called during render_block to decide visibility.
	 *                                     Receives ( $block_content, $block, $condition_value )
	 *                                     and must return $block_content (possibly empty string to hide).
	 * }
	 * @return bool True on success, false if slug already registered.
	 */
	public function register( $slug, $args ) {
		if ( isset( $this->conditions[ $slug ] ) ) {
			_doing_it_wrong(
				__METHOD__,
				sprintf(
					/* translators: %s: visibility condition slug */
					__( 'Visibility condition "%s" is already registered.', 'gutenberg' ),
					$slug
				),
				'6.9.0'
			);
			return false;
		}

		$this->conditions[ $slug ] = wp_parse_args(
			$args,
			array(
				'label'           => $slug,
				'render_callback' => null,
			)
		);

		return true;
	}

	/**
	 * Unregisters a visibility condition type.
	 *
	 * @param string $slug The slug of the condition to unregister.
	 * @return bool True on success, false if condition was not registered.
	 */
	public function unregister( $slug ) {
		if ( ! isset( $this->conditions[ $slug ] ) ) {
			_doing_it_wrong(
				__METHOD__,
				sprintf(
					/* translators: %s: visibility condition slug */
					__( 'Visibility condition "%s" is not registered.', 'gutenberg' ),
					$slug
				),
				'6.9.0'
			);
			return false;
		}

		unset( $this->conditions[ $slug ] );
		return true;
	}

	/**
	 * Gets all registered visibility conditions.
	 *
	 * @return array Array of registered conditions.
	 */
	public function get_registered() {
		return $this->conditions;
	}

	/**
	 * Gets a specific registered visibility condition.
	 *
	 * @param string $slug The slug of the condition to retrieve.
	 * @return array|null The condition configuration, or null if not found.
	 */
	public function get( $slug ) {
		return $this->conditions[ $slug ] ?? null;
	}

	/**
	 * Checks if a visibility condition is registered.
	 *
	 * @param string $slug The slug of the condition to check.
	 * @return bool True if the condition is registered, false otherwise.
	 */
	public function is_registered( $slug ) {
		return isset( $this->conditions[ $slug ] );
	}
}

/**
 * Registers a block visibility condition.
 *
 * This function allows plugins and themes to register custom visibility conditions
 * that can control when blocks are shown or hidden on the frontend.
 *
 * Example:
 * ```php
 * register_block_visibility_condition( 'userRole', array(
 *     'label'           => __( 'User Role', 'my-plugin' ),
 *     'render_callback' => function ( $block_content, $block, $condition_value ) {
 *         $current_user = wp_get_current_user();
 *         $current_roles = $current_user->roles;
 *
 *         foreach ( $condition_value as $role => $is_visible ) {
 *             if ( false === $is_visible && in_array( $role, $current_roles, true ) ) {
 *                 return ''; // Hidden for this role.
 *             }
 *         }
 *         return $block_content;
 *     },
 * ) );
 * ```
 *
 * @since 6.9.0
 *
 * @param string $slug Unique slug for this condition.
 * @param array  $args Configuration array for the visibility condition.
 * @return bool True on success, false on failure.
 */
function register_block_visibility_condition( $slug, $args ) {
	return WP_Block_Visibility_Conditions_Registry::get_instance()->register( $slug, $args );
}

/**
 * Unregisters a block visibility condition.
 *
 * @since 6.9.0
 *
 * @param string $slug The slug of the condition to unregister.
 * @return bool True on success, false on failure.
 */
function unregister_block_visibility_condition( $slug ) {
	return WP_Block_Visibility_Conditions_Registry::get_instance()->unregister( $slug );
}
