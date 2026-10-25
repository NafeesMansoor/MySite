import PublicationList from '../../components/PublicationList';

export default function Proceedings() {
  return (
    <PublicationList
      heading="Conference Proceedings"
      description="Research papers presented at international conferences and symposia."
      route="/publications/proceedings"
      types={['conference']}
      emptyLabel="conference papers"
    />
  );
}
