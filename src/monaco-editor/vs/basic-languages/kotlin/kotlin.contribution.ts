/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { registerLanguage } from '../_.contribution';

registerLanguage({
	id: 'kotlin',
	extensions: ['.kt'],
	aliases: ['Kotlin', 'kotlin'],
	mimetypes: ['text/x-kotlin-source', 'text/x-kotlin'],
	loader: () => import(/* webpackChunkName: "lang/kotlin" */'./kotlin')
});
