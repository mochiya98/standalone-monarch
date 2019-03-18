/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from "vs/base/common/uri";
import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import {
	Token,
	TokenizationResult,
	TokenizationResult2
} from "vs/editor/common/core/token";
import * as modes from "vs/editor/common/modes";
import { ModesRegistry } from "vs/editor/common/modes/modesRegistry";
import { ILanguageExtensionPoint } from "vs/editor/common/services/modeService";
import * as standaloneEnums from "vs/editor/common/standalone/standaloneEnums";
import { StaticServices } from "vs/editor/standalone/browser/standaloneServices";
import { compile } from "vs/editor/standalone/common/monarch/monarchCompile";
import { createTokenizationSupport } from "vs/editor/standalone/common/monarch/monarchLexer";
import { IMonarchLanguage } from "vs/editor/standalone/common/monarch/monarchTypes";
import { IStandaloneThemeService } from "vs/editor/standalone/common/standaloneThemeService";

type ITextModel = any;

/**
 * Register information about a new language.
 */
export function register(language: ILanguageExtensionPoint): void {
	ModesRegistry.registerLanguage(language);
}

/**
 * Get the information of all the registered languages.
 */
export function getLanguages(): ILanguageExtensionPoint[] {
	let result: ILanguageExtensionPoint[] = [];
	result = result.concat(ModesRegistry.getLanguages());
	return result;
}

export function getEncodedLanguageId(languageId: string): number {
	let lid = StaticServices.modeService.get().getLanguageIdentifier(languageId);
	return lid ? lid.id : 0;
}

/**
 * An event emitted when a language is first time needed (e.g. a model has it set).
 * @event
 */
export function onLanguage(
	languageId: string,
	callback: () => void
): IDisposable {
	let disposable = StaticServices.modeService.get().onDidCreateMode(mode => {
		if (mode.getId() === languageId) {
			// stop listening
			disposable.dispose();
			// invoke actual listener
			callback();
		}
	});
	return disposable;
}

/**
 * @internal
 */
export class EncodedTokenizationSupport2Adapter
	implements modes.ITokenizationSupport {
	private readonly _actual: EncodedTokensProvider;

	constructor(actual: EncodedTokensProvider) {
		this._actual = actual;
	}

	public getInitialState(): modes.IState {
		return this._actual.getInitialState();
	}

	public tokenize(
		line: string,
		state: modes.IState,
		offsetDelta: number
	): TokenizationResult {
		throw new Error("Not supported!");
	}

	public tokenize2(line: string, state: modes.IState): TokenizationResult2 {
		let result = this._actual.tokenizeEncoded(line, state);
		return new TokenizationResult2(result.tokens, result.endState);
	}
}

/**
 * @internal
 */
export class TokenizationSupport2Adapter implements modes.ITokenizationSupport {
	private readonly _standaloneThemeService: IStandaloneThemeService;
	private readonly _languageIdentifier: modes.LanguageIdentifier;
	private readonly _actual: TokensProvider;

	constructor(
		standaloneThemeService: IStandaloneThemeService,
		languageIdentifier: modes.LanguageIdentifier,
		actual: TokensProvider
	) {
		this._standaloneThemeService = standaloneThemeService;
		this._languageIdentifier = languageIdentifier;
		this._actual = actual;
	}

	public getInitialState(): modes.IState {
		return this._actual.getInitialState();
	}

	private _toClassicTokens(
		tokens: IToken[],
		language: string,
		offsetDelta: number
	): Token[] {
		let result: Token[] = [];
		let previousStartIndex: number = 0;
		for (let i = 0, len = tokens.length; i < len; i++) {
			const t = tokens[i];
			let startIndex = t.startIndex;

			// Prevent issues stemming from a buggy external tokenizer.
			if (i === 0) {
				// Force first token to start at first index!
				startIndex = 0;
			} else if (startIndex < previousStartIndex) {
				// Force tokens to be after one another!
				startIndex = previousStartIndex;
			}

			result[i] = new Token(startIndex + offsetDelta, t.scopes, language);

			previousStartIndex = startIndex;
		}
		return result;
	}

