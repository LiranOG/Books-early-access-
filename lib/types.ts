export type ContentBlock =
  | { type: 'h1' | 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'code'; text: string };

export type Chapter = {
  id: string;
  title: string;
  blocks: ContentBlock[];
};

export type Book = {
  id: string;
  title: string;
  subtitle: string;
  language: 'en' | 'he';
  chapters: Chapter[];
};
