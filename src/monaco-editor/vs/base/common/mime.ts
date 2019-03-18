/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const MIME_TEXT = "text/plain";
export const MIME_BINARY = "application/octet-stream";
export const MIME_UNKNOWN = "application/unknown";

export interface ITextMimeAssociation {
	readonly id: string;
	readonly mime: string;
	readonly filename?: string;
	readonly extension?: string;
	readonly filepattern?: string;
	readonly firstline?: RegExp;
	readonly userConfigured?: boolean;
}

interface ITextMimeAssociationItem extends ITextMimeAssociation {
	readonly filenameLowercase?: string;
	readonly extensionLowercase?: string;
	readonly filepatternLowercase?: string;
	readonly filepatternOnPath?: boolean;
}

/**
 * Associate a text mime to the registry.
 */
export function registerTextMime(
	association: ITextMimeAssociation,
	warnOnOverwrite = false
): void {}
