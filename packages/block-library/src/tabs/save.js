/**
 * WordPress dependencies
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Save( {} ) {
	// eslint-disable-next-line react-compiler/react-compiler
	const blockProps = useBlockProps.save();

	// eslint-disable-next-line react-compiler/react-compiler
	const innerBlocksProps = useInnerBlocksProps.save( {} );

	return (
		<div { ...blockProps }>
			<h3 className="tabs__title">Contents</h3>
			<ul className="tabs__list"></ul>
			{ innerBlocksProps.children }
		</div>
	);
}
