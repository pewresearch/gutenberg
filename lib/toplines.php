<?php
/**
 * Toplines support for posts.
 *
 * Allows posts to have multiple toplines. Each topline is a string of key findings
 * or summary text. The /topline endpoint returns all toplines associated with a parent post.
 *
 * @package gutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Silence is golden.' );
}

/**
 * Registers the toplines post meta field.
 *
 * Toplines are stored as a JSON array of strings. Each post can have multiple toplines.
 */
function gutenberg_register_toplines_post_meta() {
	$post_types = get_post_types( array( 'show_in_rest' => true ) );
	foreach ( $post_types as $post_type ) {
		if (
			post_type_supports( $post_type, 'editor' ) &&
			post_type_supports( $post_type, 'custom-fields' ) &&
			post_type_supports( $post_type, 'revisions' )
		) {
			register_post_meta(
				$post_type,
				'toplines',
				array(
					'show_in_rest'      => true,
					'single'            => true,
					'type'              => 'string',
					'revisions_enabled' => true,
					'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
						return current_user_can( 'edit_post', $post_id );
					},
					'sanitize_callback' => 'gutenberg_sanitize_toplines_meta',
				)
			);
		}
	}
}

/**
 * Sanitizes the toplines meta value.
 *
 * Accepts either a JSON-encoded array of strings (from database/legacy) or an array
 * (from REST API). Validates and sanitizes each topline. Stored as JSON string.
 *
 * @param mixed $value The raw meta value (string or array from REST).
 * @return string Sanitized JSON string, or empty string if invalid.
 */
function gutenberg_sanitize_toplines_meta( $value ) {
	if ( is_string( $value ) ) {
		$decoded = json_decode( $value, true );
	} elseif ( is_array( $value ) ) {
		$decoded = $value;
	} else {
		return '';
	}

	if ( ! is_array( $decoded ) ) {
		return '';
	}

	$sanitized = array();
	foreach ( $decoded as $topline ) {
		if ( is_string( $topline ) ) {
			$sanitized[] = wp_kses_post( $topline );
		} elseif ( is_array( $topline ) && isset( $topline['text'] ) ) {
			$sanitized[] = wp_kses_post( $topline['text'] );
		}
	}

	return wp_json_encode( array_values( $sanitized ) );
}

/**
 * Registers the REST API endpoint for fetching toplines by parent post.
 *
 * GET /wp/v2/topline?parent=<post_id> returns all toplines for the given post.
 */
function gutenberg_register_toplines_rest_routes() {
	register_rest_route(
		'wp/v2',
		'/topline',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'gutenberg_rest_get_toplines',
				'permission_callback' => 'gutenberg_rest_toplines_permissions_check',
				'args'                => array(
					'parent' => array(
						'description'       => __( 'The ID of the parent post.', 'gutenberg' ),
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
						'validate_callback' => function ( $param ) {
							return $param > 0;
						},
					),
					'context' => array(
						'description' => __( 'Scope under which the request is made.', 'gutenberg' ),
						'type'       => 'string',
						'default'    => 'view',
						'enum'       => array( 'view', 'edit' ),
					),
				),
			),
			'schema' => 'gutenberg_get_toplines_rest_schema',
		)
	);
}

/**
 * Permissions check for the toplines endpoint.
 *
 * @param WP_REST_Request $request Full request object.
 * @return true|WP_Error True if the request has read access, WP_Error otherwise.
 */
function gutenberg_rest_toplines_permissions_check( $request ) {
	$parent_id = $request->get_param( 'parent' );
	$post      = get_post( $parent_id );

	if ( ! $post ) {
		return new WP_Error(
			'rest_post_invalid_id',
			__( 'Invalid parent post ID.', 'gutenberg' ),
			array( 'status' => 404 )
		);
	}

	if ( 'edit' === $request->get_param( 'context' ) ) {
		if ( ! current_user_can( 'edit_post', $parent_id ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to edit this post.', 'gutenberg' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}
	} else {
		if ( ! current_user_can( 'read_post', $parent_id ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to read this post.', 'gutenberg' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}
	}

	return true;
}

/**
 * REST API callback to get all toplines for a parent post.
 *
 * @param WP_REST_Request $request Full request object.
 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error on failure.
 */
function gutenberg_rest_get_toplines( $request ) {
	$parent_id = $request->get_param( 'parent' );
	$toplines  = gutenberg_get_post_toplines( $parent_id );

	$data = array(
		'parent'   => (int) $parent_id,
		'toplines' => $toplines,
	);

	return rest_ensure_response( $data );
}

/**
 * Retrieves all toplines for a post.
 *
 * @param int $post_id The post ID.
 * @return array Array of topline strings.
 */
function gutenberg_get_post_toplines( $post_id ) {
	$raw = get_post_meta( $post_id, 'toplines', true );
	if ( empty( $raw ) ) {
		return array();
	}

	$decoded = json_decode( $raw, true );
	if ( ! is_array( $decoded ) ) {
		return array();
	}

	return array_values( array_filter( array_map( function ( $item ) {
		return is_string( $item ) ? $item : '';
	}, $decoded ) ) );
}

/**
 * Schema for the toplines REST endpoint.
 *
 * @return array Schema definition.
 */
function gutenberg_get_toplines_rest_schema() {
	return array(
		'$schema'    => 'http://json-schema.org/draft-04/schema#',
		'title'      => 'toplines',
		'type'       => 'object',
		'properties' => array(
			'parent'  => array(
				'description' => __( 'The ID of the parent post.', 'gutenberg' ),
				'type'        => 'integer',
				'context'    => array( 'view', 'edit' ),
			),
			'toplines' => array(
				'description' => __( 'All toplines associated with the parent post.', 'gutenberg' ),
				'type'        => 'array',
				'items'       => array(
					'type' => 'string',
				),
				'context'    => array( 'view', 'edit' ),
			),
		),
	);
}

/**
 * Prepares the toplines meta value for REST responses.
 *
 * Converts the stored JSON string to an array for the REST API so that
 * meta.toplines is returned as an array of strings rather than raw JSON.
 *
 * @param WP_REST_Response $response The response object.
 * @param WP_Post          $post     Post object.
 * @param WP_REST_Request   $request  Request object.
 * @return WP_REST_Response Modified response.
 */
function gutenberg_prepare_toplines_for_rest( $response, $post, $request ) {
	if ( isset( $post->ID ) && isset( $response->data['meta']['toplines'] ) ) {
		$response->data['meta']['toplines'] = gutenberg_get_post_toplines( $post->ID );
	}
	return $response;
}

add_action( 'init', 'gutenberg_register_toplines_post_meta', 20 );
add_action( 'rest_api_init', 'gutenberg_register_toplines_rest_routes' );
add_action( 'rest_api_init', 'gutenberg_add_toplines_rest_prepare_filters' );

/**
 * Adds rest_prepare filters for all post types that support toplines.
 */
function gutenberg_add_toplines_rest_prepare_filters() {
	$post_types = get_post_types( array( 'show_in_rest' => true ) );
	foreach ( $post_types as $post_type ) {
		if (
			post_type_supports( $post_type, 'editor' ) &&
			post_type_supports( $post_type, 'custom-fields' ) &&
			post_type_supports( $post_type, 'revisions' )
		) {
			add_filter( "rest_prepare_{$post_type}", 'gutenberg_prepare_toplines_for_rest', 10, 3 );
		}
	}
}
