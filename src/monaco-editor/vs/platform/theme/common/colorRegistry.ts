/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as platform from 'vs/platform/registry/common/platform';
import { Color, RGBA } from 'vs/base/common/color';
import { ITheme } from 'vs/platform/theme/common/themeService';
import { Event, Emitter } from 'vs/base/common/event';

import { RunOnceScheduler } from 'vs/base/common/async';

//  ------ API types

type IJSONSchema = any;
type IJSONSchemaMap = any;
type IJSONContributionRegistry = any;

export type ColorIdentifier = string;

export interface ColorContribution {
	readonly id: ColorIdentifier;
	readonly description: string;
	readonly defaults: ColorDefaults | null;
	readonly needsTransparency: boolean;
	readonly deprecationMessage: string | undefined;
}


export interface ColorFunction {
	(theme: ITheme): Color | undefined;
}

export interface ColorDefaults {
	light: ColorValue | null;
	dark: ColorValue | null;
	hc: ColorValue | null;
}

/**
 * A Color Value is either a color literal, a refence to other color or a derived color
 */
export type ColorValue = Color | string | ColorIdentifier | ColorFunction;

// color registry
export const Extensions = {
	ColorContribution: 'base.contributions.colors'
};

export interface IColorRegistry {

	readonly onDidChangeSchema: Event<void>;

	/**
	 * Register a color to the registry.
	 * @param id The color id as used in theme description files
	 * @param defaults The default values
	 * @description the description
	 */
	registerColor(id: string, defaults: ColorDefaults, description: string): ColorIdentifier;

	/**
	 * Register a color to the registry.
	 */
	deregisterColor(id: string);

	/**
	 * Get all color contributions
	 */
	getColors(): ColorContribution[];

	/**
	 * Gets the default color of the given id
	 */
	resolveDefaultColor(id: ColorIdentifier, theme: ITheme): Color | undefined;

	/**
	 * JSON schema for an object to assign color values to one of the color contributions.
	 */
	getColorSchema(): IJSONSchema;

	/**
	 * JSON schema to for a reference to a color contribution.
	 */
	getColorReferenceSchema(): IJSONSchema;

}



class ColorRegistry implements IColorRegistry {

	private readonly _onDidChangeSchema = new Emitter<void>();
	readonly onDidChangeSchema: Event<void> = this._onDidChangeSchema.event;

	private colorsById: { [key: string]: ColorContribution };
	private colorSchema: IJSONSchema & { properties: IJSONSchemaMap } = { type: 'object', properties: {} };
	private colorReferenceSchema: IJSONSchema & { enum: string[], enumDescriptions: string[] } = { type: 'string', enum: [], enumDescriptions: [] };

	constructor() {
		this.colorsById = {};
	}

	public registerColor(id: string, defaults: ColorDefaults | null, description: string, needsTransparency = false, deprecationMessage?: string): ColorIdentifier {
		let colorContribution: ColorContribution = { id, description, defaults, needsTransparency, deprecationMessage };
		this.colorsById[id] = colorContribution;
		let propertySchema: IJSONSchema = { type: 'string', description, format: 'color-hex', default: '#ff0000' };
		if (deprecationMessage) {
			propertySchema.deprecationMessage = deprecationMessage;
		}
		this.colorSchema.properties[id] = propertySchema;
		this.colorReferenceSchema.enum.push(id);
		this.colorReferenceSchema.enumDescriptions.push(description);

		this._onDidChangeSchema.fire();
		return id;
	}


	public deregisterColor(id: string): void {
		delete this.colorsById[id];
		delete this.colorSchema.properties[id];
		const index = this.colorReferenceSchema.enum.indexOf(id);
		if (index !== -1) {
			this.colorReferenceSchema.enum.splice(index, 1);
			this.colorReferenceSchema.enumDescriptions.splice(index, 1);
		}
		this._onDidChangeSchema.fire();
	}

	public getColors(): ColorContribution[] {
		return Object.keys(this.colorsById).map(id => this.colorsById[id]);
	}

