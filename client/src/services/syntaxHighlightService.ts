import { injectable } from "inversify";
import { DecorationRenderOptions, Range, TextDocument, window, workspace } from "vscode";
import { IKeywordInfo } from "../interfaces";
import { TokenColors } from "../types";
import { getCurrentTheme, getTokenColorsForTheme } from "../utils";

export interface ISyntaxHighlightService {
  highlightDocument(document?: TextDocument): void;
  addLanguageKeywordsFromTextmate(languageSyntaxes: Map<string, string>): void;
}

@injectable()
export class SyntaxHighlightService implements ISyntaxHighlightService {
  private currentTheme: string = null;
  private languageKeywordsCache: Map<string, IKeywordInfo[]> = new Map<string, IKeywordInfo[]>();
  private tokenColors: TokenColors = null;

  constructor() {
    this.currentTheme = getCurrentTheme();
    this.tokenColors = getTokenColorsForTheme(this.currentTheme);

    // watch for theme changes
    workspace.onDidChangeConfiguration((e) => {
      const themeChange = e.affectsConfiguration("workbench.colorTheme");
      if (themeChange) {
        this.currentTheme = getCurrentTheme();
        this.tokenColors = getTokenColorsForTheme(this.currentTheme);
        this.reinitializeDecorations();
        this.highlightDocument(window.activeTextEditor.document);
      }
    });

    // highlight on doc changes
    workspace.onDidChangeTextDocument((_) => {
      this.highlightDocument(window.activeTextEditor.document);
    });

    // highlight on tab change
    window.onDidChangeActiveTextEditor((e) => {
      this.highlightDocument(e.document);
    });
  }

  public highlightDocument(document?: TextDocument): void {
    if (document === undefined) {
      document = window.activeTextEditor.document;
    }

    const languageId = document.languageId;
    const documentText = document.getText();

    const editor = window.activeTextEditor;
    const offsetToPosition = editor.document.positionAt;

    const keywordInfos = this.languageKeywordsCache.get(languageId);
    keywordInfos.forEach((kwInfo) => {
      // tslint:disable-next-line: max-line-length
      const keywordRanges = this.getKeywordRangesInDocument(kwInfo, documentText, offsetToPosition);
      editor.setDecorations(kwInfo.decoration, keywordRanges);
    });
  }

  public addLanguageKeywordsFromTextmate(languageSyntaxes: Object): void {
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
        keyword: keyword,
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
        // tslint:disable-next-line: max-line-length
        kw.decoration = window.createTextEditorDecorationType(this.getKeywordDecorationOptions(kw.scope));
      });
    }
  }

}
