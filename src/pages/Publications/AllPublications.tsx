import PublicationList from '../../components/PublicationList';

export default function AllPublications() {
  return (
    <PublicationList
      heading="Publications"
      description="Search across all journal articles, conference papers, book chapters, and patents."
      route="/publications"
      types={['journal', 'conference', 'book-chapter', 'edited-book', 'patent']}
    />
  );
}
