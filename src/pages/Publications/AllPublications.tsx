import PublicationList from '../../components/PublicationList';

export default function AllPublications() {
  return (
    <PublicationList
      heading="Publications"
      description="Search across all journal articles, conference papers, book chapters, and patents."
      pageTitle="Publications | Nafees Mansoor"
      metaDescription="Searchable list of journal articles, conference papers, book chapters, and patents by Dr. Nafees Mansoor, with abstracts, keywords, and DOI links."
      types={['journal', 'conference', 'book-chapter', 'edited-book', 'patent']}
    />
  );
}
