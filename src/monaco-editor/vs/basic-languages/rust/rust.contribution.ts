/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { registerLanguage } from '../_.contribution';

registerLanguage({
	id: 'rust',
	extensions: ['.rs', '.rlib'],
	aliases: ['Rust', 'rust'],
	loader: () => import(/* webpackChunkName: "lang/rust" */'./rust')
});