	public resolveDefaultColor(id: ColorIdentifier, theme: ITheme): Color | undefined {
		const colorDesc = this.colorsById[id];
		if (colorDesc && colorDesc.defaults) {
			const colorValue = colorDesc.defaults[theme.type];
			return resolveColorValue(colorValue, theme);
		}
		return undefined;
	}

	public getColorSchema(): IJSONSchema {
		return this.colorSchema;
	}

	public getColorReferenceSchema(): IJSONSchema {
		return this.colorReferenceSchema;
	}

	public toString() {
		let sorter = (a: string, b: string) => {
			let cat1 = a.indexOf('.') === -1 ? 0 : 1;
			let cat2 = b.indexOf('.') === -1 ? 0 : 1;
			if (cat1 !== cat2) {
				return cat1 - cat2;
			}
			return a.localeCompare(b);
		};

		return Object.keys(this.colorsById).sort(sorter).map(k => `- \`${k}\`: ${this.colorsById[k].description}`).join('\n');
	}

}

const colorRegistry = new ColorRegistry();
platform.Registry.add(Extensions.ColorContribution, colorRegistry);

export function registerColor(id: string, defaults: ColorDefaults | null, description: string, needsTransparency?: boolean, deprecationMessage?: string): ColorIdentifier {
	return colorRegistry.registerColor(id, defaults, description, needsTransparency, deprecationMessage);
}

export function getColorRegistry(): IColorRegistry {
	return colorRegistry;
}

// ----- base colors

export const foreground = registerColor('foreground', { dark: '#CCCCCC', light: '#616161', hc: '#FFFFFF' }, "");
export const errorForeground = registerColor('errorForeground', { dark: '#F48771', light: '#A1260D', hc: '#F48771' }, "");
export const descriptionForeground = registerColor('descriptionForeground', { light: '#717171', dark: transparent(foreground, 0.7), hc: transparent(foreground, 0.7) }, "");

export const focusBorder = registerColor('focusBorder', { dark: Color.fromHex('#0E639C').transparent(0.8), light: Color.fromHex('#007ACC').transparent(0.4), hc: '#F38518' }, "");

export const contrastBorder = registerColor('contrastBorder', { light: null, dark: null, hc: '#6FC3DF' }, "");
export const activeContrastBorder = registerColor('contrastActiveBorder', { light: null, dark: null, hc: focusBorder }, "");

export const selectionBackground = registerColor('selection.background', { light: null, dark: null, hc: null }, "");

// ------ text colors

export const textSeparatorForeground = registerColor('textSeparator.foreground', { light: '#0000002e', dark: '#ffffff2e', hc: Color.black }, "");
export const textLinkForeground = registerColor('textLink.foreground', { light: '#006AB1', dark: '#3794FF', hc: '#3794FF' }, "");
export const textLinkActiveForeground = registerColor('textLink.activeForeground', { light: '#006AB1', dark: '#3794FF', hc: '#3794FF' }, "");
export const textPreformatForeground = registerColor('textPreformat.foreground', { light: '#A31515', dark: '#D7BA7D', hc: '#D7BA7D' }, "");
export const textBlockQuoteBackground = registerColor('textBlockQuote.background', { light: '#7f7f7f1a', dark: '#7f7f7f1a', hc: null }, "");
export const textBlockQuoteBorder = registerColor('textBlockQuote.border', { light: '#007acc80', dark: '#007acc80', hc: Color.white }, "");
export const textCodeBlockBackground = registerColor('textCodeBlock.background', { light: '#dcdcdc66', dark: '#0a0a0a66', hc: Color.black }, "");

// ----- widgets
export const widgetShadow = registerColor('widget.shadow', { dark: '#000000', light: '#A8A8A8', hc: null }, "");

export const inputBackground = registerColor('input.background', { dark: '#3C3C3C', light: Color.white, hc: Color.black }, "");
export const inputForeground = registerColor('input.foreground', { dark: foreground, light: foreground, hc: foreground }, "");
export const inputBorder = registerColor('input.border', { dark: null, light: null, hc: contrastBorder }, "");
export const inputActiveOptionBorder = registerColor('inputOption.activeBorder', { dark: '#007ACC', light: '#007ACC', hc: activeContrastBorder }, "");
export const inputPlaceholderForeground = registerColor('input.placeholderForeground', { light: transparent(foreground, 0.5), dark: transparent(foreground, 0.5), hc: transparent(foreground, 0.7) }, "");

