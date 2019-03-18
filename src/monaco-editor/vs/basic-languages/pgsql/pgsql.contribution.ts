/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { registerLanguage } from '../_.contribution';

registerLanguage({
	id: 'pgsql',
	extensions: [],
	aliases: ['PostgreSQL', 'postgres', 'pg', 'postgre'],
	loader: () => import(/* webpackChunkName: "lang/pgsql" */'./pgsql')
});
