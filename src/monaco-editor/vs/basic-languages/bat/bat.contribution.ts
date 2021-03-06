/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { registerLanguage } from '../_.contribution';

registerLanguage({
	id: 'bat',
	extensions: ['.bat', '.cmd'],
	aliases: ['Batch', 'bat'],
	loader: () => import(/* webpackChunkName: "lang/bat" */'./bat')
});
