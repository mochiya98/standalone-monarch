/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { registerLanguage } from '../_.contribution';

registerLanguage({
	id: 'graphql',
	extensions: ['.graphql', '.gql'],
	aliases: ['GraphQL', 'graphql', 'gql'],
	mimetypes: ['application/graphql'],
	loader: () => import(/* webpackChunkName: "lang/graphql" */'./graphql')
});