export const inputValidationInfoBackground = registerColor('inputValidation.infoBackground', { dark: '#063B49', light: '#D6ECF2', hc: Color.black }, "");
export const inputValidationInfoForeground = registerColor('inputValidation.infoForeground', { dark: null, light: null, hc: null }, "");
export const inputValidationInfoBorder = registerColor('inputValidation.infoBorder', { dark: '#007acc', light: '#007acc', hc: contrastBorder }, "");
export const inputValidationWarningBackground = registerColor('inputValidation.warningBackground', { dark: '#352A05', light: '#F6F5D2', hc: Color.black }, "");
export const inputValidationWarningForeground = registerColor('inputValidation.warningForeground', { dark: null, light: null, hc: null }, "");
export const inputValidationWarningBorder = registerColor('inputValidation.warningBorder', { dark: '#B89500', light: '#B89500', hc: contrastBorder }, "");
export const inputValidationErrorBackground = registerColor('inputValidation.errorBackground', { dark: '#5A1D1D', light: '#F2DEDE', hc: Color.black }, "");
export const inputValidationErrorForeground = registerColor('inputValidation.errorForeground', { dark: null, light: null, hc: null }, "");
export const inputValidationErrorBorder = registerColor('inputValidation.errorBorder', { dark: '#BE1100', light: '#BE1100', hc: contrastBorder }, "");

export const selectBackground = registerColor('dropdown.background', { dark: '#3C3C3C', light: Color.white, hc: Color.black }, "");
export const selectListBackground = registerColor('dropdown.listBackground', { dark: null, light: null, hc: Color.black }, "");
export const selectForeground = registerColor('dropdown.foreground', { dark: '#F0F0F0', light: null, hc: Color.white }, "");
export const selectBorder = registerColor('dropdown.border', { dark: selectBackground, light: '#CECECE', hc: contrastBorder }, "");

export const listFocusBackground = registerColor('list.focusBackground', { dark: '#062F4A', light: '#D6EBFF', hc: null }, "");
export const listFocusForeground = registerColor('list.focusForeground', { dark: null, light: null, hc: null }, "");
export const listActiveSelectionBackground = registerColor('list.activeSelectionBackground', { dark: '#094771', light: '#0074E8', hc: null }, "");
export const listActiveSelectionForeground = registerColor('list.activeSelectionForeground', { dark: Color.white, light: Color.white, hc: null }, "");
export const listInactiveSelectionBackground = registerColor('list.inactiveSelectionBackground', { dark: '#37373D', light: '#E4E6F1', hc: null }, "");
export const listInactiveSelectionForeground = registerColor('list.inactiveSelectionForeground', { dark: null, light: null, hc: null }, "");
export const listInactiveFocusBackground = registerColor('list.inactiveFocusBackground', { dark: null, light: null, hc: null }, "");
export const listHoverBackground = registerColor('list.hoverBackground', { dark: '#2A2D2E', light: '#F0F0F0', hc: null }, "");
export const listHoverForeground = registerColor('list.hoverForeground', { dark: null, light: null, hc: null }, "");
export const listDropBackground = registerColor('list.dropBackground', { dark: listFocusBackground, light: listFocusBackground, hc: null }, "");
export const listHighlightForeground = registerColor('list.highlightForeground', { dark: '#0097fb', light: '#0066BF', hc: focusBorder }, "");
export const listInvalidItemForeground = registerColor('list.invalidItemForeground', { dark: '#B89500', light: '#B89500', hc: '#B89500' }, "");
export const listErrorForeground = registerColor('list.errorForeground', { dark: '#F88070', light: '#B01011', hc: null }, "");
export const listWarningForeground = registerColor('list.warningForeground', { dark: '#4d9e4d', light: '#117711', hc: null }, "");
export const listFilterWidgetBackground = registerColor('listFilterWidget.background', { light: '#efc1ad', dark: '#653723', hc: Color.black }, "");
export const listFilterWidgetOutline = registerColor('listFilterWidget.outline', { dark: Color.transparent, light: Color.transparent, hc: '#f38518' }, "");
export const listFilterWidgetNoMatchesOutline = registerColor('listFilterWidget.noMatchesOutline', { dark: '#BE1100', light: '#BE1100', hc: contrastBorder }, "");

