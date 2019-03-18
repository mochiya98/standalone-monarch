/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { registerLanguage } from '../_.contribution';

registerLanguage({
	id: 'fsharp',
	extensions: ['.fs', '.fsi', '.ml', '.mli', '.fsx', '.fsscript'],
	aliases: ['F#', 'FSharp', 'fsharp'],
	loader: () => import(/* webpackChunkName: "lang/fsharp" */'./fsharp')
});
