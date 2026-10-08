import PublicationList from '../../components/PublicationList';

export default function BookChapters() {
  return (
    <PublicationList
      heading="Book Chapters"
      description="Contributions to edited books and research monographs."
      pageTitle="Book Chapters | Nafees Mansoor"
      metaDescription="Contributions to edited books and research monographs by Dr. Nafees Mansoor."
      types={['book-chapter']}
      venueLabel="Publisher"
      emptyLabel="book chapters"
    />
  );
}