export const pickerGroupForeground = registerColor('pickerGroup.foreground', { dark: '#3794FF', light: '#0066BF', hc: Color.white }, "");
export const pickerGroupBorder = registerColor('pickerGroup.border', { dark: '#3F3F46', light: '#CCCEDB', hc: Color.white }, "");

export const buttonForeground = registerColor('button.foreground', { dark: Color.white, light: Color.white, hc: Color.white }, "");
export const buttonBackground = registerColor('button.background', { dark: '#0E639C', light: '#007ACC', hc: null }, "");
export const buttonHoverBackground = registerColor('button.hoverBackground', { dark: lighten(buttonBackground, 0.2), light: darken(buttonBackground, 0.2), hc: null }, "");

export const badgeBackground = registerColor('badge.background', { dark: '#4D4D4D', light: '#C4C4C4', hc: Color.black }, "");
export const badgeForeground = registerColor('badge.foreground', { dark: Color.white, light: '#333', hc: Color.white }, "");

export const scrollbarShadow = registerColor('scrollbar.shadow', { dark: '#000000', light: '#DDDDDD', hc: null }, "");
export const scrollbarSliderBackground = registerColor('scrollbarSlider.background', { dark: Color.fromHex('#797979').transparent(0.4), light: Color.fromHex('#646464').transparent(0.4), hc: transparent(contrastBorder, 0.6) }, "");
export const scrollbarSliderHoverBackground = registerColor('scrollbarSlider.hoverBackground', { dark: Color.fromHex('#646464').transparent(0.7), light: Color.fromHex('#646464').transparent(0.7), hc: transparent(contrastBorder, 0.8) }, "");
export const scrollbarSliderActiveBackground = registerColor('scrollbarSlider.activeBackground', { dark: Color.fromHex('#BFBFBF').transparent(0.4), light: Color.fromHex('#000000').transparent(0.6), hc: contrastBorder }, "");

export const progressBarBackground = registerColor('progressBar.background', { dark: Color.fromHex('#0E70C0'), light: Color.fromHex('#0E70C0'), hc: contrastBorder }, "");

export const menuBorder = registerColor('menu.border', { dark: null, light: null, hc: contrastBorder }, "");
export const menuForeground = registerColor('menu.foreground', { dark: selectForeground, light: foreground, hc: selectForeground }, "");
export const menuBackground = registerColor('menu.background', { dark: selectBackground, light: selectBackground, hc: selectBackground }, "");
export const menuSelectionForeground = registerColor('menu.selectionForeground', { dark: listActiveSelectionForeground, light: listActiveSelectionForeground, hc: listActiveSelectionForeground }, "");
export const menuSelectionBackground = registerColor('menu.selectionBackground', { dark: listActiveSelectionBackground, light: listActiveSelectionBackground, hc: listActiveSelectionBackground }, "");
export const menuSelectionBorder = registerColor('menu.selectionBorder', { dark: null, light: null, hc: activeContrastBorder }, "");
export const menuSeparatorBackground = registerColor('menu.separatorBackground', { dark: '#BBBBBB', light: '#888888', hc: contrastBorder }, "");

/**
 * Editor background color.
 * Because of bug https://monacotools.visualstudio.com/DefaultCollection/Monaco/_workitems/edit/13254
 * we are *not* using the color white (or #ffffff, rgba(255,255,255)) but something very close to white.
 */
export const editorBackground = registerColor('editor.background', { light: '#fffffe', dark: '#1E1E1E', hc: Color.black }, "");

/**
 * Editor foreground color.
 */
