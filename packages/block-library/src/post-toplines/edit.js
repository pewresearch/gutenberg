/**
 * WordPress dependencies
 */
import { useEntityProp, store as coreStore } from '@wordpress/core-data';
import {
	BlockControls,
	RichText,
	Warning,
	useBlockProps,
	useBlockEditingMode,
} from '@wordpress/block-editor';
import {
	Button,
	ToolbarGroup,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { useCanEditEntity } from '../utils/hooks';

export default function PostToplinesEditor( {
	context: { postId, postType, queryId },
} ) {
	const blockEditingMode = useBlockEditingMode();
	const showControls = blockEditingMode === 'default';
	const isDescendentOfQueryLoop = Number.isFinite( queryId );
	const userCanEdit = useCanEditEntity( 'postType', postType, postId );

	const [ meta, setMeta ] = useEntityProp(
		'postType',
		postType,
		'meta',
		postId
	);
	const toplines = Array.isArray( meta?.toplines ) ? meta.toplines : [];

	const postTypeSupportsToplines = useSelect(
		( select ) =>
			!! select( coreStore ).getPostType( postType )?.supports
				?.customFields,
		[ postType ]
	);

	const isEditable =
		userCanEdit && ! isDescendentOfQueryLoop && postTypeSupportsToplines;

	const setToplines = ( newToplines ) => {
		setMeta( { ...meta, toplines: newToplines } );
	};

	const updateTopline = ( index, value ) => {
		const updated = [ ...toplines ];
		updated[ index ] = value;
		setToplines( updated );
	};

	const addTopline = () => {
		setToplines( [ ...toplines, '' ] );
	};

	const removeTopline = ( index ) => {
		setToplines( toplines.filter( ( _, i ) => i !== index ) );
	};

	const blockProps = useBlockProps();

	if ( ! postType || ! postId ) {
		return (
			<div { ...blockProps }>
				<p>{ __( 'This block will display the post toplines.' ) }</p>
			</div>
		);
	}

	if ( ! postTypeSupportsToplines ) {
		return (
			<div { ...blockProps }>
				<Warning>
					{ __(
						'The post type does not support custom fields. Toplines require custom-fields support.'
					) }
				</Warning>
			</div>
		);
	}

	if ( isEditable && toplines.length === 0 && showControls ) {
		return (
			<>
				<BlockControls />
				<div { ...blockProps }>
					<div className="wp-block-post-toplines__empty-state">
						<p>{ __( 'No toplines yet.' ) }</p>
						<Button
							variant="primary"
							icon={ plus }
							onClick={ addTopline }
							__next40pxDefaultSize
						>
							{ __( 'Add Topline' ) }
						</Button>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			{ showControls && (
				<BlockControls group="block">
					<ToolbarGroup>
						<Button
							icon={ plus }
							onClick={ addTopline }
							label={ __( 'Add topline' ) }
							__next40pxDefaultSize
						/>
					</ToolbarGroup>
				</BlockControls>
			) }
			<div { ...blockProps }>
				<ul className="wp-block-post-toplines__list">
					{ toplines.map( ( topline, index ) => (
						<li
							key={ index }
							className="wp-block-post-toplines__item"
						>
							{ isEditable ? (
								<HStack spacing={ 2 } align="flex-start">
									<RichText
										className="wp-block-post-toplines__text"
										tagName="span"
										value={ topline }
										onChange={ ( value ) =>
											updateTopline( index, value )
										}
										placeholder={ __( 'Enter topline…' ) }
										allowedFormats={ [] }
										preserveWhiteSpace
									/>
									<Button
										variant="tertiary"
										isDestructive
										size="small"
										onClick={ () => removeTopline( index ) }
										label={ __( 'Remove topline' ) }
										aria-label={ __( 'Remove topline' ) }
									>
										{ __( 'Remove' ) }
									</Button>
								</HStack>
							) : (
								<span className="wp-block-post-toplines__text">
									{ topline || __( '(Empty topline)' ) }
								</span>
							) }
						</li>
					) ) }
				</ul>
			</div>
		</>
	);
}
