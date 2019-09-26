import { injectable } from "inversify";
import {
  DecorationRenderOptions, Range, TextDocument, window, workspace,
} from "vscode";
import { IKeywordInfo } from "../interfaces";
import { TokenColors } from "../types";
import { getCurrentTheme, getTokenColorsForTheme } from "../utils";

export interface ISyntaxHighlightingService {
  highlightDocument(document: TextDocument): void;
}

@injectable()
export class SyntaxHighlightingService implements ISyntaxHighlightingService {
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

    // TEST
    const kw1 = {
      decoration: null,
      keyword: "data",
      length: 4,
      regex: new RegExp(`\\b${"data"}\\b`, "g"),
      scope: "support.class",
    };
    const kw2 = {
      decoration: null,
      keyword: "Int",
      length: 3,
      regex: new RegExp(`\\b${"Int"}\\b`, "g"),
      scope: "constant.language",
    };
    kw1.decoration = window.createTextEditorDecorationType(this.getKeywordDecorationOptions(kw1));
    kw2.decoration = window.createTextEditorDecorationType(this.getKeywordDecorationOptions(kw2));

    this.languageKeywordsCache.set("plaintext", [kw1, kw2]);
  }

  public highlightDocument(document: TextDocument): void {
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

  public addLanguageKeywords(languageId: string) {
    // get keywords for language
  }

  private getKeywordDecorationOptions(keyword: IKeywordInfo): DecorationRenderOptions {
    return {color: this.tokenColors.get(keyword.scope).foreground };
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

  private reinitializeDecorations(): void {
    for (const languageKeywords of this.languageKeywordsCache.values()) {
      languageKeywords.forEach((kw) => {
        kw.decoration.dispose(); // remove previous decorations from editor
        kw.decoration = window.createTextEditorDecorationType(this.getKeywordDecorationOptions(kw));
      });
    }
  }

}
