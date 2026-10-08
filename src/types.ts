export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  type: 'journal' | 'conference' | 'book-chapter' | 'patent' | 'edited-book';
  link?: string;
  impactFactor?: string;
  indexed?: string;
  // 'curated' records are hand-maintained; 'scopus' records come from the Scopus export only.
  origin?: 'curated' | 'scopus';
  matchMethod?: 'manual' | 'doi' | 'title+type' | 'title';
  // Metadata below is copied from the Scopus export and is absent when no record matched.
  doi?: string;
  scopusEid?: string;
  scopusUrl?: string;
  abstract?: string;
  authorNames?: string[];
  authorKeywords?: string[];
  indexKeywords?: string[];
  sourceTitle?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  articleNumber?: string;
  pages?: string;
  conferenceName?: string;
  conferenceDate?: string;
  conferenceLocation?: string;
  issn?: string;
  isbn?: string[];
  documentType?: string;
  scopusYear?: number;
  openAccess?: boolean;
  citedBy?: number;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  thesis?: string;
  cgpa?: string;
}

export interface Experience {
  role: string;
  institution: string;
  period: string;
  location: string;
}

export interface Award {
  title: string;
  venue: string;
  date: string;
  category?: string;
}

export interface Grant {
  role: string;
  title: string;
  body: string;
  amount: string;
  period: string;
}

export interface ProfessionalService {
  role: string;
  organization: string;
  period: string;
}

export interface NewspaperMention {
  id: string;
  title: string;
  source?: string;
  date: string;
  link?: string;
  links?: { name: string; url: string }[];
  image?: string;
}