export const editorForeground = registerColor('editor.foreground', { light: '#333333', dark: '#BBBBBB', hc: Color.white }, "");

/**
 * Editor widgets
 */
export const editorWidgetBackground = registerColor('editorWidget.background', { dark: '#252526', light: '#F3F3F3', hc: '#0C141F' }, "");
export const editorWidgetBorder = registerColor('editorWidget.border', { dark: '#454545', light: '#C8C8C8', hc: contrastBorder }, "");

export const editorWidgetResizeBorder = registerColor('editorWidget.resizeBorder', { light: null, dark: null, hc: null }, "");

/**
 * Editor selection colors.
 */
export const editorSelectionBackground = registerColor('editor.selectionBackground', { light: '#ADD6FF', dark: '#264F78', hc: '#f3f518' }, "");
export const editorSelectionForeground = registerColor('editor.selectionForeground', { light: null, dark: null, hc: '#000000' }, "");
export const editorInactiveSelection = registerColor('editor.inactiveSelectionBackground', { light: transparent(editorSelectionBackground, 0.5), dark: transparent(editorSelectionBackground, 0.5), hc: transparent(editorSelectionBackground, 0.5) }, "", true);
export const editorSelectionHighlight = registerColor('editor.selectionHighlightBackground', { light: lessProminent(editorSelectionBackground, editorBackground, 0.3, 0.6), dark: lessProminent(editorSelectionBackground, editorBackground, 0.3, 0.6), hc: null }, "", true);
export const editorSelectionHighlightBorder = registerColor('editor.selectionHighlightBorder', { light: null, dark: null, hc: activeContrastBorder }, "");


/**
 * Editor find match colors.
 */
export const editorFindMatch = registerColor('editor.findMatchBackground', { light: '#A8AC94', dark: '#515C6A', hc: null }, "");
export const editorFindMatchHighlight = registerColor('editor.findMatchHighlightBackground', { light: '#EA5C0055', dark: '#EA5C0055', hc: null }, "", true);
export const editorFindRangeHighlight = registerColor('editor.findRangeHighlightBackground', { dark: '#3a3d4166', light: '#b4b4b44d', hc: null }, "", true);
export const editorFindMatchBorder = registerColor('editor.findMatchBorder', { light: null, dark: null, hc: activeContrastBorder }, "");
export const editorFindMatchHighlightBorder = registerColor('editor.findMatchHighlightBorder', { light: null, dark: null, hc: activeContrastBorder }, "");
export const editorFindRangeHighlightBorder = registerColor('editor.findRangeHighlightBorder', { dark: null, light: null, hc: transparent(activeContrastBorder, 0.4) }, "", true);

/**
 * Editor hover
 */
export const editorHoverHighlight = registerColor('editor.hoverHighlightBackground', { light: '#ADD6FF26', dark: '#264f7840', hc: '#ADD6FF26' }, "", true);
export const editorHoverBackground = registerColor('editorHoverWidget.background', { light: editorWidgetBackground, dark: editorWidgetBackground, hc: editorWidgetBackground }, "");
export const editorHoverBorder = registerColor('editorHoverWidget.border', { light: editorWidgetBorder, dark: editorWidgetBorder, hc: editorWidgetBorder }, "");
export const editorHoverStatusBarBackground = registerColor('editorHoverWidget.statusBarBackground', { dark: lighten(editorHoverBackground, 0.2), light: darken(editorHoverBackground, 0.05), hc: editorWidgetBackground }, "");

/**
 * Editor link colors
 */
export const editorActiveLinkForeground = registerColor('editorLink.activeForeground', { dark: '#4E94CE', light: Color.blue, hc: Color.cyan }, "");

/**
 * Diff Editor Colors
 */
export const defaultInsertColor = new Color(new RGBA(155, 185, 85, 0.2));
export const defaultRemoveColor = new Color(new RGBA(255, 0, 0, 0.2));

export const diffInserted = registerColor('diffEditor.insertedTextBackground', { dark: defaultInsertColor, light: defaultInsertColor, hc: null }, "", true);
export const diffRemoved = registerColor('diffEditor.removedTextBackground', { dark: defaultRemoveColor, light: defaultRemoveColor, hc: null }, "", true);

