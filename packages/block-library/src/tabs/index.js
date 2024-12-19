/**
 * Internal dependencies
 */
// import './style.scss';

import edit from './edit';
import icon from './icon';
import save from './save';
import initBlock from '../utils/init-block';

import metadata from './block.json';

const { name } = metadata;

export { metadata, name };

export const settings = {
	icon,
	edit,
	save,
};

export const init = () => initBlock( { name, metadata, settings } );
