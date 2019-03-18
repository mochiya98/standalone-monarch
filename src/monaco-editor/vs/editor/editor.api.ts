/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createMonacoLanguagesAPI } from "vs/editor/standalone/browser/standaloneLanguages";

const global: any = self;

const api: { languages?: ReturnType<typeof createMonacoLanguagesAPI> } = {};
api.languages = createMonacoLanguagesAPI();

global.monaco = api;
