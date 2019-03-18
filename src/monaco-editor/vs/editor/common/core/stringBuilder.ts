/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as strings from 'vs/base/common/strings';

export interface IStringBuilder {
	build(): string;
	reset(): void;
	write1(charCode: number): void;
	appendASCII(charCode: number): void;
	appendASCIIString(str: string): void;
}

export let createStringBuilder: (capacity: number) => IStringBuilder;

createStringBuilder = (capacity) => new CompatStringBuilder();

class CompatStringBuilder implements IStringBuilder {

	private _pieces: string;

	constructor() {
		this._pieces = "";
	}

	public reset(): void {
		this._pieces = "";
	}

	public build(): string {
		return this._pieces;
	}

	public write1(charCode: number): void {
		this._pieces += String.fromCharCode(charCode);
	}

	public appendASCII(charCode: number): void {
		this.write1(charCode);
	}

	public appendASCIIString(str: string): void {
		this._pieces += str;
	}
}