	public tokenize(
		line: string,
		state: modes.IState,
		offsetDelta: number
	): TokenizationResult {
		let actualResult = this._actual.tokenize(line, state);
		let tokens = this._toClassicTokens(
			actualResult.tokens,
			this._languageIdentifier.language,
			offsetDelta
		);

		let endState: modes.IState;
		// try to save an object if possible
		if (actualResult.endState.equals(state)) {
			endState = state;
		} else {
			endState = actualResult.endState;
		}

		return new TokenizationResult(tokens, endState);
	}

	private _toBinaryTokens(tokens: IToken[], offsetDelta: number): Uint32Array {
		const languageId = this._languageIdentifier.id;
		const tokenTheme = this._standaloneThemeService.getTheme().tokenTheme;

		let result: number[] = [],
			resultLen = 0;
		let previousStartIndex: number = 0;
		for (let i = 0, len = tokens.length; i < len; i++) {
			const t = tokens[i];
			const metadata = tokenTheme.match(languageId, t.scopes);
			if (resultLen > 0 && result[resultLen - 1] === metadata) {
				// same metadata
				continue;
			}

			let startIndex = t.startIndex;

			// Prevent issues stemming from a buggy external tokenizer.
			if (i === 0) {
				// Force first token to start at first index!
				startIndex = 0;
			} else if (startIndex < previousStartIndex) {
				// Force tokens to be after one another!
				startIndex = previousStartIndex;
			}

			result[resultLen++] = startIndex + offsetDelta;
			result[resultLen++] = metadata;

			previousStartIndex = startIndex;
		}

		let actualResult = new Uint32Array(resultLen);
		for (let i = 0; i < resultLen; i++) {
			actualResult[i] = result[i];
		}
		return actualResult;
	}

	public tokenize2(
		line: string,
		state: modes.IState,
		offsetDelta: number
	): TokenizationResult2 {
		let actualResult = this._actual.tokenize(line, state);
		let tokens = this._toBinaryTokens(actualResult.tokens, offsetDelta);

		let endState: modes.IState;
		// try to save an object if possible
		if (actualResult.endState.equals(state)) {
			endState = state;
		} else {
			endState = actualResult.endState;
		}

		return new TokenizationResult2(tokens, endState);
	}
}

/**
 * A token.
 */
export interface IToken {
	startIndex: number;
	scopes: string;
}

/**
 * The result of a line tokenization.
 */
export interface ILineTokens {
	/**
	 * The list of tokens on the line.
	 */
	tokens: IToken[];
	/**
	 * The tokenization end state.
	 * A pointer will be held to this and the object should not be modified by the tokenizer after the pointer is returned.
	 */
	endState: modes.IState;
}

/**
 * The result of a line tokenization.
 */
export interface IEncodedLineTokens {
	/**
	 * The tokens on the line in a binary, encoded format. Each token occupies two array indices. For token i:
	 *  - at offset 2*i => startIndex
	 *  - at offset 2*i + 1 => metadata
	 * Meta data is in binary format:
	 * - -------------------------------------------
	 *     3322 2222 2222 1111 1111 1100 0000 0000
	 *     1098 7654 3210 9876 5432 1098 7654 3210
	 * - -------------------------------------------
	 *     bbbb bbbb bfff ffff ffFF FTTT LLLL LLLL
	 * - -------------------------------------------
	 *  - L = EncodedLanguageId (8 bits): Use `getEncodedLanguageId` to get the encoded ID of a language.
	 *  - T = StandardTokenType (3 bits): Other = 0, Comment = 1, String = 2, RegEx = 4.
	 *  - F = FontStyle (3 bits): None = 0, Italic = 1, Bold = 2, Underline = 4.
	 *  - f = foreground ColorId (9 bits)
	 *  - b = background ColorId (9 bits)
	 *  - The color value for each colorId is defined in IStandaloneThemeData.customTokenColors:
	 * e.g colorId = 1 is stored in IStandaloneThemeData.customTokenColors[1]. Color id = 0 means no color,
	 * id = 1 is for the default foreground color, id = 2 for the default background.
	 */
	tokens: Uint32Array;
	/**
	 * The tokenization end state.
	 * A pointer will be held to this and the object should not be modified by the tokenizer after the pointer is returned.
	 */
	endState: modes.IState;
}

/**
 * A "manual" provider of tokens.
 */
