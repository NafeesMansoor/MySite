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
  source: string;
  date: string;
  link?: string;
  image?: string;
}
