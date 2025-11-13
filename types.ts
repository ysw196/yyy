export enum Page {
  Keyword = 'Keyword',
  Topic = 'Topic',
  AISearch = 'AISearch',
  Article = 'Article',
  Image = 'Image',
}

export interface SelectableItem {
  text: string;
  selected: boolean;
}

export interface KeywordState {
  keyword: string;
  longTailKeywords: SelectableItem[];
  isLoading: boolean;
  error: string | null;
}

export interface TopicState {
  keywords: string[];
  year: string;
  topics: SelectableItem[];
  isLoading: boolean;
  error: string | null;
}

export interface AISearchState {
  topic: string;
  region: '中国' | '国外';
  analysisResult: string;
  isLoading: boolean;
  error: string | null;
}

export type ArticleType = 'GEO' | 'SEO';

export interface ArticleState {
  title: string;
  article: string;
  isLoading: boolean;
  error: string | null;
  articleType: ArticleType;
  wordCount: string;
  language: '中文' | 'English';
  companyName: string;
  contentToInsert: string;
  outline: string;
  imagePrompts: string[];
  useKnowledgeBase: boolean;
}

export interface ImageJob {
    prompt: string;
    imageUrl: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface ImageState {
  jobs: ImageJob[];
}