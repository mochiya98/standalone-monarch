/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Color, RGBA } from 'vs/base/common/color';
import { activeContrastBorder, editorBackground, editorForeground, registerColor } from 'vs/platform/theme/common/colorRegistry';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';

/**
 * Definition of the editor colors
 */
export const editorLineHighlight = registerColor('editor.lineHighlightBackground', { dark: null, light: null, hc: null }, '');
export const editorLineHighlightBorder = registerColor('editor.lineHighlightBorder', { dark: '#282828', light: '#eeeeee', hc: '#f38518' }, '');
export const editorRangeHighlight = registerColor('editor.rangeHighlightBackground', { dark: '#ffffff0b', light: '#fdff0033', hc: null }, '', true);
export const editorRangeHighlightBorder = registerColor('editor.rangeHighlightBorder', { dark: null, light: null, hc: activeContrastBorder }, '', true);

export const editorCursorForeground = registerColor('editorCursor.foreground', { dark: '#AEAFAD', light: Color.black, hc: Color.white }, '');
export const editorCursorBackground = registerColor('editorCursor.background', null, '');
export const editorWhitespaces = registerColor('editorWhitespace.foreground', { dark: '#e3e4e229', light: '#33333333', hc: '#e3e4e229' }, '');
export const editorIndentGuides = registerColor('editorIndentGuide.background', { dark: editorWhitespaces, light: editorWhitespaces, hc: editorWhitespaces }, '');
export const editorActiveIndentGuides = registerColor('editorIndentGuide.activeBackground', { dark: editorWhitespaces, light: editorWhitespaces, hc: editorWhitespaces }, '');
export const editorLineNumbers = registerColor('editorLineNumber.foreground', { dark: '#858585', light: '#237893', hc: Color.white }, '');

const deprecatedEditorActiveLineNumber = registerColor('editorActiveLineNumber.foreground', { dark: '#c6c6c6', light: '#0B216F', hc: activeContrastBorder }, '');
export const editorActiveLineNumber = registerColor('editorLineNumber.activeForeground', { dark: deprecatedEditorActiveLineNumber, light: deprecatedEditorActiveLineNumber, hc: deprecatedEditorActiveLineNumber }, '');

export const editorRuler = registerColor('editorRuler.foreground', { dark: '#5A5A5A', light: Color.lightgrey, hc: Color.white }, '');

export const editorCodeLensForeground = registerColor('editorCodeLens.foreground', { dark: '#999999', light: '#999999', hc: '#999999' }, '');

export const editorBracketMatchBackground = registerColor('editorBracketMatch.background', { dark: '#0064001a', light: '#0064001a', hc: '#0064001a' }, '');
export const editorBracketMatchBorder = registerColor('editorBracketMatch.border', { dark: '#888', light: '#B9B9B9', hc: '#fff' }, '');

export const editorOverviewRulerBorder = registerColor('editorOverviewRuler.border', { dark: '#7f7f7f4d', light: '#7f7f7f4d', hc: '#7f7f7f4d' }, '');

export const editorGutter = registerColor('editorGutter.background', { dark: editorBackground, light: editorBackground, hc: editorBackground }, '');

export const editorErrorForeground = registerColor('editorError.foreground', { dark: '#ea4646', light: '#d60a0a', hc: null }, '');
export const editorErrorBorder = registerColor('editorError.border', { dark: null, light: null, hc: Color.fromHex('#E47777').transparent(0.8) }, '');

export const editorWarningForeground = registerColor('editorWarning.foreground', { dark: '#4d9e4d', light: '#117711', hc: null }, '');
export const editorWarningBorder = registerColor('editorWarning.border', { dark: null, light: null, hc: Color.fromHex('#71B771').transparent(0.8) }, '');

export const editorInfoForeground = registerColor('editorInfo.foreground', { dark: '#008000', light: '#008000', hc: null }, '');
export const editorInfoBorder = registerColor('editorInfo.border', { dark: null, light: null, hc: Color.fromHex('#71B771').transparent(0.8) }, '');

export const editorHintForeground = registerColor('editorHint.foreground', { dark: Color.fromHex('#eeeeee').transparent(0.7), light: '#6c6c6c', hc: null }, '');
export const editorHintBorder = registerColor('editorHint.border', { dark: null, light: null, hc: Color.fromHex('#eeeeee').transparent(0.8) }, '');

export const editorUnnecessaryCodeBorder = registerColor('editorUnnecessaryCode.border', { dark: null, light: null, hc: Color.fromHex('#fff').transparent(0.8) }, '');
export const editorUnnecessaryCodeOpacity = registerColor('editorUnnecessaryCode.opacity', { dark: Color.fromHex('#000a'), light: Color.fromHex('#0007'), hc: null }, '');

const rulerRangeDefault = new Color(new RGBA(0, 122, 204, 0.6));
export const overviewRulerRangeHighlight = registerColor('editorOverviewRuler.rangeHighlightForeground', { dark: rulerRangeDefault, light: rulerRangeDefault, hc: rulerRangeDefault }, '', true);
export const overviewRulerError = registerColor('editorOverviewRuler.errorForeground', { dark: new Color(new RGBA(255, 18, 18, 0.7)), light: new Color(new RGBA(255, 18, 18, 0.7)), hc: new Color(new RGBA(255, 50, 50, 1)) }, '');
export const overviewRulerWarning = registerColor('editorOverviewRuler.warningForeground', { dark: new Color(new RGBA(18, 136, 18, 0.7)), light: new Color(new RGBA(18, 136, 18, 0.7)), hc: new Color(new RGBA(50, 255, 50, 1)) }, '');
export const overviewRulerInfo = registerColor('editorOverviewRuler.infoForeground', { dark: new Color(new RGBA(18, 18, 136, 0.7)), light: new Color(new RGBA(18, 18, 136, 0.7)), hc: new Color(new RGBA(50, 50, 255, 1)) }, '');

// contains all color rules that used to defined in editor/browser/widget/editor.css
registerThemingParticipant((theme, collector) => {
	const background = theme.getColor(editorBackground);
	if (background) {
		collector.addRule(`.monaco-editor, .monaco-editor-background, .monaco-editor .inputarea.ime-input { background-color: ${background}; }`);
	}

	const foreground = theme.getColor(editorForeground);
	if (foreground) {
		collector.addRule(`.monaco-editor, .monaco-editor .inputarea.ime-input { color: ${foreground}; }`);
	}

	const gutter = theme.getColor(editorGutter);
	if (gutter) {
		collector.addRule(`.monaco-editor .margin { background-color: ${gutter}; }`);
	}

	const rangeHighlight = theme.getColor(editorRangeHighlight);
	if (rangeHighlight) {
		collector.addRule(`.monaco-editor .rangeHighlight { background-color: ${rangeHighlight}; }`);
	}

	const rangeHighlightBorder = theme.getColor(editorRangeHighlightBorder);
	if (rangeHighlightBorder) {
		collector.addRule(`.monaco-editor .rangeHighlight { border: 1px ${theme.type === 'hc' ? 'dotted' : 'solid'} ${rangeHighlightBorder}; }`);
	}

	const invisibles = theme.getColor(editorWhitespaces);
	if (invisibles) {
		collector.addRule(`.vs-whitespace { color: ${invisibles} !important; }`);
	}
});
