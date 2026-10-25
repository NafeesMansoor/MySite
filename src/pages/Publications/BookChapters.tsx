import PublicationList from '../../components/PublicationList';

export default function BookChapters() {
  return (
    <PublicationList
      heading="Book Chapters"
      description="Contributions to edited books and research monographs."
      route="/publications/book-chapters"
      types={['book-chapter']}
      venueLabel="Publisher"
      emptyLabel="book chapters"
    />
  );
}
