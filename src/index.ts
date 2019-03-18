import "./monaco-editor/vs/editor/editor.api";
import "./monaco-editor/vs/basic-languages/monaco.contribution";
import { StaticServices } from "./monaco-editor/vs/editor/standalone/browser/standaloneServices";
import {
	Colorizer,
	IColorizerElementOptions,
	IColorizerOptions
} from "vs/editor/standalone/browser/colorizer";

export function colorizeElement(
	domNode: HTMLElement,
	options: IColorizerElementOptions
): Promise<void> {
	return Colorizer.colorizeElement(
		StaticServices.standaloneThemeService.get(),
		StaticServices.modeService.get(),
		domNode,
		options
	);
}

/**
 * Colorize `text` using language `languageId`.
 */
export function colorize(
	text: string,
	languageId: string,
	options: IColorizerOptions
): Promise<string> {
	return Colorizer.colorize(
		StaticServices.modeService.get(),
		text,
		languageId,
		options
	);
}
export function defineTheme(themeName, themeData) {
	StaticServices.standaloneThemeService.get().defineTheme(themeName, themeData);
}
export function setTheme(themeName) {
	StaticServices.standaloneThemeService.get().setTheme(themeName);
}
