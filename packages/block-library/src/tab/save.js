/**
 * WordPress dependencies
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { anchor, slug } = attributes;
	const tabPanelId = anchor || slug;

	// eslint-disable-next-line react-compiler/react-compiler
	const blockProps = useBlockProps.save();
	// eslint-disable-next-line react-compiler/react-compiler
	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <section { ...innerBlocksProps } id={ tabPanelId } />;
}