export const diffInsertedOutline = registerColor('diffEditor.insertedTextBorder', { dark: null, light: null, hc: '#33ff2eff' }, "");
export const diffRemovedOutline = registerColor('diffEditor.removedTextBorder', { dark: null, light: null, hc: '#FF008F' }, "");

export const diffBorder = registerColor('diffEditor.border', { dark: null, light: null, hc: contrastBorder }, "");

/**
 * Snippet placeholder colors
 */
export const snippetTabstopHighlightBackground = registerColor('editor.snippetTabstopHighlightBackground', { dark: new Color(new RGBA(124, 124, 124, 0.3)), light: new Color(new RGBA(10, 50, 100, 0.2)), hc: new Color(new RGBA(124, 124, 124, 0.3)) }, "");
export const snippetTabstopHighlightBorder = registerColor('editor.snippetTabstopHighlightBorder', { dark: null, light: null, hc: null }, "");
export const snippetFinalTabstopHighlightBackground = registerColor('editor.snippetFinalTabstopHighlightBackground', { dark: null, light: null, hc: null }, "");
export const snippetFinalTabstopHighlightBorder = registerColor('editor.snippetFinalTabstopHighlightBorder', { dark: '#525252', light: new Color(new RGBA(10, 50, 100, 0.5)), hc: '#525252' }, "");

/**
 * Breadcrumb colors
 */
export const breadcrumbsForeground = registerColor('breadcrumb.foreground', { light: transparent(foreground, 0.8), dark: transparent(foreground, 0.8), hc: transparent(foreground, 0.8) }, "");
export const breadcrumbsBackground = registerColor('breadcrumb.background', { light: editorBackground, dark: editorBackground, hc: editorBackground }, "");
export const breadcrumbsFocusForeground = registerColor('breadcrumb.focusForeground', { light: darken(foreground, 0.2), dark: lighten(foreground, 0.1), hc: lighten(foreground, 0.1) }, "");
export const breadcrumbsActiveSelectionForeground = registerColor('breadcrumb.activeSelectionForeground', { light: darken(foreground, 0.2), dark: lighten(foreground, 0.1), hc: lighten(foreground, 0.1) }, "");
export const breadcrumbsPickerBackground = registerColor('breadcrumbPicker.background', { light: editorWidgetBackground, dark: editorWidgetBackground, hc: editorWidgetBackground }, "");

/**
 * Merge-conflict colors
 */

const headerTransparency = 0.5;
const currentBaseColor = Color.fromHex('#40C8AE').transparent(headerTransparency);
const incomingBaseColor = Color.fromHex('#40A6FF').transparent(headerTransparency);
const commonBaseColor = Color.fromHex('#606060').transparent(0.4);
const contentTransparency = 0.4;
const rulerTransparency = 1;

export const mergeCurrentHeaderBackground = registerColor('merge.currentHeaderBackground', { dark: currentBaseColor, light: currentBaseColor, hc: null }, "", true);
export const mergeCurrentContentBackground = registerColor('merge.currentContentBackground', { dark: transparent(mergeCurrentHeaderBackground, contentTransparency), light: transparent(mergeCurrentHeaderBackground, contentTransparency), hc: transparent(mergeCurrentHeaderBackground, contentTransparency) }, "", true);
export const mergeIncomingHeaderBackground = registerColor('merge.incomingHeaderBackground', { dark: incomingBaseColor, light: incomingBaseColor, hc: null }, "", true);
export const mergeIncomingContentBackground = registerColor('merge.incomingContentBackground', { dark: transparent(mergeIncomingHeaderBackground, contentTransparency), light: transparent(mergeIncomingHeaderBackground, contentTransparency), hc: transparent(mergeIncomingHeaderBackground, contentTransparency) }, "", true);
export const mergeCommonHeaderBackground = registerColor('merge.commonHeaderBackground', { dark: commonBaseColor, light: commonBaseColor, hc: null }, "", true);
export const mergeCommonContentBackground = registerColor('merge.commonContentBackground', { dark: transparent(mergeCommonHeaderBackground, contentTransparency), light: transparent(mergeCommonHeaderBackground, contentTransparency), hc: transparent(mergeCommonHeaderBackground, contentTransparency) }, "", true);

