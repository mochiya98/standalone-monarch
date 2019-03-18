/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModeService } from "vs/editor/common/services/modeService";
import { ModeServiceImpl } from "vs/editor/common/services/modeServiceImpl";
import { StandaloneThemeServiceImpl } from "vs/editor/standalone/browser/standaloneThemeServiceImpl";
import { IStandaloneThemeService } from "vs/editor/standalone/common/standaloneThemeService";
import { ServiceIdentifier } from "vs/platform/instantiation/common/instantiation";

export interface IEditorOverrideServices {
	[index: string]: any;
}

export module StaticServices {
	export class LazyStaticService<T> {
		private readonly _serviceId: ServiceIdentifier<T>;
		private _value: T | null;

		public get id() {
			return this._serviceId;
		}

		constructor(serviceId: ServiceIdentifier<T>, instance: T) {
			this._serviceId = serviceId;
			this._value = instance;
		}

		public get(overrides?: IEditorOverrideServices): T {
			return this._value;
		}
	}

	let _all: LazyStaticService<any>[] = [];

	function define<T>(
		serviceId: ServiceIdentifier<T>,
		instance: T
	): LazyStaticService<T> {
		let r = new LazyStaticService(serviceId, instance);
		_all.push(r);
		return r;
	}

	export const modeService = define(IModeService, new ModeServiceImpl());

	export const standaloneThemeService = define(IStandaloneThemeService, new StandaloneThemeServiceImpl());
}
