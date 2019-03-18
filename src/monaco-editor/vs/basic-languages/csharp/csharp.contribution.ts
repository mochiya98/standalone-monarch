/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { registerLanguage } from '../_.contribution';

registerLanguage({
	id: 'csharp',
	extensions: ['.cs', '.csx', '.cake'],
	aliases: ['C#', 'csharp'],
	loader: () => import(/* webpackChunkName: "lang/csharp" */'./csharp')
});