export interface TokensProvider {
	/**
	 * The initial state of a language. Will be the state passed in to tokenize the first line.
	 */
	getInitialState(): modes.IState;
	/**
	 * Tokenize a line given the state at the beginning of the line.
	 */
	tokenize(line: string, state: modes.IState): ILineTokens;
}

/**
 * A "manual" provider of tokens, returning tokens in a binary form.
 */
export interface EncodedTokensProvider {
	/**
	 * The initial state of a language. Will be the state passed in to tokenize the first line.
	 */
	getInitialState(): modes.IState;
	/**
	 * Tokenize a line given the state at the beginning of the line.
	 */
	tokenizeEncoded(line: string, state: modes.IState): IEncodedLineTokens;
}

function isEncodedTokensProvider(
	provider: TokensProvider | EncodedTokensProvider
): provider is EncodedTokensProvider {
	return provider["tokenizeEncoded"];
}

function isThenable<T>(obj: any): obj is Thenable<T> {
	if (typeof obj.then === "function") {
		return true;
	}
	return false;
}

/**
 * Set the tokens provider for a language (monarch implementation).
 */
export function setMonarchTokensProvider(
	languageId: string,
	languageDef: IMonarchLanguage | Thenable<IMonarchLanguage>
): IDisposable {
	const create = (languageDef: IMonarchLanguage) => {
		return createTokenizationSupport(
			StaticServices.modeService.get(),
			StaticServices.standaloneThemeService.get(),
			languageId,
			compile(languageId, languageDef)
		);
	};
	if (isThenable<IMonarchLanguage>(languageDef)) {alert();
		return modes.TokenizationRegistry.registerPromise(
			languageId,
			languageDef.then(languageDef => create(languageDef))
		);
	}
	return modes.TokenizationRegistry.register(languageId, create(languageDef));
}

export interface IRelatedInformation {
	resource: URI;
	message: string;
	startLineNumber: number;
	startColumn: number;
	endLineNumber: number;
	endColumn: number;
}
export const enum MarkerTag {
	Unnecessary = 1
}
export enum MarkerSeverity {
	Hint = 1,
	Info = 2,
	Warning = 4,
	Error = 8
}
export interface IMarkerData {
	code?: string;
	severity: MarkerSeverity;
	message: string;
	source?: string;
	startLineNumber: number;
	startColumn: number;
	endLineNumber: number;
	endColumn: number;
	relatedInformation?: IRelatedInformation[];
	tags?: MarkerTag[];
}

/**
 * Contains additional diagnostic information about the context in which
 * a [code action](#CodeActionProvider.provideCodeActions) is run.
 */
export interface CodeActionContext {
	/**
	 * An array of diagnostics.
	 */
	readonly markers: IMarkerData[];

	/**
	 * Requested kind of actions to return.
	 */
	readonly only?: string;
}

/**
 * The code action interface defines the contract between extensions and
 * the [light bulb](https://code.visualstudio.com/docs/editor/editingevolved#_code-action) feature.
 */
export interface CodeActionProvider {
	/**
	 * Provide commands for the given document and range.
	 */
	provideCodeActions(
		model: ITextModel,
		range: Range,
		context: CodeActionContext,
		token: CancellationToken
	):
		| (modes.Command | modes.CodeAction)[]
		| Promise<(modes.Command | modes.CodeAction)[]>;
}

/**
 * @internal
 */
export function createMonacoLanguagesAPI(): Partial<typeof monaco.languages> {
	return {
		register: <any>register,
		getLanguages: <any>getLanguages,
		onLanguage: <any>onLanguage,
		getEncodedLanguageId: <any>getEncodedLanguageId,

		// provider methods
		setMonarchTokensProvider: <any>setMonarchTokensProvider,

		// enums
		DocumentHighlightKind: standaloneEnums.DocumentHighlightKind,
		CompletionItemKind: standaloneEnums.CompletionItemKind,
		CompletionItemInsertTextRule: standaloneEnums.CompletionItemInsertTextRule,
		SymbolKind: standaloneEnums.SymbolKind,
		IndentAction: standaloneEnums.IndentAction,
		CompletionTriggerKind: standaloneEnums.CompletionTriggerKind,
		SignatureHelpTriggerKind: standaloneEnums.SignatureHelpTriggerKind,

		// classes
		FoldingRangeKind: modes.FoldingRangeKind
	};
}
