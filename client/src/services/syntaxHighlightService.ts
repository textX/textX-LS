import { injectable } from "inversify";
import { DecorationRenderOptions, Range, TextEditor, window, workspace } from "vscode";
import { IKeywordInfo } from "../interfaces";
import { TokenColors } from "../types";
import { getCurrentTheme, getTokenColorsForTheme } from "../utils";

export interface ISyntaxHighlightService {
  highlightAllEditorsDocument(): void;
  highlightEditorsDocument(editor?: TextEditor): void;
  addLanguageKeywordsFromTextmate(languageSyntaxes: Map<string, string>): void;
}

@injectable()
export class SyntaxHighlightService implements ISyntaxHighlightService {
  private currentTheme: string = null;
  private languageKeywordsCache: Map<string, IKeywordInfo[]> = new Map<string, IKeywordInfo[]>();
  private tokenColors: TokenColors = null;

  constructor() {
    this.currentTheme = getCurrentTheme();
    this.tokenColors = this.tryGetTokenColorsForTheme(this.currentTheme);

    // watch for theme changes
    workspace.onDidChangeConfiguration((e) => {
      const themeChange = e.affectsConfiguration("workbench.colorTheme");
      if (themeChange) {
        this.currentTheme = getCurrentTheme();
        this.tokenColors = this.tryGetTokenColorsForTheme(this.currentTheme);
        this.reinitializeDecorations();
        this.highlightEditorsDocument(window.activeTextEditor);
      }
    });

    // highlight on doc changes
    workspace.onDidChangeTextDocument((_) => {
      this.highlightEditorsDocument(window.activeTextEditor);
    });

    // highlight on tab change
    window.onDidChangeActiveTextEditor((e) => {
      this.highlightEditorsDocument(e);
    });
  }

  public highlightAllEditorsDocument(): void {
    window.visibleTextEditors.forEach((editor) => this.highlightEditorsDocument(editor));
  }

  public highlightEditorsDocument(editor?: TextEditor): void {
    if (editor === undefined) {
      editor = window.activeTextEditor;
    }

    const document = editor.document;
    const languageId = document.languageId;
    const documentText = document.getText();
    const offsetToPosition = editor.document.positionAt;

    const keywordInfos = this.languageKeywordsCache.get(languageId) || [];
    keywordInfos.forEach((kwInfo) => {
      const keywordRanges = this.getKeywordRangesInDocument(kwInfo, documentText, offsetToPosition);
      editor.setDecorations(kwInfo.decoration, keywordRanges);
    });
  }

  public addLanguageKeywordsFromTextmate(languageSyntaxes: object): void {
    for (const [langId, textmateJSON] of Object.entries(languageSyntaxes)) {
      (this.languageKeywordsCache.get(langId) || []).forEach((kwInfo) => kwInfo.decoration.dispose());
      this.languageKeywordsCache.set(langId, this.getKeywordsFromTextmateJSON(textmateJSON));
    }
  }

  private getKeywordDecorationOptions(scope: string): DecorationRenderOptions {
    return {color: this.tokenColors.get(scope).foreground };
  }

  private getKeywordsFromTextmateJSON(textmate: string): IKeywordInfo[] {
    return JSON.parse(textmate).repository.language_keyword.patterns.map((pattern) => {
      const keyword: string = pattern.match;
      const scope: string = pattern.name;

      return {
        decoration: window.createTextEditorDecorationType(this.getKeywordDecorationOptions(scope)),
        keyword,
        length: keyword.length,
        regex: this.getKeywordsRegex(keyword),
        scope,
      };
    });
  }

  private getKeywordRangesInDocument(
    keyword: IKeywordInfo, documentText: string, offsetToPosition,
  ): Range[] {

    const ranges: Range[] = [];
    // tslint:disable-next-line: no-conditional-assignment
    for (let match: RegExpExecArray; (match = keyword.regex.exec(documentText)) !== null;) {
      const matchIndex = match.index;
      ranges.push(new Range(offsetToPosition(matchIndex),
                            offsetToPosition(matchIndex + keyword.length)));
    }
    return ranges;
  }

  private getKeywordsRegex(keyword: string): RegExp {
    return new RegExp(`\\b${keyword}\\b`, "g");
  }

  private reinitializeDecorations(): void {
    for (const languageKeywords of this.languageKeywordsCache.values()) {
      languageKeywords.forEach((kw) => {
        kw.decoration.dispose(); // remove previous decorations from editor
        kw.decoration = window.createTextEditorDecorationType(this.getKeywordDecorationOptions(kw.scope));
      });
    }
  }

  private tryGetTokenColorsForTheme(themeName: string): TokenColors {
    try {
      return getTokenColorsForTheme(themeName);
    } catch {
      window.showWarningMessage(`Could not load tokens color for theme: ${this.currentTheme}`);
      return new Map();
    }
  }

}
