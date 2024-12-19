/**
 * Internal dependencies
 */
// import './style.scss';
import registerTabLabelBinding from './binding';
import edit from './edit';
import icon from './icon';
import save from './save';
import initBlock from '../utils/init-block';
import metadata from './block.json';

const { name } = metadata;

/**
 * This is an extra, but useful, block binding that allows us to use the tab label elsewhere inside a tab's content.
 */
registerTabLabelBinding();

export { metadata, name };

export const settings = {
	icon,
	edit,
	save,
};

export const init = () => initBlock( { name, metadata, settings } );
