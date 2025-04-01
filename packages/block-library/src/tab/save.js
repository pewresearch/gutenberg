/**
 * WordPress dependencies
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	getTypographyClassesAndStyles as useTypographyProps,
} from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { anchor } = attributes;
	const typographyProps = useTypographyProps( attributes );

	const tabPanelId = anchor;

	// eslint-disable-next-line react-compiler/react-compiler
	const blockProps = useBlockProps.save( {
		className: typographyProps.className,
		style: { ...typographyProps.style },
	} );
	// eslint-disable-next-line react-compiler/react-compiler
	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <section { ...innerBlocksProps } id={ tabPanelId } />;
}