export const mergeBorder = registerColor('merge.border', { dark: null, light: null, hc: '#C3DF6F' }, "");

export const overviewRulerCurrentContentForeground = registerColor('editorOverviewRuler.currentContentForeground', { dark: transparent(mergeCurrentHeaderBackground, rulerTransparency), light: transparent(mergeCurrentHeaderBackground, rulerTransparency), hc: mergeBorder }, "");
export const overviewRulerIncomingContentForeground = registerColor('editorOverviewRuler.incomingContentForeground', { dark: transparent(mergeIncomingHeaderBackground, rulerTransparency), light: transparent(mergeIncomingHeaderBackground, rulerTransparency), hc: mergeBorder }, "");
export const overviewRulerCommonContentForeground = registerColor('editorOverviewRuler.commonContentForeground', { dark: transparent(mergeCommonHeaderBackground, rulerTransparency), light: transparent(mergeCommonHeaderBackground, rulerTransparency), hc: mergeBorder }, "");

const findMatchColorDefault = new Color(new RGBA(246, 185, 77, 0.7));
export const overviewRulerFindMatchForeground = registerColor('editorOverviewRuler.findMatchForeground', { dark: findMatchColorDefault, light: findMatchColorDefault, hc: findMatchColorDefault }, "", true);

export const overviewRulerSelectionHighlightForeground = registerColor('editorOverviewRuler.selectionHighlightForeground', { dark: '#A0A0A0CC', light: '#A0A0A0CC', hc: '#A0A0A0CC' }, "", true);


// ----- color functions

export function darken(colorValue: ColorValue, factor: number): ColorFunction {
	return (theme) => {
		let color = resolveColorValue(colorValue, theme);
		if (color) {
			return color.darken(factor);
		}
		return undefined;
	};
}

export function lighten(colorValue: ColorValue, factor: number): ColorFunction {
	return (theme) => {
		let color = resolveColorValue(colorValue, theme);
		if (color) {
			return color.lighten(factor);
		}
		return undefined;
	};
}

export function transparent(colorValue: ColorValue, factor: number): ColorFunction {
	return (theme) => {
		let color = resolveColorValue(colorValue, theme);
		if (color) {
			return color.transparent(factor);
		}
		return undefined;
	};
}

export function oneOf(...colorValues: ColorValue[]): ColorFunction {
	return (theme) => {
		for (let colorValue of colorValues) {
			let color = resolveColorValue(colorValue, theme);
			if (color) {
				return color;
			}
		}
		return undefined;
	};
}

function lessProminent(colorValue: ColorValue, backgroundColorValue: ColorValue, factor: number, transparency: number): ColorFunction {
	return (theme) => {
		let from = resolveColorValue(colorValue, theme);
		if (from) {
			let backgroundColor = resolveColorValue(backgroundColorValue, theme);
			if (backgroundColor) {
				if (from.isDarkerThan(backgroundColor)) {
					return Color.getLighterColor(from, backgroundColor, factor).transparent(transparency);
				}
				return Color.getDarkerColor(from, backgroundColor, factor).transparent(transparency);
			}
			return from.transparent(factor * transparency);
		}
		return undefined;
	};
}

// ----- implementation

/**
 * @param colorValue Resolve a color value in the context of a theme
 */
function resolveColorValue(colorValue: ColorValue | null, theme: ITheme): Color | undefined {
	if (colorValue === null) {
		return undefined;
	} else if (typeof colorValue === 'string') {
		if (colorValue[0] === '#') {
			return Color.fromHex(colorValue);
		}
		return theme.getColor(colorValue);
	} else if (colorValue instanceof Color) {
		return colorValue;
	} else if (typeof colorValue === 'function') {
		return colorValue(theme);
	}
	return undefined;
}

export const workbenchColorsSchemaId = 'vscode://schemas/workbench-colors';

